"use client";

import { User, Users } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Props = {
  shareType: "friend" | "group";
  onSelectFriend: () => void;
  onSelectGroup: () => void;
};

export function ShareTypeToggle({
  shareType,
  onSelectFriend,
  onSelectGroup,
}: Props) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      spacing={0}
      value={shareType}
      onValueChange={(v) => {
        if (v === "friend") onSelectFriend();
        else if (v === "group") onSelectGroup();
      }}
      aria-label="Con chi dividere"
      className="w-full"
    >
      <ToggleGroupItem
        value="friend"
        className="h-11 flex-1 data-[state=on]:bg-brand-soft data-[state=on]:text-brand"
      >
        <User data-icon="inline-start" />
        Amico
      </ToggleGroupItem>
      <ToggleGroupItem
        value="group"
        className="h-11 flex-1 data-[state=on]:bg-brand-soft data-[state=on]:text-brand"
      >
        <Users data-icon="inline-start" />
        Gruppo
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
