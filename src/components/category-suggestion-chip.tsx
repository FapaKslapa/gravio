"use client";

import { Sparkles } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { CategoryIcon } from "@/components/icon-helper";
import { fadeUp } from "@/lib/motion";

type Category = { id: string; name: string; icon: string; color: string };

export function CategorySuggestionChip({
  categoryId,
  categories,
  onUse,
}: {
  categoryId: string | null;
  categories: Category[];
  onUse: (id: string) => void;
}) {
  const cat = categoryId ? categories.find((c) => c.id === categoryId) : null;
  return (
    <div aria-live="polite">
      <AnimatePresence initial={false}>
        {cat && (
          <m.button
            key={cat.id}
            type="button"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            onClick={() => onUse(cat.id)}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-dashed bg-brand-soft px-3.5 text-sm font-medium text-foreground active:scale-[0.97]"
          >
            <Sparkles className="size-4 text-brand" aria-hidden="true" />
            <span style={{ color: cat.color }}>
              <CategoryIcon name={cat.icon} size={16} />
            </span>
            <span>Suggerita: {cat.name}</span>
            <span className="font-semibold text-brand">· Usa</span>
          </m.button>
        )}
      </AnimatePresence>
    </div>
  );
}
