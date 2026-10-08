# Design System: Gravio

Mode: Operate (app UI). Mobile first, one hand; desktop is a re-composition (sidebar + multi-pane), not a stretched phone.

## North star
"Il portafoglio che si illumina": a clean violet-tinted paper ground, one vivid brand accent, and full-saturation colour that always means something (category, income, expense, budget state). Colour never decorates; it is never the only signal.

## Tokens (src/app/globals.css, OKLCH, light + .dark)
- Neutrals: background, card, popover, muted, accent, border, input, foreground (hue 285, very low chroma).
- Brand: `brand`, `brand-foreground`, `brand-soft`; user picks accent (ids blue=indaco, green, purple, orange, red) via `html[data-accent]`.
- Semantic: `income` / `income-soft` (green), `expense` / `expense-soft` (coral), `destructive`, `warning`, `chart-1..5`.
- Category colours: stored per category as hex (APPLE_COLORS in lib/constants). Render as 4px bar, dot, 12-15% tint tile with the full colour on the icon. Never fill whole cards or buttons with them.
- Elevation: utilities `elevation-1/2/3` (soft tinted shadow + hairline border). No hard offset shadows, no gradient text, no decorative glass.

## Type
Onest (body, UI) and Bricolage Grotesque (`font-display`, numbers, titles). Money and times use `tabular` / `num-display` (lining + tabular). Scale: micro 11px (floor), label 12px/600, body 14px, title 16px/600, headline 24px/700 tracking -0.025em, poster number `clamp(2rem, 11vw, 3.5rem)` display 700. Sentence case, no uppercase labels, no eyebrow kickers.

## Shape
Radii: sm 12, md 16, lg 20, xl 28. Cards `rounded-lg`, hero `rounded-xl`, nav/segments/badges/switch fully round. Touch targets 44px minimum.

## Layout
Page padding px-4 (md px-8). Shell: mobile header + floating pill bottom nav; md+ left sidebar (72px rail, 256px at xl). Content max-w-7xl. Multi-pane from xl. One poster moment per screen (the budget hero on Panoramica).

## Overlays
Mobile (<768px): vaul `Drawer`. Desktop: `Dialog`. Always through `ResponsiveSheet` (components/ui/responsive-sheet.tsx) or `Drawer`/`Popover` pairs. Confirmations via `AlertDialog` (desktop) / drawer (mobile). Never a hand-rolled modal.

## Motion
`lib/motion.ts`: springs snappy/smooth/gentle, stagger 35ms capped at 8, fadeUp, scaleIn. Shared `layoutId` pills for nav and segmented controls. Press = scale 0.97. Reduced motion is globally respected.

## Don't
Nested cards, identical icon+title+text card grids, hero-metric template spam, colored side borders, emoji as icons, raw tailwind colours (`blue-500`, `rose-500`, `emerald-*`): use semantic tokens (`brand`, `income`, `expense`, `destructive`, `warning`, `muted-foreground`).
