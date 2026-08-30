import sys
import argparse
from bs4 import BeautifulSoup
from translator import translator_instance, LANG_CODE_MAP

def translate_html_file(input_file_path: str, output_file_path: str, src_lang: str = "eng_Latn", tgt_lang: str = "tel_Telu"):
    print(f"Reading HTML file: {input_file_path}...")
    with open(input_file_path, "r", encoding="utf-8") as f:
        html_content = f.read()

    # Initialize model if needed
    if not translator_instance.is_initialized:
        translator_instance.initialize()

    print(f"Translating HTML from {src_lang} to {tgt_lang} preserving DOM layout...")
    translated_html = translator_instance.translate_html(
        html_content=html_content,
        src_lang=src_lang,
        tgt_lang=tgt_lang
    )

    with open(output_file_path, "w", encoding="utf-8") as f:
        f.write(translated_html)

    print(f"✅ Webpage translated successfully! Saved to: {output_file_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Translate an entire HTML file into Indic languages while preserving tags & layout.")
    parser.add_argument("input_file", nargs="?", default="index.html", help="Input HTML file path (default: index.html)")
    parser.add_argument("output_file", nargs="?", default="index_translated.html", help="Output HTML file path (default: index_translated.html)")
    parser.add_argument("--src", default="eng_Latn", help="Source language FLORES code (default: eng_Latn)")
    parser.add_argument("--tgt", default="tel_Telu", help="Target language FLORES code (default: tel_Telu)")

    args = parser.parse_args()
    translate_html_file(args.input_file, args.output_file, args.src, args.tgt)
