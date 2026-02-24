"use client";

import { useState } from "react";
import Modal from "@/app/components/ui/Modal";
import Button from "@/app/components/ui/Button";
import TaskCard from "@/app/components/tasks/TaskCard";
import CreateTaskForm from "@/app/components/tasks/CreateTaskForm";
import { STATUS_CONFIG } from "@/app/utils/constants";
import { cn } from "@/app/utils/helpers";
import type { Task, TaskStatus } from "@/app/lib/types";

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  boardId: number;
  onCreateTask: (formData: FormData) => void;
  isCreating: boolean;
}

export default function TaskColumn({
  status,
  tasks,
  boardId,
  onCreateTask,
  isCreating,
}: TaskColumnProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const config = STATUS_CONFIG[status];

  function handleSubmit(formData: FormData) {
    onCreateTask(formData);
    setModalOpen(false);
  }

  return (
    <div className="flex flex-col min-w-72 flex-1 max-w-sm">
      {/* Column header */}
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2.5 rounded-xl mb-3",
          config.bg,
          `border ${config.border}`
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn("font-semibold text-sm", config.color)}>
            {config.label}
          </span>
          <span
            className={cn(
              "text-xs font-medium px-1.5 py-0.5 rounded-full bg-white/70",
              config.color
            )}
          >
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className={cn(
            "p-1 rounded-lg transition-colors hover:bg-white/50",
            config.color
          )}
          title={`Add task to ${config.label}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-2.5 flex-1">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-xs text-slate-400">No tasks here</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs"
              onClick={() => setModalOpen(true)}
            >
              + Add one
            </Button>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} boardId={boardId} />
          ))
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`New task — ${config.label}`}
      >
        <CreateTaskForm
          boardId={boardId}
          defaultStatus={status}
          onSubmit={handleSubmit}
          isPending={isCreating}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
