import { ARPA, languageToneStartMap, symbolToId, symbols } from "./symbols.js";

const symbolSet = new Set<string>(symbols);

export function phonemesToIds(
  cleanedText: string[],
  tones: number[],
  language: "EN" = "EN",
): [number[], number[], number[]] {
  const unkId = symbolToId["UNK"];
  const phones = cleanedText.map((symbol) => symbolToId[symbol] ?? unkId);
  const toneStart = languageToneStartMap[language];
  const toneIds = tones.map((tone) => tone + toneStart);
  const langId = 2;
  const langIds = new Array(phones.length).fill(langId);
  return [phones, toneIds, langIds];
}

export function mapPhoneme(ph: string): string {
  const rep: Record<string, string> = {
    "：": ",",
    "；": ",",
    "，": ",",
    "。": ".",
    "！": "!",
    "？": "?",
    "\n": ".",
    "·": ",",
    "、": ",",
    "...": "…",
    v: "V",
  };
  if (rep[ph] !== undefined) ph = rep[ph];
  if (symbolSet.has(ph)) return ph;
  return "UNK";
}

export function parsePhoneme(phn: string): [string, number] {
  const match = phn.match(/(\d)$/);
  if (match) return [phn.slice(0, -1).toLowerCase(), Number.parseInt(match[1], 10) + 1];
  return [phn.toLowerCase(), 0];
}

export function parseSyllables(syllables: string[][]): [string[], number[]] {
  const phonemes: string[] = [];
  const tones: number[] = [];
  for (const phnList of syllables) {
    for (const phn of phnList) {
      const [phone, tone] = parsePhoneme(phn);
      phonemes.push(phone);
      tones.push(tone);
    }
  }
  return [phonemes, tones];
}

export function isArpaPhone(ph: string): boolean {
  return ARPA.has(ph);
}
