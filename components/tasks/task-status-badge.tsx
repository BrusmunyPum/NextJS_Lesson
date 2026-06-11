import type { TaskStatus } from "@/features/tasks/types";

type TaskStatusBadgeProps = {
  status: TaskStatus;
};

const statusStyles: Record<TaskStatus, string> = {
  "todo": "bg-slate-800 text-slate-300",
  "in-progress": "bg-blue-900/50 text-blue-300",
  "completed": "bg-green-900/50 text-green-300",
};

const statusLabels: Record<TaskStatus, string> = {
  "todo": "Todo",
  "in-progress": "In Progress",
  "completed": "Completed",
};

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
