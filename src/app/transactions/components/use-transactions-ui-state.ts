import { useReducer } from "react";
import type { MobileTab } from "./transactions-mobile-tabs";
import type {
  NormalizedTransaction,
  SortField,
  ViewMode,
} from "./transactions-utils";

type UIState = {
  currentPage: number;
  viewMode: ViewMode;
  sortField: SortField;
  sortDirection: "asc" | "desc";
  activeMobileTab: MobileTab;
  isTxModalOpen: boolean;
  isCatManageOpen: boolean;
  isCsvModalOpen: boolean;
  txToDelete: string | null;
  catToDelete: string | null;
  editingTx: NormalizedTransaction | null;
};

type UIAction =
  | { type: "SET_FIELD"; field: keyof UIState; value: unknown }
  | { type: "SET_FIELDS"; fields: Partial<UIState> };

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_FIELDS":
      return { ...state, ...action.fields };
    default:
      return state;
  }
}

export function useTransactionsUiState() {
  const [uiState, dispatch] = useReducer(uiReducer, {
    currentPage: 1,
    viewMode: "timeline",
    sortField: "date",
    sortDirection: "desc",
    activeMobileTab: "list",
    isTxModalOpen: false,
    isCatManageOpen: false,
    isCsvModalOpen: false,
    txToDelete: null,
    catToDelete: null,
    editingTx: null,
  });

  const { currentPage, sortDirection } = uiState;

  const setCurrentPage = (val: number | ((prev: number) => number)) => {
    if (typeof val === "function") {
      dispatch({
        type: "SET_FIELD",
        field: "currentPage",
        value: val(currentPage),
      });
    } else {
      dispatch({ type: "SET_FIELD", field: "currentPage", value: val });
    }
  };
  const setViewMode = (val: ViewMode) =>
    dispatch({ type: "SET_FIELD", field: "viewMode", value: val });
  const setSortField = (val: SortField) =>
    dispatch({ type: "SET_FIELD", field: "sortField", value: val });
  const setSortDirection = (
    val: "asc" | "desc" | ((prev: "asc" | "desc") => "asc" | "desc"),
  ) => {
    if (typeof val === "function") {
      dispatch({
        type: "SET_FIELD",
        field: "sortDirection",
        value: val(sortDirection),
      });
    } else {
      dispatch({ type: "SET_FIELD", field: "sortDirection", value: val });
    }
  };
  const setActiveMobileTab = (val: MobileTab) =>
    dispatch({ type: "SET_FIELD", field: "activeMobileTab", value: val });
  const setIsTxModalOpen = (val: boolean) =>
    dispatch({ type: "SET_FIELD", field: "isTxModalOpen", value: val });
  const setIsCatManageOpen = (val: boolean) =>
    dispatch({ type: "SET_FIELD", field: "isCatManageOpen", value: val });
  const setIsCsvModalOpen = (val: boolean) =>
    dispatch({ type: "SET_FIELD", field: "isCsvModalOpen", value: val });
  const setTxToDelete = (val: string | null) =>
    dispatch({ type: "SET_FIELD", field: "txToDelete", value: val });
  const setCatToDelete = (val: string | null) =>
    dispatch({ type: "SET_FIELD", field: "catToDelete", value: val });
  const setEditingTx = (val: NormalizedTransaction | null) =>
    dispatch({ type: "SET_FIELD", field: "editingTx", value: val });

  const handleSortChange = (field: SortField) => {
    if (uiState.sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  return {
    ...uiState,
    handleSortChange,
    setCurrentPage,
    setViewMode,
    setSortField,
    setSortDirection,
    setActiveMobileTab,
    setIsTxModalOpen,
    setIsCatManageOpen,
    setIsCsvModalOpen,
    setTxToDelete,
    setCatToDelete,
    setEditingTx,
  };
}
