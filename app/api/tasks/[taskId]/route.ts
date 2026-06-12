import { NextResponse } from "next/server";
import { mockTasks } from "@/features/tasks/data/mock-tasks";
import type { Task } from "@/features/tasks/types";

type RouteContext = {
  params: Promise<{ taskId: string }>;
};

// GET /api/tasks/:taskId — return a single task
export async function GET(_request: Request, { params }: RouteContext) {
  const { taskId } = await params;

  await new Promise((r) => setTimeout(r, 300));

  // Special id to test error boundaries during development
  if (taskId === "task-error") {
    return NextResponse.json(
      { error: "Simulated server error" },
      { status: 500 },
    );
  }

  const task = mockTasks.find((t) => t.id === taskId);

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

// PATCH /api/tasks/:taskId — update a task
export async function PATCH(request: Request, { params }: RouteContext) {
  const { taskId } = await params;
  const body = (await request.json()) as Partial<Task>;

  const task = mockTasks.find((t) => t.id === taskId);

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const updatedTask = { ...task, ...body, id: taskId };

  return NextResponse.json(updatedTask);
}

// DELETE /api/tasks/:taskId — delete a task
export async function DELETE(_request: Request, { params }: RouteContext) {
  const { taskId } = await params;

  const exists = mockTasks.some((t) => t.id === taskId);

  if (!exists) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
