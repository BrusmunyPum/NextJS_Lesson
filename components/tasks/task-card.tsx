import { memo } from "react";
import type { Task } from "@/features/tasks/types";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import Link from "next/link";

type TaskCardProps = {
  task: Task;
};

// memo — skips re-render if the task prop reference hasn't changed.
// Since tasks come from useMemo in TaskInteractiveList, changing filters
// only re-renders cards whose task object is new.
export const TaskCard = memo(function TaskCard({ task }: TaskCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-white">
            {task.title}
          </h3>

          {task.description ? (
            <p className="mt-2 line-clamp-2 text-sm text-slate-400">
              {task.description}
            </p>
          ) : null}
        </div>

        <div className="shrink-0">
          <TaskStatusBadge status={task.status} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
        <span>Priority: <span className="capitalize">{task.priority}</span></span>
        <span>Assignee: {task.assigneeName}</span>
        <span>Due: {task.dueDate}</span>
      </div>

      <Link
        href={`/dashboard/tasks/${task.id}`}
        className="mt-4 inline-flex text-sm font-medium text-blue-400 transition hover:text-blue-300"
      >
        View details →
      </Link>
    </article>
  );
});
