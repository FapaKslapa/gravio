import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  minHeight: string;
  layerStyle?: CSSProperties;
  children: ReactNode;
};

export function CardStackSingle({
  className,
  minHeight,
  layerStyle,
  children,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl bg-card elevation-2 [&>*]:grow",
        className,
      )}
      style={{ minHeight, ...layerStyle }}
    >
      {children}
    </div>
  );
}
