"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import type { ActionResult, Task } from "@/app/lib/types";

const dateTransform = (val: string | null | undefined) => {
  if (!val || val === "") return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

const CreateTaskSchema = z.object({
  boardId: z.coerce.number().int().positive("Board ID is required"),
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().optional().transform(dateTransform),
});

const UpdateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long").optional(),
  description: z.string().max(1000, "Description is too long").nullable().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().nullable().optional().transform(dateTransform),
});

export async function createTask(
  formData: FormData
): Promise<ActionResult<Task>> {
  const raw = {
    boardId: formData.get("boardId") as string,
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    priority: (formData.get("priority") as string) || undefined,
    dueDate: (formData.get("dueDate") as string) || undefined,
  };

  const parsed = CreateTaskSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const task = await prisma.task.create({
      data: {
        boardId: parsed.data.boardId,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        priority: parsed.data.priority,
        dueDate: parsed.data.dueDate,
      },
    });
    revalidatePath(`/board/${parsed.data.boardId}`);
    return { success: true, data: task };
  } catch (err) {
    console.error("[createTask]", err);
    return { success: false, error: "Failed to create task." };
  }
}

export async function updateTask(
  id: number,
  boardId: number,
  formData: FormData
): Promise<ActionResult<Task>> {
  const raw = {
    title: (formData.get("title") as string) || undefined,
    description: formData.get("description") as string | null,
    status: (formData.get("status") as string) || undefined,
    priority: (formData.get("priority") as string) || undefined,
    dueDate: formData.get("dueDate") as string | null,
  };

  const parsed = UpdateTaskSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const task = await prisma.task.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath(`/board/${boardId}`);
    return { success: true, data: task };
  } catch (err) {
    console.error("[updateTask]", err);
    return { success: false, error: "Failed to update task." };
  }
}

export async function updateTaskStatus(
  id: number,
  boardId: number,
  status: "todo" | "in_progress" | "done"
): Promise<ActionResult<Task>> {
  try {
    const task = await prisma.task.update({
      where: { id },
      data: { status },
    });
    revalidatePath(`/board/${boardId}`);
    return { success: true, data: task };
  } catch (err) {
    console.error("[updateTaskStatus]", err);
    return { success: false, error: "Failed to update task status." };
  }
}

export async function deleteTask(
  id: number,
  boardId: number
): Promise<ActionResult<void>> {
  try {
    await prisma.task.delete({ where: { id } });
    revalidatePath(`/board/${boardId}`);
    return { success: true, data: undefined };
  } catch (err) {
    console.error("[deleteTask]", err);
    return { success: false, error: "Failed to delete task." };
  }
}
