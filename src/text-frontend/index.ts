import { cleanTinyTtsText } from "./clean.js";
import { insertBlanks } from "./commons.js";
import { loadCmuDict } from "./cmu-dict.js";
import { graphemeToPhoneme } from "./english.js";
import { loadG2pModel } from "./g2p-predict.js";
import { normalizeText } from "./normalize.js";
import { phonemesToIds } from "./phonemes-to-ids.js";
import type { TokenIds } from "../types.js";

let initialized = false;

export async function loadTextFrontend(urls: { cmudict: string; g2pModel: string }): Promise<void> {
  await Promise.all([loadCmuDict(urls.cmudict), loadG2pModel(urls.g2pModel)]);
  initialized = true;
}

export function textToTokens(text: string): TokenIds {
  if (!initialized) {
    throw new Error("Text frontend not loaded. Await InflectNanoTTS.from_pretrained() first.");
  }

  const cleaned = cleanTinyTtsText(text);
  const normalized = normalizeText(cleaned);
  const { phones, tones } = graphemeToPhoneme(normalized);
  const [phoneIds, toneIds, langIds] = phonemesToIds(phones, tones, "EN");

  return {
    phoneIds: insertBlanks(phoneIds, 0),
    toneIds: insertBlanks(toneIds, 0),
    langIds: insertBlanks(langIds, 0),
  };
}

export { cleanTinyTtsText, normalizeText, graphemeToPhoneme };
