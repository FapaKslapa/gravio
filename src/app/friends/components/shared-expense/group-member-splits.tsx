"use client";

import { CircleAlert, CircleCheck } from "lucide-react";
import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn, formatCurrency } from "@/lib/utils";
import { MemberAvatar } from "./member-avatar";
import type { Group } from "./types";

type Props = {
  selectedGroup: Group | undefined;
  checkedMemberIds: string[];
  groupSplitMode: "equal" | "custom";
  customSplitsVal: Record<string, string>;
  currentUserId: string;
  currency: string;
  amountNok: number;
  groupShareNok: number;
  displayCurrency: string;
  customIsExact: boolean;
  customDifference: number;
  convertCurrency: (amount: number, from: string, to: string) => number;
  onToggleGroupSplitMode: (mode: "equal" | "custom") => void;
  onToggleMember: (id: string) => void;
  onChangeCustomSplit: (memberId: string, val: string) => void;
};

export function GroupMemberSplits({
  selectedGroup,
  checkedMemberIds,
  groupSplitMode,
  customSplitsVal,
  currentUserId,
  currency,
  amountNok,
  groupShareNok,
  displayCurrency,
  customIsExact,
  customDifference,
  convertCurrency,
  onToggleGroupSplitMode,
  onToggleMember,
  onChangeCustomSplit,
}: Props) {
  const checkedCount = checkedMemberIds.length;
  const checkedSet = useMemo(
    () => new Set(checkedMemberIds),
    [checkedMemberIds],
  );

  return (
    <div className="flex flex-col gap-6">
      <Field>
        <FieldLabel>Come dividere</FieldLabel>
        <ToggleGroup
          type="single"
          variant="outline"
          spacing={0}
          value={groupSplitMode}
          onValueChange={(v) => {
            if (v === "equal" || v === "custom") onToggleGroupSplitMode(v);
          }}
          aria-label="Modalità di divisione"
          className="w-full"
        >
          <ToggleGroupItem
            value="equal"
            className="h-11 flex-1 data-[state=on]:bg-brand-soft data-[state=on]:text-brand"
          >
            Uguale
          </ToggleGroupItem>
          <ToggleGroupItem
            value="custom"
            className="h-11 flex-1 data-[state=on]:bg-brand-soft data-[state=on]:text-brand"
          >
            Importi
          </ToggleGroupItem>
        </ToggleGroup>
      </Field>

      <section aria-label="Partecipanti" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold">Chi partecipa</h3>
          <span className="tabular text-xs text-muted-foreground">
            {checkedCount} su {selectedGroup?.members.length ?? 0}
          </span>
        </div>
        <ul className="flex flex-col gap-2">
          {selectedGroup?.members.map((member) => {
            const checked = checkedSet.has(member.id);
            const isMe = member.id === currentUserId;
            const inputId = `split-${member.id}`;
            return (
              <li
                key={member.id}
                className={cn(
                  "flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2 transition-colors",
                  checked ? "border-brand/40 bg-brand-soft" : "bg-card",
                )}
              >
                <Checkbox
                  id={`check-${member.id}`}
                  checked={checked}
                  onCheckedChange={() => onToggleMember(member.id)}
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
                        value={customSplitsVal[member.id] || ""}
                        onChange={(e) =>
                          onChangeCustomSplit(member.id, e.target.value)
                        }
                        className="tabular h-11 w-24 text-right"
                      />
                      <span className="text-xs text-muted-foreground">
                        {currency}
                      </span>
                    </div>
                  ) : (
                    <span className="tabular shrink-0 text-sm font-semibold">
                      {formatCurrency(
                        convertCurrency(groupShareNok, "NOK", displayCurrency),
                        displayCurrency,
                      )}
                    </span>
                  )
                ) : null}
              </li>
            );
          })}
        </ul>
        {checkedCount === 0 ? (
          <p role="alert" className="text-sm text-destructive">
            Seleziona almeno un partecipante.
          </p>
        ) : null}
      </section>

      {amountNok > 0 && checkedCount > 0 && groupSplitMode === "custom" ? (
        <p
          role="status"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
            customIsExact
              ? "bg-income-soft text-income"
              : "bg-expense-soft text-expense",
          )}
        >
          {customIsExact ? (
            <>
              <CircleCheck className="size-4" aria-hidden="true" />
              Importi assegnati correttamente
            </>
          ) : (
            <>
              <CircleAlert className="size-4" aria-hidden="true" />
              <span className="tabular">
                {customDifference > 0
                  ? `Mancano ${formatCurrency(customDifference, currency)}`
                  : `Eccedenza di ${formatCurrency(-customDifference, currency)}`}
              </span>
            </>
          )}
        </p>
      ) : null}
    </div>
  );
}
