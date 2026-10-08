export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type TransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  editingTx?: {
    id: string;
    description: string | null;
    type: "expense" | "income";
    amount: string;
    currency: string;
    categoryId: string | null;
    date: string | Date;
  } | null;
  onSave: (tx: {
    id?: string;
    description: string;
    type: "expense" | "income";
    amount: number;
    currency: string;
    categoryId: string | null;
    date: string;
  }) => Promise<void>;
  onCreateCategory: (cat: {
    name: string;
    icon: string;
    color: string;
  }) => Promise<{ id: string }>;
};
