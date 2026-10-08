import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { CategoriesModal } from "./categories-modal";
import { CsvImportModal } from "./csv-import-modal";
import { TransactionModal } from "./transaction-modal";
import type { NormalizedTransaction } from "./transactions-utils";
import type { useTransactionMutations } from "./use-transaction-mutations";

type Mutations = ReturnType<typeof useTransactionMutations>;

type TransactionsDialogsProps = Mutations & {
  categories: React.ComponentProps<typeof TransactionModal>["categories"];
  isTxModalOpen: boolean;
  isCatManageOpen: boolean;
  isCsvModalOpen: boolean;
  txToDelete: string | null;
  catToDelete: string | null;
  editingTx: NormalizedTransaction | null;
  setIsTxModalOpen: (v: boolean) => void;
  setIsCatManageOpen: (v: boolean) => void;
  setIsCsvModalOpen: (v: boolean) => void;
  setTxToDelete: (v: string | null) => void;
  setCatToDelete: (v: string | null) => void;
  setEditingTx: (v: NormalizedTransaction | null) => void;
};

export function TransactionsDialogs({
  categories,
  isTxModalOpen,
  isCatManageOpen,
  isCsvModalOpen,
  txToDelete,
  catToDelete,
  editingTx,
  setIsTxModalOpen,
  setIsCatManageOpen,
  setIsCsvModalOpen,
  setTxToDelete,
  setCatToDelete,
  setEditingTx,
  handleSaveTx,
  handleCreateCategory,
  handleUpdateCategory,
  handleCsvImport,
  handleDeleteTransaction,
  handleDeleteCategory,
}: TransactionsDialogsProps) {
  return (
    <>
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        categories={categories}
        editingTx={editingTx}
        onSave={(tx) => handleSaveTx(tx, () => setEditingTx(null))}
        onCreateCategory={handleCreateCategory}
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        categories={categories}
        onImport={handleCsvImport}
      />

      <CategoriesModal
        isOpen={isCatManageOpen}
        onClose={() => setIsCatManageOpen(false)}
        categories={categories}
        onDeleteCategory={setCatToDelete}
        onCreateCategory={async (cat) => {
          await handleCreateCategory(cat);
        }}
        onUpdateCategory={handleUpdateCategory}
      />

      <ConfirmationDialog
        isOpen={txToDelete !== null}
        onClose={() => setTxToDelete(null)}
        onConfirm={() => {
          if (txToDelete)
            handleDeleteTransaction(txToDelete, () => setTxToDelete(null));
        }}
        title="Elimina Transazione"
        message="Sei sicuro di voler eliminare questa transazione? L'operazione non può essere annullata."
        confirmLabel="Elimina"
        cancelLabel="Annulla"
      />

      <ConfirmationDialog
        isOpen={catToDelete !== null}
        onClose={() => setCatToDelete(null)}
        onConfirm={() => {
          if (catToDelete)
            handleDeleteCategory(catToDelete, () => setCatToDelete(null));
        }}
        title="Elimina Categoria"
        message="Sei sicuro di voler eliminare questa categoria? Le transazioni collegate rimarranno ma diventeranno senza categoria."
        confirmLabel="Elimina"
        cancelLabel="Annulla"
      />
    </>
  );
}
