"use client";

import type React from "react";
import { useState } from "react";
import {
  PickerChevron,
  PickerList,
  PickerShell,
  pickerTriggerClass,
} from "@/components/ui/picker-shell";
import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: string;
  color?: string;
  icon?: React.ReactNode;
};

type CustomSelectProps = {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
  footerAction?: {
    label: string;
    onPress: () => void;
  };
};

function Leading({ opt }: { opt: Option }) {
  if (!opt.color && !opt.icon) return null;
  return (
    <>
      {opt.color && (
        <span
          aria-hidden
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: opt.color }}
        />
      )}
      {opt.icon}
    </>
  );
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Seleziona opzione...",
  className,
  triggerClassName,
  dropdownClassName,
  footerAction,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <PickerShell
      open={open}
      onOpenChange={setOpen}
      title={placeholder}
      className={className}
      contentClassName={dropdownClassName}
      trigger={
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn("group/picker", pickerTriggerClass, triggerClassName)}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selected ? (
              <>
                <Leading opt={selected} />
                <span className="truncate">{selected.label}</span>
              </>
            ) : (
              <span className="truncate text-muted-foreground">
                {placeholder}
              </span>
            )}
          </span>
          <PickerChevron />
        </button>
      }
    >
      <PickerList
        items={options.map((o) => ({
          value: o.value,
          label: o.label,
          leading: <Leading opt={o} />,
        }))}
        value={value}
        searchable={options.length > 8}
        searchLabel="Cerca"
        emptyLabel="Nessuna opzione disponibile."
        onSelect={(v) => {
          onChange(v);
          setOpen(false);
        }}
        footerAction={
          footerAction && {
            label: footerAction.label,
            onPress: () => {
              footerAction.onPress();
              setOpen(false);
            },
          }
        }
      />
    </PickerShell>
  );
}
