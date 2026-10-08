import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex w-full flex-col gap-4"
    >
      <span className="sr-only">Caricamento in corso...</span>
      <Skeleton className="h-8 w-48 rounded-md" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    </div>
  );
}
