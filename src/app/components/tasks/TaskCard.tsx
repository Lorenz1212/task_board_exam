"use client";

import { useState, useEffect, useTransition } from "react";
import Card from "@/app/components/ui/Card";
import Modal from "@/app/components/ui/Modal";
import Button from "@/app/components/ui/Button";
import StatusBadge from "@/app/components/tasks/StatusBadge";
import PriorityBadge from "@/app/components/tasks/PriorityBadge";
import { formatDate, isOverdue } from "@/app/utils/helpers";
import { TASK_STATUSES, STATUS_CONFIG } from "@/app/utils/constants";
import { updateTaskStatus, deleteTask } from "@/app/actions/task.actions";
import { useToast } from "@/app/hooks/useToast";
import type { Task, TaskStatus } from "@/app/lib/types";

interface TaskCardProps {
  task: Task;
  boardId: number;
}

export default function TaskCard({ task, boardId }: TaskCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState<TaskStatus>(task.status);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { success, error: toastError } = useToast();

  // Sync when the server sends fresh task data after revalidation
  useEffect(() => {
    setLocalStatus(task.status);
  }, [task.status]);

  const overdue = isOverdue(task.dueDate) && localStatus !== "done";

  function onStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as TaskStatus;
    const prevStatus = localStatus;
    setLocalStatus(newStatus); // optimistic — immediate visual feedback
    startTransition(async () => {
      const result = await updateTaskStatus(task.id, boardId, newStatus);
      if (!result.success) {
        setLocalStatus(prevStatus); // revert on server error
        toastError(result.error);
      } else {
        success("Status updated!");
      }
    });
  }

  function onDelete() {
    startTransition(async () => {
      setIsDeleted(true); // optimistic — card disappears immediately
      const result = await deleteTask(task.id, boardId);
      if (!result.success) {
        setIsDeleted(false); // revert
        toastError(result.error);
      } else {
        success("Task deleted.");
        setDetailOpen(false);
      }
    });
  }

  // Render nothing while optimistically deleted (server revalidation removes it for real)
  if (isDeleted) return null;

  return (
    <>
      <Card
        padding={false}
        hover
        className="p-4 flex flex-col gap-3 cursor-pointer"
        onClick={() => setDetailOpen(true)}
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-slate-900 leading-snug flex-1 line-clamp-2">
            {task.title}
          </h4>
          <PriorityBadge priority={task.priority} className="shrink-0" />
        </div>

        {task.description && (
          <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
        )}

        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={localStatus} />
          {task.dueDate && (
            <span
              className={`text-xs ${
                overdue ? "text-red-600 font-medium" : "text-slate-400"
              }`}
            >
              {overdue ? "⚠ " : ""}Due {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </Card>

      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Task details"
        size="md"
      >
        <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
          <div>
            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">
              Title
            </p>
            <p className="text-sm font-medium text-slate-900">{task.title}</p>
          </div>

          {task.description && (
            <div>
              <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">
                Description
              </p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">
                Status
              </p>
              {/* Controlled — always reflects the latest server + optimistic state */}
              <select
                value={localStatus}
                onChange={onStatusChange}
                disabled={isPending}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_CONFIG[s].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">
                Priority
              </p>
              <PriorityBadge priority={task.priority} />
            </div>
          </div>

          {task.dueDate && (
            <div>
              <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">
                Due date
              </p>
              <p
                className={`text-sm ${
                  overdue ? "text-red-600 font-medium" : "text-slate-700"
                }`}
              >
                {overdue ? "⚠ Overdue — " : ""}
                {formatDate(task.dueDate)}
              </p>
            </div>
          )}

          <p className="text-xs text-slate-400">
            Created {formatDate(task.createdAt)}
          </p>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button
              variant="danger"
              size="sm"
              loading={isPending}
              onClick={onDelete}
            >
              Delete task
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
