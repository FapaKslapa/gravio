"use client";

import { ChevronRight, FolderPlus, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

type GroupMember = {
  id: string;
  name: string;
  email: string;
};

type GroupItem = {
  id: string;
  name: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  members: GroupMember[];
};

type GroupListCardProps = {
  groups: GroupItem[];
  selectedGroupId: string | undefined;
  onSelectGroup: (group: GroupItem) => void;
  onClearFriend: () => void;
  onOpenCreateGroup: () => void;
};

export function GroupListCard({
  groups,
  selectedGroupId,
  onSelectGroup,
  onClearFriend,
  onOpenCreateGroup,
}: GroupListCardProps) {
  if (groups.length === 0) {
    return (
      <Card className="elevation-1">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>Nessun gruppo creato</EmptyTitle>
            <EmptyDescription>
              Dividi le spese con più amici creando un gruppo.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              onClick={onOpenCreateGroup}
              className="h-11 gap-1.5 rounded-full bg-brand px-5 font-semibold text-brand-foreground hover:bg-brand/90"
            >
              <FolderPlus />
              Crea gruppo
            </Button>
          </EmptyContent>
        </Empty>
      </Card>
    );
  }

  return (
    <Card className="gap-0 p-0 elevation-1">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-base font-semibold">Gruppi</h2>
        <Button
          variant="ghost"
          className="h-11 gap-1.5 rounded-full px-3 font-semibold text-brand"
          onClick={onOpenCreateGroup}
        >
          <FolderPlus />
          Nuovo gruppo
        </Button>
      </div>
      <ul className="flex flex-col border-t">
        {groups.map((group) => {
          const isSelected = selectedGroupId === group.id;
          return (
            <li key={group.id} className="not-last:border-b">
              <button
                type="button"
                aria-current={isSelected ? "true" : undefined}
                onClick={() => {
                  onSelectGroup(group);
                  onClearFriend();
                }}
                className={cn(
                  "flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
                  isSelected && "bg-brand-soft hover:bg-brand-soft",
                )}
              >
                <Avatar className="size-10">
                  <AvatarFallback className="bg-brand-soft text-brand">
                    <Users className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-semibold">
                    {group.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {group.members.length} membri
                  </span>
                </div>
                <ChevronRight
                  aria-hidden
                  className="size-4 shrink-0 text-muted-foreground"
                />
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
