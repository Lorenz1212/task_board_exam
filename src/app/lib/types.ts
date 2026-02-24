import type { Board, Task, TaskStatus, Priority } from "@prisma/client";

export type { Board, Task, TaskStatus, Priority };

export type BoardWithTasks = Board & {
  tasks: Task[];
};

export type BoardWithTaskCount = Board & {
  tasks: Pick<Task, "id" | "status">[];
};

export type CreateBoardInput = {
  name: string;
  description?: string;
  color?: string;
};

export type CreateTaskInput = {
  boardId: string;
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string | null;
};

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
