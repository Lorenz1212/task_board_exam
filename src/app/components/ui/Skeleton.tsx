import { cn } from "@/app/utils/helpers";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-slate-200", className)} />
  );
}

export function BoardCardSkeleton() {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-6 w-14 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <div className="flex justify-between items-center pt-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="rounded-lg bg-white border border-slate-200 p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex justify-between items-center pt-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function TaskColumnSkeleton() {
  return (
    <div className="flex-1 min-w-72 space-y-3">
      <Skeleton className="h-8 w-32 rounded-lg" />
      {[1, 2, 3].map((i) => (
        <TaskCardSkeleton key={i} />
      ))}
    </div>
  );
}
