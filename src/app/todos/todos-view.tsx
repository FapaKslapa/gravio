"use client";

import { m } from "motion/react";
import { SwipeArea } from "@/components/ui/swipe-area";
import { fadeUp } from "@/lib/motion";
import { TodoEmptyState } from "./components/todo-empty-state";
import { TodoForm } from "./components/todo-form";
import { TodoHeader } from "./components/todo-header";
import { TodoItems } from "./components/todo-items";
import { TodoLists } from "./components/todo-lists";
import { TodoModalsContainer } from "./components/todo-modals-container";
import { TodosSkeleton } from "./components/todos-skeleton";
import { useTodoView } from "./use-todo-view";

export default function TodosView() {
  const v = useTodoView();

  if (v.isCategoriesLoading || v.isListsLoading) {
    return <TodosSkeleton />;
  }

  const lists = v.listsData || [];
  const categories = v.categoriesData || [];
  const todos = v.todosData || [];
  const activeIdx = lists.findIndex((l) => l.id === v.actualActiveListId);

  return (
    <div className="flex flex-col gap-5">
      <TodoHeader onNewList={() => v.setIsNewListOpen(true)} />

      {lists.length === 0 ? (
        <TodoEmptyState onNewList={() => v.setIsNewListOpen(true)} />
      ) : (
        <m.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 items-start gap-5 md:grid-cols-[15rem_minmax(0,1fr)] md:gap-8 xl:grid-cols-[17rem_minmax(0,1fr)]"
        >
          <div className="md:sticky md:top-6">
            <TodoLists
              lists={lists}
              activeListId={v.actualActiveListId}
              onSelectActiveList={v.handleSelectActiveList}
            />
          </div>

          <SwipeArea
            className="flex min-w-0 flex-col gap-4"
            disabled={v.isSelectionMode}
            onPrev={
              activeIdx > 0
                ? () => v.handleSelectActiveList(lists[activeIdx - 1].id)
                : undefined
            }
            onNext={
              activeIdx >= 0 && activeIdx < lists.length - 1
                ? () => v.handleSelectActiveList(lists[activeIdx + 1].id)
                : undefined
            }
          >
            <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-30 -mx-4 bg-background/90 px-4 py-2 backdrop-blur-md md:static md:mx-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
              <TodoForm
                key={v.actualActiveListId}
                activeListId={v.actualActiveListId}
                listName={v.activeListName}
                categories={categories}
                onAddTodo={v.handleCreateTodo}
              />
            </div>

            <TodoItems
              listName={v.activeListName}
              canDeleteList={lists.length > 1}
              onDeleteList={() => v.setListToDelete(v.actualActiveListId)}
              todos={todos}
              categories={categories}
              onToggleTodo={v.handleToggleTodo}
              onDeleteTodo={v.setTodoToDelete}
              onImportTodo={v.setImportingTodo}
              isSelectionMode={v.isSelectionMode}
              selectedTodoIds={v.selectedTodoIds}
              onToggleSelectTodo={v.handleToggleSelectTodo}
              onToggleAllSelectTodos={v.handleToggleAllSelectTodos}
              onStartSelectionMode={() => v.setIsSelectionMode(true)}
              onCancelSelectionMode={() => {
                v.setIsSelectionMode(false);
                v.setSelectedTodoIds([]);
              }}
              onTriggerBulkImport={() => v.setIsBulkImportOpen(true)}
            />
          </SwipeArea>
        </m.div>
      )}

      <TodoModalsContainer
        isNewListOpen={v.isNewListOpen}
        newListName={v.newListName}
        onNewListNameChange={v.setNewListName}
        onNewListClose={() => v.setIsNewListOpen(false)}
        onNewListSubmit={v.handleCreateList}
        importingTodo={v.importingTodo}
        onImportTodoClose={() => v.setImportingTodo(null)}
        onImportTodoConfirm={v.handleImportTodo}
        isBulkImportOpen={v.isBulkImportOpen}
        onBulkImportClose={() => v.setIsBulkImportOpen(false)}
        selectedTodos={todos.filter((t) => v.selectedTodoIdsSet.has(t.id))}
        categories={categories}
        onBulkImportConfirm={v.handleImportTodoBulk}
        listToDelete={v.listToDelete}
        onDeleteListClose={() => v.setListToDelete(null)}
        onDeleteListConfirm={v.handleDeleteListConfirm}
        todoToDelete={v.todoToDelete}
        onDeleteTodoClose={() => v.setTodoToDelete(null)}
        onDeleteTodoConfirm={v.handleDeleteTodoConfirm}
      />
    </div>
  );
}
