"use client";

import { useCallback, useTransition } from "react";
import {
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "@/app/actions/task.actions";
import { useToast } from "@/app/hooks/useToast";

export function useTasks() {
  const [isPending, startTransition] = useTransition();
  const { success, error } = useToast();

  const handleCreate = useCallback(
    async (formData: FormData, onSuccess?: () => void) => {
      return new Promise<boolean>((resolve) => {
        startTransition(async () => {
          const result = await createTask(formData);
          if (result.success) {
            success("Task created!");
            onSuccess?.();
            resolve(true);
          } else {
            error(result.error);
            resolve(false);
          }
        });
      });
    },
    [success, error]
  );

  const handleUpdate = useCallback(
    async (id: number, boardId: number, formData: FormData, onSuccess?: () => void) => {
      return new Promise<boolean>((resolve) => {
        startTransition(async () => {
          const result = await updateTask(id, boardId, formData);
          if (result.success) {
            success("Task updated!");
            onSuccess?.();
            resolve(true);
          } else {
            error(result.error);
            resolve(false);
          }
        });
      });
    },
    [success, error]
  );

  const handleStatusChange = useCallback(
    async (
      id: number,
      boardId: number,
      status: "todo" | "in_progress" | "done",
      onSuccess?: () => void
    ) => {
      return new Promise<boolean>((resolve) => {
        startTransition(async () => {
          const result = await updateTaskStatus(id, boardId, status);
          if (result.success) {
            success("Status updated!");
            onSuccess?.();
            resolve(true);
          } else {
            error(result.error);
            resolve(false);
          }
        });
      });
    },
    [success, error]
  );

  const handleDelete = useCallback(
    async (id: number, boardId: number, onSuccess?: () => void) => {
      return new Promise<boolean>((resolve) => {
        startTransition(async () => {
          const result = await deleteTask(id, boardId);
          if (result.success) {
            success("Task deleted.");
            onSuccess?.();
            resolve(true);
          } else {
            error(result.error);
            resolve(false);
          }
        });
      });
    },
    [success, error]
  );

  return { isPending, handleCreate, handleUpdate, handleStatusChange, handleDelete };
}
