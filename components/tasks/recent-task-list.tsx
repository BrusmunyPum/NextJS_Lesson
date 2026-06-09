import Link from "next/link";
import type { Task, TaskPriority, TaskStatus } from "@/features/tasks/types";

type RecentTaskListProps = {
  tasks: Task[];
};

function getStatusLabel(status: TaskStatus) {
  switch (status) {
    case "todo":
      return "Todo";
    case "in-progress":
      return "In Progress";
    case "completed":
      return "Completed";
  }
}

function getPriorityLabel(priority: TaskPriority) {
  switch (priority) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function RecentTaskList({ tasks }: RecentTaskListProps) {
  await wait(1000);
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Recent Tasks</h2>
        <p className="mt-1 text-sm text-slate-400">
          Click a task to view its detail page.
        </p>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <Link
            key={task.id}
            href={`/dashboard/tasks/${task.id}`}
            className="block rounded-xl border border-slate-800 bg-slate-950 p-4 transition hover:border-blue-500 hover:bg-slate-900"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-medium text-white">{task.title}</h3>

                {task.description ? (
                  <p className="mt-1 text-sm text-slate-400">
                    {task.description}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">
                    No description provided.
                  </p>
                )}
              </div>

              <div className="flex gap-2 text-xs">
                <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">
                  {getStatusLabel(task.status)}
                </span>

                <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">
                  {getPriorityLabel(task.priority)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-1 text-sm text-slate-400 sm:flex-row sm:justify-between">
              <p>Assignee: {task.assigneeName}</p>
              <p>Due: {task.dueDate}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
