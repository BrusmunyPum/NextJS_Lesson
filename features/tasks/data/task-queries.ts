import { mockTasks } from "@/features/tasks/data/mock-tasks";

// loading function (wait)
function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getTasks() {
  await wait(800);

  return mockTasks;
}

export async function getTaskById(taskId: string) {
  await wait(1000);

  if (taskId === "task-error") {
    throw new Error("Failed to get task details.");
  }

  return mockTasks.find((task) => task.id === taskId);
}

export function getCompletedTasks() {
  return mockTasks.filter((task) => task.status === "completed");
}
