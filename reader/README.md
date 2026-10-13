# Reader

The Next.js app Research uses to browse and search the archive. Reader team owns this folder.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

With no `.env.local`, the page shows sample items from `lib/sample-items.json`, so you can build the layout before the database exists.

## Connect the real database

Copy `.env.example` to `.env.local` and fill in the Supabase URL and **anon** key (a lead will share them). The anon key can only read `items`. Never put the service role key in this app.

## Where things are

- `app/page.tsx`: the home page: header, summary numbers, footer
- `components/item-list.tsx`: search, topic and source filters, and the list grouped by day
- `lib/items.ts`: the database query, with a fallback to sample data
- `lib/format.ts`: source names, topic names, UTC dates, and plain-text summaries
- `lib/filter.ts`: matches a search and a topic against items already loaded
- `app/globals.css`: styles

Summaries from RSS feeds can contain HTML. The page shows that text with the tags removed. It does not render the HTML.

Milestone 1: the home page lists real items, newest first, with title, source, date, tags, and a link to the original.
