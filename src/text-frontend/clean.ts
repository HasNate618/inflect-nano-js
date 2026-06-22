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
  let result = text;

  for (const [from, to] of Object.entries(QUOTE_TRANSLATION)) {
    result = result.split(from).join(to);
  }

  result = result.replace(/\.\.\./g, "\u2026");

  // Strip markdown
  result = result.replace(/\*\*(.+?)\*\*/g, "$1");
  result = result.replace(/\*(.+?)\*/g, "$1");
  result = result.replace(/`(.+?)`/g, "$1");
  result = result.replace(/^#{1,6}\s+/gm, "");
  result = result.replace(/^[-*•]\s+/gm, "");
  result = result.replace(/^\d+\.\s+/gm, "");

  result = result.replace(/\s+/g, " ").trim();
  result = result.replace(/\s+([,.!?\u2026])/g, "$1");
  result = result.replace(/([,.!?\u2026]){2,}/g, "$1");
  return result;
}
