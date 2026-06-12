# Next.js 16 — Phase 9 Lesson Review: Performance

> **Phase 9 topics:** next/image · React.memo · Bundle analysis · Performance checklist

---

## Lesson 9.1 — next/image

Plain `<img>` sends the original file at full size to every device. `next/image` automatically optimizes:

- Resizes to the display size
- Converts to modern format (WebP / AVIF)
- Lazy loads by default (only loads when in viewport)
- Prevents layout shift (requires width + height)

```tsx
// ❌ Plain img
<img src="/avatar.png" alt="User" />

// ✅ next/image — same result, fully optimized
import Image from "next/image";

<Image
  src="/avatar.png"
  alt="User avatar"
  width={40}
  height={40}
  className="rounded-full"
/>
```

### Fill mode — when dimensions are unknown

```tsx
<div className="relative h-40 w-full">
  <Image
    src={task.coverImage}
    alt={task.title}
    fill                       // fills the parent container
    className="object-cover rounded-xl"
  />
</div>
// Parent must have position: relative and explicit dimensions
```

### priority — above-the-fold images

```tsx
// Add priority to images visible immediately on load (hero, avatar in header)
// Tells Next.js to preload it — removes the loading delay
<Image src="/hero.png" alt="Hero" width={1200} height={600} priority />
```

---

## Lesson 9.2 — React.memo

`React.memo` wraps a component so it **only re-renders when props change**. Without it, a component re-renders every time its parent re-renders — even if nothing relevant changed.

```tsx
import { memo } from "react";

// ❌ Without memo — re-renders on every parent render
function TaskCard({ task }: { task: Task }) { ... }

// ✅ With memo — skips re-render if task prop reference is unchanged
export const TaskCard = memo(function TaskCard({ task }: { task: Task }) { ... });
```

### How it works with useMemo

```tsx
// useMemo returns the same array reference if deps didn't change
const filteredTasks = useMemo(() => tasks.filter(...), [tasks, filterState.status]);

// memo on TaskCard checks: is this task the same object as last render?
// If filteredTasks is the same array → same task objects → TaskCard skips render
filteredTasks.map(task => <TaskCard key={task.id} task={task} />)
```

`useMemo` + `React.memo` work together: `useMemo` keeps task references stable, `memo` uses those stable references to skip re-renders.

### When memo does NOT help

```tsx
// ❌ Object literal — new reference every render, memo always re-renders
<TaskCard task={{ id: "1", title: "Fix bug" }} />

// ❌ Inline function — new reference every render
<TaskCard onDelete={() => handleDelete(task.id)} />

// ✅ Fix: useCallback makes the function reference stable
const handleDelete = useCallback((id: string) => { ... }, []);
<TaskCard onDelete={handleDelete} />
```

### Built in this project

```tsx
// components/tasks/task-card.tsx
export const TaskCard = memo(function TaskCard({ task }: TaskCardProps) {
  // Only re-renders when task object reference changes
  // Works because filteredTasks comes from useMemo
});

// components/dashboard/stat-card.tsx
export const StatCard = memo(function StatCard({ title, value, description }: StatCardProps) {
  // Only re-renders when value changes — numbers are compared by value
});
```

---

## Lesson 9.3 — Code Splitting with next/dynamic

Already covered in Phase 8, but worth repeating in the performance context:

```tsx
import dynamic from "next/dynamic";

// Bundle for HeavyChart only downloads when the component renders
const HeavyChart = dynamic(
  () => import("@/components/heavy-chart"),
  {
    loading: () => <div className="h-64 animate-pulse bg-slate-800 rounded-xl" />,
    ssr: false, // browser-only (uses window/document)
  }
);
```

**Impact:** The initial page JS bundle is smaller → page loads faster → better user experience and SEO score.

---

## Lesson 9.4 — Bundle Analysis

```bash
# Install
npm install @next/bundle-analyzer

# next.config.ts
import bundleAnalyzer from "@next/bundle-analyzer";
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });
export default withBundleAnalyzer({});

# Run
ANALYZE=true npm run build
```

Opens a visual treemap of your JS bundle. Look for:
- Libraries that take up disproportionate space
- Duplicate packages
- Large dependencies you could replace with smaller alternatives

---

## Lesson 9.5 — Performance Checklist

| Rule | Why |
|---|---|
| `next/image` for all images | Auto-resize, WebP, lazy load, no layout shift |
| Fetch in Server Components | Zero client JS, no loading flicker |
| `useMemo` for expensive filters | Skip recalculation on unrelated renders |
| `React.memo` on list items | Skip re-render when props unchanged |
| `useCallback` for props to memo components | Stable reference — memo works correctly |
| `next/dynamic` for heavy components | Smaller initial bundle |
| `Promise.all` for parallel fetches | Wait for slowest, not sum of all |
| `cache: "no-store"` only when needed | Allow Next.js caching where data is stable |

---

## Decision Guide: When to Memoize

```
Is there a measurable performance problem?
├── NO  → don't add memo/useMemo/useCallback yet
└── YES → identify which component re-renders too often
            ↓
          Is it re-rendering with the same props?
          ├── YES → add React.memo
          └── NO  → the props are actually changing, memo won't help
                     ↓
                   Is a value recalculated expensively?
                   ├── YES → useMemo
                   └── Is a function recreated causing memo to miss?
                       └── YES → useCallback on that function
```

**Rule of thumb:** Measure first, optimize second. Premature memoization adds complexity without benefit — and `memo` itself has a small overhead (the comparison).

---

## Files Updated in Phase 9

| File | Change |
|---|---|
| `components/tasks/task-card.tsx` | Wrapped with `React.memo` |
| `components/dashboard/stat-card.tsx` | Wrapped with `React.memo` |

---

## What's Coming Next

| Phase | Topic |
|---|---|
| **10** | Testing — Jest, React Testing Library, Playwright E2E |
