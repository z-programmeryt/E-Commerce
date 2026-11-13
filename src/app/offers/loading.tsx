import { Skeleton } from "@/components/EmptyState";

export default function Loading() {
  return (
    <div className="container-page py-12" aria-busy="true" aria-live="polite">
      <Skeleton className="mb-3 h-4 w-24" />
      <Skeleton className="mb-8 h-9 w-2/3 max-w-md" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-[4/5] w-full" />
            <Skeleton className="mt-3 h-3 w-3/4" />
            <Skeleton className="mt-2 h-3 w-1/3" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading offers…</span>
    </div>
  );
}
