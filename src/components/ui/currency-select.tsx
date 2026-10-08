"use client";

import { useState } from "react";
import {
  PickerChevron,
  PickerList,
  PickerShell,
  pickerTriggerClass,
} from "@/components/ui/picker-shell";
import { cn } from "@/lib/utils";

const ALL_CURRENCIES = [
  { code: "EUR", name: "Euro" },
  { code: "NOK", name: "Krone Norvegese" },
  { code: "USD", name: "Dollaro USA" },
  { code: "GBP", name: "Sterlina Britannica" },
  { code: "SEK", name: "Krona Svedese" },
  { code: "DKK", name: "Krone Danese" },
  { code: "CHF", name: "Franco Svizzero" },
  { code: "CAD", name: "Dollaro Canadese" },
  { code: "AUD", name: "Dollaro Australiano" },
  { code: "JPY", name: "Yen Giapponese" },
  { code: "CNY", name: "Yuan Cinese" },
  { code: "INR", name: "Rupia Indiana" },
  { code: "BRL", name: "Real Brasiliano" },
  { code: "MXN", name: "Peso Messicano" },
  { code: "SGD", name: "Dollaro di Singapore" },
  { code: "HKD", name: "Dollaro di Hong Kong" },
  { code: "KRW", name: "Won Sudcoreano" },
  { code: "PLN", name: "Zloty Polacco" },
  { code: "CZK", name: "Corona Ceca" },
  { code: "HUF", name: "Fiorino Ungherese" },
  { code: "RON", name: "Leu Romeno" },
  { code: "TRY", name: "Lira Turca" },
  { code: "ZAR", name: "Rand Sudafricano" },
  { code: "RUB", name: "Rublo Russo" },
  { code: "SAR", name: "Riyal Saudita" },
  { code: "AED", name: "Dirham EAU" },
  { code: "NZD", name: "Dollaro Neozelandese" },
  { code: "THB", name: "Baht Tailandese" },
  { code: "MYR", name: "Ringgit Malese" },
  { code: "IDR", name: "Rupia Indonesiana" },
];

type CurrencySelectProps = {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  triggerClassName?: string;
  currencies?: { code: string; name: string }[];
};

export function CurrencySelect({
  value,
  onChange,
  className,
  triggerClassName,
  currencies = ALL_CURRENCIES,
}: CurrencySelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <PickerShell
      open={open}
      onOpenChange={setOpen}
      title="Seleziona valuta"
      className={className}
      trigger={
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn("group/picker", pickerTriggerClass, triggerClassName)}
        >
          <span className="font-semibold tabular">{value || "—"}</span>
          <PickerChevron />
        </button>
      }
    >
      <PickerList
        items={currencies.map((c) => ({
          value: c.code,
          label: c.code,
          description: c.name,
        }))}
        value={value}
        searchable
        searchLabel="Cerca valuta"
        emptyLabel="Nessuna valuta trovata."
        onSelect={(v) => {
          onChange(v);
          setOpen(false);
        }}
      />
    </PickerShell>
  );
}
