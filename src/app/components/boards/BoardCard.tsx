"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import { formatDate, getTaskCountsByStatus } from "@/app/utils/helpers";
import type { BoardWithTaskCount } from "@/app/lib/types";
import { useBoards } from "@/app/hooks/useBoards";

interface BoardCardProps {
  board: BoardWithTaskCount;
}

export default function BoardCard({ board }: BoardCardProps) {
  const [confirming, setConfirming] = useState(false);
  const { isPending, handleDelete } = useBoards();
  const counts = getTaskCountsByStatus(board.tasks);

  async function onDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirming) {
      setConfirming(true);
      return;
    }
    await handleDelete(board.id);
  }

  return (
    <Card hover className="flex flex-col gap-4 group relative overflow-hidden">
      {/* Color accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ backgroundColor: board.color ?? "#6366f1" }}
      />

      <div className="flex items-start justify-between gap-2 pt-1">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate text-base">
            {board.name}
          </h3>
          {board.description && (
            <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
              {board.description}
            </p>
          )}
        </div>

        <button
          onClick={onDelete}
          disabled={isPending}
          className={`shrink-0 p-1.5 rounded-lg transition-colors text-sm ${
            confirming
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100"
          }`}
          aria-label={confirming ? "Confirm delete" : "Delete board"}
          title={confirming ? "Click again to confirm" : "Delete board"}
          onBlur={() => setConfirming(false)}
        >
          {confirming ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Task status pills */}
      <div className="flex gap-2 text-xs flex-wrap">
        <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
          {counts.todo} to do
        </span>
        <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
          {counts.in_progress} in progress
        </span>
        <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
          {counts.done} done
        </span>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs text-slate-400">
          Created {formatDate(board.createdAt)}
        </span>
        <Link href={`/board/${board.id}`}>
          <Button size="sm" variant="secondary">
            Open →
          </Button>
        </Link>
      </div>
    </Card>
  );
}
