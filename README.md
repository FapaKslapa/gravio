# Gravio

Everyday expenses, logged in a few taps from your phone: how much you spent, how much you can still spend this month, and who owes what.

It is a personal project, built phone-first (it installs as an app) and then adapted to the desktop.

## How it thinks

**Logging an expense should take a few taps.** The "Aggiungi spesa" button opens a sheet with a large amount field, categories as tiles and the date already set. While you type the description, the app suggests a category based on the expenses you have already logged, and below it you find your latest combinations and a "repeat last" shortcut.

**The monthly budget is the first thing you see.** The overview shows how much is left, whether you are on track, and how much you can spend per day from now until the end of the month. A stack of "Da sistemare" cards collects whatever needs attention: friend requests, categories past 80% of their budget, recurring payments about to be due, shopping lists ready to import.

**Bank statements are imported without leaving the phone.** Upload a CSV, an Excel file or a PDF with a text layer and it is read in the browser, never sent to the server. Gravio guesses the right columns, flags movements you already have and suggests a category; you check the preview and import.

**Receipts are photographed.** One photo, a read by a Workers AI model, and a pre-filled form to confirm. The photo is not stored.

**Saving advice starts from numbers, not from AI.** Categories growing compared to previous months, subscriptions, frequent small purchases and budgets at risk are computed without AI. The model only receives totals per category, never the descriptions of your expenses, and writes 3 to 5 tips in Italian. The result is cached for a week, and if the AI does not answer the card still works with fallback text.

**Splitting costs with friends lives in the same place.** Friends and groups, shared expenses split equally, by percentage, by amount or by shares, balances and requests.

On top of that: recurring transactions, shopping lists that convert into transactions, savings goals with a deadline, statistics, global search (Cmd/Ctrl+K), light and dark theme, accent colour and preferred currency. Sign-in is passwordless, with a link sent by email.

On phones overlays are drawers, on desktop they are dialogs, and dates and selects are never the browser's native ones.

## Running it locally

You need Node 20 or later and pnpm.

```bash
pnpm install
pnpm dev
```

The app starts on http://localhost:3000. Create a `.dev.vars` file (ignored by Git) with these variables:

- `BETTER_AUTH_SECRET`: a random string of at least 32 characters, signs the sessions
- `BETTER_AUTH_URL`: the address of the app, `http://localhost:3000` locally
- `BREVO_API_KEY`, `BREVO_FROM_EMAIL`, `BREVO_FROM_NAME`: for emails, optional

In development emails are not sent, their links are printed in the terminal instead. The database is a local Wrangler D1, so production data is never touched. The Workers AI binding, on the other hand, always uses remote resources and needs `wrangler login`.

Other useful commands are `pnpm lint`, `pnpm preview` (a Cloudflare build in preview) and `pnpm db:generate` to create a migration from the schema.

## How it is built

Next.js 16 with the App Router, React 19 and TypeScript, with a Tailwind CSS 4 interface built on shadcn/ui, vaul for drawers, recharts for charts and `motion` for animation. Data goes through tRPC with zod validation and TanStack Query. The database is Cloudflare D1 with Drizzle, sign-in is better-auth with magic links and emails go out through Brevo. It runs on Cloudflare Workers through OpenNext, with Workers AI (`@cf/google/gemma-4-26b-a4b-it`) for receipts and advice. Linting and formatting with Biome, releases with changesets.

```
src/app/            pages: overview, transactions, lists, statistics, friends, goals, settings
src/components/     navigation shell, base components (ui), notifications
src/lib/import/     CSV, Excel and PDF reading, columns, duplicates, suggested categories
src/lib/insights/   spending analysis and advice text
src/lib/receipt/    receipt photo resizing
src/server/         tRPC procedures and the Workers AI client with per-user quota
src/db/             Drizzle schema and D1 migrations
```

`next` is pinned to 16.3.8: 16.4.0 does not start with the current OpenNext adapter. Check compatibility before upgrading.

## Deploy

1. Create the D1 database and put its id in `wrangler.jsonc`, together with the domain.
2. Apply the migrations in `src/db/migrations`, one at a time: `wrangler d1 execute <database> --remote --file src/db/migrations/<file>.sql`. After `pnpm db:generate`, check the generated `.sql` and keep only the new `CREATE` statements if it contains rebuilds of existing tables.
3. Set the secrets with `wrangler secret put` (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BREVO_API_KEY`).
4. `pnpm run deploy`.

On Cloudflare's free plan the limits to watch are 10 ms of CPU per request, 100,000 requests per day and 10,000 Workers AI neurons per day for the whole account. That is why receipts and advice have a per-user quota (20 scans per day).

## How I work

Work and commits happen only on `development`. Releases happen only on `main`, with the `chore: release vX.Y.Z` commit.

Pushing a `v*` tag runs `.github/workflows/deploy.yml`, which publishes the GitHub release using the notes from `CHANGELOG.md` and deploys to Cloudflare Workers. The deploy needs the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets; without them it is skipped and the release is still created. D1 migrations stay manual.
