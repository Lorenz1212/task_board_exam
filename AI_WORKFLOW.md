# AI Workflow Documentation

## 1. AI Tool Used

| Field | Details |
|-------|---------|
| **Tool** | Claude Sonnet (via Cursor IDE) |
| **Plan** | $20/month subscription |

---

## 2. Example Prompts

### Stage 1: Structuring the Prompt

Before writing the final prompt, I asked AI to help me structure it better.

**Why I did this:** Instead of guessing what to include, I leveraged AI to help create a thorough prompt that covers all assessment requirements.

**Result:** AI provided a structured template with 5 sections that became the foundation of the final prompt.

---

### Stage 2: The Final Comprehensive Prompt

Using the template from Stage 1, I crafted this detailed prompt:

> I'm building a task board system for a 2-hour developer assessment. Need production-ready Next.js (App Router) with TypeScript, Prisma (Postgres), and Tailwind CSS.
>
> My setup is ready — generate complete code with senior dev architecture:
>
> **1. Prisma Schema (Postgres):**
> - Board model: `id`, `name` (required), `createdAt` (auto), optional fields (`description`, `color`)
> - Task model: `id`, `boardId` (relation), `title` (required), `status` (enum: `todo`, `in_progress`, `done`), `createdAt` (auto)
> - Add optional fields: `description`, `priority` (`low`/`medium`/`high`), `dueDate`
> - Relation: one-to-many with cascade delete (delete board = delete all tasks)
> - Include indexes for performance
>
> **2. Folder Structure (feature-based):**
> ```
> /app
>   /actions
>     /board.actions.ts
>     /task.actions.ts
>   /components
>     /ui         (reusable: Button, Card, Modal)
>     /boards     (BoardCard, CreateBoardForm)
>     /tasks      (TaskCard, TaskColumn, CreateTaskForm, StatusBadge)
>   /hooks
>     /useBoards.ts
>     /useTasks.ts
>   /lib
>     /prisma.ts  (singleton)
>     /types.ts
>   /utils
>     /constants.ts
>     /helpers.ts
>   /page.tsx           (dashboard)
>   /board/[id]/page.tsx
> ```
>
> **3. Server Actions (with Postgres):**
> - Board: `createBoard`, `getAllBoards`, `getBoardWithTasks`, `deleteBoard`
> - Task: `createTask`, `updateTask`, `deleteTask`, `updateTaskStatus`
> - Include Zod validation, error handling, `revalidatePath`
>
> **4. Frontend Implementation:**
> - Dashboard: show all boards as cards, create board modal/form
> - Board detail: tasks grouped by status columns, drag-drop optional
> - Real-time updates: optimistic UI, loading skeletons
> - Filter by status, sort by date/priority
> - Toast notifications for success/error
>
> **5. Best Practices:**
> - Prisma singleton pattern
> - Proper TypeScript types throughout
> - Error boundaries
> - Loading states
> - Responsive design with Tailwind
> - Environment variables (`.env.example`)
>
> Generate complete, working code that follows senior dev standards.

---

## 3. My Process

### How I Used AI

- Used AI **after** setting up the project manually
- Mainly for code generation, debugging, and optimisation
- No AI used for initial project setup — that was done manually

### What I Did Manually (Before AI)

- ✅ Initial Next.js project setup
- ✅ Installed dependencies (Prisma, Tailwind, etc.)
- ✅ Created and configured Prisma schema
- ✅ Set up database and ran migrations
- ✅ Created folder structure

### What I Used AI For

- **Server Actions** — Generated all CRUD operations
- **Components** — Created `TaskCard`, `BoardCard`, forms
- **Custom Hooks** — `useBoards`, `useTasks` with optimistic updates
- **Debugging** — Fixed hydration errors and TypeScript issues
- **Filtering/Sorting** — Added status filters and date sorting
- **Documentation** — Helped format README and these files

### Where AI Struggled

| Problem | What Happened | How I Fixed It |
|---------|---------------|----------------|
| **Type mismatch** | AI assumed different ID types than my schema | Manually adjusted types to match the existing schema |
| **Optimistic updates** | Initial code didn't handle rollback on error | Added revert logic manually |
| **Date handling** | Caused hydration warnings (server/client mismatch) | Implemented `useState` lazy initialiser for client-side only |

---

*Document prepared for Developer Assessment — Task Board System*
*Last Updated: 2026-02-25*
