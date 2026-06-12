# Next.js 16 — Phase 8 Lesson Review: Advanced Architecture

> **Phase 8 topics:** Prop drilling problem · Context API · AuthContext · next/dynamic · Code splitting

---

## Lesson 8.1 — The Prop Drilling Problem

When many components need the same data, two bad patterns emerge:

**Pattern 1 — Multiple fetches (wasteful):**
```tsx
// Every component fetches independently — 3 network calls for the same data
function Sidebar()  { const { user } = useAuth(); } // fetch /api/auth/me
function TopNav()   { const { user } = useAuth(); } // fetch /api/auth/me again
function Profile()  { const { user } = useAuth(); } // fetch /api/auth/me again
```

**Pattern 2 — Prop drilling (messy):**
```tsx
// user passes through every layer even if middle components don't need it
<DashboardShell user={user}>
  <DashboardSidebar user={user}>
    <DashboardNav user={user}>
      <UserAvatar user={user} />  // only this one actually uses it
    </DashboardNav>
  </DashboardSidebar>
</DashboardShell>
```

**Solution: Context API** — fetch once, share everywhere without passing props.

---

## Lesson 8.2 — Context API

The three-step pattern:

```tsx
import { createContext, useContext, useState } from "react";

// Step 1 — Create the context with a default value
const ThemeContext = createContext<"dark" | "light">("dark");

// Step 2 — Provide it (wrap the tree that needs access)
function App() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  return (
    <ThemeContext.Provider value={theme}>
      <Page />
    </ThemeContext.Provider>
  );
}

// Step 3 — Consume it (any component at any depth inside the Provider)
function Button() {
  const theme = useContext(ThemeContext);
  return <button className={theme === "dark" ? "bg-slate-900" : "bg-white"}>Click</button>;
}
```

### Key rules

- A component must be **inside the Provider** to call `useContext`
- When the context **value changes**, every consumer re-renders
- You can have multiple Contexts in one app (AuthContext, ThemeContext, etc.)
- Providers can be **nested** — inner Provider overrides outer for its subtree

---

## Lesson 8.3 — AuthContext (built in this project)

```tsx
// contexts/auth-context.tsx
"use client";

type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; user: User }
  | { status: "unauthenticated" };

type AuthContextValue = {
  user: User | undefined;
  loading: boolean;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
};

// null default — caught by the useAuth hook below
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ status: "loading" });

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) { setState({ status: "unauthenticated" }); return; }
      const { user } = await res.json();
      setState({ status: "authenticated", user });
    } catch {
      setState({ status: "unauthenticated" });
    }
  }, []);

  // Fetch once on mount — result shared with all consumers
  useEffect(() => { fetchUser(); }, [fetchUser]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setState({ status: "unauthenticated" });
    router.push("/login");
  }

  const value: AuthContextValue = {
    user: state.status === "authenticated" ? state.user : undefined,
    loading: state.status === "loading",
    logout,
    refetchUser: fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook — throws if called outside AuthProvider
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
```

### Mounted in root layout

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>   {/* fetches user ONCE — all descendants share it */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Usage anywhere in the app

```tsx
"use client";
import { useAuth } from "@/hooks/use-auth";

function UserMenu() {
  const { user, loading, logout } = useAuth(); // reads from Context — no fetch

  if (loading) return <Spinner />;
  if (!user)   return null;

  return (
    <div>
      <p>{user.name}</p>
      <button onClick={logout}>Sign out</button>
    </div>
  );
}
```

### Before vs after

```
BEFORE:
  DashboardSidebar → fetch /api/auth/me
  TopNav           → fetch /api/auth/me  (duplicate)
  Profile          → fetch /api/auth/me  (duplicate)

AFTER:
  AuthProvider     → fetch /api/auth/me  (once)
  DashboardSidebar → useContext()        (no fetch)
  TopNav           → useContext()        (no fetch)
  Profile          → useContext()        (no fetch)
```

---

## Lesson 8.4 — Code Splitting with next/dynamic

By default Next.js bundles all components together. Heavy components slow initial load even if the user doesn't see them right away.

`next/dynamic` lazy-loads a component — JS only downloads when the component is rendered:

```tsx
import dynamic from "next/dynamic";

// The JS for TaskDetailCard is only downloaded when this component renders
const TaskDetailCard = dynamic(
  () => import("@/components/tasks/task-detail-card"),
  {
    loading: () => <p className="text-slate-400">Loading...</p>,
  }
);
```

### ssr: false — skip server rendering

```tsx
// Some libraries use window/document and crash on the server
const HeavyChart = dynamic(
  () => import("@/components/heavy-chart"),
  {
    ssr: false,     // don't render on server — browser only
    loading: () => <div className="h-64 animate-pulse bg-slate-800 rounded-xl" />,
  }
);
```

### When to use next/dynamic

| Use it | Skip it |
|---|---|
| Heavy chart/graph libraries | Simple UI components |
| Rich text editors | Components always visible on load |
| Components only shown after interaction | Small, fast components |
| Browser-only third-party libraries | Server Components |

---

## Lesson 8.5 — When to Use Context vs Other Solutions

| Situation | Best solution |
|---|---|
| Auth state (user, logout) | Context API |
| Theme (dark/light mode) | Context API |
| URL state (filters, search, page) | URL search params |
| Local toggle (modal, dropdown) | `useState` in that component |
| Server data shared to children | Server Component + props |
| Form state | React Hook Form |
| Complex global state (large app) | Zustand or Redux |

**Rule:** Context re-renders **every consumer** when the value changes. Don't put fast-changing values (e.g. mouse position, scroll) in Context. Use it for slow-changing global state like the current user or theme.

---

## Files Built in Phase 8

| File | Purpose |
|---|---|
| `contexts/auth-context.tsx` | AuthContext + AuthProvider + useAuth |
| `hooks/use-auth.ts` | Re-exports useAuth (backwards-compatible) |
| `app/layout.tsx` | Wraps app in AuthProvider |
| `components/dashboard/dashboard-sidebar.tsx` | Reads user from Context, no extra fetch |

---

## What's Coming Next

| Phase | Topic |
|---|---|
| **9** | Performance — Image optimization, bundle analysis, React.memo |
| **10** | Testing — Jest, React Testing Library, Playwright |
