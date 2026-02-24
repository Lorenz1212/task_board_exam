"use client";

import { useCallback, useTransition } from "react";
import {
  createBoard,
  deleteBoard,
  updateBoard,
} from "@/app/actions/board.actions";
import { useToast } from "@/app/hooks/useToast";

export function useBoards() {
  const [isPending, startTransition] = useTransition();
  const { success, error } = useToast();

  const handleCreate = useCallback(
    async (formData: FormData, onSuccess?: (id: number) => void) => {
      return new Promise<boolean>((resolve) => {
        startTransition(async () => {
          const result = await createBoard(formData);
          if (result.success) {
            success("Board created!");
            onSuccess?.(result.data.id);
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
    async (id: number, onSuccess?: () => void) => {
      return new Promise<boolean>((resolve) => {
        startTransition(async () => {
          const result = await deleteBoard(id);
          if (result.success) {
            success("Board deleted.");
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
    async (id: number, formData: FormData, onSuccess?: () => void) => {
      return new Promise<boolean>((resolve) => {
        startTransition(async () => {
          const result = await updateBoard(id, formData);
          if (result.success) {
            success("Board updated!");
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

  return { isPending, handleCreate, handleDelete, handleUpdate };
}
