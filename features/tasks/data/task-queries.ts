import type { Task } from "@/features/tasks/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

// ── Server-side queries (called from Server Components) ───────────────────────

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/api/tasks`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch tasks");

  return res.json();
}

export async function getTaskById(taskId: string): Promise<Task | undefined> {
  if (taskId === "task-error") throw new Error("Failed to get task details.");

  const res = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
    cache: "no-store",
  });

  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error("Failed to fetch task");

  return res.json();
}

export async function getCompletedTasks(): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/api/tasks?status=completed`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch completed tasks");

  return res.json();
}
