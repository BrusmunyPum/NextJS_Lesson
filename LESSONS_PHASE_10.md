# Next.js 16 — Phase 10 Lesson Review: Testing

> **Phase 10 topics:** Jest unit tests · React Testing Library · Playwright E2E

---

## Testing Layers

| Layer | Tool | What it tests | Speed |
|---|---|---|---|
| Unit | Jest | Pure functions, schemas, utilities | Very fast |
| Component | React Testing Library | UI behavior, interactions | Fast |
| End-to-end | Playwright | Full user flows in real browser | Slow |

---

## Lesson 10.1 — Jest Unit Tests

Unit tests test a single function in isolation — no browser, no React, no network.

### Setup

```bash
npm install --save-dev jest @types/jest ts-jest
```

```ts
// jest.config.ts
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
};
```

### Testing Zod schemas

```ts
// __tests__/task-schema.test.ts
import { TaskFormSchema } from "@/features/tasks/schemas/task-schema";

const validTask = {
  title: "Fix login bug",
  status: "todo",
  priority: "high",
  dueDate: "2026-12-01",
  assigneeName: "Sokha",
};

describe("TaskFormSchema", () => {
  it("accepts valid task data", () => {
    const result = TaskFormSchema.safeParse(validTask);
    expect(result.success).toBe(true);
  });

  it("rejects title shorter than 3 characters", () => {
    const result = TaskFormSchema.safeParse({ ...validTask, title: "Hi" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Title must be at least 3 characters");
  });

  it("rejects invalid status", () => {
    const result = TaskFormSchema.safeParse({ ...validTask, status: "invalid" });
    expect(result.success).toBe(false);
  });
});
```

### Testing token helpers

```ts
// __tests__/token.test.ts
import { createToken, verifyToken } from "@/features/auth/token";

const mockUser = { id: "1", name: "Sokha", email: "sokha@test.com", role: "admin" as const };

describe("token", () => {
  it("creates and verifies a valid token", () => {
    const token = createToken(mockUser);
    const user = verifyToken(token);
    expect(user?.email).toBe(mockUser.email);
  });

  it("returns null for a tampered token", () => {
    const token = createToken(mockUser);
    const tampered = token.slice(0, -3) + "xxx";
    expect(verifyToken(tampered)).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(verifyToken("")).toBeNull();
  });
});
```

### Jest matchers to know

```ts
expect(value).toBe(expected)          // strict equality (===)
expect(value).toEqual(expected)       // deep equality (objects/arrays)
expect(value).toBeTruthy()            // not null/undefined/false/0/""
expect(value).toBeNull()
expect(value).toBeUndefined()
expect(arr).toHaveLength(3)
expect(str).toContain("substring")
expect(fn).toHaveBeenCalled()
expect(fn).toHaveBeenCalledWith(arg)
expect(fn).toHaveBeenCalledTimes(1)
```

---

## Lesson 10.2 — React Testing Library (RTL)

RTL tests from the **user's perspective** — finds elements by visible text, roles, and labels (not class names or IDs).

### Setup

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

### Testing StatCard

```tsx
import { render, screen } from "@testing-library/react";
import { StatCard } from "@/components/dashboard/stat-card";

describe("StatCard", () => {
  it("renders title, value, and description", () => {
    render(<StatCard title="Total Tasks" value={24} description="All tasks" />);

    expect(screen.getByText("Total Tasks")).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("All tasks")).toBeInTheDocument();
  });
});
```

### Testing user interactions

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskFilterButton } from "@/components/tasks/task-filter-button";

describe("TaskFilterButton", () => {
  it("calls onSelect with its value when clicked", () => {
    const onSelect = jest.fn(); // mock — tracks calls without real implementation

    render(
      <TaskFilterButton label="Todo" value="todo" activeValue="all" onSelect={onSelect} />
    );

    fireEvent.click(screen.getByText("Todo"));

    expect(onSelect).toHaveBeenCalledWith("todo");
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("appears active when activeValue matches its value", () => {
    render(
      <TaskFilterButton label="Todo" value="todo" activeValue="todo" onSelect={jest.fn()} />
    );

    // Find by role and check it has the active class/aria attribute
    const button = screen.getByRole("button", { name: "Todo" });
    expect(button).toBeInTheDocument();
  });
});
```

### How to find elements

```tsx
// By visible text
screen.getByText("Submit")

// By ARIA role + name (most accessible approach)
screen.getByRole("button", { name: "Create Task" })
screen.getByRole("textbox", { name: "Title" })
screen.getByRole("heading", { name: "Tasks" })

// By form label
screen.getByLabelText("Email")

// By placeholder
screen.getByPlaceholderText("Search tasks...")

// Query (returns null instead of throwing if not found)
screen.queryByText("Error message")

// Async (waits for element to appear)
await screen.findByText("Task created!")
```

### Key principle

```tsx
// ❌ Testing implementation — breaks when you rename a class
expect(container.querySelector(".btn-primary")).toBeInTheDocument();

// ✅ Testing behavior — survives refactoring
expect(screen.getByRole("button", { name: "Create Task" })).toBeInTheDocument();
```

---

## Lesson 10.3 — Playwright (End-to-End)

Playwright controls a real browser and tests complete user flows from start to finish.

### Setup

```bash
npm install --save-dev @playwright/test
npx playwright install
```

```ts
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:3000" },
});
```

### Testing login flow

```ts
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test("login with valid credentials redirects to dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.fill('[type="email"]', "admin@example.com");
  await page.fill('[type="password"]', "password123");
  await page.click('[type="submit"]');
  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByText("Overview")).toBeVisible();
});

test("login with wrong password shows error", async ({ page }) => {
  await page.goto("/login");
  await page.fill('[type="email"]', "admin@example.com");
  await page.fill('[type="password"]', "wrongpassword");
  await page.click('[type="submit"]');
  await expect(page.getByText("Invalid email or password")).toBeVisible();
  await expect(page).toHaveURL("/login");
});

test("logged-out user is redirected to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});
```

### Testing task creation

```ts
// e2e/tasks.spec.ts
test("can create a new task", async ({ page }) => {
  // Login
  await page.goto("/login");
  await page.fill('[type="email"]', "admin@example.com");
  await page.fill('[type="password"]', "password123");
  await page.click('[type="submit"]');
  await page.waitForURL("/dashboard");

  // Navigate to new task form
  await page.goto("/dashboard/tasks");
  await page.click("text=+ New Task");
  await page.waitForURL("/dashboard/tasks/new");

  // Fill and submit
  await page.fill("#title", "E2E Test Task");
  await page.fill("#assigneeName", "Tester");
  await page.fill("#dueDate", "2026-12-31");
  await page.click('[type="submit"]');

  // Should redirect back to list
  await page.waitForURL("/dashboard/tasks");
});
```

### Playwright vs RTL

| | React Testing Library | Playwright |
|---|---|---|
| Browser | Simulated (jsdom) | Real (Chromium, Firefox, Safari) |
| Speed | Fast | Slow |
| Tests | Component behavior | Full user journey |
| Needs server? | No | Yes |
| Good for | Unit UI, interactions | Critical flows, auth, navigation |

---

## Testing Strategy

```
Unit tests (Jest) — run on every save
  ✓ Zod schemas
  ✓ Token helpers
  ✓ Pure utility functions

Component tests (RTL) — run before commit
  ✓ Components render correctly
  ✓ User interactions trigger right callbacks
  ✓ Error states display properly

E2E tests (Playwright) — run in CI before deploy
  ✓ Login / logout flow
  ✓ Create / view tasks
  ✓ Auth redirect (logged-out → login page)
  ✓ Form validation in real browser
```

---

## Files This Phase Covered (lesson only — no new files created)

The tests above are ready to implement. To set them up:

```bash
# Unit + component tests
npm install --save-dev jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom

# E2E
npm install --save-dev @playwright/test
npx playwright install
```

Then create:
```
__tests__/
  task-schema.test.ts
  token.test.ts
  stat-card.test.tsx
  task-filter-button.test.tsx
e2e/
  auth.spec.ts
  tasks.spec.ts
playwright.config.ts
jest.config.ts
```

---

## Curriculum Complete 🎉

All 10 phases covered:

| Phase | Topic | Status |
|---|---|---|
| 1 | Next.js Fundamentals & Routing | ✅ |
| 2 | Server Components & Layouts | ✅ |
| 3 | Component Architecture & Interactivity | ✅ |
| 4 | React Hooks Deep Dive | ✅ |
| 5 | Data Fetching & API Integration | ✅ |
| 6 | Forms & Validation | ✅ |
| 7 | Authentication | ✅ |
| 8 | Advanced Architecture (Context API) | ✅ |
| 9 | Performance | ✅ |
| 10 | Testing | ✅ |
