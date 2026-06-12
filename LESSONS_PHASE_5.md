# Next.js 16 — Phase 5 Lesson Review: Data Fetching & API Integration

> **Phase 5 topics:** Route Handlers · fetch() · Server vs Client fetching · Promise.all · useFetch hook · Error handling

---

## Lesson 5.1 — Next.js Route Handlers (API Routes)

Route Handlers live in `app/api/` and create real HTTP endpoints.

### File structure

```
app/
  api/
    tasks/
      route.ts          → GET /api/tasks, POST /api/tasks
      [taskId]/
        route.ts        → GET /api/tasks/:taskId, PATCH, DELETE
```

### Basic Route Handler

```ts
// app/api/tasks/route.ts
import { NextResponse } from "next/server";

// Each exported function maps to an HTTP method
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url); // read query params
  const status = searchParams.get("status");      // ?status=todo

  const tasks = status
    ? allTasks.filter(t => t.status === status)
    : allTasks;

  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json(); // read request body

  // Validate required fields
  if (!body.title) {
    return NextResponse.json(
      { error: "title is required" },
      { status: 400 }  // Bad Request
    );
  }

  return NextResponse.json(newTask, { status: 201 }); // Created
}
```

### Route Handler with dynamic params

```ts
// app/api/tasks/[taskId]/route.ts
type RouteContext = {
  params: Promise<{ taskId: string }>; // async in Next.js 16
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { taskId } = await params;

  const task = findTask(taskId);
  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { taskId } = await params;
  const body = await request.json();
  // update and return
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { taskId } = await params;
  // delete and return
  return new NextResponse(null, { status: 204 }); // No Content
}
```

### HTTP Status Codes to know

| Code | Meaning | When to use |
|---|---|---|
| 200 | OK | Successful GET |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Missing/invalid input |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected failure |

---

## Lesson 5.2 — fetch() in Server Components

Server Components can call `fetch()` directly — no `useEffect` needed.

```tsx
// app/dashboard/tasks/page.tsx (Server Component)
export default async function TasksPage() {
  const res = await fetch("http://localhost:3000/api/tasks", {
    cache: "no-store", // always fresh
  });

  if (!res.ok) throw new Error("Failed to fetch tasks");

  const tasks = await res.json();
  return <TaskList tasks={tasks} />;
}
```

### Cache options

```ts
// Fresh on every request (like SSR — Server Side Rendering)
fetch(url, { cache: "no-store" });

// Cache forever until manually revalidated (like SSG — Static Site Generation)
fetch(url, { cache: "force-cache" });

// Revalidate every N seconds (like ISR — Incremental Static Regeneration)
fetch(url, { next: { revalidate: 60 } });
```

### Environment variable for base URL

```ts
// features/tasks/data/task-queries.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/api/tasks`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}
```

`NEXT_PUBLIC_` prefix makes the variable available in the browser too (not just server).

### Built in the project

```ts
// features/tasks/data/task-queries.ts
export async function getTasks(): Promise<Task[]> { ... }
export async function getTaskById(taskId: string): Promise<Task | undefined> { ... }
export async function getCompletedTasks(): Promise<Task[]> { ... }
```

---

## Lesson 5.3 — useFetch Hook (Client-side)

For data that needs to refresh after user interaction, use a client-side fetch hook.

### The 4 states of a fetch

```ts
type FetchState<T> =
  | { status: "idle" }                     // not started
  | { status: "loading" }                  // request in flight
  | { status: "success"; data: T }         // got data
  | { status: "error"; error: string };    // something went wrong
```

### Built in the project

```ts
// hooks/use-fetch.ts
export function useFetch<T>(url: string | null | undefined): UseFetchResult<T> {
  const [state, setState] = useState<FetchState<T>>({ status: "idle" });

  const fetchData = useCallback(async () => {
    if (!url) return;
    setState({ status: "loading" });
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed: ${res.status}`);
      }
      const data: T = await res.json();
      setState({ status: "success", data });
    } catch (err) {
      setState({
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data: state.status === "success" ? state.data : undefined,
    loading: state.status === "loading" || state.status === "idle",
    error: state.status === "error" ? state.error : undefined,
    refetch: fetchData,
  };
}
```

### Usage

```tsx
"use client";
import { useFetch } from "@/hooks/use-fetch";
import type { Task } from "@/features/tasks/types";

export function TaskWidget() {
  const { data: tasks, loading, error, refetch } = useFetch<Task[]>("/api/tasks");

  if (loading) return <p>Loading...</p>;
  if (error)   return <p>Error: {error} <button onClick={refetch}>Retry</button></p>;
  if (!tasks?.length) return <p>No tasks</p>;

  return <ul>{tasks.map(t => <li key={t.id}>{t.title}</li>)}</ul>;
}
```

### Server Component vs useFetch — when to use each

| | Server Component | useFetch (Client) |
|---|---|---|
| Runs on | Server | Browser |
| When to use | Initial page load data | Data after user action |
| SEO | ✅ Yes | ❌ No |
| Can use hooks? | ❌ No | ✅ Yes |
| Example | Task list on page load | Refresh after delete |

---

## Lesson 5.4 — Error Handling in fetch

`fetch()` only throws on **network failure** — not on 404 or 500. Always check `res.ok`:

```ts
// ❌ WRONG — silently gets error body on 404/500
const data = await fetch(url).then(r => r.json());

// ✅ CORRECT — check status first
const res = await fetch(url);
if (!res.ok) {
  const body = await res.json().catch(() => ({})); // .catch in case body isn't JSON
  throw new Error(body.error ?? `Request failed: ${res.status}`);
}
const data = await res.json();
```

### Where errors surface

| Location | Error goes to |
|---|---|
| Server Component | Nearest `error.tsx` boundary |
| `useFetch` hook | `state.error` string |
| Route Handler | Return `NextResponse.json({ error: "..." }, { status: 4xx })` |

---

## Lesson 5.5 — Parallel vs Sequential Fetching

### Sequential — slow

```ts
// Total wait = 400ms + 300ms = 700ms
const tasks = await getTasks();          // wait 400ms
const completed = await getCompletedTasks(); // then wait 300ms
```

### Parallel with Promise.all — fast

```ts
// Total wait = max(400ms, 300ms) = 400ms
const [tasks, completed] = await Promise.all([
  getTasks(),
  getCompletedTasks(),
]);
```

`Promise.all` resolves when **all** promises resolve. If **any** rejects → all fail.

### Promise.allSettled — when partial failure is OK

```ts
const results = await Promise.allSettled([
  getTasks(),      // might fail
  getStats(),      // might fail
]);

results.forEach(result => {
  if (result.status === "fulfilled") use(result.value);
  if (result.status === "rejected")  log(result.reason);
});
```

Use `allSettled` when some data is optional — a failed stats fetch shouldn't crash the whole page.

### Built in the project

```ts
// app/dashboard/page.tsx — parallel
const [tasks, completedTasks] = await Promise.all([
  getTasks(),
  getCompletedTasks(),
]);

// app/dashboard/tasks/[taskId]/page.tsx — parallel + derived data
const [task, allTasks] = await Promise.all([
  getTaskById(taskId),
  getTasks(),
]);

// Derived — no extra fetch needed
const relatedTasks = allTasks
  .filter(t => t.assigneeName === task.assigneeName && t.id !== task.id)
  .slice(0, 3);
```

---

## Phase 5 Summary

### Files built

| File | Purpose |
|---|---|
| `app/api/tasks/route.ts` | `GET /api/tasks`, `POST /api/tasks` |
| `app/api/tasks/[taskId]/route.ts` | `GET`, `PATCH`, `DELETE` for one task |
| `features/tasks/data/task-queries.ts` | Server-side fetch helpers |
| `hooks/use-fetch.ts` | Client-side fetch hook |
| `app/dashboard/page.tsx` | Parallel fetch with `Promise.all` |
| `app/dashboard/tasks/[taskId]/page.tsx` | Parallel fetch + related tasks |
| `.env.local` | `NEXT_PUBLIC_API_URL` base URL |

### Data flow

```
Browser visits /dashboard/tasks
       ↓
Server Component (page.tsx)
       ↓ await getTasks()
       ↓ fetch("http://localhost:3000/api/tasks")
       ↓
Route Handler (app/api/tasks/route.ts)
       ↓ reads mockTasks
       ↓ NextResponse.json(tasks)
       ↓
Server Component receives tasks
       ↓ passes as props
       ↓
Client Component (TaskInteractiveList) renders UI
```

---

## What's Coming Next

| Phase | Topic |
|---|---|
| **6** | Forms & Validation — React Hook Form + Zod schema validation |
| **7** | Authentication — JWT, sessions, real proxy.ts |
| **8** | Advanced Architecture — Context API, code splitting |
| **9** | Performance — bundle analysis, optimization |
| **10** | Testing — Jest, React Testing Library, Playwright |
