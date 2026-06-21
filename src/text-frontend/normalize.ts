import { expandAbbreviations } from "./english-utils/abbreviations.js";
import { normalizeNumbers } from "./english-utils/number-norm.js";
import { expandTimeEnglish } from "./english-utils/time-norm.js";

export function normalizeText(text: string): string {
  let out = text.toLowerCase();
  out = expandTimeEnglish(out);
  out = normalizeNumbers(out);
  out = expandAbbreviations(out);
  return out;
}
