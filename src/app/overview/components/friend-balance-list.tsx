import { Check } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn, formatCurrency } from "@/lib/utils";

export type FriendBalanceItem = {
  user: { id: string; name: string | null };
  balance: number;
};

export function FriendBalanceList({
  items,
  displayCurrency,
}: {
  items: FriendBalanceItem[];
  displayCurrency: string;
}) {
  if (items.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Check />
          </EmptyMedia>
          <EmptyTitle>Tutto in pari</EmptyTitle>
          <EmptyDescription>
            Non hai debiti o crediti in sospeso con i tuoi amici.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ul className="flex max-h-60 flex-col overflow-y-auto">
      {items.map((item) => {
        const isCredit = item.balance > 0;
        const initials = item.user.name ? item.user.name[0] : "?";
        return (
          <li
            key={item.user.id}
            className="flex min-h-14 items-center justify-between gap-3 border-b py-2 last:border-b-0"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="size-9">
                <AvatarFallback className="bg-brand-soft font-semibold text-brand uppercase">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold">
                  {item.user.name || "Amico"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {isCredit ? "Ti deve" : "Gli devi"}
                </span>
              </div>
            </div>
            <span
              className={cn(
                "num-display tabular shrink-0 text-sm font-bold",
                isCredit ? "text-income" : "text-expense",
              )}
            >
              {isCredit ? "+" : "−"}
              {formatCurrency(Math.abs(item.balance), displayCurrency)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
