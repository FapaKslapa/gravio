"use client";

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FriendSplitFields } from "./friend-split-fields";
import { FriendSplitPreview } from "./friend-split-preview";
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

        <FriendSplitFields
          splitMode={splitMode}
          percentage={percentage}
          exactNok={exactNok}
          parts={parts}
          friendName={friendName}
          onChangePercentage={onChangePercentage}
          onChangeExactNok={onChangeExactNok}
          onChangeN={onChangeN}
        />
      </FieldGroup>

      <FriendSplitPreview
        payerName={payerName}
        payerImage={payerImage}
        friendName={friendName}
        myNok={myNok}
        friendNok={friendNok}
        myPct={myPct}
        friendPct={friendPct}
        amountNok={amountNok}
        displayCurrency={displayCurrency}
        convertCurrency={convertCurrency}
      />
    </div>
  );
}
