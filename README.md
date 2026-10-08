# Gravio

Le spese di ogni giorno, registrate in pochi tocchi dal telefono: quanto hai speso, quanto puoi ancora spendere questo mese e chi ti deve cosa.

È un progetto personale, pensato prima per il telefono (si installa come app) e poi per il desktop.

## Come ragiona

**Registrare una spesa deve costare pochi tocchi.** Il pulsante "Aggiungi spesa" apre un foglio con l'importo in grande, le categorie a tessere e la data già impostata. Mentre scrivi la descrizione l'app suggerisce la categoria in base alle spese che hai già registrato, e sotto trovi le ultime combinazioni usate e "Ripeti ultima".

**Il budget del mese è la prima cosa che vedi.** La Panoramica mostra quanto resta, se sei in linea, e quanto puoi spendere al giorno da qui a fine mese. Una pila di carte "Da sistemare" raccoglie ciò che richiede attenzione: richieste d'amicizia, categorie oltre l'80% del budget, ricorrenti in scadenza, liste della spesa da importare.

**Gli estratti conto della banca si importano senza uscire dal telefono.** Si carica un CSV, un Excel o un PDF con testo e il file viene letto nel browser, senza passare dal server. Gravio propone da solo le colonne giuste, segna i movimenti già presenti e suggerisce la categoria; tu controlli l'anteprima e importi.

**Gli scontrini si fotografano.** Una foto, la lettura con un modello di Workers AI e un form già compilato da confermare. La foto non viene salvata.

**I consigli di risparmio partono dai numeri, non dall'AI.** Categorie che crescono rispetto ai mesi scorsi, abbonamenti, micro-spese frequenti e budget a rischio sono calcolati senza AI. Il modello riceve solo i totali per categoria, mai le descrizioni delle spese, e scrive 3-5 consigli in italiano. Il risultato resta in cache una settimana e, se l'AI non risponde, la card funziona comunque con testi di riserva.

**I conti con gli amici sono nello stesso posto.** Amici e gruppi, spese condivise divise in parti uguali, per percentuale, per importo o per quote, saldi e richieste.

Poi c'è il resto: transazioni ricorrenti, liste della spesa convertibili in transazioni, obiettivi di risparmio con scadenza, statistiche, ricerca globale (Cmd/Ctrl+K), tema chiaro e scuro, colore d'accento e valuta preferita. L'accesso è senza password, con un link via email.

Su telefono gli overlay sono drawer, su desktop sono dialog, e date e select non sono mai quelle del browser.

## Provarlo in locale

Servono Node 20 o superiore e pnpm.

```bash
pnpm install
pnpm dev
```

L'app parte su http://localhost:3000. Crea un file `.dev.vars` (ignorato da Git) con queste variabili:

- `BETTER_AUTH_SECRET`: una stringa casuale di almeno 32 caratteri, firma le sessioni
- `BETTER_AUTH_URL`: l'indirizzo dell'app, in locale `http://localhost:3000`
- `BREVO_API_KEY`, `BREVO_FROM_EMAIL`, `BREVO_FROM_NAME`: per le email, facoltative

In sviluppo i link delle email non vengono inviati ma stampati nel terminale. Il database è un D1 locale di Wrangler, quindi non tocca i dati di produzione. Il binding di Workers AI invece usa sempre le risorse remote e richiede `wrangler login`.

Gli altri comandi utili sono `pnpm lint`, `pnpm preview` (build per Cloudflare in anteprima) e `pnpm db:generate` per creare una migration dallo schema.

## Com'è fatto

Next.js 16 con App Router, React 19 e TypeScript, interfaccia in Tailwind CSS 4 con shadcn/ui, vaul per i drawer, recharts per i grafici e `motion` per le animazioni. I dati passano da tRPC con validazione zod e TanStack Query. Il database è Cloudflare D1 con Drizzle, il login è better-auth con magic link e le email partono da Brevo. Gira su Cloudflare Workers tramite OpenNext, con Workers AI (`@cf/google/gemma-4-26b-a4b-it`) per scontrini e consigli. Lint e formattazione con Biome, release con changesets.

```
src/app/            pagine: panoramica, transazioni, liste, statistiche, amici, obiettivi, impostazioni
src/components/     shell di navigazione, componenti base (ui), notifiche
src/lib/import/     lettura di CSV, Excel e PDF, colonne, duplicati, categorie suggerite
src/lib/insights/   analisi della spesa e testi dei consigli
src/lib/receipt/    ridimensionamento delle foto degli scontrini
src/server/         procedure tRPC e client di Workers AI con quota per utente
src/db/             schema Drizzle e migration di D1
```

`next` è fissato alla 16.3.8: la 16.4.0 non parte con l'adapter OpenNext attuale. Prima di aggiornarlo conviene verificare la compatibilità.

## Deploy

1. Crea il database D1 e metti il suo id in `wrangler.jsonc`, insieme al dominio.
2. Applica le migration in `src/db/migrations`, una alla volta: `wrangler d1 execute <database> --remote --file src/db/migrations/<file>.sql`. Dopo `pnpm db:generate` controlla il `.sql` generato e tieni solo i `CREATE` nuovi se contiene ricostruzioni di tabelle esistenti.
3. Imposta i secret con `wrangler secret put` (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BREVO_API_KEY`).
4. `pnpm deploy`.

Sul piano gratuito di Cloudflare i limiti da tenere d'occhio sono 10 ms di CPU per richiesta, 100.000 richieste al giorno e 10.000 neuron al giorno di Workers AI per l'intero account. Per questo scontrini e consigli hanno una quota per utente (20 scansioni al giorno).

## Come lavoro

Si lavora e si fa commit solo su `development`. Le release si fanno solo su `main`, con il commit `chore: release vX.Y.Z`. Il workflow `.github/workflows/deploy.yml` parte sui tag `v*` e fa il deploy sul vecchio server via SSH: prima di creare un tag conviene controllare se serve ancora.
