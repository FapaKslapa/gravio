"use client";

import { useMemo } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatCurrency } from "@/lib/utils";
import { CustomSplitStatus } from "./custom-split-status";
import { GroupMemberRow } from "./group-member-row";
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

  const shareLabel = formatCurrency(
    convertCurrency(groupShareNok, "NOK", displayCurrency),
    displayCurrency,
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
          {selectedGroup?.members.map((member) => (
            <GroupMemberRow
              key={member.id}
              member={member}
              checked={checkedSet.has(member.id)}
              isMe={member.id === currentUserId}
              groupSplitMode={groupSplitMode}
              customValue={customSplitsVal[member.id]}
              currency={currency}
              shareLabel={shareLabel}
              onToggle={() => onToggleMember(member.id)}
              onChangeCustom={(val) => onChangeCustomSplit(member.id, val)}
            />
          ))}
        </ul>
        {checkedCount === 0 ? (
          <p role="alert" className="text-sm text-destructive">
            Seleziona almeno un partecipante.
          </p>
        ) : null}
      </section>

      {amountNok > 0 && checkedCount > 0 && groupSplitMode === "custom" ? (
        <CustomSplitStatus
          customIsExact={customIsExact}
          customDifference={customDifference}
          currency={currency}
        />
      ) : null}
    </div>
  );
}
