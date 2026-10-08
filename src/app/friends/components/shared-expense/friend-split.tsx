"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatCurrency } from "@/lib/utils";
import { MemberAvatar } from "./member-avatar";
import type { SplitMode } from "./types";

const MODES: Array<{ id: SplitMode; label: string }> = [
  { id: "half", label: "Uguale" },
  { id: "percentage", label: "Percentuale" },
  { id: "exact", label: "Importo" },
  { id: "custom_n", label: "In parti" },
];

type Props = {
  splitMode: SplitMode;
  percentage: string;
  exactNok: string;
  n: string;
  payerName: string;
  payerImage?: string | null;
  friendName?: string;
  myNok: number;
  friendNok: number;
  myPct: number;
  friendPct: number;
  amountNok: number;
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
  onChangeSplitMode: (mode: SplitMode) => void;
  onChangePercentage: (val: string) => void;
  onChangeExactNok: (val: string) => void;
  onChangeN: (val: string) => void;
};

export function FriendSplit({
  splitMode,
  percentage,
  exactNok,
  n,
  payerName,
  payerImage,
  friendName = "Amico",
  myNok,
  friendNok,
  myPct,
  friendPct,
  amountNok,
  displayCurrency,
  convertCurrency,
  onChangeSplitMode,
  onChangePercentage,
  onChangeExactNok,
  onChangeN,
}: Props) {
  const parts = Math.min(10, Math.max(2, parseInt(n, 10) || 2));
  const show = (nok: number) =>
    formatCurrency(
      convertCurrency(nok, "NOK", displayCurrency),
      displayCurrency,
    );

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <FieldLabel>Come dividere</FieldLabel>
          <ToggleGroup
            type="single"
            variant="outline"
            spacing={0}
            value={splitMode === "thirds" ? "custom_n" : splitMode}
            onValueChange={(v) => {
              if (v) onChangeSplitMode(v as SplitMode);
            }}
            aria-label="Modalità di divisione"
            className="w-full"
          >
            {MODES.map((mode) => (
              <ToggleGroupItem
                key={mode.id}
                value={mode.id}
                className="h-11 flex-1 px-1 text-xs data-[state=on]:bg-brand-soft data-[state=on]:text-brand sm:text-sm"
              >
                {mode.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>

        {splitMode === "percentage" ? (
          <Field>
            <FieldLabel htmlFor="split-pct">
              Quota di {friendName} (%)
            </FieldLabel>
            <div className="flex items-center gap-3">
              <input
                type="range"
                aria-label="Percentuale a carico dell'amico"
                min="1"
                max="99"
                value={percentage}
                onChange={(e) => onChangePercentage(e.target.value)}
                className="h-11 flex-1 cursor-pointer accent-brand"
              />
              <Input
                id="split-pct"
                type="number"
                inputMode="numeric"
                min="1"
                max="99"
                value={percentage}
                onChange={(e) => onChangePercentage(e.target.value)}
                className="tabular h-11 w-20 text-center"
              />
            </div>
          </Field>
        ) : null}

        {splitMode === "exact" ? (
          <Field>
            <FieldLabel htmlFor="split-exact">
              Importo a carico di {friendName} (NOK)
            </FieldLabel>
            <Input
              id="split-exact"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={exactNok}
              onChange={(e) => onChangeExactNok(e.target.value)}
              className="tabular h-11"
            />
          </Field>
        ) : null}

        {splitMode === "custom_n" || splitMode === "thirds" ? (
          <Field>
            <FieldLabel>Numero di persone</FieldLabel>
            <div className="flex items-center justify-between gap-3 rounded-lg border px-2">
              <Button
                type="button"
                variant="ghost"
                aria-label="Meno persone"
                disabled={parts <= 2}
                onClick={() => onChangeN(String(parts - 1))}
                className="size-11"
              >
                <Minus />
              </Button>
              <span className="num-display font-display text-2xl font-bold">
                {parts}
              </span>
              <Button
                type="button"
                variant="ghost"
                aria-label="Più persone"
                disabled={parts >= 10}
                onClick={() => onChangeN(String(parts + 1))}
                className="size-11"
              >
                <Plus />
              </Button>
            </div>
          </Field>
        ) : null}
      </FieldGroup>

      <section aria-label="Anteprima a testa" className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Anteprima a testa</h3>
        {amountNok > 0 ? (
          <>
            <div
              className="flex h-2 gap-0.5 overflow-hidden rounded-full"
              aria-hidden="true"
            >
              <div
                className="rounded-full bg-brand transition-[width] duration-300"
                style={{ width: `${myPct}%` }}
              />
              <div
                className="rounded-full bg-brand/30 transition-[width] duration-300"
                style={{ width: `${friendPct}%` }}
              />
            </div>
            <ul className="flex flex-col gap-2">
              <li className="flex items-center gap-3">
                <MemberAvatar name={payerName} image={payerImage} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  Tu
                </span>
                <span className="tabular text-sm font-semibold">
                  {show(myNok)}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <MemberAvatar name={friendName} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {friendName}
                </span>
                <span className="tabular text-sm font-semibold">
                  {show(friendNok)}
                </span>
              </li>
            </ul>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Inserisci un importo per vedere la divisione.
          </p>
        )}
      </section>
    </div>
  );
}
