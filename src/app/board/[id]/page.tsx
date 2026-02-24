import { notFound } from "next/navigation";
import Link from "next/link";
import { getBoardWithTasks } from "@/app/actions/board.actions";
import TaskBoard from "@/app/components/tasks/TaskBoard";
import type { Metadata } from "next";

interface BoardPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: BoardPageProps): Promise<Metadata> {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) return { title: "Board" };
  const result = await getBoardWithTasks(numericId);
  return {
    title: result.success ? result.data.name : "Board",
  };
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) notFound();
  const result = await getBoardWithTasks(numericId);

  if (!result.success) {
    if (result.error === "Board not found.") notFound();
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{result.error}</p>
      </div>
    );
  }

  const board = result.data;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Boards
          </Link>

          <div className="w-px h-5 bg-slate-200" />

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: board.color ?? "#6366f1" }}
            />
            <h1 className="font-semibold text-slate-900 truncate">{board.name}</h1>
            {board.description && (
              <span className="text-sm text-slate-400 truncate hidden sm:block">
                — {board.description}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-slate-400">
              {board.tasks.length} task{board.tasks.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </header>

      {/* Board content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
        <TaskBoard board={board} />
      </main>
    </div>
  );
}
