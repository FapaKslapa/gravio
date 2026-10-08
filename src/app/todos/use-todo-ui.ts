import { useMemo, useReducer } from "react";
import type { TodoItem } from "./components/todo-items";
import { initialUIState, uiReducer } from "./ui-state";

export function useTodoUi() {
  const [uiState, dispatch] = useReducer(uiReducer, initialUIState);
  const { selectedTodoIds } = uiState;

  const setActiveListId = (val: string) =>
    dispatch({ type: "SET_FIELD", field: "activeListId", value: val });
  const setIsSelectionMode = (val: boolean) =>
    dispatch({ type: "SET_FIELD", field: "isSelectionMode", value: val });
  const setSelectedTodoIds = (
    val: string[] | ((prev: string[]) => string[]),
  ) => {
    if (typeof val === "function") {
      dispatch({
        type: "SET_FIELD",
        field: "selectedTodoIds",
        value: val(selectedTodoIds),
      });
    } else {
      dispatch({ type: "SET_FIELD", field: "selectedTodoIds", value: val });
    }
  };
  const setIsBulkImportOpen = (val: boolean) =>
    dispatch({ type: "SET_FIELD", field: "isBulkImportOpen", value: val });
  const setIsNewListOpen = (val: boolean) =>
    dispatch({ type: "SET_FIELD", field: "isNewListOpen", value: val });
  const setNewListName = (val: string) =>
    dispatch({ type: "SET_FIELD", field: "newListName", value: val });
  const setImportingTodo = (val: TodoItem | null) =>
    dispatch({ type: "SET_FIELD", field: "importingTodo", value: val });
  const setListToDelete = (val: string | null) =>
    dispatch({ type: "SET_FIELD", field: "listToDelete", value: val });
  const setTodoToDelete = (val: string | null) =>
    dispatch({ type: "SET_FIELD", field: "todoToDelete", value: val });

  const selectedTodoIdsSet = useMemo(
    () => new Set(selectedTodoIds),
    [selectedTodoIds],
  );

  return {
    ...uiState,
    selectedTodoIdsSet,
    setActiveListId,
    setIsSelectionMode,
    setSelectedTodoIds,
    setIsBulkImportOpen,
    setIsNewListOpen,
    setNewListName,
    setImportingTodo,
    setListToDelete,
    setTodoToDelete,
  };
}
