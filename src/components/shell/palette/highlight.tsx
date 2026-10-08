import { norm } from "./palette-utils";

export function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const idx = norm(text).indexOf(norm(q));
  if (idx < 0 || norm(text).length !== text.length) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-xs bg-brand-soft text-foreground">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}
