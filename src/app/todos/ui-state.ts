import type { TodoItem } from "./components/todo-items";

export type UIState = {
  activeListId: string;
  isSelectionMode: boolean;
  selectedTodoIds: string[];
  isBulkImportOpen: boolean;
  isNewListOpen: boolean;
  newListName: string;
  importingTodo: TodoItem | null;
  listToDelete: string | null;
  todoToDelete: string | null;
};

export type UIAction =
  | { type: "SET_FIELD"; field: keyof UIState; value: unknown }
  | { type: "SET_FIELDS"; fields: Partial<UIState> };

export const initialUIState: UIState = {
  activeListId: "",
  isSelectionMode: false,
  selectedTodoIds: [],
  isBulkImportOpen: false,
  isNewListOpen: false,
  newListName: "",
  importingTodo: null,
  listToDelete: null,
  todoToDelete: null,
};

export function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_FIELDS":
      return { ...state, ...action.fields };
    default:
      return state;
  }
}
