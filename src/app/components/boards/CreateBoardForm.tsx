"use client";

import { useRef, useState } from "react";
import Button from "@/app/components/ui/Button";
import { BOARD_COLORS } from "@/app/utils/constants";
import { cn } from "@/app/utils/helpers";
import { useBoards } from "@/app/hooks/useBoards";

interface CreateBoardFormProps {
  onSuccess?: (id: number) => void;
  onCancel?: () => void;
}

export default function CreateBoardForm({
  onSuccess,
  onCancel,
}: CreateBoardFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedColor, setSelectedColor] = useState(BOARD_COLORS[0]);
  const { isPending, handleCreate } = useBoards();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("color", selectedColor);

    const ok = await handleCreate(formData, onSuccess);
    if (ok) formRef.current?.reset();
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="board-name"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Board name <span className="text-red-500">*</span>
        </label>
        <input
          id="board-name"
          name="name"
          type="text"
          required
          maxLength={100}
          placeholder="e.g. Q1 Roadmap"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label
          htmlFor="board-description"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Description
        </label>
        <textarea
          id="board-description"
          name="description"
          rows={2}
          maxLength={500}
          placeholder="Optional description..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <p className="block text-sm font-medium text-slate-700 mb-2">Color</p>
        <div className="flex gap-2 flex-wrap">
          {BOARD_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={cn(
                "w-7 h-7 rounded-full transition-all",
                selectedColor === color
                  ? "ring-2 ring-offset-2 ring-slate-400 scale-110"
                  : "hover:scale-110"
              )}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isPending} className="flex-1">
          Create Board
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
