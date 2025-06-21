export type CurrencyQuery = {
  amount: number;
  from: string;
  to: string;
};

const SYMBOL_TO_CODE: Record<string, string> = {
  $: "usd",
  "€": "eur",
  "£": "gbp",
  "¥": "jpy",
  "₹": "inr",
  "₽": "rub",
  "₩": "krw",
  "₨": "pkr",
  "₺": "try",
  R$: "brl",
  "₫": "vnd",
  "₴": "uah",
  "₦": "ngn",
  "₪": "ils",
  "₡": "crc",
  "₱": "php",
  "฿": "thb",
  "₭": "lak",
  "₮": "mnt",
  "₼": "azn",
  "₵": "ghs",
  "₸": "kzt",
  A$: "aud",
  C$: "cad",
  NZ$: "nzd",
  S$: "sgd",
  HK$: "hkd",
  "₲": "pyg",
  "₠": "euro",
  "₢": "brb",
  "₣": "frf",
  "₤": "itl",
  "₧": "esp",
  "₯": "grd",
  "₰": "pfennig",
  "₳": "ara",
  "₾": "gel",
  "₿": "btc",
  "៛": "khr",
  "₥": "mill",
};

export function isCurrencyConversion(query: string): CurrencyQuery | null {
  let normalized = query.trim().toLowerCase();

  // Step 1: Replace symbols when they're stuck to numbers (like $2 → 2 usd)
  for (const [symbol, code] of Object.entries(SYMBOL_TO_CODE)) {
    const escapedSymbol = symbol.replace(/[$()*+?.\\^|{}[\]]/g, "\\$&");

    // Match patterns like "$2", "₹100" (symbol followed by number)
    const symbolNumberRegex = new RegExp(
      `${escapedSymbol}(\\d+(?:\\.\\d+)?)`,
      "gi"
    );
    normalized = normalized.replace(
      symbolNumberRegex,
      (_, amount) => `${amount} ${code}`
    );
  }

  // Step 2: Replace standalone symbols like "$ to inr" → "usd to inr"
  for (const [symbol, code] of Object.entries(SYMBOL_TO_CODE)) {
    const escapedSymbol = symbol.replace(/[$()*+?.\\^|{}[\]]/g, "\\$&");
    const standaloneRegex = new RegExp(
      `(?<=\\s|^)${escapedSymbol}(?=\\s|$)`,
      "gi"
    );
    normalized = normalized.replace(standaloneRegex, ` ${code} `);
  }

  // Normalize spacing
  normalized = normalized.replace(/\s+/g, " ").trim();

  // Step 3: Extract amount, from, and to
  const regex = /(\d+(?:\.\d+)?)\s*([a-z]{2,5})\s+(?:to|in)\s+([a-z]{2,5})/i;
  const match = normalized.match(regex);
  if (!match) return null;

  const amount = parseFloat(match[1]);
  const from = match[2];
  const to = match[3];

  if (isNaN(amount) || !from || !to) return null;

  return { amount, from, to };
}

export async function convertCurrency({
  amount,
  from,
  to,
}: CurrencyQuery): Promise<string> {
  const url = `https://snipr-iota.vercel.app/api/currency?amount=${amount}&from=${from}&to=${to}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.conversion ?? "null";
}

export async function getMeanings(word: string): Promise<string[]> {
  const url = `https://snipr-iota.vercel.app/api/meaning?word=${encodeURIComponent(
    word
  )}`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

export async function getSuggestions(query: string): Promise<string[]> {
  const url = `https://snipr-iota.vercel.app/api/suggest?q=${encodeURIComponent(
    query
  )}`;

  const res = await fetch(url);
  const data = await res.json();
  return data;
}
