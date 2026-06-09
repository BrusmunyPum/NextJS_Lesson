import { Task } from "@/features/tasks/types";
import Link from "next/link";

type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{task.title}</h3>

          {task.description ? (
            <p className="mt-2 text-sm text-slate-400">{task.description}</p>
          ) : null}
        </div>

        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
          {task.status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
        <span>Priority: {task.priority}</span>
        <span>Assignee: {task.assigneeName}</span>
        <span>Due: {task.dueDate}</span>
      </div>

      <Link
        href={`/dashboard/tasks/${task.id}`}
        className="mt-4 inline-flex text-sm font-medium text-blue-400 transition hover:text-blue-300"
      >
        View details
      </Link>
    </article>
  );
}
