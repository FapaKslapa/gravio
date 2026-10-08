import { Check } from "lucide-react";
import type { BulkTodoItem } from "./todo-bulk-convert-types";

export function BulkSelectedSummary({ todos }: { todos: BulkTodoItem[] }) {
  return (
    <div className="flex max-h-28 flex-col gap-2 overflow-y-auto rounded-lg bg-muted px-3.5 py-3">
      <p className="text-xs text-muted-foreground">
        <span className="tabular">{todos.length}</span> articoli selezionati
      </p>
      <div className="flex flex-wrap gap-1.5">
        {todos.map((todo) => (
          <span
            key={todo.id}
            className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-xs font-medium"
          >
            <Check className="size-3 text-income" strokeWidth={3} />
            {todo.title}
          </span>
        ))}
      </div>
    </div>
  );
}
