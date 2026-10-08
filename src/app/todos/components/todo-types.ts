export type TodoItem = {
  id: string;
  todoListId: string | null;
  title: string;
  notes: string | null;
  categoryId: string | null;
  estimatedAmount: string | null;
  estimatedCurrency: string | null;
  completed: boolean;
  convertedToTransactionId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};
