export type FriendUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export type FriendItem = {
  friendshipId: string;
  user: FriendUser;
  createdAt: Date | null;
};

export type BalanceInfo = {
  user: { id: string; name: string; email: string };
  balanceNok: number;
};

export type TransactionInfo = {
  id: string;
  userId: string;
  payerName?: string | null;
  amountEur: string;
  amountNok: string;
  description: string | null;
  date: Date;
  sharedInfo?: {
    id: string;
    payerId: string;
    borrowerId: string;
    splitAmountNok: string;
    settled: boolean;
    isBorrowed: boolean;
  } | null;
};
