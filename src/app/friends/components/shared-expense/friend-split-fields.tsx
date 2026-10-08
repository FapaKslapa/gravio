"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { SplitMode } from "./types";

type Props = {
  splitMode: SplitMode;
  percentage: string;
  exactNok: string;
  parts: number;
  friendName: string;
  onChangePercentage: (val: string) => void;
  onChangeExactNok: (val: string) => void;
  onChangeN: (val: string) => void;
};

export function FriendSplitFields({
  splitMode,
  percentage,
  exactNok,
  parts,
  friendName,
  onChangePercentage,
  onChangeExactNok,
  onChangeN,
}: Props) {
  return (
    <>
      {splitMode === "percentage" ? (
        <Field>
          <FieldLabel htmlFor="split-pct">Quota di {friendName} (%)</FieldLabel>
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
    </>
  );
}
