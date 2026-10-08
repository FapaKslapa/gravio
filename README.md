# Gravio

Gravio è un'app per tenere sotto controllo le proprie spese, pensata prima di tutto per il telefono (PWA) e che funziona bene anche da desktop. Registra spese ed entrate in più valute, ti dice quanto puoi ancora spendere nel mese e ti aiuta a dividere i conti con gli amici.

Produzione: https://gravio.zimaserver.it

## Funzionalità

- **Panoramica**: budget del mese in grande, "Puoi spendere X al giorno", spese recenti, budget per categoria, saldi con gli amici, convertitore di valuta e una pila di carte "Da sistemare" (richieste d'amicizia, budget oltre l'80%, ricorrenti in scadenza, liste da importare).
- **Aggiunta rapida**: importo, categoria, data e valuta in pochi tocchi, con le ultime combinazioni usate e "Ripeti ultima". La categoria viene suggerita dallo storico mentre scrivi la descrizione.
- **Transazioni**: timeline per giorno, tabella ordinabile, filtri, ricorrenti, categorie personalizzabili, swipe sulle righe su mobile (modifica, duplica, elimina con annulla).
- **Import estratti conto**: CSV, Excel (`.xlsx`) e PDF con testo, letti direttamente nel browser (il file non lascia il dispositivo). Mappatura colonne, anteprima, rilevamento dei duplicati e categoria suggerita.
- **Scansione scontrini**: foto dello scontrino, lettura con Workers AI e form di conferma precompilato.
- **Consulente di risparmio**: "Dove puoi risparmiare". I numeri sono calcolati senza AI (categorie in crescita, abbonamenti, micro-spese, budget a rischio); l'AI scrive solo i consigli, riceve solo totali per categoria e il risultato è in cache per una settimana.
- **Obiettivi di risparmio** con versamenti, scadenza e importo mensile necessario.
- **Liste della spesa** con conversione delle voci in transazioni.
- **Statistiche**: trend, ripartizione per categoria, calendario di spesa.
- **Amici e gruppi**: spese condivise con divisione uguale, per percentuale, importo o parti, saldi e richieste.
- **Ricerca globale** (Cmd/Ctrl+K) per azioni, pagine, transazioni, amici e liste.
- **Impostazioni**: tema chiaro/scuro, colore d'accento, valuta preferita, budget, notifiche.
- Accesso senza password con link via email.

Su mobile gli overlay sono drawer (bottom sheet), su desktop sono dialog. Date e select non sono mai quelle del browser.

## Stack

- Next.js 16 (App Router, React 19), TypeScript
- Tailwind CSS 4, shadcn/ui (Radix), vaul, motion, recharts
- tRPC + TanStack Query, zod
- better-auth (magic link), email transazionali con Brevo
- Cloudflare Workers con l'adapter OpenNext, database D1, drizzle ORM
- Workers AI (modello `@cf/google/gemma-4-26b-a4b-it`) per scontrini e consigli
- Biome per lint e formattazione, changesets per le release, pnpm

`next` è fissato a `16.3.8`: la `16.4.0` non funziona con l'adapter OpenNext attuale (errore `preview-props.json` in avvio). Prima di aggiornarlo verifica la compatibilità.

## Sviluppo locale

Requisiti: Node 20+ e pnpm.

```bash
pnpm install
```

Crea un file `.dev.vars` (ignorato da Git) con:

```
BETTER_AUTH_SECRET=una-stringa-casuale-di-almeno-32-caratteri
BETTER_AUTH_URL=http://localhost:3000
BREVO_API_KEY=            # opzionale: senza chiave le email non partono
BREVO_FROM_EMAIL=         # opzionale
BREVO_FROM_NAME=          # opzionale
```

Poi:

```bash
pnpm dev
```

In sviluppo i link delle email vengono stampati nel terminale. Il binding `DB` usa il database D1 locale di Wrangler; il binding `AI` accede sempre alle risorse remote, quindi richiede `wrangler login`.

Comandi utili:

| Comando | Cosa fa |
| --- | --- |
| `pnpm lint` | controlla `src` con Biome |
| `pnpm build` | build di Next.js |
| `pnpm preview` | build OpenNext e anteprima nel runtime Workers |
| `pnpm deploy` | build OpenNext e deploy su Cloudflare |
| `pnpm db:generate` | genera una migration da `src/db/schema.ts` |

## Database

Lo schema è in `src/db/schema.ts` e le migration in `src/db/migrations`. Dopo `pnpm db:generate`, controlla il `.sql` generato: se contiene ricostruzioni di tabelle esistenti, tieni solo i `CREATE` nuovi. Le migration si applicano a mano:

```bash
npx wrangler d1 execute gravio --remote --file src/db/migrations/<file>.sql
```

## Deploy

Il Worker si chiama `gravio` ed è collegato al dominio `gravio.zimaserver.it` (vedi `wrangler.jsonc`). Segreti da impostare sul Worker:

```bash
npx wrangler secret put BETTER_AUTH_SECRET --name gravio
npx wrangler secret put BETTER_AUTH_URL --name gravio    # https://gravio.zimaserver.it
npx wrangler secret put BREVO_API_KEY --name gravio
```

Poi `pnpm deploy`. Con il piano gratuito di Cloudflare i limiti da tenere d'occhio sono 10 ms di CPU per richiesta, 100.000 richieste al giorno e 10.000 neuron al giorno di Workers AI per l'intero account (il limite per utente è di 20 scansioni al giorno).

## Flusso di lavoro

- Si lavora e si fa commit solo su `development`.
- Le release si fanno solo su `main`: merge di `development`, aggiornamento di versione e `CHANGELOG.md`, commit `chore: release vX.Y.Z`.
- Il workflow `.github/workflows/deploy.yml` parte sui tag `v*` e fa il deploy sul vecchio server via SSH: prima di creare un tag, verifica se serve ancora.
