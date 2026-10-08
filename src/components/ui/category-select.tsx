"use client";

import { useState } from "react";
import { CategoryBadge } from "@/components/ui/category-picker";
import {
  PickerChevron,
  PickerList,
  PickerShell,
  pickerTriggerClass,
} from "@/components/ui/picker-shell";
import { cn } from "@/lib/utils";

type CategoryOption = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type CategorySelectProps = {
  value: string;
  onChange: (val: string) => void;
  categories: CategoryOption[];
  generalLabel?: string;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
};

function Tile({ cat, size }: { cat: CategoryOption; size: "sm" | "md" }) {
  return <CategoryBadge cat={cat} size={size === "sm" ? 24 : 32} />;
}

export function CategorySelect({
  value,
  onChange,
  categories,
  generalLabel = "Nessuna categoria",
  placeholder,
  className,
  triggerClassName,
}: CategorySelectProps) {
  const generalOption: CategoryOption = {
    id: "",
    name: generalLabel,
    icon: "Sparkles",
    color: "#8E8E93",
  };
  const [open, setOpen] = useState(false);

  const allOptions = [generalOption, ...categories];
  const selected = allOptions.find((c) => c.id === value) ?? generalOption;

  return (
    <PickerShell
      open={open}
      onOpenChange={setOpen}
      title="Seleziona categoria"
      className={className}
      trigger={
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn("group/picker", pickerTriggerClass, triggerClassName)}
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <Tile cat={selected} size="sm" />
            <span className="truncate font-medium">
              {selected.name || placeholder || generalLabel}
            </span>
          </span>
          <PickerChevron />
        </button>
      }
    >
      <PickerList
        items={allOptions.map((c) => ({
          value: c.id,
          label: c.name,
          leading: <Tile cat={c} size="md" />,
        }))}
        value={value}
        searchable={allOptions.length > 6}
        searchLabel="Cerca categoria"
        emptyLabel="Nessuna categoria trovata."
        onSelect={(v) => {
          onChange(v);
          setOpen(false);
        }}
      />
    </PickerShell>
  );
}
