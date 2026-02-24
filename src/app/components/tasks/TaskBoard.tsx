"use client";

import { useState, useMemo, useOptimistic, useTransition } from "react";
import TaskColumn from "@/app/components/tasks/TaskColumn";
import Modal from "@/app/components/ui/Modal";
import Button from "@/app/components/ui/Button";
import CreateTaskForm from "@/app/components/tasks/CreateTaskForm";
import { TASK_STATUSES, PRIORITY_CONFIG } from "@/app/utils/constants";
import { createTask } from "@/app/actions/task.actions";
import { useToast } from "@/app/hooks/useToast";
import type { BoardWithTasks, Priority, Task, TaskStatus } from "@/app/lib/types";

interface TaskBoardProps {
  board: BoardWithTasks;
}

type SortKey = "createdAt" | "priority" | "dueDate";
type FilterStatus = TaskStatus | "all";

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

// Hardcoded hex so they work in style={{ backgroundColor }} without Tailwind JIT
const PRIORITY_COLORS: Record<Priority, string> = {
  high: "#ef4444",
  medium: "#eab308",
  low: "#94a3b8",
};

export default function TaskBoard({ board }: TaskBoardProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("createdAt");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [isCreating, startCreate] = useTransition();
  const { success, error: toastError } = useToast();

  // useOptimistic gives the task list an immediate update on create,
  // before the server round-trip completes. React replaces the optimistic entry
  // with real server data once revalidatePath refreshes the parent Server Component.
  const [optimisticTasks, addOptimisticTask] = useOptimistic(
    board.tasks,
    (current: Task[], newTask: Task) => [...current, newTask]
  );

  function handleCreateTask(formData: FormData) {
    // Build a temporary task from form values for the instant UI update
    const optimisticTask: Task = {
      id: -(Date.now()), // negative temp ID — never persisted to DB
      boardId: board.id,
      title: (formData.get("title") as string) ?? "",
      description: (formData.get("description") as string) || null,
      status: (formData.get("status") as TaskStatus) ?? "todo",
      priority: (formData.get("priority") as Priority) ?? "medium",
      dueDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    startCreate(async () => {
      addOptimisticTask(optimisticTask);
      const result = await createTask(formData);
      if (result.success) {
        success("Task created!");
      } else {
        toastError(result.error);
      }
    });

    setCreateOpen(false);
  }

  const processedTasks = useMemo(() => {
    let tasks = [...optimisticTasks];

    if (filterStatus !== "all") {
      tasks = tasks.filter((t) => t.status === filterStatus);
    }

    tasks.sort((a, b) => {
      if (sortBy === "priority") {
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      }
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return tasks;
  }, [optimisticTasks, sortBy, filterStatus]);

  const tasksByStatus = useMemo(
    () =>
      TASK_STATUSES.reduce(
        (acc, status) => {
          acc[status] = processedTasks.filter((t) => t.status === status);
          return acc;
        },
        {} as Record<TaskStatus, Task[]>
      ),
    [processedTasks]
  );

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1">
          <label className="text-sm text-slate-500 font-medium shrink-0">Sort:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="createdAt">Date created</option>
            <option value="priority">Priority</option>
            <option value="dueDate">Due date</option>
          </select>

          <label className="text-sm text-slate-500 font-medium shrink-0 ml-2">
            Filter:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <Button onClick={() => setCreateOpen(true)} loading={isCreating}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        {TASK_STATUSES.map((status) => {
          const count = optimisticTasks.filter((t) => t.status === status).length;
          const total = optimisticTasks.length;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={status} className="flex-1 text-center">
              <div className="text-2xl font-bold text-slate-900">{count}</div>
              <div className="text-xs text-slate-500">{pct}%</div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      {optimisticTasks.length > 0 && (
        <div className="flex rounded-full overflow-hidden h-1.5 bg-slate-100">
          {TASK_STATUSES.map((status) => {
            const count = optimisticTasks.filter((t) => t.status === status).length;
            const pct = (count / optimisticTasks.length) * 100;
            const colorMap: Record<TaskStatus, string> = {
              todo: "bg-slate-300",
              in_progress: "bg-blue-500",
              done: "bg-emerald-500",
            };
            return (
              <div
                key={status}
                className={colorMap[status]}
                style={{ width: `${pct}%` }}
              />
            );
          })}
        </div>
      )}

      {/* Kanban columns */}
      <div className="flex gap-5 overflow-x-auto pb-4 flex-1 min-h-0">
        {TASK_STATUSES.map((status) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            boardId={board.id}
            onCreateTask={handleCreateTask}
            isCreating={isCreating}
          />
        ))}
      </div>

      {/* Priority legend — one dot per priority, hex colors for style prop */}
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span className="font-medium">Priority:</span>
        {(["high", "medium", "low"] as Priority[]).map((p) => (
          <span key={p} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: PRIORITY_COLORS[p] }}
            />
            {PRIORITY_CONFIG[p].label}
          </span>
        ))}
      </div>

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add new task"
      >
        <CreateTaskForm
          boardId={board.id}
          onSubmit={handleCreateTask}
          isPending={isCreating}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>
    </div>
  );
}
