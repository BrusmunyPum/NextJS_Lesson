import { NextResponse } from "next/server";
import { mockTasks } from "@/features/tasks/data/mock-tasks";
import type { Task } from "@/features/tasks/types";

// GET /api/tasks — return all tasks (optionally filtered by status)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  // Simulate network latency so loading states are visible during development
  await new Promise((r) => setTimeout(r, 400));

  const tasks = status
    ? mockTasks.filter((t) => t.status === status)
    : mockTasks;

  return NextResponse.json(tasks);
}

// POST /api/tasks — create a new task
export async function POST(request: Request) {
  const body = (await request.json()) as Omit<Task, "id">;

  // Validate required fields
  if (!body.title || !body.status || !body.priority) {
    return NextResponse.json(
      { error: "title, status, and priority are required" },
      { status: 400 },
    );
  }

  const newTask: Task = {
    ...body,
    id: `task-${Date.now()}`,
  };

  // In a real app: save to database here
  // mockTasks.push(newTask); — intentionally not mutating for this learning project

  return NextResponse.json(newTask, { status: 201 });
}
