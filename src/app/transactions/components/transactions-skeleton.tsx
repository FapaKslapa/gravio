import { Skeleton } from "@/components/ui/skeleton";

export function TransactionsSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Caricamento in corso</span>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-11 w-28 rounded-full" />
      </div>
      <Skeleton className="h-13 w-full rounded-full md:max-w-md" />
      <Skeleton className="h-11 w-full rounded-full" />
      {["a", "b", "c", "d", "e"].map((k) => (
        <Skeleton key={k} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}
