export type TodoConvertItem = {
  id: string;
  title: string;
  estimatedAmount: string | null;
  estimatedCurrency: string | null;
};

export type TodoConvertModalProps = {
  isOpen: boolean;
  onClose: () => void;
  todoItem: TodoConvertItem | null;
  onConvert: (data: {
    todoId: string;
    amount: number;
    currency: string;
    date: string;
  }) => Promise<void>;
};
