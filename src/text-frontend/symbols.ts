// AUTO-GENERATED from tiny_tts/text/symbols.py — do not edit manually
export const symbols = ["_", "\"", "(", ")", "*", "/", ":", "AA", "E", "EE", "En", "N", "OO", "Q", "V", "[", "\\", "]", "^", "a", "a:", "aa", "ae", "ah", "ai", "an", "ang", "ao", "aw", "ay", "b", "by", "c", "ch", "d", "dh", "dy", "e", "e:", "eh", "ei", "en", "eng", "er", "ey", "f", "g", "gy", "h", "hh", "hy", "i", "i0", "i:", "ia", "ian", "iang", "iao", "ie", "ih", "in", "ing", "iong", "ir", "iu", "iy", "j", "jh", "k", "ky", "l", "m", "my", "n", "ng", "ny", "o", "o:", "ong", "ou", "ow", "oy", "p", "py", "q", "r", "ry", "s", "sh", "t", "th", "ts", "ty", "u", "u:", "ua", "uai", "uan", "uang", "uh", "ui", "un", "uo", "uw", "v", "van", "ve", "vn", "w", "x", "y", "z", "zh", "zy", "~", "æ", "ç", "ð", "ø", "ŋ", "œ", "ɐ", "ɑ", "ɒ", "ɔ", "ɕ", "ə", "ɛ", "ɜ", "ɡ", "ɣ", "ɥ", "ɦ", "ɪ", "ɫ", "ɬ", "ɭ", "ɯ", "ɲ", "ɵ", "ɸ", "ɹ", "ɾ", "ʁ", "ʃ", "ʊ", "ʌ", "ʎ", "ʏ", "ʑ", "ʒ", "ʝ", "ʲ", "ˈ", "ˌ", "ː", "̃", "̩", "β", "θ", "ᄀ", "ᄁ", "ᄂ", "ᄃ", "ᄄ", "ᄅ", "ᄆ", "ᄇ", "ᄈ", "ᄉ", "ᄊ", "ᄋ", "ᄌ", "ᄍ", "ᄎ", "ᄏ", "ᄐ", "ᄑ", "ᄒ", "ᅡ", "ᅢ", "ᅣ", "ᅤ", "ᅥ", "ᅦ", "ᅧ", "ᅨ", "ᅩ", "ᅪ", "ᅫ", "ᅬ", "ᅭ", "ᅮ", "ᅯ", "ᅰ", "ᅱ", "ᅲ", "ᅳ", "ᅴ", "ᅵ", "ᆨ", "ᆫ", "ᆮ", "ᆯ", "ᆷ", "ᆸ", "ᆼ", "ㄸ", "!", "?", "…", ",", ".", "'", "-", "¿", "¡", "SP", "UNK"] as const;

export const symbolToId: Record<string, number> = Object.fromEntries(symbols.map((s, i) => [s, i]));

export const languageIdMap = {"ZH": 0, "JP": 1, "EN": 2, "ZH_MIX_EN": 3, "KR": 4, "ES": 5, "SP": 5, "FR": 6, "DE": 7, "RU": 8, "VI": 9} as const;

export const languageToneStartMap = {"ZH": 0, "ZH_MIX_EN": 0, "JP": 6, "EN": 7, "KR": 11, "ES": 12, "SP": 12, "FR": 13, "DE": 14, "RU": 15, "VI": 16} as const;

export type LanguageCode = keyof typeof languageToneStartMap;

export const PAD = "_";

export const ARPA = new Set(["AA0", "AA1", "AA2", "AE0", "AE1", "AE2", "AH0", "AH1", "AH2", "AO0", "AO1", "AO2", "AW0", "AW1", "AW2", "AY0", "AY1", "AY2", "B", "CH", "D", "DH", "EH0", "EH1", "EH2", "ER", "ER0", "ER1", "ER2", "EY0", "EY1", "EY2", "F", "G", "HH", "IH", "IH0", "IH1", "IH2", "IY0", "IY1", "IY2", "JH", "K", "L", "M", "N", "NG", "OW0", "OW1", "OW2", "OY0", "OY1", "OY2", "P", "R", "S", "SH", "T", "TH", "UH0", "UH1", "UH2", "UW0", "UW1", "UW2", "V", "W", "Y", "Z", "ZH"]);