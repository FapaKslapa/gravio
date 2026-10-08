import { m } from "motion/react";
import Image from "next/image";
import { fadeUp, springs } from "@/lib/motion";

const SAMPLE_CATEGORIES = [
  { name: "Spesa", amount: "182", share: 46, color: "var(--chart-1)" },
  { name: "Trasporti", amount: "96", share: 24, color: "var(--chart-2)" },
  { name: "Svago", amount: "64", share: 16, color: "var(--chart-3)" },
];

export function BrandPanel() {
  return (
    <aside className="relative flex flex-col justify-between gap-10 overflow-hidden bg-brand px-6 pt-12 pb-16 text-brand-foreground lg:min-h-dvh lg:px-14 lg:py-14">
      <m.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0}
        className="flex items-center gap-3"
      >
        <Image
          src="/logo.png"
          alt=""
          width={44}
          height={44}
          priority
          className="rounded-md"
        />
        <span className="font-display text-2xl font-bold tracking-tight">
          Gravio
        </span>
      </m.div>

      <m.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={1}
        className="flex max-w-xl flex-col gap-4"
      >
        <h1 className="font-display text-[clamp(2rem,9vw,3.5rem)] leading-[1.02] font-bold tracking-[-0.03em] text-balance">
          Quanto ti resta, a colpo d&apos;occhio.
        </h1>
        <p className="max-w-md text-base text-brand-foreground/90 text-pretty">
          Registra una spesa in pochi secondi, in qualsiasi valuta, e tieni il
          budget del mese sempre sotto controllo.
        </p>
      </m.div>

      <m.div
        aria-hidden
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.gentle, delay: 0.25 }}
        className="hidden max-w-sm flex-col gap-5 rounded-xl bg-card p-5 text-card-foreground shadow-[0_24px_60px_-24px_oklch(0.2_0.1_285/0.6)] lg:flex"
      >
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">
            Ti restano questo mese
          </span>
          <span className="num-display text-5xl font-bold">
            412<span className="text-2xl text-muted-foreground">,50 €</span>
          </span>
        </div>
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
          {SAMPLE_CATEGORIES.map((c) => (
            <span
              key={c.name}
              className="h-full"
              style={{ width: `${c.share}%`, backgroundColor: c.color }}
            />
          ))}
        </div>
        <ul className="flex flex-col gap-2">
          {SAMPLE_CATEGORIES.map((c) => (
            <li
              key={c.name}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                {c.name}
              </span>
              <span className="tabular text-muted-foreground">
                {c.amount} €
              </span>
            </li>
          ))}
        </ul>
      </m.div>
    </aside>
  );
}
