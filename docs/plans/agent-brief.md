# Brief per i subagenti (leggere prima di toccare codice)

Contesto: Gravio, app spese in italiano, Next 16 + tRPC + Tailwind v4 + shadcn (radix) + vaul. Leggi `PRODUCT.md`, `DESIGN.md`, `docs/plans/redesign.md`. Shell, token, `ResponsiveSheet`, `lib/motion.ts` e i componenti `src/components/ui/*` shadcn esistono gia'.

Regole ferree
- Tocca SOLO la tua cartella area (indicata nel task) piu' eventuali NUOVI file in `src/components/ui/` con prefisso specifico. Non modificare file condivisi (globals.css, dashboard-layout, components/ui esistenti, lib/*). Se serve una modifica condivisa, scrivila nel report finale.
- Non fare commit ne' push. Non lanciare `pnpm build` (collide con altri agenti): verifica con `npx tsc --noEmit` filtrando i tuoi file e `pnpm exec biome check <tuoi file> --write`.
- Rimuovi ogni import da `@heroui/react` (sono solo Card/Button/CardHeader/CardContent: usa shadcn Card/Button).
- Ogni overlay/modale fatto a mano (`m.div` fixed inset-0, backdrop, ecc.) diventa `ResponsiveSheet` (drawer mobile / dialog desktop). Conferme: `ConfirmationDialog` va riscritto con `AlertDialog`/drawer se e' nella tua area, altrimenti usalo cosi' com'e'.
- Niente colori grezzi tailwind (`blue-500`, `rose-500`, `emerald-500`, `neutral-500/10`, `bg-(--card)`, `border-(--card-border)`, `text-(--text-muted)`): usa token semantici (`bg-card`, `border`, `text-muted-foreground`, `bg-brand`, `text-income`, `text-expense`, `bg-expense-soft`, `bg-brand-soft`). I colori delle categorie restano quelli salvati nel DB (hex) usati come barra/pallino/tinta.
- Form con shadcn `Field`/`FieldGroup`/`FieldLabel`; `Input`, `Select`, `Switch`, `Tabs`, `Badge`, `Skeleton`, `Empty` per stati vuoti, `sonner` (`toast`) per feedback.
- Mobile first (390px) poi md/xl. Target tocco >=44px, testo >=11px, contrasto >=4.5:1, focus visibile, `aria-label` sui pulsanti icona, significato mai solo colore.
- Numeri/importi: classe `tabular` o `num-display`, importi via `formatCurrency`. Icone lucide, mai emoji.
- Animazioni con `m` da `motion/react` (mai framer-motion) (LazyMotion domMax gia' attivo) usando `springs`/`fadeUp` da `@/lib/motion`; una sola entrata coordinata per schermata, stagger limitato. Niente gsap.
- Non cambiare logica dati, query tRPC, schemi, testi di dominio. Cambia struttura visiva, composizione, interazione.
- Stile codice: come il resto (biome, doppi apici, nessun commento superfluo).
- Report finale (max 15 righe): file toccati, cosa e' cambiato, modifiche condivise richieste, problemi aperti.
