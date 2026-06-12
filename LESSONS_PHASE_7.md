# Next.js 16 — Phase 7 Lesson Review: Authentication

> **Phase 7 topics:** HTTP-only cookies · Token-based auth · Auth API routes · proxy.ts · Login form · useAuth hook

---

## Lesson 7.1 — How Web Authentication Works

HTTP is **stateless** — every request is independent. The server doesn't remember who you are between requests. Authentication is the mechanism that carries identity across requests.

### Session-based vs Token-based

| | Session-based | Token-based |
|---|---|---|
| Server stores | Session data in database | Nothing |
| Client stores | Session ID in cookie | Token in cookie |
| Scalability | Needs shared DB across servers | Stateless — works anywhere |
| Revocation | Easy (delete session from DB) | Hard (token valid until expiry) |

### Why HTTP-only cookies — not localStorage

```
❌ localStorage       — JavaScript can read it → XSS attack steals the token
❌ Regular cookie     — JavaScript can read it → same problem  
✅ HTTP-only cookie   — browser sends it automatically, JS cannot read it
```

```ts
response.cookies.set("auth-token", token, {
  httpOnly: true,   // document.cookie cannot access this
  secure: true,     // only sent over HTTPS (in production)
  sameSite: "lax",  // CSRF protection
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  path: "/",        // sent on all routes
});
```

---

## Lesson 7.2 — The Auth Flow

### Login

```
User submits email + password
        ↓
POST /api/auth/login
        ↓
Server verifies credentials
        ↓
Server creates token, sets HTTP-only cookie
        ↓
Browser stores cookie automatically
        ↓
Redirect → /dashboard
```

### Every request after login

```
Browser sends cookie automatically with every request
        ↓
proxy.ts reads the cookie
        ↓
verifyToken(token) → user or null
        ↓
valid?  → allow request through
invalid? → redirect to /login
```

### Logout

```
POST /api/auth/logout
        ↓
Server sets cookie with maxAge: 0 (clears it)
        ↓
Redirect → /login
```

---

## Lesson 7.3 — Token Helpers

In production use a proper JWT library (`jose`, `jsonwebtoken`). For learning, we implemented a simple base64 token.

```ts
// features/auth/token.ts

// Encode user data into a token string
export function createToken(user: User): string {
  const payload = JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  });
  const encoded = Buffer.from(payload).toString("base64");
  const signature = Buffer.from(`${encoded}.${TOKEN_SECRET}`).toString("base64").slice(0, 16);
  return `${encoded}.${signature}`;
}

// Decode and verify — returns user or null if invalid/expired
export function verifyToken(token: string): User | null {
  try {
    const [encoded, signature] = token.split(".");
    const expectedSig = Buffer.from(`${encoded}.${TOKEN_SECRET}`).toString("base64").slice(0, 16);
    if (signature !== expectedSig) return null; // tampered
    const payload = JSON.parse(Buffer.from(encoded, "base64").toString("utf-8"));
    if (payload.exp < Date.now()) return null;  // expired
    return { id: payload.id, email: payload.email, name: payload.name, role: payload.role };
  } catch {
    return null;
  }
}
```

---

## Lesson 7.4 — Auth API Routes

### POST /api/auth/login

```ts
export async function POST(request: Request) {
  const { email, password } = await request.json();

  const user = findUserByEmail(email);

  // Same error for wrong email AND wrong password
  // Never reveal whether the email exists — security best practice
  if (!user || user.password !== password) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const token = createToken({ id: user.id, name: user.name, email: user.email, role: user.role });

  const response = NextResponse.json({ user: { ...user, password: undefined } });
  response.cookies.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
```

### POST /api/auth/logout

```ts
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    maxAge: 0,  // immediately expires = cleared
    path: "/",
  });
  return response;
}
```

### GET /api/auth/me

```ts
export async function GET() {
  const cookieStore = await cookies(); // Next.js server helper
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = verifyToken(token);
  if (!user) return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });

  return NextResponse.json({ user });
}
```

---

## Lesson 7.5 — Real proxy.ts

```ts
// proxy.ts
import { verifyToken } from "@/features/auth/token";

const PROTECTED_PREFIXES = ["/dashboard"];
const AUTH_ROUTES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Read the HTTP-only cookie
  const token = request.cookies.get("auth-token")?.value;

  // Verify — returns user object or null
  const user = token ? verifyToken(token) : null;
  const isAuthenticated = user !== null;

  // Protected route + not logged in
  if (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname); // remember destination
      return NextResponse.redirect(loginUrl);
    }
  }

  // Auth route + already logged in
  if (AUTH_ROUTES.includes(pathname)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}
```

**`?from=` param** — when a logged-out user tries to visit `/dashboard/tasks`, proxy redirects to `/login?from=/dashboard/tasks`. After login, `LoginForm` reads this param and sends them back to their original destination instead of always going to `/dashboard`.

---

## Lesson 7.6 — Login Form (Real)

```tsx
// components/auth/login-form.tsx
"use client";

const LoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>({
    resolver: zodResolver(LoginSchema),
  });

  async function onSubmit(data: LoginData) {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Login failed");
      }
      // Go back to where they were, or dashboard
      const from = searchParams.get("from") ?? "/dashboard";
      router.push(from);
      router.refresh(); // re-fetch server data with new auth state
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    }
  }
}
```

---

## Lesson 7.7 — useAuth Hook (Client-side)

```ts
// hooks/use-auth.ts
export function useAuth(): AuthResult {
  const router = useRouter();

  // Fetch current user from the API (reads HTTP-only cookie server-side)
  const { data, loading } = useFetch<{ user: User }>("/api/auth/me");

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh(); // clear server component cache
  }

  return {
    user: data?.user,  // undefined while loading or if not logged in
    loading,
    logout,
  };
}
```

Usage in any Client Component:
```tsx
const { user, loading, logout } = useAuth();

if (loading) return <Spinner />;
if (!user)   return null;

return (
  <div>
    <p>Hello, {user.name}</p>
    <button onClick={logout}>Sign out</button>
  </div>
);
```

---

## Files Built in Phase 7

| File | Purpose |
|---|---|
| `features/auth/types.ts` | `User` and `AuthSession` types |
| `features/auth/mock-users.ts` | Test users (admin + member) |
| `features/auth/token.ts` | `createToken` / `verifyToken` |
| `app/api/auth/login/route.ts` | POST — verify credentials, set cookie |
| `app/api/auth/logout/route.ts` | POST — clear cookie |
| `app/api/auth/me/route.ts` | GET — return current user from cookie |
| `proxy.ts` | Real route protection reading cookie |
| `app/(auth)/login/page.tsx` | Login page |
| `components/auth/login-form.tsx` | Login form with RHF + Zod |
| `hooks/use-auth.ts` | Client hook for current user + logout |
| `components/dashboard/dashboard-sidebar.tsx` | User info + Sign out button |

---

## Test Credentials

```
Email:    admin@example.com  /  Password: password123
Email:    member@example.com /  Password: password123
```

---

## Security Notes (for production)

| This project (learning) | Production |
|---|---|
| Simple base64 token | Proper JWT with `jose` library |
| Plain text passwords | Hashed with `bcrypt` |
| Mock user array | Real database |
| `AUTH_SECRET` in .env.local | Random 32-byte secret, never committed |
| HTTP only (dev) | HTTPS + `secure: true` |

---

## What's Coming Next

| Phase | Topic |
|---|---|
| **8** | Advanced Architecture — Context API, code splitting, lazy loading |
| **9** | Performance — bundle analysis, memoization strategy |
| **10** | Testing — Jest, React Testing Library, Playwright |
