"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MemberAvatar } from "./member-avatar";

type Props = {
  member: { id: string; name: string };
  checked: boolean;
  isMe: boolean;
  groupSplitMode: "equal" | "custom";
  customValue: string | undefined;
  currency: string;
  shareLabel: string;
  onToggle: () => void;
  onChangeCustom: (val: string) => void;
};

export function GroupMemberRow({
  member,
  checked,
  isMe,
  groupSplitMode,
  customValue,
  currency,
  shareLabel,
  onToggle,
  onChangeCustom,
}: Props) {
  const inputId = `split-${member.id}`;
  return (
    <li
      className={cn(
        "flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2 transition-colors",
        checked ? "border-brand/40 bg-brand-soft" : "bg-card",
      )}
    >
      <Checkbox
        id={`check-${member.id}`}
        checked={checked}
        onCheckedChange={() => onToggle()}
        aria-label={`Includi ${member.name}`}
      />
      <label
        htmlFor={`check-${member.id}`}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 py-1"
      >
        <MemberAvatar name={member.name} />
        <span className="truncate text-sm font-medium">
          {member.name}
          {isMe ? " (Tu)" : ""}
        </span>
      </label>
      {checked ? (
        groupSplitMode === "custom" ? (
          <div className="flex shrink-0 items-center gap-1.5">
            <Input
              id={inputId}
              type="number"
              inputMode="decimal"
              aria-label={`Importo di ${member.name}`}
              min="0"
              step="0.01"
              placeholder="0.00"
              value={customValue || ""}
              onChange={(e) => onChangeCustom(e.target.value)}
              className="tabular h-11 w-24 text-right"
            />
            <span className="text-xs text-muted-foreground">{currency}</span>
          </div>
        ) : (
          <span className="tabular shrink-0 text-sm font-semibold">
            {shareLabel}
          </span>
        )
      ) : null}
    </li>
  );
}
