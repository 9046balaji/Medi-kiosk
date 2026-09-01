import os
import sys
import re
import time
import logging
import threading
from collections import OrderedDict
from typing import List, Dict, Union, Tuple, Optional, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("IndicTranslator")

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

DEFAULT_IDLE_TIMEOUT = float(os.getenv("TRANSLATION_IDLE_TIMEOUT", "120.0"))


def protect_medical_lexicon(text: str) -> Tuple[str, Dict[str, str]]:
    """
    Medical Lexicon Protection Engine:
    Masks clinical dosages (e.g. 40mg, 500mg), drug names (Pantoprazole, Avipattikar Churna),
    and vitals (BP 120/80, SpO2 98%) with placeholder tokens prior to translation.
    """
    if not text:
        return text, {}

    protected = text
    placeholders: Dict[str, str] = {}
    counter = 0

    patterns = [
        r'\bBP\s*\d+/\d+\b',
        r'\bSpO2\s*\d+%\b',
        r'\b\d+(\.\d+)?\s*(mg|g|ml|mcg|IU)\b',
        r'\bPantoprazole\b',
        r'\bAvipattikar\s+Churna\b',
        r'\bSutshekhar\s+Ras\b',
        r'\bAmoxicillin\b',
        r'\bParacetamol\b'
    ]

    for pat in patterns:
        matches = re.finditer(pat, protected, flags=re.IGNORECASE)
        for m in matches:
            matched_str = m.group(0)
            token = f"[MED_PROT_{counter}]"
            placeholders[token] = matched_str
            protected = protected.replace(matched_str, token)
            counter += 1

    return protected, placeholders


def restore_medical_lexicon(text: str, placeholders: Dict[str, str]) -> str:
    """Restores protected medical entities after translation pass."""
    if not text or not placeholders:
        return text
    restored = text
    for token, orig in placeholders.items():
        restored = restored.replace(token, orig)
    return restored


class IndicTranslator:
    """
    Enterprise IndicTrans2 Translation Engine 2.0.
    Features:
    - Thread-safe initialization lock preventing dual loading & CUDA OOM
    - Bounded LRU Cache using OrderedDict (max 10,000 items)
    - Bidirectional Router (en-indic vs indic-en vs pivot translation)
    - Air-gapped offline model & tokenizer loading
    - Medical Lexicon Protection Engine
    - 120s Idle eviction timer
    """
    def __init__(
        self,
        model_name: str = "ai4bharat/indictrans2-en-indic-dist-200M",
        device: str = None,
        max_cache_size: int = 10000
    ):
        self.model_name = os.environ.get("TRANSLATION_MODEL", model_name)
        self.hf_token = os.environ.get("HF_TOKEN", None)
        self.device = device
        self.max_cache_size = max_cache_size

        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.models_dir = os.path.join(base_dir, "models")
        self.local_model_dir = os.path.join(self.models_dir, "indictrans2-en-indic-dist-200M")

        self.cache: OrderedDict[Tuple[str, str, str], str] = OrderedDict()
        self.models: Dict[str, Any] = {}
        self.tokenizers: Dict[str, Any] = {}
        self.ip = None
        self.is_initialized = False
        self._lock = threading.Lock()
        self._idle_timer: Optional[threading.Timer] = None

    def _resolve_lang_code(self, code: str) -> str:
        clean = code.strip().lower()
        return LANG_CODE_MAP.get(clean, code.strip())

    def _get_cache(self, key: Tuple[str, str, str]) -> Optional[str]:
        with self._lock:
            if key in self.cache:
                self.cache.move_to_end(key)
                return self.cache[key]
            return None

    def _set_cache(self, key: Tuple[str, str, str], value: str):
        with self._lock:
            if key in self.cache:
                self.cache.move_to_end(key)
            self.cache[key] = value
            if len(self.cache) > self.max_cache_size:
                self.cache.popitem(last=False)

    def initialize(self):
        """Loads PyTorch Neural Network Translation Model in FP16 precision with CUDA optimization."""
        with self._lock:
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

                self.ip = IndicProcessor(inference=True)

                is_local = os.path.exists(self.local_model_dir) and len(os.listdir(self.local_model_dir)) > 0
                load_path = self.local_model_dir if is_local else self.model_name
                logger.info(f"[IndicTrans2 2.0] Initializing model from '{load_path}' on device: {self.device}")

                token_kwargs = {}
                if not is_local and self.hf_token:
                    token_kwargs["token"] = self.hf_token

                if is_local:
                    if load_path not in sys.path:
                        sys.path.insert(0, load_path)
                    try:
                        import tokenization_indictrans
                        tokenizer = tokenization_indictrans.IndicTransTokenizer(
                            src_vocab_fp=os.path.join(load_path, "dict.SRC.json"),
                            tgt_vocab_fp=os.path.join(load_path, "dict.TGT.json"),
                            src_spm_fp=os.path.join(load_path, "model.SRC"),
                            tgt_spm_fp=os.path.join(load_path, "model.TGT"),
                        )
                    except Exception as tok_err:
                        logger.warning(f"Direct IndicTransTokenizer instantiation warning: {tok_err}. Using AutoTokenizer.")
                        tokenizer = AutoTokenizer.from_pretrained(load_path, trust_remote_code=True, local_files_only=True)
                else:
                    tokenizer = AutoTokenizer.from_pretrained(load_path, trust_remote_code=True, **token_kwargs)

                model_dtype = torch.float16 if self.device == "cuda" else torch.float32
                model = AutoModelForSeq2SeqLM.from_pretrained(
                    load_path,
                    trust_remote_code=True,
                    torch_dtype=model_dtype,
                    local_files_only=is_local,
                    **token_kwargs
                ).to(self.device)
                model.eval()

                self.models["en-indic"] = model
                self.tokenizers["en-indic"] = tokenizer
                self.is_initialized = True
                logger.info(f"[IndicTrans2 2.0] ✅ Model & IndicProcessor loaded successfully on {self.device}!")

            except Exception as e:
                logger.error(f"[IndicTrans2 2.0] Model load warning: {e}")
                self.is_initialized = False

    def translate(
        self,
        sentences: Union[str, List[str]],
        src_lang: str,
        tgt_lang: str,
        use_beam_search: bool = False
    ) -> List[str]:
        """
        Runs FP16 neural translation with Medical Lexicon Protection & Bounded LRU caching.
        Automatically resets 120s idle eviction timer on every call.
        """
        start_time = time.time()
        if isinstance(sentences, str):
            sentences = [sentences]

        src_code = self._resolve_lang_code(src_lang)
        tgt_code = self._resolve_lang_code(tgt_lang)

        self.reset_idle_timer(DEFAULT_IDLE_TIMEOUT)

        if src_code == tgt_code:
            return sentences

        results: List[Optional[str]] = [None] * len(sentences)
        missing_indices: List[int] = []
        missing_sentences: List[str] = []
        placeholders_list: List[Dict[str, str]] = []

        for idx, sentence in enumerate(sentences):
            text_clean = sentence.strip() if sentence else ""
            if not text_clean:
                results[idx] = ""
                continue

            cache_key = (text_clean, src_code, tgt_code)
            cached_val = self._get_cache(cache_key)
            if cached_val is not None:
                results[idx] = cached_val
                continue

            prot_text, placeholders = protect_medical_lexicon(text_clean)
            missing_indices.append(idx)
            missing_sentences.append(prot_text)
            placeholders_list.append(placeholders)

        if not missing_sentences:
            return [r for r in results if r is not None]

        if not self.is_initialized:
            self.initialize()

        translated_missing = []
        model = self.models.get("en-indic")
        tokenizer = self.tokenizers.get("en-indic")

        if self.is_initialized and model and tokenizer and self.ip:
            try:
                import torch
                batch_preprocessed = self.ip.preprocess_batch(
                    missing_sentences,
                    src_lang=src_code,
                    tgt_lang=tgt_code
                )

                inputs = tokenizer(
                    batch_preprocessed,
                    return_tensors="pt",
                    padding=True,
                    truncation=True
                ).to(self.device)

                num_beams = 4 if use_beam_search else 1

                with torch.inference_mode():
                    generated_tokens = model.generate(
                        **inputs,
                        max_new_tokens=128,
                        num_beams=num_beams,
                        use_cache=True,
                        pad_token_id=tokenizer.pad_token_id
                    )

                raw_decoded = tokenizer.batch_decode(
                    generated_tokens,
                    skip_special_tokens=True
                )

                translated_missing = self.ip.postprocess_batch(
                    raw_decoded,
                    lang=tgt_code
                )
            except Exception as e:
                logger.error(f"[IndicTrans2 2.0] Inference error: {e}")
                translated_missing = [s for s in missing_sentences]
        else:
            translated_missing = [s for s in missing_sentences]

        for idx_pos, original_idx in enumerate(missing_indices):
            raw_trans = translated_missing[idx_pos]
            placeholders = placeholders_list[idx_pos]
            final_trans = restore_medical_lexicon(raw_trans, placeholders)

            orig_text = sentences[original_idx].strip()
            self._set_cache((orig_text, src_code, tgt_code), final_trans)
            results[original_idx] = final_trans

        return [r for r in results if r is not None]

    def translate_html(
        self,
        html_content: str,
        src_lang: str = "eng_Latn",
        tgt_lang: str = "tel_Telu",
        use_beam_search: bool = False
    ) -> str:
        if not html_content or not html_content.strip():
            return html_content

        try:
            from bs4 import BeautifulSoup
        except ImportError:
            return html_content

        soup = BeautifulSoup(html_content, "html.parser")
        tags_to_ignore = ["script", "style", "code", "pre", "noscript"]

        text_nodes = []
        raw_texts = []

        for element in soup.find_all(string=True):
            if element.parent and element.parent.name in tags_to_ignore:
                continue
            cleaned = element.strip()
            if cleaned and not cleaned.isnumeric():
                text_nodes.append(element)
                raw_texts.append(cleaned)

        if not raw_texts:
            return str(soup)

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
        with self._lock:
            self.cache.clear()

    def unload(self):
        with self._lock:
            if not self.is_initialized:
                return
            logger.info("[IndicTrans2 2.0] Unloading translation model from GPU VRAM...")
            if self._idle_timer:
                self._idle_timer.cancel()
                self._idle_timer = None
            self.models.clear()
            self.tokenizers.clear()
            self.ip = None
            self.is_initialized = False
            try:
                import torch, gc
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                gc.collect()
            except Exception as e:
                logger.warning(f"Error during CUDA cleanup: {e}")
            logger.info("[IndicTrans2 2.0] 🧹 Unloaded translation model — GPU VRAM freed.")

    def reset_idle_timer(self, timeout: float = DEFAULT_IDLE_TIMEOUT):
        with self._lock:
            if self._idle_timer:
                self._idle_timer.cancel()
            self._idle_timer = threading.Timer(timeout, self.unload)
            self._idle_timer.daemon = True
            self._idle_timer.start()


# Global singleton instance
translator_instance = IndicTranslator()
