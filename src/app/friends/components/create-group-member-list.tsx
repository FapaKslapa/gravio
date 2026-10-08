"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { MemberAvatar } from "./shared-expense/member-avatar";

type FriendItem = {
  friendshipId: string;
  user: { id: string; name: string; email: string; image?: string | null };
};

type Props = {
  friends: FriendItem[];
  selectedSet: Set<string>;
  onToggle: (friendId: string) => void;
};

export function CreateGroupMemberList({
  friends,
  selectedSet,
  onToggle,
}: Props) {
  return (
    <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto">
      {friends.map((friend) => {
        const checked = selectedSet.has(friend.user.id);
        const id = `member-${friend.user.id}`;
        return (
          <li
            key={friend.user.id}
            className={cn(
              "flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2 transition-colors",
              checked ? "border-brand/40 bg-brand-soft" : "bg-card",
            )}
          >
            <Checkbox
              id={id}
              checked={checked}
              onCheckedChange={() => onToggle(friend.user.id)}
            />
            <label
              htmlFor={id}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 py-1"
            >
              <MemberAvatar name={friend.user.name} image={friend.user.image} />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">
                  {friend.user.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {friend.user.email}
                </span>
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
