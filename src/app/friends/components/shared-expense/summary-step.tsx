"use client";

import { Check, Loader2 } from "lucide-react";
import { m } from "motion/react";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/motion";
import { formatCurrency } from "@/lib/utils";
import { MemberAvatar } from "./member-avatar";
import type { FormState, Friend, Group } from "./types";

type Props = {
  state: FormState;
  selectedFriend?: Friend;
  selectedGroup?: Group;
  checkedMemberIdsSet: Set<string>;
  currentUserId: string;
  payerName: string;
  payerImage?: string | null;
  parsedAmount: number;
  groupShareNok: number;
  myNok: number;
  friendNok: number;
  splitSummaryLabel: string;
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
  canSave: boolean;
  isSaving: boolean;
  onSave: () => Promise<void>;
};

export function SharedExpenseSummaryStep({
  state,
  selectedFriend,
  selectedGroup,
  checkedMemberIdsSet,
  currentUserId,
  payerName,
  payerImage,
  parsedAmount,
  groupShareNok,
  myNok,
  friendNok,
  splitSummaryLabel,
  displayCurrency,
  convertCurrency,
  canSave,
  isSaving,
  onSave,
}: Props) {
  const fromNok = (nok: number) =>
    formatCurrency(convertCurrency(nok, "NOK", state.currency), state.currency);

  const rows =
    state.shareType === "friend"
      ? [
          {
            id: "me",
            name: `${payerName} (Tu)`,
            image: payerImage,
            value: fromNok(myNok),
          },
          {
            id: selectedFriend?.user.id ?? "friend",
            name: selectedFriend?.user.name ?? "Amico",
            image: null,
            value: fromNok(friendNok),
          },
        ]
      : (selectedGroup?.members ?? [])
          .filter((m) => checkedMemberIdsSet.has(m.id))
          .map((m) => ({
            id: m.id,
            name: m.id === currentUserId ? `${m.name} (Tu)` : m.name,
            image: m.id === currentUserId ? payerImage : null,
            value:
              state.groupSplitMode === "custom"
                ? formatCurrency(
                    parseFloat(state.customSplitsVal[m.id]) || 0,
                    state.currency,
                  )
                : fromNok(groupShareNok),
          }));

  const target =
    state.shareType === "group"
      ? selectedGroup?.name
      : selectedFriend?.user.name;

  return (
    <m.div
      key="summary-step"
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-1 rounded-lg bg-muted/50 px-4 py-5">
        <p className="truncate text-sm text-muted-foreground">
          {state.desc}
          {target ? ` · con ${target}` : ""}
        </p>
        <p className="num-display font-display text-[clamp(2rem,11vw,3.25rem)] leading-none font-bold tracking-tight">
          {formatCurrency(parsedAmount, state.currency)}
        </p>
        <p className="tabular text-xs text-muted-foreground">
          {splitSummaryLabel}
          {state.currency !== displayCurrency
            ? ` · circa ${formatCurrency(
                convertCurrency(parsedAmount, state.currency, displayCurrency),
                displayCurrency,
              )}`
            : ""}
        </p>
      </div>

      <section aria-label="Quote" className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">
          Ha pagato {payerName}, quote a testa
        </h3>
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center gap-3">
              <MemberAvatar name={row.name} image={row.image} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {row.name}
              </span>
              <span className="tabular text-sm font-semibold">{row.value}</span>
            </li>
          ))}
        </ul>
      </section>

      <Button
        type="button"
        disabled={!canSave || isSaving}
        onClick={onSave}
        className="h-12 w-full text-base"
      >
        {isSaving ? (
          <Loader2 data-icon="inline-start" className="animate-spin" />
        ) : (
          <Check data-icon="inline-start" />
        )}
        {isSaving ? "Salvataggio..." : "Aggiungi spesa"}
      </Button>
    </m.div>
  );
}
