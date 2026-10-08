"use client";

import { ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";

type GroupMember = {
  id: string;
  name: string;
  email: string;
};

type GroupMemberListProps = {
  members: GroupMember[];
  currentUserId: string;
};

export function GroupMemberList({
  members,
  currentUserId,
}: GroupMemberListProps) {
  return (
    <section aria-label="Membri del gruppo" className="border-t px-4 py-4">
      <h3 className="mb-3 text-base font-semibold">Membri</h3>
      <ul className="flex flex-wrap gap-2">
        {members.map((member: GroupMember) => (
          <li
            key={member.id}
            className="flex items-center gap-2 rounded-full bg-muted py-1 pr-3 pl-1 text-sm font-medium"
          >
            <Avatar size="sm">
              <AvatarFallback className="bg-brand-soft text-[11px] font-semibold text-brand">
                {member.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>
              {member.name}
              {member.id === currentUserId && " (tu)"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

type GroupSettlementProposal = {
  fromUser: { id: string; name: string; email: string; image: string | null };
  toUser: { id: string; name: string; email: string; image: string | null };
  amountNok: number;
};

type GroupSettlementProposalsProps = {
  proposals: GroupSettlementProposal[];
  isProposalsLoading: boolean;
  currentUserId: string;
  displayCurrency: string;
  convertCurrency: (amount: number, from: string, to: string) => number;
  isSettlingId: string | null;
  onSettle: (friendId: string) => void;
};

export function GroupSettlementProposals({
  proposals,
  isProposalsLoading,
  currentUserId,
  displayCurrency,
  convertCurrency,
  isSettlingId,
  onSettle,
}: GroupSettlementProposalsProps) {
  return (
    <section aria-label="Saldi da regolare" className="border-t">
      <h3 className="px-4 pt-4 pb-2 text-base font-semibold">
        Saldi da regolare
      </h3>
      {isProposalsLoading ? (
        <p className="px-4 pb-4 text-sm text-muted-foreground">
          Calcolo dei saldi in corso...
        </p>
      ) : proposals && proposals.length > 0 ? (
        <ul className="flex flex-col pb-2">
          {proposals.map((p: GroupSettlementProposal) => {
            const isFromMe = p.fromUser.id === currentUserId;
            const isToMe = p.toUser.id === currentUserId;
            const canSettle = isFromMe || isToMe;
            const targetFriendId = isFromMe ? p.toUser.id : p.fromUser.id;

            return (
              <li
                key={`${p.fromUser.id}-${p.toUser.id}-${p.amountNok}`}
                className="flex items-center justify-between gap-3 px-4 py-2"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="flex flex-wrap items-center gap-x-1.5 text-sm">
                    <span
                      className={cn(
                        "font-semibold",
                        isFromMe && "text-expense",
                      )}
                    >
                      {isFromMe ? "Tu" : p.fromUser.name}
                    </span>
                    <ArrowRight
                      aria-label="deve dare a"
                      role="img"
                      className="size-3.5 text-muted-foreground"
                    />
                    <span
                      className={cn("font-semibold", isToMe && "text-income")}
                    >
                      {isToMe ? "Te" : p.toUser.name}
                    </span>
                  </span>
                  <span className="tabular text-sm font-bold">
                    {formatCurrency(
                      convertCurrency(p.amountNok, "NOK", displayCurrency),
                      displayCurrency,
                    )}
                  </span>
                </div>
                {canSettle && (
                  <Button
                    variant="outline"
                    className="h-11 shrink-0 rounded-full px-4 font-semibold"
                    onClick={() => onSettle(targetFriendId)}
                    disabled={isSettlingId !== null}
                  >
                    {isSettlingId === targetFriendId
                      ? "Salvataggio..."
                      : "Salda"}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-4 pb-4 text-sm text-muted-foreground">
          Tutti i debiti in questo gruppo sono saldati.
        </p>
      )}
    </section>
  );
}
