import { CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

export function RecurrentLoading() {
  return (
    <div className="elevation-1 flex flex-col gap-3 rounded-lg bg-card p-4">
      {["a", "b", "c"].map((k) => (
        <div key={k} className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-md" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function RecurrentEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <Empty className="border py-14">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CalendarDays />
        </EmptyMedia>
        <EmptyTitle>Nessuna regola ricorrente attiva</EmptyTitle>
        <EmptyDescription>
          Crea una regola per automatizzare l'inserimento di stipendi,
          abbonamenti o affitto.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          className="h-11 gap-1.5 rounded-full bg-brand px-4 text-brand-foreground hover:bg-brand/90"
          onClick={onCreate}
        >
          <Plus data-icon="inline-start" />
          Nuova ricorrente
        </Button>
      </EmptyContent>
    </Empty>
  );
}
