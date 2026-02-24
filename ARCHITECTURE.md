# Architecture Decisions Document

## 1. Technology Choices

### Why Next.js App Router?

I chose **App Router** over Pages Router for several reasons:

| Reason | Explanation |
|--------|-------------|
| **Server Components by Default** | Better performance, smaller client bundle, improved SEO |
| **Nested Layouts** | Easier to share UI across pages (header, navigation) |
| **Loading UI** | Built-in loading states with `loading.tsx` files |
| **Error Boundaries** | Automatic error handling with `error.tsx` files |
| **Server Actions** | Native way to handle mutations without creating API routes |

**Trade-off:** App Router is newer and has a learning curve, but it's the future of Next.js and offers better performance.

---

### Why PostgreSQL?

I chose **PostgreSQL** because:

- **Reliability** — ACID compliant, great for structured data like tasks and boards
- **Relations** — Perfect for one-to-many relationships between boards and tasks
- **Enum Support** — Native support for status (`todo`/`in_progress`/`done`) and priority enums
- **Indexes** — Powerful indexing for faster queries (filtering by status, sorting by date)
- **JSON Support** — Future-proof if flexible fields are ever needed
- **Industry Standard** — Most commonly used in production apps

**Alternative considered:** SQLite (simpler setup) but PostgreSQL is more production-realistic.

---

### Why Prisma ORM?

- **Type Safety** — Automatic TypeScript types generated from schema
- **Migrations** — Easy version control for database changes
- **Query Building** — Intuitive API for complex queries
- **Relation Management** — Simple syntax for including related data
- **Schema Definition** — Clean, readable data models

---

### Why Tailwind CSS?

- **Speed** — Rapid UI development with utility classes
- **Consistency** — Design system through configuration
- **Responsive** — Built-in responsive modifiers
- **Performance** — Purges unused CSS in production
- **No Context Switching** — Styles colocated with components

---

## 2. Data Structure

### Database Design Decisions

**Board model:**

```prisma
model Board {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  color       String?  @default("#6366f1")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  tasks       Task[]
}
```

Why this design:

1. **Auto-increment ID** — Simpler than UUID for this scale, better performance for joins
2. **Optional fields** — Description and color give flexibility without requiring them
3. **Default color** — Ensures consistent UI even when user doesn't specify
4. **Timestamps** — Essential for auditing and sorting

**Task model:**

```prisma
model Task {
  id          Int        @id @default(autoincrement())
  boardId     Int
  title       String
  description String?
  status      TaskStatus @default(todo)
  priority    Priority   @default(medium)
  dueDate     DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  board       Board      @relation(fields: [boardId], references: [id], onDelete: Cascade)
}
```

Why this design:

1. **`boardId` foreign key** — Establishes relationship with Board
2. **Enum for status** — Restricts to valid values (`todo`/`in_progress`/`done`)
3. **Enum for priority** — Restricts to `low`/`medium`/`high`
4. **Default values** — Status = `todo`, Priority = `medium` (sensible defaults)
5. **Indexes** — Added on `boardId`, `status`, `priority` for faster filtering

### Cascade Delete Strategy

I chose `onDelete: Cascade`:

```prisma
board Board @relation(fields: [boardId], references: [id], onDelete: Cascade)
```

Reasoning:

1. If a board is deleted, its tasks become orphaned data
2. Cleaning up automatically prevents database bloat
3. Matches user expectation — deleting a board deletes everything inside it
4. Simpler application logic — no need to handle orphaned tasks separately

**Alternative considered:** `RESTRICT` (prevent deletion if tasks exist) — but this creates unnecessary friction for users.

---

## 3. API Design

### Server Actions vs API Routes

I chose **Server Actions** over traditional API routes because:

- **Type Safety** — Functions are called directly, no HTTP layer to bridge
- **Progressive Enhancement** — Work without JavaScript enabled
- **Simpler Code** — No need to create separate route files
- **Built-in Revalidation** — `revalidatePath` and `revalidateTag` work natively

### Actions Reference

**Board actions:**

```ts
// Get all boards with task counts
export async function getAllBoards(): Promise<ActionResult<BoardWithTaskCount[]>>

// Get single board with all its tasks
export async function getBoardWithTasks(id: number): Promise<ActionResult<BoardWithTasks>>

// Create new board
export async function createBoard(formData: FormData): Promise<ActionResult<{ id: number }>>

// Update board details
export async function updateBoard(id: number, formData: FormData): Promise<ActionResult<{ id: number }>>

// Delete board (cascades to tasks)
export async function deleteBoard(id: number): Promise<ActionResult<void>>
```

**Task actions:**

```ts
// Create task in a specific board
export async function createTask(formData: FormData): Promise<ActionResult<Task>>

// Update task details
export async function updateTask(id: number, boardId: number, formData: FormData): Promise<ActionResult<Task>>

// Change task status (optimistic-update friendly)
export async function updateTaskStatus(id: number, boardId: number, status: TaskStatus): Promise<ActionResult<Task>>

// Delete task
export async function deleteTask(id: number, boardId: number): Promise<ActionResult<void>>
```

### Why This Structure

- **Grouped by resource** — Boards and tasks have their own files
- **Single responsibility** — Each action does exactly one thing
- **Optimistic-update ready** — Status updates are separate from full updates
- **Type-safe inputs** — Zod validation on all actions

---

## 4. Frontend Organization

### Folder Structure

```
src/app/
├── actions/               # Server actions
│   ├── board.actions.ts
│   └── task.actions.ts
├── board/[id]/
│   └── page.tsx           # Board detail page
├── components/
│   ├── boards/            # Board-specific components
│   │   ├── BoardCard.tsx
│   │   ├── BoardList.tsx
│   │   └── CreateBoardForm.tsx
│   ├── tasks/             # Task-specific components
│   │   ├── CreateTaskForm.tsx
│   │   ├── PriorityBadge.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── TaskBoard.tsx
│   │   ├── TaskCard.tsx
│   │   └── TaskColumn.tsx
│   └── ui/                # Reusable primitives
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── Skeleton.tsx
│       └── ToastProvider.tsx
├── hooks/                 # Custom React hooks
│   ├── useBoards.ts
│   ├── useTasks.ts
│   └── useToast.ts
├── lib/
│   ├── prisma.ts          # PrismaClient singleton
│   └── types.ts           # Shared TypeScript types
├── utils/
│   ├── constants.ts       # Status/priority config, colors
│   └── helpers.ts         # cn(), formatDate(), isOverdue()
└── page.tsx               # Dashboard
```

Why this structure:

1. **Feature-based** — Easy to find related code
2. **Scalable** — New features slot in without clutter
3. **Colocation** — Related files stay together
4. **Clear boundaries** — UI vs logic vs data

### State Management

| Type | Location | Reason |
|------|----------|--------|
| Server state | React Server Components | No client JS needed |
| Form state | `useTransition` + Server Actions | Built-in pending state |
| UI state | `useState` (client components) | Simple, local only |
| Optimistic updates | `useOptimistic` | Instant UI feedback before server round-trip |
| Notifications | Context-based `useToast` | Global, accessible anywhere |

**Why no Redux/Zustand:**

1. Most state is server-derived
2. React 19's built-in hooks (`useOptimistic`, `useTransition`) are sufficient
3. Simpler = fewer bugs
4. Better performance with Server Components

### Component Architecture

**Server Components (default):**

- Dashboard page (`page.tsx`)
- Board detail page (initial load)
- Board list

**Client Components (`"use client"`):**

- `TaskCard` — status dropdown, optimistic delete
- `TaskBoard` — filtering, sorting, optimistic task creation
- `CreateBoardForm` / `CreateTaskForm` — form handling
- `Modal`, `Button`, `ToastProvider` — interactive UI primitives

**Why this split:**

- Maximise performance — send less JS to the client
- Better SEO — content renders on the server
- Progressive enhancement — works without JS

### Routing Strategy

```
/                  →  Dashboard (all boards)
/board/[id]        →  Board detail (tasks grouped by status columns)
```

- **Clean URLs** — Easy to read and share
- **Dynamic routes** — Handles any board ID
- **Nested layouts** — Can add a board-scoped layout later if needed

---

## 5. What I Would Change

### With More Time

**Composite database indexes:**

- Currently have basic single-column indexes
- Would add composite indexes for common combined queries (e.g. `status` + `priority` + `dueDate`)

**Caching:**

- Add React `cache()` to deduplicate data fetching within a single request
- Implement incremental static regeneration for read-heavy pages

**Better error handling:**

- More granular error boundaries per section
- Retry logic for failed mutations
- User-friendly error messages instead of generic fallbacks

**Testing:**

- Unit tests for server actions
- Component tests with React Testing Library
- E2E tests with Playwright

**Performance:**

- Virtual scrolling for boards/tasks lists with many items
- Pagination instead of loading all tasks at once

### Known Issues

| Problem | Why It Happened | How I'd Fix It |
|---------|-----------------|----------------|
| Hydration warnings with dates | Server and client render different date strings | `useState(() => new Date())` lazy init — client-side only |
| No loading skeletons everywhere | Prioritised functionality over polish | Add `<Suspense>` boundaries with skeleton fallbacks |
| Client-side form validation missing | Relied on server-side Zod validation only | Mirror Zod schemas client-side for instant feedback |

### What Would Be Different in Production

**Authentication & authorization:**

- Add NextAuth.js or Clerk
- Users can only see their own boards
- Role-based access (admin, editor, viewer)

**Observability:**

- Error tracking with Sentry
- Performance monitoring (Web Vitals, query durations)
- User analytics

**Reliability:**

- Rate limiting (Upstash Redis)
- Automated CI/CD pipeline with staging environment
- Database backup strategy

**Security:**

- Input sanitisation at every boundary
- CSRF protection
- Environment variable validation with `zod` at startup

**Documentation:**

- OpenAPI/Swagger spec for any future REST endpoints
- Storybook for UI components
- Onboarding guide for new contributors

**Accessibility:**

- WCAG 2.1 AA compliance
- Full keyboard navigation
- Screen reader testing

---

## Summary

This architecture prioritises:

1. **Performance** — Server Components, optimistic updates, minimal client JS
2. **Developer Experience** — End-to-end type safety, clear structure, fast feedback
3. **Scalability** — Feature-based organisation, clean boundaries between layers
4. **Production Readiness** — Zod validation, error handling, revalidation strategy

The choices reflect a balance between speed of development (2-hour assessment constraint) and real-world production patterns.

---

*Document prepared for Developer Assessment — Task Board System*
*Last Updated: 2026-02-25*
