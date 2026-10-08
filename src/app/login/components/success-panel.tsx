import { MailCheck } from "lucide-react";
import { m } from "motion/react";
import type React from "react";
import { springs } from "@/lib/motion";

export function SuccessPanel({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action: React.ReactNode;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springs.smooth}
      role="status"
      className="flex flex-col items-center gap-4 py-2 text-center"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-income-soft text-income">
        <MailCheck aria-hidden className="size-7" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-xl font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground text-pretty">{children}</p>
      </div>
      <div className="w-full">{action}</div>
    </m.div>
  );
}
