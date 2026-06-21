import { getCmuDict } from "./cmu-dict.js";
import { predictG2p } from "./g2p-predict.js";
import { isArpaPhone, mapPhoneme, parsePhoneme, parseSyllables } from "./phonemes-to-ids.js";

export interface GraphemeResult {
  phones: string[];
  tones: number[];
}

function lookupPhones(core: string): [string[], number[]] | null {
  const entry = getCmuDict()[core.toUpperCase()];
  if (!entry) return null;
  return parseSyllables([entry]);
}

function phonesFromNeural(core: string): [string[], number[]] {
  const preds = predictG2p(core);
  if (preds?.length) {
    const phones: string[] = [];
    const tones: number[] = [];
    for (const ph of preds) {
      if (isArpaPhone(ph)) {
        const [parsed, tone] = parsePhoneme(ph);
        phones.push(parsed);
        tones.push(tone);
      } else {
        phones.push(ph);
        tones.push(0);
      }
    }
    return [phones, tones];
  }

  const phones: string[] = [];
  const tones: number[] = [];
  for (const ch of core) {
    if (ch === "'") continue;
    phones.push(ch.toLowerCase());
    tones.push(0);
  }
  return [phones, tones];
}

function resolveCore(core: string): [string[], number[]] {
  if (core.includes("'")) {
    const parts = core.split("'");
    const phones: string[] = [];
    const tones: number[] = [];
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) {
        phones.push("'");
        tones.push(0);
      }
      const part = parts[i];
      if (!part) continue;
      const hit = lookupPhones(part) ?? phonesFromNeural(part);
      phones.push(...hit[0]);
      tones.push(...hit[1]);
    }
    return [phones, tones];
  }

  return lookupPhones(core) ?? phonesFromNeural(core);
}

/** Grapheme-to-phoneme aligned with tiny_tts/text/english.py + tiny-tts npm G2P. */
export function graphemeToPhoneme(text: string, padStartEnd = true): GraphemeResult {
  const words = text.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const allPhones: string[] = [];
  const allTones: number[] = [];

  for (const word of words) {
    const lead = word.match(/^[^a-z0-9]*/)?.[0] ?? "";
    const trail = word.match(/[^a-z0-9']*$/)?.[0] ?? "";
    const core = word.slice(lead.length, word.length - trail.length);

    for (const ch of lead) {
      allPhones.push(mapPhoneme(ch));
      allTones.push(0);
    }

    if (core.length > 0) {
      const [phones, tones] = resolveCore(core);
      for (let i = 0; i < phones.length; i++) {
        allPhones.push(mapPhoneme(phones[i]));
        allTones.push(tones[i]);
      }
    }

    for (const ch of trail) {
      allPhones.push(mapPhoneme(ch));
      allTones.push(0);
    }
  }

  if (padStartEnd) {
    allPhones.unshift("_");
    allPhones.push("_");
    allTones.unshift(0);
    allTones.push(0);
  }

  return { phones: allPhones, tones: allTones };
}
