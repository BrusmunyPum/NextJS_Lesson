import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TaskDetailCard } from "@/components/tasks/task-detail-card";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { getTaskById, getTasks } from "@/features/tasks/data/task-queries";

type TaskDetailPageProps = {
  params: Promise<{ taskId: string }>;
};

// generateMetadata and the page both need the task — Next.js deduplicates
// the fetch automatically when using the same URL + options.
export async function generateMetadata({ params }: TaskDetailPageProps): Promise<Metadata> {
  const { taskId } = await params;
  const task = await getTaskById(taskId);
  if (!task) return { title: "Task Not Found" };
  return {
    title: task.title,
    description: task.description ?? `Task details for ${task.title}`,
  };
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { taskId } = await params;

  // Parallel fetch — task detail and all tasks run at the same time
  const [task, allTasks] = await Promise.all([
    getTaskById(taskId),
    getTasks(),
  ]);

  if (!task) notFound();

  // Related tasks — same assignee, different task
  const relatedTasks = allTasks
    .filter((t) => t.assigneeName === task.assigneeName && t.id !== task.id)
    .slice(0, 3);

  return (
    <section className="flex flex-col gap-6">
      {/* Back link */}
      <Link
        href="/dashboard/tasks"
        className="w-fit text-sm font-medium text-blue-400 hover:text-blue-300"
      >
        ← Back to tasks
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
        <div className="flex items-center gap-3">
          <TaskStatusBadge status={task.status} />
          <span className="text-sm text-slate-400">
            Assigned to {task.assigneeName} · Due {task.dueDate}
          </span>
        </div>
      </div>

      {/* Task detail */}
      <TaskDetailCard task={task} />

      {/* Related tasks — same assignee */}
      {relatedTasks.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-lg font-semibold">
            Other tasks by {task.assigneeName}
          </h2>
          <div className="flex flex-col gap-3">
            {relatedTasks.map((related) => (
              <Link
                key={related.id}
                href={`/dashboard/tasks/${related.id}`}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 transition hover:border-slate-700"
              >
                <span className="text-sm font-medium text-white">
                  {related.title}
                </span>
                <TaskStatusBadge status={related.status} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
