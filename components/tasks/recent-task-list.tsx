import type { Task } from "@/features/tasks/types";
import Link from "next/link";

type RecentTaskListProps = {
  tasks: Task[];
};

export function RecentTaskList({ tasks }: RecentTaskListProps) {
  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-white">Recent Tasks</h2>
        <p className="mt-1 text-sm text-slate-400">
          Latest tasks in your workspace
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {recentTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-white">{task.title}</p>
              <p className="mt-1 text-xs text-slate-500">
                {task.assigneeName} · Due {task.dueDate}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                {task.status}
              </span>
              <Link
                href={`/dashboard/tasks/${task.id}`}
                className="text-xs font-medium text-blue-400 transition hover:text-blue-300"
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
