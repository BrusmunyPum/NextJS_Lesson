import type { Task } from "@/features/tasks/types";

type TaskDetailCardProps = {
  task: Task;
};

export function TaskDetailCard({ task }: TaskDetailCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <dl className="grid gap-5 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-slate-400">Status</dt>
          <dd className="mt-1 font-medium text-white">{task.status}</dd>
        </div>

        <div>
          <dt className="text-sm text-slate-400">Priority</dt>
          <dd className="mt-1 font-medium text-white">{task.priority}</dd>
        </div>

        <div>
          <dt className="text-sm text-slate-400">Assignee</dt>
          <dd className="mt-1 font-medium text-white">{task.assigneeName}</dd>
        </div>

        <div>
          <dt className="text-sm text-slate-400">Due Date</dt>
          <dd className="mt-1 font-medium text-white">{task.dueDate}</dd>
        </div>
      </dl>

      <div className="mt-6 border-t border-slate-800 pt-6">
        <h3 className="font-semibold">Description</h3>
        <p className="mt-2 text-slate-300">
          {task.description ?? "No description provided."}
        </p>
      </div>
    </div>
  );
}
