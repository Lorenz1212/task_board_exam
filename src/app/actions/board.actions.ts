"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";
import { syncBoardCreated, syncBoardUpdated, syncBoardDeleted } from "@/app/lib/neo4j-sync";
import type { ActionResult, BoardWithTaskCount, BoardWithTasks } from "@/app/lib/types";

const CreateBoardSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  color: z.string().optional(),
});

const UpdateBoardSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long").optional(),
  description: z.string().max(500, "Description is too long").nullable().optional(),
  color: z.string().optional(),
});

export async function createBoard(
  formData: FormData
): Promise<ActionResult<{ id: number }>> {
  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    color: (formData.get("color") as string) || undefined,
  };

  const parsed = CreateBoardSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const board = await prisma.board.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        color: parsed.data.color ?? "#6366f1",
      },
    });
    revalidatePath("/");
    syncBoardCreated(board.id, board.name, board.color ?? "#6366f1");
    return { success: true, data: { id: board.id } };
  } catch (err) {
    console.error("[createBoard]", err);
    return { success: false, error: "Failed to create board. Please try again." };
  }
}

export async function getAllBoards(): Promise<
  ActionResult<BoardWithTaskCount[]>
> {
  try {
    const boards = await prisma.board.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        tasks: { select: { id: true, status: true } },
      },
    });
    return { success: true, data: boards };
  } catch (err) {
    console.error("[getAllBoards]", err);
    return { success: false, error: "Failed to load boards." };
  }
}

export async function getBoardWithTasks(
  id: number
): Promise<ActionResult<BoardWithTasks>> {
  try {
    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        },
      },
    });
    if (!board) return { success: false, error: "Board not found." };
    return { success: true, data: board };
  } catch (err) {
    console.error("[getBoardWithTasks]", err);
    return { success: false, error: "Failed to load board." };
  }
}

export async function updateBoard(
  id: number,
  formData: FormData
): Promise<ActionResult<{ id: number }>> {
  const raw = {
    name: (formData.get("name") as string) || undefined,
    description: formData.get("description") as string | null,
    color: (formData.get("color") as string) || undefined,
  };

  const parsed = UpdateBoardSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const board = await prisma.board.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/");
    revalidatePath(`/board/${id}`);
    syncBoardUpdated(board.id, board.name, board.color ?? undefined);
    return { success: true, data: { id: board.id } };
  } catch (err) {
    console.error("[updateBoard]", err);
    return { success: false, error: "Failed to update board." };
  }
}

export async function deleteBoard(id: number): Promise<ActionResult<void>> {
  try {
    await prisma.board.delete({ where: { id } });
    revalidatePath("/");
    syncBoardDeleted(id);
    return { success: true, data: undefined };
  } catch (err) {
    console.error("[deleteBoard]", err);
    return { success: false, error: "Failed to delete board." };
  }
}
