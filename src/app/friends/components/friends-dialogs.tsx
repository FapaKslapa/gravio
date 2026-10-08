"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-is-mobile";

type ConfirmSheetProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
};

function ConfirmSheet({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  destructive = false,
}: ConfirmSheetProps) {
  const isMobile = useIsMobile();
  const [pending, setPending] = useState(false);

  const handleConfirm = async () => {
    setPending(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setPending(false);
    }
  };

  const confirmButton = (
    <Button
      type="button"
      variant={destructive ? "destructive" : "default"}
      disabled={pending}
      onClick={handleConfirm}
      className="h-11"
    >
      {pending ? (
        <Loader2 data-icon="inline-start" className="animate-spin" />
      ) : null}
      {pending ? "Attendi..." : confirmLabel}
    </Button>
  );

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={(o) => {
          if (!o && !pending) onClose();
        }}
      >
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{message}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="pb-[max(1rem,env(safe-area-inset-bottom))]">
            {confirmButton}
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={onClose}
              className="h-11"
            >
              Annulla
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o && !pending) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Annulla</AlertDialogCancel>
          {confirmButton}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type FriendItem = {
  friendshipId: string;
  user: { id: string; name: string; email: string; image: string | null };
  createdAt: Date | null;
};

type GroupItem = {
  id: string;
  name: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  members: { id: string; name: string; email: string }[];
};

interface FriendsDialogsProps {
  friendToDelete: FriendItem | null;
  onCloseFriendDelete: () => void;
  onConfirmFriendDelete: () => Promise<void>;

  settleConfirmFriend: FriendItem | null;
  onCloseSettle: () => void;
  onConfirmSettle: () => Promise<void>;

  groupToDelete: GroupItem | null;
  onCloseGroupDelete: () => void;
  onConfirmGroupDelete: () => Promise<void>;
}

export function FriendsDialogs({
  friendToDelete,
  onCloseFriendDelete,
  onConfirmFriendDelete,
  settleConfirmFriend,
  onCloseSettle,
  onConfirmSettle,
  groupToDelete,
  onCloseGroupDelete,
  onConfirmGroupDelete,
}: FriendsDialogsProps) {
  return (
    <>
      <ConfirmSheet
        open={friendToDelete !== null}
        onClose={onCloseFriendDelete}
        onConfirm={onConfirmFriendDelete}
        title="Rimuovi amico"
        message={`Sei sicuro di voler rimuovere ${friendToDelete?.user.name} dai tuoi amici? Questo non cancellerà le transazioni passate ma non potrete più condividere nuove spese.`}
        confirmLabel="Rimuovi"
        destructive
      />

      <ConfirmSheet
        open={settleConfirmFriend !== null}
        onClose={onCloseSettle}
        onConfirm={onConfirmSettle}
        title="Conferma saldo"
        message={`Sei sicuro di voler saldare il debito con ${settleConfirmFriend?.user.name}? Verrà registrata una transazione di saldo.`}
        confirmLabel="Salda"
      />

      <ConfirmSheet
        open={groupToDelete !== null}
        onClose={onCloseGroupDelete}
        onConfirm={onConfirmGroupDelete}
        title="Elimina gruppo"
        message={`Sei sicuro di voler eliminare il gruppo "${groupToDelete?.name}"? I membri ed i bilanci storici rimarranno intatti, ma il gruppo verrà rimosso.`}
        confirmLabel="Elimina"
        destructive
      />
    </>
  );
}
