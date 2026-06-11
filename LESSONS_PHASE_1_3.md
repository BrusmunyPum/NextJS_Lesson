# Next.js 16 — Phase 1–3 Lesson Review

> **Project:** Task Management App  
> **Stack:** Next.js 16.2.7 · React 19 · TypeScript 5 · Tailwind CSS 4  
> **Goal:** Learn Next.js from basic to advanced through a real project.

---

## Phase 1 — Next.js Fundamentals & Project Setup

### 1.1 What is Next.js?

Next.js is a **React framework** that adds:
- File-based routing (no need to configure routes manually)
- Server-side rendering (SSR) and static generation (SSG)
- Built-in image optimization, fonts, and metadata
- API routes (backend endpoints inside the same project)

### 1.2 App Router vs Pages Router

Next.js 16 uses the **App Router** (`app/` folder). The old Pages Router (`pages/`) still exists but is legacy.

| Feature | App Router | Pages Router |
|---|---|---|
| Folder | `app/` | `pages/` |
| Default component type | Server Component | Client Component |
| Layouts | `layout.tsx` per folder | `_app.tsx` global only |
| Data fetching | `async/await` in component | `getServerSideProps` / `getStaticProps` |

### 1.3 File-Based Routing

Every file named `page.tsx` inside `app/` becomes a route:

```
app/
  page.tsx              → /
  dashboard/
    page.tsx            → /dashboard
    tasks/
      page.tsx          → /dashboard/tasks
      [taskId]/
        page.tsx        → /dashboard/tasks/:taskId
```

### 1.4 Special Files

| File | Purpose |
|---|---|
| `page.tsx` | The UI for that route |
| `layout.tsx` | Wraps children — persists across navigation |
| `loading.tsx` | Shown while the page is loading (Suspense boundary) |
| `error.tsx` | Shown when an error occurs — must be `"use client"` |
| `not-found.tsx` | Shown when `notFound()` is called |

### 1.5 Dynamic Routes

```
app/dashboard/tasks/[taskId]/page.tsx
```

The `[taskId]` segment is a **dynamic parameter**. In Next.js 16, `params` is **async**:

```ts
// ✅ Next.js 16
export default async function Page({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
}
```

### 1.6 Catch-All Routes

```
app/[...missing]/page.tsx  → matches /anything/at/all
```

Used for custom 404 pages or wildcard routing.

### 1.7 Route Groups

Wrap a folder in `(parentheses)` to group routes **without adding to the URL**:

```
app/
  (auth)/
    login/page.tsx    → /login  (not /auth/login)
    register/page.tsx → /register
```

Use case: separate layouts for auth pages vs dashboard pages.

---

## Phase 2 — Server Components & Client Components

### 2.1 Server Components (default)

Every component in `app/` is a **Server Component** by default.

- Runs only on the server — never sent to the browser as JS
- Can use `async/await` directly
- Can access databases, environment variables, file system
- **Cannot** use `useState`, `useEffect`, `onClick`, or any browser API

```tsx
// Server Component — no "use client" needed
export default async function TasksPage() {
  const tasks = await getTasks(); // runs on server
  return <TaskList tasks={tasks} />;
}
```

### 2.2 Client Components

Add `"use client"` at the top to make a component run in the browser:

```tsx
"use client";
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Rules:**
- Must add `"use client"` to use any React hook or browser event
- Client Components can import Server Components? **No.** But Server Components can import and render Client Components.
- `"use client"` marks the **boundary** — everything below it in the tree is also a client component

### 2.3 When to Use Each

| Use Server Component when... | Use Client Component when... |
|---|---|
| Fetching data | Using `useState` or `useReducer` |
| Accessing backend resources | Using `useEffect` |
| No interactivity needed | Handling events (`onClick`, `onChange`) |
| SEO-critical content | Using browser APIs (`localStorage`, etc.) |
| Reducing JS bundle size | Using third-party client-only libraries |

### 2.4 Layouts

`layout.tsx` wraps every page in its folder and persists across navigation (doesn't re-render):

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
```

Root layout (`app/layout.tsx`) must include `<html>` and `<body>`.

### 2.5 Metadata

**Static metadata:**
```ts
export const metadata: Metadata = {
  title: {
    template: "%s | Task Management",  // child pages replace %s
    default: "Task Management",         // fallback
  },
  description: "...",
};
```

**Dynamic metadata** (when you need data to build the title):
```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const { taskId } = await params;
  const task = await getTaskById(taskId);
  if (!task) return { title: "Not Found" };
  return { title: task.title };
}
```

### 2.6 Loading & Error Boundaries

```tsx
// app/dashboard/tasks/loading.tsx
export default function Loading() {
  return <div>Loading tasks...</div>;
}
```

```tsx
// app/dashboard/tasks/error.tsx
"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>  {/* reset, NOT unstable_retry */}
    </div>
  );
}
```

### 2.7 `proxy.ts` (Next.js 16 Middleware)

In Next.js 16, middleware is configured in `proxy.ts` (not `middleware.ts`):

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const isAuthenticated = false; // TODO: replace with real auth in Phase 7
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
```

---

## Phase 3 — Component Architecture & Interactivity

### 3.1 Component Design System

Reusable UI components live in `components/ui/`:

```
components/ui/
  button.tsx       — variants: primary / secondary / danger / ghost
  badge.tsx        — color variants
  card.tsx         — Card + CardHeader with action slot
  modal.tsx        — Escape key, scroll lock, backdrop close
  dropdown.tsx     — click-outside via useRef
  tabs.tsx         — render prop pattern
  pagination.tsx   — prev/next + page numbers
  page-header.tsx  — eyebrow + title + description + action slot
```

### 3.2 TypeScript Patterns

**`import type`** — use for types/interfaces (erased at compile time, better for tree-shaking):
```ts
import type { Task, TaskStatus } from "@/features/tasks/types";
```

**`Record<K, V>`** — type for style maps:
```ts
const statusStyles: Record<TaskStatus, string> = {
  "todo": "bg-slate-800 text-slate-300",
  "in-progress": "bg-blue-900/50 text-blue-300",
  "completed": "bg-green-900/50 text-green-300",
};
```

**Optional props with defaults:**
```ts
type Props = {
  title: string;
  description?: string;  // optional
};
```

### 3.3 URL State vs Component State

**Rule:** If the state should survive a page refresh or be shareable via URL → put it in the URL.

| State type | Where to store |
|---|---|
| Filter (status) | URL search param `?status=todo` |
| Search text | URL search param `?search=fix` |
| Current page | URL search param `?page=2` |
| Modal open/close | `useState` |
| Mobile sidebar open | `useState` |
| Active tab | `useState` |

### 3.4 Reading Search Params

**In Server Components** (`searchParams` is async in Next.js 16):
```ts
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const { status, search, page } = await searchParams;
}
```

**In Client Components:**
```tsx
"use client";
import { useSearchParams } from "next/navigation";

const searchParams = useSearchParams();
const status = searchParams.get("status");
```

### 3.5 Updating the URL (Client Component)

```tsx
"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

function updateParams(updates: Record<string, string | undefined>) {
  const params = new URLSearchParams(searchParams.toString());
  
  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  });
  
  router.replace(`${pathname}?${params.toString()}`, { scroll: false });
}
```

### 3.6 `useCallback`

Memoizes a function so it doesn't get re-created on every render:

```tsx
const updateParams = useCallback(
  (updates: Record<string, string | undefined>) => {
    // ...
  },
  [router, pathname, searchParams], // dependencies
);
```

**When to use:** When passing a function as a prop to a child component that is wrapped in `React.memo`, or when the function is a dependency of `useEffect`.

**When NOT to use:** Everywhere "just to be safe" — it has its own overhead and adds complexity.

### 3.7 Active Navigation Links

```tsx
"use client";
import { usePathname } from "next/navigation";

const pathname = usePathname();

// ✅ Exact match for /dashboard (to avoid matching /dashboard/tasks)
const isActive = item.href === "/dashboard"
  ? pathname === item.href
  : pathname.startsWith(item.href);
```

### 3.8 Component Composition Patterns

**Children prop:**
```tsx
function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}
```

**Action slot (render prop via prop):**
```tsx
function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <h2>{title}</h2>
      {action}
    </div>
  );
}

// Usage:
<CardHeader title="Tasks" action={<Button>Add Task</Button>} />
```

**Render prop pattern (Tabs):**
```tsx
function Tabs({ children }: { children: (activeTab: string) => React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("cards");
  return (
    <div>
      {/* tab buttons */}
      {children(activeTab)}  {/* call children as a function */}
    </div>
  );
}

// Usage:
<Tabs tabs={tabs} defaultValue="cards">
  {(activeTab) => (
    <div>{activeTab === "cards" ? <CardView /> : <TableView />}</div>
  )}
</Tabs>
```

### 3.9 Derived State vs Stored State

**Never store derived values in state** — compute them from existing state:

```tsx
// ❌ Wrong — redundant state
const [tasks, setTasks] = useState(allTasks);
const [filteredTasks, setFilteredTasks] = useState(allTasks); // derived!

// ✅ Correct — derive it
const [activeFilter, setActiveFilter] = useState("all");
const filteredTasks = tasks.filter(t => activeFilter === "all" || t.status === activeFilter);
```

### 3.10 Mobile-Responsive Patterns

```tsx
// Show/hide based on screen size
<div className="hidden sm:block">  {/* hidden on mobile, visible on sm+ */}
<div className="block sm:hidden">  {/* visible on mobile only */}

// Table responsive pattern
<th className="hidden sm:table-cell">Assignee</th>  {/* hidden on mobile */}

// Flex wrap for button groups
<div className="flex flex-wrap gap-3">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>
```

---

## Common Mistakes to Avoid

| Mistake | Fix |
|---|---|
| `import React from "react"` | Not needed in React 17+, remove it |
| `import { Task }` for a type | Use `import type { Task }` |
| `unstable_retry` in error.tsx | The correct prop is `reset` |
| `document.title = "..."` in useEffect | Use Next.js `metadata` export instead |
| Storing derived data in state | Compute it from existing state |
| Using `middleware.ts` in Next.js 16 | Use `proxy.ts` instead |
| `params.taskId` (sync) | Must `await params` first in Next.js 16 |
| `"use client"` on every component | Only add when you need hooks or events |

---

## Files We Built

```
app/
  layout.tsx                          — root layout, title template
  page.tsx                            — redirects to /dashboard
  (auth)/
    layout.tsx                        — centered auth layout
    login/page.tsx                    — login form UI (placeholder)
    register/page.tsx                 — register form UI (placeholder)
  dashboard/
    layout.tsx                        — wraps with DashboardShell
    page.tsx                          — overview with stat cards
    tasks/
      page.tsx                        — reads searchParams, passes to TaskInteractiveList
      loading.tsx                     — loading skeleton
      error.tsx                       — error boundary with reset
      not-found.tsx                   — custom 404
      [taskId]/
        page.tsx                      — dynamic route with generateMetadata

components/
  ui/
    button.tsx / badge.tsx / card.tsx
    modal.tsx / dropdown.tsx / tabs.tsx
    pagination.tsx / page-header.tsx
  dashboard/
    dashboard-nav.tsx                 — active link detection
    dashboard-sidebar.tsx             — mobile toggle
    dashboard-shell.tsx               — composes sidebar + main
    stat-card.tsx
  tasks/
    task-card.tsx / task-table.tsx
    task-status-badge.tsx
    task-interactive-list.tsx         — URL state, filters, search, pagination
    task-filter-button.tsx
    task-search-input.tsx
    task-empty-state.tsx / task-count.tsx
    task-delete-modal.tsx
    recent-task-list.tsx

features/tasks/
  types.ts                            — Task, TaskStatus, TaskPriority, DashboardStat, NavItem
  data/
    mock-tasks.ts                     — 5 mock tasks
    task-queries.ts                   — getTasks(), getTaskById(), getCompletedTasks()

proxy.ts                              — route protection (bypassed for development)
```

---

## What's Coming Next

| Phase | Topic |
|---|---|
| **4** | React Hooks deep dive — useEffect, useMemo, useCallback, useRef, custom hooks |
| **5** | Data fetching & API integration — fetch, SWR/TanStack Query, loading states |
| **6** | Forms & Validation — React Hook Form + Zod |
| **7** | Authentication — real JWT auth, sessions, proxy.ts real implementation |
| **8** | Advanced architecture — code splitting, lazy loading |
| **9** | Performance — memoization, bundle analysis |
| **10** | Testing — Jest, React Testing Library, Playwright |
