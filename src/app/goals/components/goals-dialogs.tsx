import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import type { Goal } from "../goals-helpers";
import type { GoalsMutations } from "../use-goals-mutations";
import { ContributionSheet } from "./contribution-sheet";
import { GoalFormSheet } from "./goal-form-sheet";

type GoalsDialogsProps = {
  mutations: GoalsMutations;
  displayCurrency: string;
  formOpen: boolean;
  onFormOpenChange: (open: boolean) => void;
  editing: Goal | null;
  onCreated: (id: string) => void;
  contributing: Goal | null;
  onCloseContribute: () => void;
  deleteId: string | null;
  onCloseDelete: () => void;
  onDeleted: () => void;
  deleteContributionId: string | null;
  onCloseDeleteContribution: () => void;
};

export function GoalsDialogs({
  mutations,
  displayCurrency,
  formOpen,
  onFormOpenChange,
  editing,
  onCreated,
  contributing,
  onCloseContribute,
  deleteId,
  onCloseDelete,
  onDeleted,
  deleteContributionId,
  onCloseDeleteContribution,
}: GoalsDialogsProps) {
  const {
    createMutation,
    updateMutation,
    deleteMutation,
    addContributionMutation,
    deleteContributionMutation,
  } = mutations;

  return (
    <>
      <GoalFormSheet
        open={formOpen}
        onOpenChange={onFormOpenChange}
        goal={editing}
        defaultCurrency={displayCurrency}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={async (values) => {
          if (editing) {
            await updateMutation.mutateAsync({ id: editing.id, ...values });
          } else {
            const { id } = await createMutation.mutateAsync(values);
            onCreated(id);
          }
          onFormOpenChange(false);
        }}
      />

      <ContributionSheet
        goal={contributing}
        isPending={addContributionMutation.isPending}
        onOpenChange={(open) => {
          if (!open) onCloseContribute();
        }}
        onSubmit={async (values) => {
          if (!contributing) return;
          await addContributionMutation.mutateAsync({
            goalId: contributing.id,
            ...values,
          });
          toast.success("Versamento registrato");
          onCloseContribute();
        }}
      />

      <ConfirmationDialog
        isOpen={deleteId !== null}
        onClose={onCloseDelete}
        title="Eliminare l'obiettivo?"
        message="L'obiettivo e tutti i suoi versamenti verranno eliminati."
        confirmLabel="Elimina"
        onConfirm={async () => {
          if (!deleteId) return;
          await deleteMutation.mutateAsync({ id: deleteId });
          onCloseDelete();
          onDeleted();
        }}
      />

      <ConfirmationDialog
        isOpen={deleteContributionId !== null}
        onClose={onCloseDeleteContribution}
        title="Eliminare il versamento?"
        confirmLabel="Elimina"
        onConfirm={async () => {
          if (!deleteContributionId) return;
          await deleteContributionMutation.mutateAsync({
            id: deleteContributionId,
          });
          onCloseDeleteContribution();
        }}
      />
    </>
  );
}
