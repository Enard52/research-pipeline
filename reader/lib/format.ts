const ACRONYMS: Record<string, string> = {
  sec: "SEC",
  cftc: "CFTC",
  etf: "ETF",
  rwa: "RWA",
  ai: "AI",
};

function displayWord(word: string, titleCase: boolean): string {
  const known = ACRONYMS[word];
  if (known) return known;
  if (!titleCase) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function sourceLabel(sourceId: string): string {
  return sourceId.split("-").filter(Boolean).map((word) => displayWord(word, false)).join(" ");
}

export function topicLabel(tag: string): string {
  return tag.split("-").filter(Boolean).map((word) => displayWord(word, true)).join(" ");
}

// Publication dates are stored in UTC. Format in UTC so a late-evening
// Eastern timestamp does not move the calendar day.
export function formatDate(iso: string | null): string {
  if (!iso) return "Date unknown";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Date unknown";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatDayHeading(iso: string | null): string {
  if (!iso) return "Undated";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Undated";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function dayKey(iso: string | null): string {
  if (!iso) return "undated";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "undated" : date.toISOString().slice(0, 10);
}

// RSS summaries often include HTML. The page renders text only.
export function plainText(value: string | null): string | null {
  if (!value) return null;
  const text = value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, digits: string) => fromCodePoint(Number(digits)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => fromCodePoint(parseInt(hex, 16)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#0*39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 0 ? text : null;
}

function fromCodePoint(code: number): string {
  if (!Number.isFinite(code) || code <= 0 || code > 0x10ffff) return " ";
  return String.fromCodePoint(code);
}

export function byNewest(
  a: { published_at: string | null },
  b: { published_at: string | null },
): number {
  const aTime = a.published_at ? Date.parse(a.published_at) : Number.NaN;
  const bTime = b.published_at ? Date.parse(b.published_at) : Number.NaN;
  const aMissing = Number.isNaN(aTime);
  const bMissing = Number.isNaN(bTime);
  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;
  return bTime - aTime;
}
