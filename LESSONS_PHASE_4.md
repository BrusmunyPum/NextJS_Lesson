# Next.js 16 — Phase 4 Lesson Review: React Hooks Deep Dive

> **Phase 4 topics:** useEffect · useState advanced · useMemo · useCallback · useRef · Custom Hooks

---

## Lesson 4.0 — useEffect (The Right Way)

### What is useEffect?

`useEffect` lets you **synchronize a component with something outside React** — a timer, event listener, browser API, or external system.

> Key mental model: **synchronize**, not "run code after render."

### Basic Syntax

```tsx
useEffect(() => {
  // effect runs here

  return () => {
    // cleanup runs when component unmounts (or before next effect)
  };
}, [dependencies]);
```

### The Dependency Array

```tsx
useEffect(() => { ... });            // ❌ runs after EVERY render
useEffect(() => { ... }, []);        // ✅ runs ONCE on mount
useEffect(() => { ... }, [userId]);  // ✅ runs on mount + when userId changes
```

**Rule:** Every value from the component used inside the effect must be in the dependency array.

### Example — Event Listener with Cleanup

```tsx
useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") setIsOpen(false);
  }

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown); // cleanup!
  };
}, []); // setIsOpen is stable — safe to omit from deps
```

Without cleanup → memory leak. The listener keeps firing even after the component is gone.

### Example — Auto-focus a DOM element

```tsx
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  inputRef.current?.focus();
}, []); // once on mount
```

### The 3 Most Common Mistakes

**1. Infinite loop:**
```tsx
// ❌ WRONG
useEffect(() => {
  setCount(count + 1);
}, [count]); // changing state → re-render → effect → state → infinite loop

// ✅ CORRECT — functional update breaks the cycle
useEffect(() => {
  setCount(prev => prev + 1);
}, []);
```

**2. Missing dependencies:**
```tsx
// ❌ WRONG — stale userId if it changes
useEffect(() => {
  fetchUser(userId);
}, []);

// ✅ CORRECT
useEffect(() => {
  fetchUser(userId);
}, [userId]);
```

**3. useEffect for derived state:**
```tsx
// ❌ WRONG
const [filtered, setFiltered] = useState([]);
useEffect(() => {
  setFiltered(tasks.filter(t => t.status === "todo"));
}, [tasks]);

// ✅ CORRECT — just derive it
const filtered = tasks.filter(t => t.status === "todo");
```

### When NOT to Use useEffect

| What you want | Better approach |
|---|---|
| Compute derived data | Plain variable |
| Handle a click | Event handler |
| Fetch on page load | Server Component async/await |
| Set page title in Next.js | `export const metadata` |
| Transform data for render | Derive inside render |

### Built in the project

```tsx
// dashboard-sidebar.tsx — close sidebar on Escape
useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") setIsOpen(false);
  }
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);

// task-search-input.tsx — auto-focus on mount
useEffect(() => {
  inputRef.current?.focus();
}, []);

// task-interactive-list.tsx — sync debounced search to URL
useEffect(() => {
  updateParams({ search: debouncedSearch || undefined, page: undefined });
}, [debouncedSearch, updateParams]);
```

---

## Lesson 4.1 — useState Advanced Patterns

### Pattern 1: Object State

Group related fields into one state object instead of multiple separate useState calls:

```tsx
// ❌ Three separate calls
const [status, setStatus] = useState("all");
const [search, setSearch] = useState("");
const [page, setPage] = useState(1);

// ✅ One object
const [filterState, setFilterState] = useState({
  status: "all",
  search: "",
  page: 1,
});
```

**Updating object state — always spread, never mutate:**
```tsx
// ❌ WRONG — mutates existing object, React won't re-render
filterState.status = "todo";
setFilterState(filterState);

// ✅ CORRECT — new object with spread
setFilterState(prev => ({ ...prev, status: "todo", page: 1 }));
```

### Pattern 2: Functional Update

When new state depends on previous state, use the callback form:

```tsx
// ❌ Risky in async/closure contexts — may use stale value
setCount(count + 1);

// ✅ Always gets the latest state
setCount(prev => prev + 1);
```

### Pattern 3: Lazy Initializer

If the initial value is expensive to compute, pass a function:

```tsx
// ❌ Runs on every render (wasteful)
const [data, setData] = useState(expensiveComputation());

// ✅ Runs only on first render
const [data, setData] = useState(() => expensiveComputation());
```

### Pattern 4: When NOT to Use State

```tsx
// ❌ State for a value that doesn't affect the UI
const [renderCount, setRenderCount] = useState(0);
useEffect(() => { setRenderCount(c => c + 1); }); // infinite loop!

// ✅ useRef for values that don't need to trigger re-render
const renderCount = useRef(0);
useEffect(() => { renderCount.current += 1; });
```

### Built in the project

```tsx
// task-interactive-list.tsx
const [filterState, setFilterState] = useState<FilterState>({
  status: initialStatus ?? "all",
  search: initialSearch,
  page: initialPage,
});

// Update multiple fields at once, always reset page
setFilterState(prev => ({ ...prev, status: value, page: 1 }));
```

---

## Lesson 4.2 — useMemo

Memoizes the **result of a calculation** — only re-runs when dependencies change.

```tsx
const value = useMemo(() => expensiveCalculation(a, b), [a, b]);
```

### When to use

| Use it | Skip it |
|---|---|
| Filtering/sorting large lists | Simple math or string operations |
| Complex transformations on big data | Small arrays (< 100 items) |
| Result used as dep in useEffect | "Just to be safe" — adds overhead |

### Derived state vs useMemo

```tsx
// For cheap calculations — plain variable is fine
const total = items.length;

// For expensive calculations — useMemo
const filteredTasks = useMemo(
  () => tasks.filter(task => task.status === filterState.status),
  [tasks, filterState.status],
);
```

### Built in the project

```tsx
// task-interactive-list.tsx
const filteredTasks = useMemo(
  () =>
    tasks.filter((task) => {
      const matchesStatus =
        filterState.status === "all" || task.status === filterState.status;
      const matchesSearch = task.title
        .toLowerCase()
        .includes(filterState.search.toLowerCase());
      return matchesStatus && matchesSearch;
    }),
  [tasks, filterState.status, filterState.search],
  // Note: filterState.page is NOT a dep — pagination doesn't affect filtering
);
```

---

## Lesson 4.3 — useRef

Stores a value that **persists across renders but does NOT trigger a re-render** when changed.

### Use 1: Reference a DOM element

```tsx
const inputRef = useRef<HTMLInputElement>(null);

// After mount, inputRef.current is the real <input> DOM node
inputRef.current?.focus();
inputRef.current?.select();

// Connect to JSX
<input ref={inputRef} />
```

The generic `<HTMLInputElement>` tells TypeScript what type of element this is — gives you correct autocomplete and type safety on `.focus()`, `.value`, etc.

### Use 2: Store a value without triggering re-render

```tsx
const renderCount = useRef(0);
renderCount.current += 1; // does NOT cause a re-render
```

### useRef vs useState

| | useRef | useState |
|---|---|---|
| Triggers re-render? | ❌ No | ✅ Yes |
| Persists across renders? | ✅ Yes | ✅ Yes |
| Use for | DOM access, timers, counters | Values user sees on screen |

### Click-outside pattern (dropdown.tsx)

```tsx
const dropdownRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  function handleClickOutside(e: MouseEvent) {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

return <div ref={dropdownRef}>...</div>;
```

`contains(e.target)` — checks if the click happened inside the element. If not → close.

### Built in the project

```tsx
// task-search-input.tsx — auto-focus search on page load
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  inputRef.current?.focus();
}, []);

<input ref={inputRef} ... />
```

---

## Lesson 4.4 — useCallback

Memoizes a **function** so it doesn't get re-created on every render.

```tsx
const handleClick = useCallback(() => {
  doSomething(a, b);
}, [a, b]); // new function only created when a or b changes
```

### When to use

| Use it | Skip it |
|---|---|
| Function passed as prop to memoized child | Functions used only inside render |
| Function listed as dep in useEffect | "Just in case" — adds complexity |

### Built in the project

```tsx
// task-interactive-list.tsx
const updateParams = useCallback(
  (updates: Partial<Record<"status" | "search" | "page", string | undefined>>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  },
  [router, pathname, searchParams], // new function only when URL context changes
);
```

Why? `updateParams` is listed as a dependency in the `useEffect` that syncs debounced search. Without `useCallback`, every render would create a new function → `useEffect` would re-fire → infinite loop.

---

## Lesson 4.5 — Custom Hooks

A custom hook is a **function starting with `use` that calls other hooks**. Lets you extract and reuse stateful logic.

### Rules

- Name must start with `use`
- Can call other hooks inside
- Cannot be called inside conditions or loops (same rules as built-in hooks)
- Lives in its own file (convention: `hooks/use-something.ts`)

### Built in the project — `useDebounce`

```tsx
// hooks/use-debounce.ts
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer); // cancel timer if value changes before delay
  }, [value, delay]);

  return debouncedValue;
}
```

**How debounce works:**
1. User types "f" → timer starts (300ms)
2. User types "fi" → old timer cancelled, new timer starts
3. User types "fix" → old timer cancelled, new timer starts
4. User stops → 300ms passes → `debouncedValue` updates to "fix"
5. URL updates once (not three times)

**Usage:**
```tsx
const debouncedSearch = useDebounce(filterState.search, 300);

useEffect(() => {
  updateParams({ search: debouncedSearch || undefined });
}, [debouncedSearch, updateParams]);
```

---

## Phase 4 Summary

### Hooks Decision Tree

```
Need to store something?
├── Affects UI when changed? → useState
└── Doesn't affect UI?      → useRef

Is it derived from other state?
└── YES → plain variable or useMemo (never useState)

Need to run a side effect?
├── Syncing to DOM/timer/API/event? → useEffect
├── Expensive calculation?          → useMemo
└── Stable function reference?      → useCallback

Reusing stateful logic in multiple components?
└── Custom hook
```

### All hooks used in this project

| Hook | File | Purpose |
|---|---|---|
| `useState` | `task-interactive-list`, `dashboard-sidebar` | UI state |
| `useEffect` | `dashboard-sidebar`, `task-search-input`, `task-interactive-list` | Escape key, auto-focus, URL sync |
| `useMemo` | `task-interactive-list` | Cache filtered tasks |
| `useCallback` | `task-interactive-list` | Stable `updateParams` reference |
| `useRef` | `task-search-input`, `dropdown` | DOM access |
| `useDebounce` (custom) | `task-interactive-list` | Delay URL updates on search |

---

## What's Coming Next

| Phase | Topic |
|---|---|
| **5** | Data Fetching — real fetch calls, loading states, error handling, SWR |
| **6** | Forms & Validation — React Hook Form + Zod |
| **7** | Authentication — JWT, sessions, proxy.ts real implementation |
| **8** | Advanced Architecture — Context API, code splitting |
| **9** | Performance — bundle analysis, memoization strategy |
| **10** | Testing — Jest, React Testing Library, Playwright |
