import os
import time
import logging
from typing import List, Dict, Union, Tuple, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("IndicTranslator")

# Map standard 2-letter ISO codes and lowercase Flores codes to exact Flores language codes for ALL 22 Indic Languages
LANG_CODE_MAP: Dict[str, str] = {
    "en": "eng_Latn",
    "eng_latn": "eng_Latn",
    "english": "eng_Latn",
    
    "hi": "hin_Deva",
    "hin_deva": "hin_Deva",
    "hindi": "hin_Deva",
    
    "as": "asm_Beng",
    "asm_beng": "asm_Beng",
    "assamese": "asm_Beng",
    
    "bn": "ben_Beng",
    "ben_beng": "ben_Beng",
    "bengali": "ben_Beng",
    
    "brx": "brx_Deva",
    "brx_deva": "brx_Deva",
    "bodo": "brx_Deva",
    
    "doi": "doi_Deva",
    "doi_deva": "doi_Deva",
    "dogri": "doi_Deva",
    
    "gu": "guj_Gujr",
    "guj_gujr": "guj_Gujr",
    "gujarati": "guj_Gujr",
    
    "kn": "kan_Knda",
    "kan_knda": "kan_Knda",
    "kannada": "kan_Knda",
    
    "ks": "kas_Arab",
    "kas_arab": "kas_Arab",
    "kas_deva": "kas_Deva",
    "kashmiri": "kas_Arab",
    
    "gom": "gom_Deva",
    "gom_deva": "gom_Deva",
    "konkani": "gom_Deva",
    
    "mai": "mai_Deva",
    "mai_deva": "mai_Deva",
    "maithili": "mai_Deva",
    
    "ml": "mal_Mlym",
    "mal_mlym": "mal_Mlym",
    "malayalam": "mal_Mlym",
    
    "mni": "mni_Beng",
    "mni_beng": "mni_Beng",
    "mni_mtei": "mni_Mtei",
    "manipuri": "mni_Beng",
    
    "mr": "mar_Deva",
    "mar_deva": "mar_Deva",
    "marathi": "mar_Deva",
    
    "ne": "npi_Deva",
    "npi_deva": "npi_Deva",
    "nepali": "npi_Deva",
    
    "or": "ory_Orya",
    "ory_orya": "ory_Orya",
    "odia": "ory_Orya",
    "oriya": "ory_Orya",
    
    "pa": "pan_Guru",
    "pan_guru": "pan_Guru",
    "punjabi": "pan_Guru",
    "panjabi": "pan_Guru",
    
    "sa": "san_Deva",
    "san_deva": "san_Deva",
    "sanskrit": "san_Deva",
    
    "sat": "sat_Olck",
    "sat_olck": "sat_Olck",
    "santali": "sat_Olck",
    
    "sd": "snd_Arab",
    "snd_arab": "snd_Arab",
    "snd_deva": "snd_Deva",
    "sindhi": "snd_Arab",
    
    "ta": "tam_Taml",
    "tam_taml": "tam_Taml",
    "tamil": "tam_Taml",
    
    "te": "tel_Telu",
    "tel_telu": "tel_Telu",
    "telugu": "tel_Telu",
    
    "ur": "urd_Arab",
    "urd_arab": "urd_Arab",
    "urdu": "urd_Arab"
}

class IndicTranslator:
    def __init__(
        self,
        model_name: str = "ai4bharat/indictrans2-en-indic-dist-200M",
        device: str = None
    ):
        self.model_name = os.environ.get("TRANSLATION_MODEL", model_name)
        self.hf_token = os.environ.get("HF_TOKEN", None)
        self.device = device
        
        # Local model directory path inside backend/medikiosk-translation/models/
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.local_model_dir = os.path.join(base_dir, "models", "indictrans2-en-indic-dist-200M")
        
        # In-Memory LRU Cache for translated strings
        self.cache: Dict[Tuple[str, str, str], str] = {}
        
        # Models, Tokenizers, and IndicProcessor
        self.model = None
        self.tokenizer = None
        self.ip = None
        self.is_initialized = False

    def _resolve_lang_code(self, code: str) -> str:
        clean = code.strip().lower()
        return LANG_CODE_MAP.get(clean, code.strip())

    def initialize(self):
        """Loads PyTorch Neural Network Translation Model in FP16 precision with CUDA optimization."""
        if self.is_initialized:
            return

        try:
            import torch
            from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
            from IndicTransToolkit import IndicProcessor

            num_threads = min(os.cpu_count() or 4, 8)
            torch.set_num_threads(num_threads)

            if not self.device:
                self.device = "cuda" if torch.cuda.is_available() else "cpu"

            # Initialize IndicProcessor for script conversion
            self.ip = IndicProcessor(inference=True)

            # Check if local model folder exists with downloaded files
            is_local = os.path.exists(self.local_model_dir) and len(os.listdir(self.local_model_dir)) > 0
            load_path = self.local_model_dir if is_local else self.model_name
            logger.info(f"Initializing AI4Bharat FP16 Model from '{load_path}' on device: {self.device}")

            token_kwargs = {}
            if not is_local and self.hf_token:
                token_kwargs["token"] = self.hf_token

            # Tokenizer loading
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                trust_remote_code=True,
                **token_kwargs
            )
            
            # Model loading with FP16 Half Precision on CUDA
            model_dtype = torch.float16 if self.device == "cuda" else torch.float32
            self.model = AutoModelForSeq2SeqLM.from_pretrained(
                load_path,
                trust_remote_code=True,
                torch_dtype=model_dtype,
                **token_kwargs
            ).to(self.device)

            self.model.eval()

            # Execute CUDA Warmup Pass
            if self.device == "cuda":
                try:
                    with torch.inference_mode():
                        batch_p = self.ip.preprocess_batch(["Warmup"], src_lang="eng_Latn", tgt_lang="hin_Deva")
                        dummy_inputs = self.tokenizer(batch_p, return_tensors="pt").to(self.device)
                        self.model.generate(**dummy_inputs, max_new_tokens=5, num_beams=1)
                except Exception as e:
                    logger.warning(f"Warmup notice: {e}")

            self.is_initialized = True
            logger.info(f"AI4Bharat IndicTrans2 FP16 Model & IndicProcessor successfully initialized on {self.device}!")

        except Exception as e:
            logger.error(f"Failed to load PyTorch Neural Translation Model: {e}")
            self.is_initialized = False

    def translate(
        self,
        sentences: Union[str, List[str]],
        src_lang: str,
        tgt_lang: str,
        use_beam_search: bool = False
    ) -> List[str]:
        """Runs dynamic FP16 neural translation with native script postprocessing & LRU caching."""
        start_time = time.time()
        if isinstance(sentences, str):
            sentences = [sentences]

        src_code = self._resolve_lang_code(src_lang)
        tgt_code = self._resolve_lang_code(tgt_lang)

        results: List[Optional[str]] = [None] * len(sentences)
        missing_indices: List[int] = []
        missing_sentences: List[str] = []

        # If source and target language are identical
        if src_code == tgt_code:
            return sentences

        # Step 1: Check In-Memory LRU Cache (0ms hit)
        for idx, sentence in enumerate(sentences):
            text_clean = sentence.strip() if sentence else ""
            if not text_clean:
                results[idx] = ""
                continue
            
            cache_key = (text_clean, src_code, tgt_code)
            if cache_key in self.cache:
                results[idx] = self.cache[cache_key]
                continue

            missing_indices.append(idx)
            missing_sentences.append(text_clean)

        # If all items were hit in cache
        if not missing_sentences:
            elapsed = (time.time() - start_time) * 1000
            logger.info(f"Cache HIT for all {len(sentences)} items ({elapsed:.2f} ms)")
            return [r for r in results if r is not None]

        # Auto-initialize model if not yet loaded
        if not self.is_initialized:
            self.initialize()

        # Step 2: Perform Dynamic PyTorch Model FP16 Neural Inference with IndicProcessor
        translated_missing = []
        if self.is_initialized and self.model and self.tokenizer and self.ip:
            try:
                import torch
                # Preprocess batch using IndicProcessor
                batch_preprocessed = self.ip.preprocess_batch(
                    missing_sentences,
                    src_lang=src_code,
                    tgt_lang=tgt_code
                )
                
                inputs = self.tokenizer(
                    batch_preprocessed,
                    return_tensors="pt",
                    padding=True,
                    truncation=True
                ).to(self.device)

                num_beams = 4 if use_beam_search else 1

                with torch.inference_mode():
                    generated_tokens = self.model.generate(
                        **inputs,
                        max_new_tokens=128,
                        num_beams=num_beams,
                        use_cache=True,
                        pad_token_id=self.tokenizer.pad_token_id
                    )

                raw_decoded = self.tokenizer.batch_decode(
                    generated_tokens,
                    skip_special_tokens=True
                )
                
                # Postprocess into native script (Telugu, Tamil, Kannada, Malayalam, etc.)
                translated_missing = self.ip.postprocess_batch(
                    raw_decoded,
                    lang=tgt_code
                )
            except Exception as e:
                logger.error(f"AI4Bharat FP16 neural inference error: {e}")
                translated_missing = [s for s in missing_sentences]
        else:
            logger.warning("Neural model offline, returning clean text")
            translated_missing = [s for s in missing_sentences]

        # Step 3: Update LRU Cache and return final response
        for idx_pos, original_idx in enumerate(missing_indices):
            trans = translated_missing[idx_pos]
            orig_text = missing_sentences[idx_pos]
            self.cache[(orig_text, src_code, tgt_code)] = trans
            results[original_idx] = trans

        elapsed = (time.time() - start_time) * 1000
        logger.info(f"AI4Bharat FP16 Neural Inference of {len(missing_sentences)} items took {elapsed:.2f} ms")

        return [r for r in results if r is not None]

    def translate_html(
        self,
        html_content: str,
        src_lang: str = "eng_Latn",
        tgt_lang: str = "tel_Telu",
        use_beam_search: bool = False
    ) -> str:
        """
        Parses HTML webpage string with BeautifulSoup4, extracts visible text nodes,
        batch-translates them via IndicTrans2 preserving all HTML formatting, tags, and layout.
        """
        if not html_content or not html_content.strip():
            return html_content

        try:
            from bs4 import BeautifulSoup
        except ImportError:
            logger.error("beautifulsoup4 is not installed. Install via `pip install beautifulsoup4`")
            return html_content

        soup = BeautifulSoup(html_content, "html.parser")
        tags_to_ignore = ["script", "style", "code", "pre", "noscript"]

        text_nodes = []
        raw_texts = []

        for element in soup.find_all(text=True):
            if element.parent and element.parent.name in tags_to_ignore:
                continue
            cleaned = element.strip()
            if cleaned and not cleaned.isnumeric():
                text_nodes.append(element)
                raw_texts.append(cleaned)

        if not raw_texts:
            return str(soup)

        logger.info(f"Extracted {len(raw_texts)} HTML text nodes for batch translation to {tgt_lang}")

        translated_texts = self.translate(
            sentences=raw_texts,
            src_lang=src_lang,
            tgt_lang=tgt_lang,
            use_beam_search=use_beam_search
        )

        for node, translated in zip(text_nodes, translated_texts):
            node.replace_with(translated)

        return str(soup)

    def clear_cache(self):
        self.cache.clear()

# Singleton instance
translator_instance = IndicTranslator()
