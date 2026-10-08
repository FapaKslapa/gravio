"use client";

import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTRPC } from "@/lib/trpc/client";

export function useCreateGroupForm(onSuccess: () => void, onClose: () => void) {
  const [name, setName] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const trpc = useTRPC();
  const createGroupMutation = useMutation(
    trpc.group.create.mutationOptions({
      onSuccess: () => {
        onSuccess();
        reset();
        onClose();
      },
    }),
  );

  const reset = () => {
    setName("");
    setSelectedIds([]);
    setAttempted(false);
  };

  const toggle = (friendId: string) => {
    setSelectedIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId],
    );
  };

  const nameInvalid = !name.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (nameInvalid) return;
    createGroupMutation.mutate({
      name: name.trim(),
      memberUserIds: selectedIds,
    });
  };

  return {
    name,
    setName,
    attempted,
    selectedIds,
    selectedSet,
    toggle,
    nameInvalid,
    handleSubmit,
    isPending: createGroupMutation.isPending,
  };
}
