import { CategoryIcon } from "@/components/icon-helper";
import { cn } from "@/lib/utils";
import type { Category, TodoItem } from "./todo-types";

export function TodoMeta({
  todoItem,
  category,
  completed,
}: {
  todoItem: TodoItem;
  category: Category | undefined;
  completed: boolean;
}) {
  return (
    <div className="min-w-0 flex-1 py-2">
      <span
        className={cn(
          "line-clamp-2 text-[15px] font-medium leading-snug break-words",
          completed && "text-muted-foreground line-through",
        )}
      >
        {todoItem.title}
      </span>
      {todoItem.notes && (
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {todoItem.notes}
        </p>
      )}
      {category && !completed && (
        <span
          className="mt-1.5 inline-flex items-center gap-1 rounded-full py-0.5 pr-2 pl-1.5 text-[11px] font-semibold"
          style={{
            backgroundColor: `color-mix(in oklab, ${category.color} 14%, transparent)`,
          }}
        >
          <span style={{ color: category.color }} className="flex">
            <CategoryIcon name={category.icon} size={12} />
          </span>
          {category.name}
        </span>
      )}
    </div>
  );
}
