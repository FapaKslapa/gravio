# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Persone che gestiscono le proprie spese quotidiane, spesso dal telefono (PWA) subito dopo un acquisto, e a volte insieme ad amici o coinquilini con cui dividono i costi. Uso dominante a una mano; da desktop per revisione e statistiche.

## Product Purpose

Gravio registra spese ed entrate in più valute (EUR, NOK e altre), con categorie, budget mensili, transazioni ricorrenti, liste della spesa, statistiche e spese condivise con amici e gruppi. Successo: aggiungere una spesa in pochi secondi e capire a colpo d'occhio quanto resta del budget del mese.

## Positioning

Un tracker di spese personale e sociale, multivaluta e pensato per il telefono: registrazione rapida, budget per categoria e saldi con gli amici nello stesso posto.

## Capabilities and Constraints

- Panoramica, transazioni (lista, timeline, tabella), ricorrenti, categorie, budget per categoria, import CSV.
- Liste della spesa convertibili in transazioni.
- Statistiche: trend, calendario di spesa, ripartizione per categoria.
- Amici, gruppi, spese condivise, saldi, notifiche.
- Tema chiaro/scuro e accento, valuta preferita, conversione tramite tassi live.
- Lingua: italiano. Hosting Cloudflare Pages + D1; auth con better-auth.
- Su mobile gli overlay sono drawer (bottom sheet), mai dialog; su desktop dialog.

## Product Principles

1. Aggiungere una spesa deve costare pochi tocchi.
2. Il budget residuo è sempre visibile e comprensibile.
3. Il colore porta significato (categoria, entrata/uscita), mai solo decorazione, e mai è l'unico segnale.
4. Mobile first, desktop ripensato e non solo allargato.

## Accessibility & Inclusion

Contrasto testo almeno 4.5:1, aree di tocco almeno 44px, etichette almeno 11px, focus visibile, prefers-reduced-motion rispettato.
