const QUOTE_TRANSLATION: Record<string, string> = {
  "\u2018": "'",
  "\u2019": "'",
  "\u201c": "",
  "\u201d": "",
  "\u2014": ",",
  "\u2013": ",",
  ";": ",",
  ":": ",",
  "\n": ".",
};

export function cleanTinyTtsText(text: string): string {
  let out = "";
  for (const char of text) {
    out += QUOTE_TRANSLATION[char] ?? char;
  }
  out = out.replaceAll("...", "…");
  out = out.replace(/\s+/g, " ").trim();
  out = out.replace(/\s+([,.!?…])/g, "$1");
  out = out.replace(/([,.!?…]){2,}/g, "$1");
  return out;
}
