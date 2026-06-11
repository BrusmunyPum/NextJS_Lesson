import type { Task } from "@/features/tasks/types";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import Link from "next/link";

type TaskTableProps = {
  tasks: Task[];
};

const priorityStyles: Record<string, string> = {
  high: "text-red-400",
  medium: "text-yellow-400",
  low: "text-slate-400",
};

export function TaskTable({ tasks }: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-8 text-center">
        <p className="text-sm text-slate-400">No tasks to display.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900">
            <th className="px-4 py-3 text-left font-medium text-slate-400">
              Title
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-400">
              Status
            </th>
            <th className="hidden px-4 py-3 text-left font-medium text-slate-400 sm:table-cell">
              Priority
            </th>
            <th className="hidden px-4 py-3 text-left font-medium text-slate-400 md:table-cell">
              Assignee
            </th>
            <th className="hidden px-4 py-3 text-left font-medium text-slate-400 lg:table-cell">
              Due Date
            </th>
            <th className="px-4 py-3 text-left font-medium text-slate-400">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-950">
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="transition hover:bg-slate-900"
            >
              <td className="px-4 py-3 font-medium text-white">
                <span className="line-clamp-1">{task.title}</span>
              </td>
              <td className="px-4 py-3">
                <TaskStatusBadge status={task.status} />
              </td>
              <td className="hidden px-4 py-3 sm:table-cell">
                <span className={`capitalize font-medium ${priorityStyles[task.priority]}`}>
                  {task.priority}
                </span>
              </td>
              <td className="hidden px-4 py-3 text-slate-300 md:table-cell">
                {task.assigneeName}
              </td>
              <td className="hidden px-4 py-3 text-slate-400 lg:table-cell">
                {task.dueDate}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/dashboard/tasks/${task.id}`}
                  className="text-blue-400 transition hover:text-blue-300"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
