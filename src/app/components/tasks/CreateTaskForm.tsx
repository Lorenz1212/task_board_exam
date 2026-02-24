"use client";

import { useRef, useState } from "react";
import Button from "@/app/components/ui/Button";
import { TASK_PRIORITIES, PRIORITY_CONFIG } from "@/app/utils/constants";
import type { TaskStatus } from "@/app/lib/types";

interface CreateTaskFormProps {
  boardId: number;
  defaultStatus?: TaskStatus;
  /** Called with the FormData when the user submits — owner drives the async work */
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
  onCancel?: () => void;
}

export default function CreateTaskForm({
  boardId,
  defaultStatus = "todo",
  onSubmit,
  isPending,
  onCancel,
}: CreateTaskFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  // Computed once on the client — avoids SSR ↔ hydration mismatch with new Date()
  const [minDate] = useState(() => new Date().toISOString().split("T")[0]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="boardId" value={boardId} />
      <input type="hidden" name="status" value={defaultStatus} />

      <div>
        <label
          htmlFor="task-title"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="task-title"
          name="title"
          type="text"
          required
          maxLength={200}
          placeholder="What needs to be done?"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          autoFocus
        />
      </div>

      <div>
        <label
          htmlFor="task-description"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Description
        </label>
        <textarea
          id="task-description"
          name="description"
          rows={3}
          maxLength={1000}
          placeholder="Add more details..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="task-priority"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Priority
          </label>
          <select
            id="task-priority"
            name="priority"
            defaultValue="medium"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_CONFIG[p].label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="task-due"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Due date
          </label>
          <input
            id="task-due"
            name="dueDate"
            type="date"
            min={minDate}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isPending} className="flex-1">
          Add Task
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
