import ItemList from "@/components/item-list";
import { formatDate, sourceLabel } from "@/lib/format";
import { getLatestItems } from "@/lib/items";

// Always fetch fresh data instead of building a static page.
export const dynamic = "force-dynamic";

const REPO_URL = "https://github.com/osucryptoclub/research-pipeline";

export default async function Home() {
  const { items, usingSample, error } = await getLatestItems();
  const sources = [...new Set(items.map((item) => item.source_id))];
  const topics = new Set(items.flatMap((item) => item.tags));
  const lastCollected = latest(items.map((item) => item.collected_at ?? item.published_at));
  const newest = latest(items.map((item) => item.published_at));

  return (
    <>
      <header className="topbar">
        <div className="shell topbar-inner">
          <div className="brand">
            <span className="mark" aria-hidden="true">RP</span>
            <span>
              <span className="brand-name">Research Pipeline</span>
              <span className="brand-org">OSU Crypto Club · Research cohort</span>
            </span>
          </div>
          <p className={`status ${error ? "is-error" : usingSample ? "is-sample" : "is-live"}`}>
            <span className="dot" aria-hidden="true" />
            {error ? "Database unavailable" : usingSample ? "Sample data" : `Updated ${formatDate(lastCollected)}`}
          </p>
        </div>
      </header>

      <section className="hero">
        <div className="shell hero-inner">
          <div>
            <p className="eyebrow">Daily archive</p>
            <h1>What trusted sources published, every morning.</h1>
            <p className="lede">
              Collected each day from sources Research approved, tagged by topic, and kept for good. Every item
              links to the original.
            </p>
          </div>
          <dl className="stats">
            <div>
              <dt>Items</dt>
              <dd>{items.length}</dd>
            </div>
            <div>
              <dt>Sources</dt>
              <dd>{sources.length}</dd>
            </div>
            <div>
              <dt>Topics</dt>
              <dd>{topics.size}</dd>
            </div>
            <div>
              <dt>Newest</dt>
              <dd className="small">{formatDate(newest)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <main className="shell">
        {usingSample && (
          <p className="notice">
            Showing sample data. Add the Supabase URL and public key to <code>reader/.env.local</code> to see
            collected items.
          </p>
        )}
        {error && <p className="notice error">Couldn&apos;t load items: {error}</p>}
        {!error && <ItemList items={items} />}
      </main>

      <footer className="footer">
        <div className="shell footer-inner">
          <div>
            <p className="footer-title">How this works</p>
            <p>
              A collector runs every morning, pulls each approved source, and saves new items. Nothing is
              rewritten or summarized by AI. Titles link to the source.
            </p>
          </div>
          <div>
            <p className="footer-title">Sources</p>
            <ul>
              {sources.length > 0 ? (
                sources.map((id) => <li key={id}>{sourceLabel(id)}</li>)
              ) : (
                <li>None yet</li>
              )}
            </ul>
          </div>
          <div>
            <p className="footer-title">Project</p>
            <ul>
              <li>
                <a href={REPO_URL} target="_blank" rel="noreferrer">
                  GitHub repository
                </a>
              </li>
              <li>
                <a href={`${REPO_URL}/issues/new/choose`} target="_blank" rel="noreferrer">
                  Suggest a source or report a problem
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="shell footer-base">Built by the Builders cohort for OSU Crypto Club Research.</div>
      </footer>
    </>
  );
}

function latest(values: (string | null | undefined)[]): string | null {
  let best: string | null = null;
  let bestTime = -Infinity;
  for (const value of values) {
    if (!value) continue;
    const time = Date.parse(value);
    if (!Number.isNaN(time) && time > bestTime) {
      best = value;
      bestTime = time;
    }
  }
  return best;
}
