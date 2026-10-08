import { ChevronDown } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { TodoItemRow } from "./todo-item-row";
import type { Category, TodoItem } from "./todo-types";

type TodoCompletedSectionProps = {
  todos: TodoItem[];
  categories: Category[];
  onToggleTodo: (id: string, completed: boolean) => void | Promise<void>;
  onImportTodo: (todo: TodoItem) => void;
};

export function TodoCompletedSection({
  todos,
  categories,
  onToggleTodo,
  onImportTodo,
}: TodoCompletedSectionProps) {
  const [showCompleted, setShowCompleted] = useState(true);

  return (
    <section className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setShowCompleted((v) => !v)}
        aria-expanded={showCompleted}
        className="flex min-h-11 w-full cursor-pointer items-center justify-between rounded-lg px-1 text-left text-sm font-semibold text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span>
          Completate <span className="tabular">({todos.length})</span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 transition-transform",
            !showCompleted && "-rotate-90",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {showCompleted && (
          <m.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={springs.smooth}
            className="-mx-1 -my-1 flex flex-col gap-2 overflow-hidden px-1 py-1"
          >
            <AnimatePresence initial={false}>
              {todos.map((todoItem) => (
                <TodoItemRow
                  key={todoItem.id}
                  todoItem={todoItem}
                  categories={categories}
                  onToggleTodo={onToggleTodo}
                  onImportTodo={onImportTodo}
                />
              ))}
            </AnimatePresence>
          </m.ul>
        )}
      </AnimatePresence>
    </section>
  );
}
