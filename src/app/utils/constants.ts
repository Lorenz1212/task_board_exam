import type { TaskStatus, Priority } from "@prisma/client";

export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  todo: {
    label: "To Do",
    color: "text-slate-600",
    bg: "bg-slate-100",
    border: "border-slate-200",
  },
  in_progress: {
    label: "In Progress",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  done: {
    label: "Done",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
};

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; bg: string; dot: string }
> = {
  low: {
    label: "Low",
    color: "text-slate-500",
    bg: "bg-slate-50",
    dot: "bg-slate-400",
  },
  medium: {
    label: "Medium",
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    dot: "bg-yellow-500",
  },
  high: {
    label: "High",
    color: "text-red-700",
    bg: "bg-red-50",
    dot: "bg-red-500",
  },
};

export const BOARD_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#22c55e",
  "#06b6d4",
  "#f43f5e",
  "#eab308",
];

export const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];
export const TASK_PRIORITIES: Priority[] = ["low", "medium", "high"];
