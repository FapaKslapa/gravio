import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (
    parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"
  );
}

export function MemberAvatar({
  name,
  image,
  className,
}: {
  name: string;
  image?: string | null;
  className?: string;
}) {
  return (
    <Avatar className={cn("size-9", className)}>
      {image ? <AvatarImage src={image} alt="" /> : null}
      <AvatarFallback className="bg-brand-soft text-xs font-semibold text-brand">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
