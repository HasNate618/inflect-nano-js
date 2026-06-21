const ABBREVIATIONS: Array<[RegExp, string]> = [
  ["mrs", "misess"],
  ["mr", "mister"],
  ["dr", "doctor"],
  ["st", "saint"],
  ["co", "company"],
  ["jr", "junior"],
  ["maj", "major"],
  ["gen", "general"],
  ["drs", "doctors"],
  ["rev", "reverend"],
  ["lt", "lieutenant"],
  ["hon", "honorable"],
  ["sgt", "sergeant"],
  ["capt", "captain"],
  ["esq", "esquire"],
  ["ltd", "limited"],
  ["col", "colonel"],
  ["ft", "fort"],
].map(([abbr, replacement]) => [new RegExp(`\\b${abbr}\\.`, "i"), replacement]);

export function expandAbbreviations(text: string): string {
  let out = text;
  for (const [regex, replacement] of ABBREVIATIONS) {
    out = out.replace(regex, replacement);
  }
  return out;
}
