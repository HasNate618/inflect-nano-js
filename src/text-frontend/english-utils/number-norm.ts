const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function numberToWords(num: number, andWord = ""): string {
  if (num < 0) return `minus ${numberToWords(-num, andWord)}`;
  if (num < 20) return ONES[num];
  if (num < 100) {
    const tens = Math.floor(num / 10);
    const ones = num % 10;
    return ones ? `${TENS[tens]} ${ONES[ones]}` : TENS[tens];
  }
  if (num < 1000) {
    const hundreds = Math.floor(num / 100);
    const rest = num % 100;
    const tail = rest ? `${andWord} ${numberToWords(rest, andWord)}` : "";
    return `${ONES[hundreds]} hundred${tail}`.trim();
  }
  if (num < 1_000_000) {
    const thousands = Math.floor(num / 1000);
    const rest = num % 1000;
    const tail = rest ? ` ${numberToWords(rest, andWord)}` : "";
    return `${numberToWords(thousands, andWord)} thousand${tail}`;
  }
  return String(num);
}

function numberToWordsGrouped(num: number): string {
  if (num < 0) return `minus ${numberToWordsGrouped(-num)}`;
  if (num < 100) return numberToWords(num, "");
  const hundreds = Math.floor(num / 100);
  const rest = num % 100;
  const hundredPart = `${ONES[hundreds]} hundred`;
  if (!rest) return hundredPart;
  if (rest < 10) return `${hundredPart} oh ${ONES[rest]}`;
  return `${hundredPart} ${numberToWords(rest, "")}`;
}

function expandOrdinal(match: string): string {
  const digits = match.replace(/(st|nd|rd|th)$/i, "");
  const n = Number.parseInt(digits, 10);
  const words = numberToWords(n);
  if (words.endsWith("one")) return `${words.slice(0, -3)}first`;
  if (words.endsWith("two")) return `${words.slice(0, -3)}second`;
  if (words.endsWith("three")) return `${words.slice(0, -5)}third`;
  if (words.endsWith("five")) return `${words.slice(0, -4)}fifth`;
  if (words.endsWith("eight")) return `${words.slice(0, -5)}eighth`;
  if (words.endsWith("nine")) return `${words.slice(0, -4)}ninth`;
  if (words.endsWith("twelve")) return `${words.slice(0, -2)}elfth`;
  return `${words}th`;
}

function expandCurrency(value: string, unit: string): string {
  const parts = value.replace(/,/g, "").split(".");
  const integer = parts[0] ? Number.parseInt(parts[0], 10) : 0;
  const fraction = parts[1] ? Number.parseInt(parts[1], 10) : 0;
  const currency = {
    $: { singular: "dollar", plural: "dollars", cent: "cent", cents: "cents" },
    "£": { singular: "pound sterling", plural: "pounds sterling", cent: "penny", cents: "pence" },
    "¥": { singular: "yen", plural: "yen", cent: "sen", cents: "sen" },
  }[unit] ?? { singular: "unit", plural: "units", cent: "cent", cents: "cents" };

  const chunks: string[] = [];
  if (integer > 0) chunks.push(`${integer} ${integer === 1 ? currency.singular : currency.plural}`);
  if (fraction > 0) chunks.push(`${fraction} ${fraction === 1 ? currency.cent : currency.cents}`);
  if (!chunks.length) return `zero ${currency.plural}`;
  return chunks.join(" ");
}

function expandNumber(match: string): string {
  const num = Number.parseInt(match, 10);
  if (num > 1000 && num < 3000) {
    if (num === 2000) return "two thousand";
    if (num > 2000 && num < 2010) return `two thousand ${numberToWords(num % 100)}`;
    if (num % 100 === 0) return `${numberToWords(num / 100)} hundred`;
    return numberToWordsGrouped(num);
  }
  return numberToWords(num);
}

export function normalizeNumbers(text: string): string {
  let out = text;
  out = out.replace(/([0-9][0-9,]+[0-9])/g, (match) => match.replace(/,/g, ""));
  out = out.replace(/(£|\$|¥)([0-9,.]*[0-9]+)/g, (_, unit, value) => expandCurrency(value, unit));
  out = out.replace(/([0-9]+\.[0-9]+)/g, (match) => match.replace(".", " point "));
  out = out.replace(/[0-9]+(st|nd|rd|th)/gi, (match) => expandOrdinal(match));
  out = out.replace(/-?[0-9]+/g, (match) => expandNumber(match));
  return out;
}
