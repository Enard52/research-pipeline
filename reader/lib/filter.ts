import { plainText, sourceLabel, topicLabel } from "./format";

type Searchable = {
  title: string | null;
  summary: string | null;
  source_id: string;
  tags: string[];
};

export type Filters = { query: string; topic: string | null; source: string | null };

// Filters run on items already loaded. Every word in the query has to appear
// in the title, summary, source, or topic.
export function itemMatches(item: Searchable, { query, topic, source }: Filters): boolean {
  if (topic && !item.tags.includes(topic)) return false;
  if (source && item.source_id !== source) return false;
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const summary = plainText(item.summary) ?? "";
  const haystack = [item.title ?? "", summary, sourceLabel(item.source_id), ...item.tags.map(topicLabel)]
    .join(" ")
    .toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

export function countBy(values: string[]): { value: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}
