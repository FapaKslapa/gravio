# Gravio redesign: piano a fasi

Branch: sviluppo e commit solo su `development`; release solo su `main`.
Riferimento: `~/WebstormProjects/uniapplication` (shadcn + radix + vaul, framer-motion springs, pill nav, elevation hairline, OKLCH tokens) ma colorato.
Decisioni: accento vivace + colore per categoria; HeroUI rimosso del tutto; mobile = drawer, desktop = dialog.
Verifica a fine fase: `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`, controllo visivo 390px e 1280px.

## Fase 0 - Dipendenze (fatta)
Tutte le dipendenze all'ultima versione (next 16.4, react 19.3, ts 7, ecc.). Nota: `@cloudflare/next-on-pages` e' deprecato, da valutare con OpenNext (`@opennextjs/cloudflare`, gia' usato da uniapplication) in Fase 8.

## Fase 1 - Fondamenta design
- `impeccable document`: DESIGN.md con tokens OKLCH (neutri + accento brand + palette categorie 12 colori con contrasto verificato chiaro/scuro), radius 0.75-1.75rem, elevation-1/2/3, tipografia (sostituire Geist con un font piu' caratteristico), motion (`lib/motion.ts`: springs snappy/smooth/gentle, stagger, fadeUp).
- `shadcn init` (base radix, tailwind v4, `components.json`), `tw-animate-css`, `vaul`, `radix-ui`, `class-variance-authority`.
- Componenti base shadcn: button, input, card, badge, tabs, select, switch, popover, calendar, skeleton, separator, sonner, tooltip, progress, field, empty, dropdown-menu, drawer, dialog, alert-dialog.
- `ResponsiveSheet` (drawer sotto md, dialog da md in su), `ConfirmSheet`, `SegmentedControl`, `MoneyInput`, `CategoryIcon/Chip`.

## Fase 2 - Shell e navigazione
- Bottom nav mobile a pillola flottante con indicatore animato (layoutId), header contestuale con valuta, campanella, impostazioni.
- Desktop: sidebar o top bar ripensata, griglia multi-pane da `xl`.
- Skeleton/loading unificati, transizioni di pagina (view transitions).

## Fase 3 - Panoramica (hero)
- Hero "Budget del mese" in stile poster: residuo grande, barra progresso, stato (in linea / attenzione / oltre).
- Quick add come drawer con keypad numerico, categoria a chip colorate, valuta.
- Card: transazioni recenti, budget per categoria, saldi amici, convertitore, onboarding.

## Fase 4 - Transazioni
- Timeline raggruppata per giorno, filtri in drawer, ricerca, swipe actions.
- Modali -> `ResponsiveSheet` (transazione, categorie, ricorrenti, import CSV a step).
- Tabella desktop con colonne ordinabili.

## Fase 5 - Liste della spesa e conversione
- Righe animate, check con spring, gruppi attivi/completati, conversione in transazione (singola e bulk) via sheet.

## Fase 6 - Statistiche
- Grafici con recharts (colori categoria, accessibili: pattern e etichette), calendario spesa, trend entrate/uscite/risparmio, ripartizione categorie.

## Fase 7 - Amici, gruppi, impostazioni
- Lista amici/gruppi, dettaglio saldi, spesa condivisa in sheet a step, richieste pendenti.
- Impostazioni stile iOS: gruppi, icon tile, tema, accento, budget, notifiche, profilo.
- Login/attivazione/verifica rifatti.

## Fase 8 - Rifinitura e rilascio
- `impeccable audit`, `polish`, `adapt`, `harden` (stati vuoti, errori, i18n, offline), detector, a11y, performance.
- Rimozione di framer-motion duplicati/gsap/heroui non usati, pulizia lint.
- Valutazione migrazione hosting a OpenNext.
- Release: merge `development` -> `main`, changeset, tag.

## Aggiunte funzionali (richieste in corso d'opera)
- Import estratti conto: CSV, Excel (.xlsx) e PDF, tutto client-side (`src/lib/import/`), mappatura colonne guidata, anteprima, rilevamento duplicati, categoria suggerita dallo storico. UI nel flusso Transazioni (Fase 4b).
- `CardStack` (`components/ui/card-stack.tsx`, portato da soci-k2b) per la sezione "Da sistemare" in Panoramica: importazioni da categorizzare, richieste amici, budget oltre l'80%, ricorrenti in arrivo. Swipe per scartare/avanzare.
- Proposte da confermare: aggiunta rapida con suggerimenti (ripeti ultima, importi frequenti), swipe sulle righe (elimina/duplica), ricerca globale Cmd+K, "puoi spendere X al giorno", previsione di fine mese, regole categoria apprese, obiettivi di risparmio.
