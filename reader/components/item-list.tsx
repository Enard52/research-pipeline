"use client";

import { useMemo, useState } from "react";
import { countBy, itemMatches } from "@/lib/filter";
import { dayKey, formatDayHeading, plainText, sourceLabel, topicLabel } from "@/lib/format";
import type { Item } from "@/lib/items";

export default function ItemList({ items }: { items: Item[] }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  const topics = useMemo(() => countBy(items.flatMap((item) => item.tags)), [items]);
  const sources = useMemo(() => countBy(items.map((item) => item.source_id)), [items]);
  const filtered = useMemo(
    () => items.filter((item) => itemMatches(item, { query, topic, source })),
    [items, query, topic, source],
  );
  const days = useMemo(() => groupByDay(filtered), [filtered]);

  const filtering = query.trim() !== "" || topic !== null || source !== null;
  const clear = () => {
    setQuery("");
    setTopic(null);
    setSource(null);
  };

  return (
    <div className="workspace">
      <aside className="rail" aria-label="Filters">
        <label className="search">
          <span className="rail-label">Search</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Titles, sources, topics"
            autoComplete="off"
          />
        </label>

        {topics.length > 0 && (
          <FilterGroup
            label="Topics"
            options={topics}
            selected={topic}
            onSelect={setTopic}
            format={topicLabel}
            total={items.length}
          />
        )}

        {sources.length > 0 && (
          <FilterGroup
            label="Sources"
            options={sources}
            selected={source}
            onSelect={setSource}
            format={sourceLabel}
            total={items.length}
          />
        )}
      </aside>

      <section className="feed" aria-label="Collected items">
        <div className="feed-bar" aria-live="polite">
          <p>
            {filtering
              ? `${filtered.length} of ${items.length} ${plural(items.length)}`
              : `${items.length} ${plural(items.length)}, newest first`}
          </p>
          {filtering && (
            <button type="button" className="clear" onClick={clear}>
              Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 && (
          <p className="empty">{items.length === 0 ? "No items collected yet." : "Nothing matches these filters."}</p>
        )}

        {days.map((day) => (
          <div key={day.key} className="day">
            <h2 className="day-heading">{formatDayHeading(day.items[0].published_at)}</h2>
            <ul className="items">
              {day.items.map((item) => {
                const summary = plainText(item.summary);
                return (
                  <li key={item.id} className="item">
                    <p className="item-source">{sourceLabel(item.source_id)}</p>
                    <a className="title" href={item.url} target="_blank" rel="noreferrer">
                      {item.title?.trim() || item.url}
                    </a>
                    {summary && <p className="summary">{summary}</p>}
                    {item.tags.length > 0 && (
                      <div className="item-tags">
                        {item.tags.map((tag) => (
                          <span key={tag}>{topicLabel(tag)}</span>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}

function FilterGroup({
  label,
  options,
  selected,
  onSelect,
  format,
  total,
}: {
  label: string;
  options: { value: string; count: number }[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  format: (value: string) => string;
  total: number;
}) {
  return (
    <div className="filter-group" role="group" aria-label={label}>
      <p className="rail-label">{label}</p>
      <button type="button" aria-pressed={selected === null} onClick={() => onSelect(null)}>
        <span>All</span>
        <span className="n">{total}</span>
      </button>
      {options.map(({ value, count }) => (
        <button
          key={value}
          type="button"
          aria-pressed={selected === value}
          onClick={() => onSelect(selected === value ? null : value)}
        >
          <span>{format(value)}</span>
          <span className="n">{count}</span>
        </button>
      ))}
    </div>
  );
}

function groupByDay(items: Item[]): { key: string; items: Item[] }[] {
  const groups: { key: string; items: Item[] }[] = [];
  for (const item of items) {
    const key = dayKey(item.published_at);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(item);
    else groups.push({ key, items: [item] });
  }
  return groups;
}

function plural(n: number): string {
  return n === 1 ? "item" : "items";
}
