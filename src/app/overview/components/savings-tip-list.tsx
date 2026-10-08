import { tipIcon } from "./tip-icon";

type Tip = {
  kind: Parameters<typeof tipIcon>[0];
  title: string;
  advice: string;
};

export function SavingsTipList({
  tips,
  summary,
}: {
  tips: Tip[];
  summary: string | undefined;
}) {
  return tips.length === 0 ? (
    <p className="text-sm text-muted-foreground">{summary}</p>
  ) : (
    <ul className="flex flex-col gap-2">
      {tips.slice(0, 2).map((tip) => {
        const Icon = tipIcon(tip.kind);
        return (
          <li
            key={`${tip.kind}-${tip.title}`}
            className="flex items-start gap-3"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
              <Icon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-tight font-semibold">{tip.title}</p>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {tip.advice}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
