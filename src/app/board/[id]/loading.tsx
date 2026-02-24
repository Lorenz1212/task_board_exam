import { TaskColumnSkeleton } from "@/app/components/ui/Skeleton";

export default function BoardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-8 gap-4">
        <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
        <div className="w-px h-5 bg-slate-200" />
        <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
      </header>
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-5 overflow-x-auto pb-4">
          {[1, 2, 3].map((i) => (
            <TaskColumnSkeleton key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
