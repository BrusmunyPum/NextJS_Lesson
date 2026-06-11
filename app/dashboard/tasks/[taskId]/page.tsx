import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TaskDetailCard } from "@/components/tasks/task-detail-card";
import { getTaskById } from "@/features/tasks/data/task-queries";

type TaskDetailPageProps = {
  params: Promise<{ taskId: string }>;
};

// generateMetadata runs on the server before the page renders
export async function generateMetadata(
  { params }: TaskDetailPageProps,
): Promise<Metadata> {
  const { taskId } = await params;
  const task = await getTaskById(taskId);

  if (!task) {
    return { title: "Task Not Found" };
  }

  return {
    title: task.title,
    // Becomes: "Design dashboard layout | Task Management"
    description: task.description ?? `Task details for ${task.title}`,
  };
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { taskId } = await params;
  const task = await getTaskById(taskId);

  if (!task) notFound();

  return (
    <section className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/tasks"
          className="text-sm font-medium text-blue-400 hover:text-blue-300"
        >
          ← Back to tasks
        </Link>
        <h2 className="mt-4 text-3xl font-bold tracking-tight">{task.title}</h2>
        <p className="mt-2 text-slate-300">Task ID: {task.id}</p>
      </div>
      <TaskDetailCard task={task} />
    </section>
  );
}
