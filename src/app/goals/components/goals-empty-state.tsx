import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function GoalsEmptyState({ onNew }: { onNew: () => void }) {
  return (
    <Empty className="border py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Target />
        </EmptyMedia>
        <EmptyTitle>Il tuo primo obiettivo</EmptyTitle>
        <EmptyDescription>
          Un viaggio, un fondo emergenze, un regalo: dai un nome a quello che
          vuoi ottenere e versa quando puoi.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          type="button"
          onClick={onNew}
          className="h-11 rounded-full bg-brand px-5 text-brand-foreground hover:bg-brand/90"
        >
          <Plus />
          Crea obiettivo
        </Button>
      </EmptyContent>
    </Empty>
  );
}
