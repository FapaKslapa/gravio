export type BulkTodoItem = {
  id: string;
  title: string;
  categoryId: string | null;
  estimatedAmount: string | null;
  estimatedCurrency: string | null;
};

export type BulkCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type TodoBulkConvertModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedTodos: BulkTodoItem[];
  categories: BulkCategory[];
  onConvertBulk: (data: {
    todoIds: string[];
    amount: number;
    currency: string;
    date: string;
    description: string;
    categoryId: string | null;
  }) => Promise<void>;
};
