"use client";

import type { FriendItem, GroupItem } from "../friends-ui-state";
import { ConfirmSheet } from "./confirm-sheet";

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
