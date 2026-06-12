# Next.js 16 — Phase 6 Lesson Review: Forms & Validation

> **Phase 6 topics:** Zod schemas · React Hook Form · zodResolver · Field errors · Form submission · router.refresh()

---

## The Problem with Plain HTML Forms

Managing forms manually requires a lot of boilerplate:

```tsx
// ❌ Manual approach — painful with many fields
const [title, setTitle] = useState("");
const [titleError, setTitleError] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);

function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  if (!title) setTitleError("Title is required");
  if (title.length < 3) setTitleError("Too short");
  // ... grows to 200+ lines with 6 fields
}
```

**Solution:** Zod handles validation rules. React Hook Form handles form state. Together they reduce this to ~10 lines.

---

## Lesson 6.1 — Zod Schemas

Zod lets you describe the exact shape and rules of valid data.

### Basic schema

```ts
import { z } from "zod";

const TaskFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be under 100 characters"),

  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .optional(),                         // field is not required

  status: z.enum(["todo", "in-progress", "completed"], {
    errorMap: () => ({ message: "Please select a valid status" }),
  }),

  priority: z.enum(["low", "medium", "high"]),

  dueDate: z.string().min(1, "Due date is required"),

  assigneeName: z.string().min(1, "Assignee name is required"),
});
```

### Deriving the TypeScript type

```ts
// z.infer reads the schema and creates a matching TypeScript type
// No duplication — define once, get both validation AND types
export type TaskFormData = z.infer<typeof TaskFormSchema>;

// Equivalent to writing manually:
type TaskFormData = {
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string;
  assigneeName: string;
};
```

### Common Zod validators

| Validator | Example | What it checks |
|---|---|---|
| `.min(n)` | `z.string().min(3)` | At least n chars / items |
| `.max(n)` | `z.string().max(100)` | At most n chars / items |
| `.optional()` | `z.string().optional()` | Field can be undefined |
| `.nullable()` | `z.string().nullable()` | Field can be null |
| `.email()` | `z.string().email()` | Valid email format |
| `.url()` | `z.string().url()` | Valid URL format |
| `.enum([...])` | `z.enum(["a","b"])` | Must be one of the values |
| `.number()` | `z.number().positive()` | Number, must be positive |
| `.default(v)` | `z.string().default("")` | Use v if undefined |

---

## Lesson 6.2 — React Hook Form

React Hook Form (RHF) manages form state efficiently by reading from the DOM directly — unlike controlled inputs with `useState`, it does not re-render the whole form on every keystroke.

### Setup

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const {
  register,       // connects <input> elements to RHF
  handleSubmit,   // validates, then calls your onSubmit
  formState: {
    errors,       // validation errors per field
    isSubmitting, // true while your async onSubmit is running
  },
  reset,          // clears the form back to defaultValues
} = useForm<TaskFormData>({
  resolver: zodResolver(TaskFormSchema), // plug Zod into RHF
  defaultValues: {
    title: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    assigneeName: "",
  },
});
```

### register — connecting inputs

`{...register("title")}` spreads these props onto the input:

```tsx
{
  name: "title",
  onChange: (e) => updateValue("title", e.target.value),
  onBlur: () => validateField("title"),
  ref: (el) => registerDOMNode("title", el),
}
```

Usage:
```tsx
<input type="text" {...register("title")} />
<select {...register("status")}>...</select>
<textarea {...register("description")} />
```

### Showing field errors

```tsx
// errors.title?.message is the string from your Zod schema
// Optional chaining (?.) because errors.title may be undefined
{errors.title?.message && (
  <p className="text-sm text-red-400">{errors.title.message}</p>
)}

// Or as a reusable helper:
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

<FieldError message={errors.title?.message} />
```

### handleSubmit

```tsx
// handleSubmit wraps your function:
// 1. Prevents default form submit (page reload)
// 2. Runs Zod validation
// 3. If invalid → populates errors, does NOT call onSubmit
// 4. If valid → calls onSubmit(data) with typed, validated data

async function onSubmit(data: TaskFormData) {
  // data is guaranteed to be valid here — Zod already checked it
  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

<form onSubmit={handleSubmit(onSubmit)}>
```

### isSubmitting

`isSubmitting` is `true` while `onSubmit` is running (awaiting the fetch). Use it to disable the form and show a loading state:

```tsx
<input
  {...register("title")}
  disabled={isSubmitting}
/>

<button type="submit" disabled={isSubmitting}>
  {isSubmitting ? "Creating..." : "Create Task"}
</button>
```

---

## Lesson 6.3 — Validation Timing

```tsx
useForm({
  mode: "onSubmit",  // default — validate only when form is submitted
  mode: "onBlur",    // validate when user leaves a field (best UX)
  mode: "onChange",  // validate on every keystroke (expensive)
  mode: "all",       // onChange + onBlur
})
```

**Recommendation:** Use `onBlur` — shows errors after the user finishes a field, not while they're still typing.

---

## Lesson 6.4 — Form Submission Flow

```
User fills form
      ↓
clicks "Create Task" (type="submit")
      ↓
handleSubmit() intercepts
      ↓
Zod validates all fields
      ↓
   invalid? → populate errors state → re-render with error messages → STOP
   valid?   → call onSubmit(data)
                    ↓
             fetch POST /api/tasks
                    ↓
             API returns 201 Created
                    ↓
             router.push("/dashboard/tasks")   ← navigate away
             router.refresh()                  ← re-fetch server data
```

### Why `router.refresh()`?

Without it, the task list shows **stale data** — the Server Component already fetched tasks before you created the new one, and Next.js cached that result. `router.refresh()` tells Next.js to re-run the Server Component and fetch fresh data.

```tsx
router.push("/dashboard/tasks");  // navigate to list
router.refresh();                 // invalidate server cache → re-fetch tasks
```

---

## Lesson 6.5 — Server-level Error Handling

Zod catches field validation errors. But the server can also return errors (network failure, duplicate entry, etc.). Handle these separately:

```tsx
const [serverError, setServerError] = useState<string | null>(null);

async function onSubmit(data: TaskFormData) {
  setServerError(null); // clear previous error

  try {
    const res = await fetch("/api/tasks", { ... });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Failed to create task");
    }

    router.push("/dashboard/tasks");
    router.refresh();
  } catch (err) {
    // Show error at the top of the form — not in a field
    setServerError(err instanceof Error ? err.message : "Something went wrong");
  }
}

// In JSX:
{serverError && (
  <div className="rounded-xl border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400">
    {serverError}
  </div>
)}
```

---

## Files Built in Phase 6

| File | Purpose |
|---|---|
| `features/tasks/schemas/task-schema.ts` | Zod schema + `TaskFormData` type |
| `components/tasks/task-form.tsx` | Form with RHF + Zod + error display |
| `app/dashboard/tasks/new/page.tsx` | Route at `/dashboard/tasks/new` |
| `app/dashboard/tasks/page.tsx` | Added "+ New Task" button |

---

## Bonus — The Infinite Loop Bug (Fixed in This Phase)

We also fixed a loop in `task-interactive-list.tsx` caused by a `useEffect` dependency chain:

**Root cause:**
```
useEffect([debouncedSearch, updateParams]) fires
  → router.replace() → searchParams changes
  → updateParams() recreated (depended on searchParams)
  → useEffect fires again → LOOP
```

**Fix 1 — searchParamsRef:** Read `searchParams` from a ref inside `updateParams` so changing the URL does not recreate the function:
```tsx
const searchParamsRef = useRef(searchParams);
useEffect(() => { searchParamsRef.current = searchParams; }, [searchParams]);

const updateParams = useCallback((updates) => {
  const params = new URLSearchParams(searchParamsRef.current.toString());
  // ...
}, [router, pathname]); // no searchParams in deps
```

**Fix 2 — isFirstRender:** Skip the search sync effect on mount:
```tsx
const isFirstRender = useRef(true);

useEffect(() => {
  if (isFirstRender.current) {
    isFirstRender.current = false;
    return; // skip — user hasn't typed yet
  }
  updateParams({ search: debouncedSearch || undefined });
}, [debouncedSearch, updateParams]);
```

**Lesson:** When a `useEffect` causes a loop, trace the dependency chain. Look for: effect → state/URL change → dependency recreated → effect again.

---

## What's Coming Next

| Phase | Topic |
|---|---|
| **7** | Authentication — JWT, sessions, real proxy.ts implementation |
| **8** | Advanced Architecture — Context API, code splitting |
| **9** | Performance — bundle analysis, optimization |
| **10** | Testing — Jest, React Testing Library, Playwright |
