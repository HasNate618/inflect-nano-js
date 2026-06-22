#!/usr/bin/env python3
"""Regenerate src/text-frontend/symbols.ts from owensong/Inflect-Nano-v1 tiny_tts symbols.py."""
from __future__ import annotations

import importlib.util
import json
from pathlib import Path

SYMBOLS_PY = Path(__file__).resolve().parents[2] / "third_party" / "tiny_tts_frontend" / "tiny_tts" / "text" / "symbols.py"
OUT = Path(__file__).resolve().parents[1] / "src" / "text-frontend" / "symbols.ts"

# Fallback: clone path relative to inflect-nano-js if vendored copy missing
if not SYMBOLS_PY.exists():
    SYMBOLS_PY = Path("/tmp/inflect-src/Inflect-Nano-v1/third_party/tiny_tts_frontend/tiny_tts/text/symbols.py")

spec = importlib.util.spec_from_file_location("symbols", SYMBOLS_PY)
mod = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mod)

ARPA = sorted({
    "AH0", "S", "AH1", "EY2", "AE2", "EH0", "OW2", "UH0", "NG", "B",
    "G", "AY0", "M", "AA0", "F", "AO0", "ER2", "UH1", "IY1", "AH2",
    "DH", "IY0", "EY1", "IH0", "K", "N", "W", "IY2", "T", "AA1",
    "ER1", "EH2", "OY0", "UH2", "UW1", "Z", "AW2", "AW1", "V", "UW2",
    "AA2", "ER", "AW0", "UW0", "R", "OW1", "EH1", "ZH", "AE0", "IH2",
    "IH", "Y", "JH", "P", "AY1", "EY0", "OY2", "TH", "HH", "D",
    "ER0", "CH", "AO1", "AE1", "AO2", "OY1", "AY2", "IH1", "OW0", "L", "SH",
})

lines = [
    "// AUTO-GENERATED from tiny_tts/text/symbols.py — run scripts/generate-symbols.py",
    f"export const symbols = {json.dumps(mod.symbols, ensure_ascii=False)} as const;",
    "",
    "export const symbolToId: Record<string, number> = Object.fromEntries(symbols.map((s, i) => [s, i]));",
    "",
    f"export const languageIdMap = {json.dumps(mod.language_id_map)} as const;",
    "",
    f"export const languageToneStartMap = {json.dumps(mod.language_tone_start_map)} as const;",
    "",
    "export type LanguageCode = keyof typeof languageToneStartMap;",
    "",
    'export const PAD = "_";',
    "",
    f"export const ARPA = new Set({json.dumps(ARPA)} as string[]);",
    "",
]

OUT.write_text("\n".join(lines))
print(f"Wrote {len(mod.symbols)} symbols to {OUT}")
