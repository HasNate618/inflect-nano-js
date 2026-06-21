// Generated from tiny_tts/text/symbols.py — keep in sync with owensong/Inflect-Nano-v1.

const punctuation = ["!", "?", "…", ",", ".", "'", "-", "¿", "¡"];
const puSymbols = [...punctuation, "SP", "UNK"];
export const PAD = "_";

const zhSymbols = [
  "E", "En", "a", "ai", "an", "ang", "ao", "b", "c", "ch", "d", "e", "ei", "en", "eng", "er", "f", "g", "h", "i", "i0", "ia", "ian", "iang", "iao", "ie", "in", "ing", "iong", "ir", "iu", "j", "k", "l", "m", "n", "o", "ong", "ou", "p", "q", "r", "s", "sh", "t", "u", "ua", "uai", "uan", "uang", "ui", "un", "uo", "v", "van", "ve", "vn", "w", "x", "y", "z", "zh", "AA", "EE", "OO",
];
const numZhTones = 6;

const jaSymbols = [
  "N", "a", "a:", "b", "by", "ch", "d", "dy", "e", "e:", "f", "g", "gy", "h", "hy", "i", "i:", "j", "k", "ky", "m", "my", "n", "ny", "o", "o:", "p", "py", "q", "r", "ry", "s", "sh", "t", "ts", "ty", "u", "u:", "w", "y", "z", "zy",
];
const numJaTones = 1;

const enSymbols = [
  "aa", "ae", "ah", "ao", "aw", "ay", "b", "ch", "d", "dh", "eh", "er", "ey", "f", "g", "hh", "ih", "iy", "jh", "k", "l", "m", "n", "ng", "ow", "oy", "p", "r", "s", "sh", "t", "th", "uh", "uw", "V", "w", "y", "z", "zh",
];
const numEnTones = 4;

const krSymbols = ["ᄌ", "ᅥ", "ᆫ", "ᅦ", "ᄋ", "ᅵ", "ᄅ", "ᅴ", "ᄀ", "ᅡ", "ᄎ", "ᅪ", "ᄑ", "ᅩ", "ᄐ", "ᄃ", "ᅢ", "ᅮ", "ᆼ", "ᅳ", "ᄒ", "ᄆ", "ᆯ", "ᆷ", "ᄂ", "ᄇ", "ᄉ", "ᆮ", "ᄁ", "ᅬ", "ᅣ", "ᄄ", "ᆨ", "ᄍ", "ᅧ", "ᄏ", "ᆸ", "ᅭ", "(", "ᄊ", ")", "ᅲ", "ᅨ", "ᄈ", "ᅱ", "ᅯ", "ᅫ", "ᅰ", "ᅤ", "~", "\\", "[", "]", "/", "^", ":"];
const numKrTones = 1;

const esSymbols = [
  "N", "Q", "a", "b", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "s", "t", "u", "v", "w", "x", "y", "z", "ɑ", "æ", "ʃ", "ʑ", "ç", "ɯ", "ɪ", "ɔ", "ɛ", "ɹ", "ð", "ə", "ɫ", "ɥ", "ɸ", "ʊ", "ɾ", "ʒ", "θ", "β", "ŋ", "ɦ", "ɡ", "r", "ɲ", "ʝ", "ɣ", "ʎ", "ˈ", "ˌ", "ː",
];
const numEsTones = 1;

const frSymbols = ["\u0303", "œ", "ø", "ʁ", "ɒ", "ʌ", "ɜ", "ɐ"];
const numFrTones = 1;

const deSymbols = ["ʏ", "̩"];
const numDeTones = 1;

const ruSymbols = ["ɭ", "ʲ", "ɕ", "\"", "ɵ", "^", "ɬ"];
const numRuTones = 1;

const normalSymbols = Array.from(
  new Set([
    ...zhSymbols,
    ...jaSymbols,
    ...enSymbols,
    ...krSymbols,
    ...esSymbols,
    ...frSymbols,
    ...deSymbols,
    ...ruSymbols,
  ]),
).sort();

export const symbols = [PAD, ...normalSymbols, ...puSymbols];

export const symbolToId = Object.fromEntries(symbols.map((symbol, index) => [symbol, index]));

export const languageIdMap = {
  ZH: 0,
  JP: 1,
  EN: 2,
  ZH_MIX_EN: 3,
  KR: 4,
  ES: 5,
  SP: 5,
  FR: 6,
  DE: 7,
  RU: 8,
  VI: 9,
} as const;

export const languageToneStartMap = {
  ZH: 0,
  ZH_MIX_EN: 0,
  JP: numZhTones,
  EN: numZhTones + numJaTones,
  KR: numZhTones + numJaTones + numEnTones,
  ES: numZhTones + numJaTones + numEnTones + numKrTones,
  SP: numZhTones + numJaTones + numEnTones + numKrTones,
  FR: numZhTones + numJaTones + numEnTones + numKrTones + numEsTones,
  DE: numZhTones + numJaTones + numEnTones + numKrTones + numEsTones + numFrTones,
  RU: numZhTones + numJaTones + numEnTones + numKrTones + numEsTones + numFrTones + numDeTones,
  VI:
    numZhTones +
    numJaTones +
    numEnTones +
    numKrTones +
    numEsTones +
    numFrTones +
    numDeTones +
    numRuTones,
} as const;

export type LanguageCode = keyof typeof languageToneStartMap;

export const ARPA = new Set([
  "AH0", "S", "AH1", "EY2", "AE2", "EH0", "OW2", "UH0", "NG", "B",
  "G", "AY0", "M", "AA0", "F", "AO0", "ER2", "UH1", "IY1", "AH2",
  "DH", "IY0", "EY1", "IH0", "K", "N", "W", "IY2", "T", "AA1",
  "ER1", "EH2", "OY0", "UH2", "UW1", "Z", "AW2", "AW1", "V", "UW2",
  "AA2", "ER", "AW0", "UW0", "R", "OW1", "EH1", "ZH", "AE0", "IH2",
  "IH", "Y", "JH", "P", "AY1", "EY0", "OY2", "TH", "HH", "D",
  "ER0", "CH", "AO1", "AE1", "AO2", "OY1", "AY2", "IH1", "OW0", "L", "SH",
]);
