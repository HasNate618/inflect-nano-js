function expandNum(n: number): string {
  const ones = [
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
  ];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  if (n < 20) return ones[n];
  if (n < 100) {
    const rem = n % 10;
    return rem ? `${tens[Math.floor(n / 10)]} ${ones[rem]}` : tens[Math.floor(n / 10)];
  }
  return String(n);
}

const TIME_RE =
  /\b((0?[0-9])|(1[0-1])|(1[2-9])|(2[0-3])):([0-5][0-9])\s*(a\.m\.|am|pm|p\.m\.|a\.m|p\.m)?\b/gi;

function expandTime(_match: string, hourRaw: string, _h2: string, _h3: string, _h4: string, _h5: string, minuteRaw: string, ampm?: string): string {
  let hour = Number.parseInt(hourRaw, 10);
  let pastNoon = hour >= 12;
  const parts: string[] = [];

  if (hour > 12) hour -= 12;
  else if (hour === 0) {
    hour = 12;
    pastNoon = true;
  }

  parts.push(expandNum(hour));
  const minute = Number.parseInt(minuteRaw, 10);
  if (minute > 0) {
    if (minute < 10) parts.push("oh");
    parts.push(expandNum(minute));
  }

  if (!ampm) parts.push(pastNoon ? "p m" : "a m");
  else parts.push(...ampm.replace(/\./g, "").split(""));

  return parts.join(" ");
}

export function expandTimeEnglish(text: string): string {
  return text.replace(TIME_RE, expandTime);
}
