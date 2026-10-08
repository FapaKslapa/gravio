import { Skeleton } from "@/components/ui/skeleton";

export function TodosSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true">
      <Skeleton className="h-11 w-full rounded-full" />
      <Skeleton className="h-11 w-3/4 rounded-full" />
      <Skeleton className="h-14 w-full rounded-xl" />
      <Skeleton className="h-14 w-full rounded-lg" />
      <Skeleton className="h-14 w-full rounded-lg" />
    </div>
  );
}
