import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/client";

export function useGoalsMutations(refetch: () => unknown) {
  const trpc = useTRPC();
  const onSuccess = () => refetch();
  const onError = () => toast.error("Operazione non riuscita");

  const createMutation = useMutation(
    trpc.savingsGoal.create.mutationOptions({ onSuccess, onError }),
  );
  const updateMutation = useMutation(
    trpc.savingsGoal.update.mutationOptions({ onSuccess, onError }),
  );
  const deleteMutation = useMutation(
    trpc.savingsGoal.delete.mutationOptions({ onSuccess, onError }),
  );
  const addContributionMutation = useMutation(
    trpc.savingsGoal.addContribution.mutationOptions({ onSuccess, onError }),
  );
  const deleteContributionMutation = useMutation(
    trpc.savingsGoal.deleteContribution.mutationOptions({ onSuccess, onError }),
  );

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    addContributionMutation,
    deleteContributionMutation,
  };
}

export type GoalsMutations = ReturnType<typeof useGoalsMutations>;
