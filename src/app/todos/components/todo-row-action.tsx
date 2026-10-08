import { Check, Receipt, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TodoItem } from "./todo-types";

export function TodoRowAction({
  todoItem,
  onDeleteTodo,
  onImportTodo,
}: {
  todoItem: TodoItem;
  onDeleteTodo?: (id: string) => void;
  onImportTodo?: (todo: TodoItem) => void;
}) {
  return todoItem.completed ? (
    todoItem.convertedToTransactionId ? (
      <span className="mr-3 inline-flex min-h-8 shrink-0 items-center gap-1 rounded-full bg-income-soft px-2.5 text-xs font-semibold text-income">
        <Check className="size-3.5" strokeWidth={3} />
        Importato
      </span>
    ) : (
      <div className="basis-full pr-3 pb-2 pl-11">
        <Button
          type="button"
          variant="outline"
          onClick={() => onImportTodo?.(todoItem)}
          className="h-11 w-full rounded-full px-3.5 text-sm font-semibold sm:w-auto"
        >
          <Receipt />
          Importa spesa
        </Button>
      </div>
    )
  ) : onDeleteTodo ? (
    <Button
      type="button"
      variant="ghost"
      onClick={() => onDeleteTodo(todoItem.id)}
      aria-label={`Elimina ${todoItem.title}`}
      className="size-11 shrink-0 rounded-full text-muted-foreground hover:text-destructive md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100"
    >
      <Trash2 />
    </Button>
  ) : null;
}
