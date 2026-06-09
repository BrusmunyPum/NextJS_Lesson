import { notFound } from "next/navigation";
import Link from "next/link";
import { TaskDetailCard } from "@/components/tasks/task-detail-card";
import { getTaskById } from "@/features/tasks/data/task-queries";

// This part receives the route parameter:
type TaskDetailPageProps = {
  params: Promise<{
    taskId: string;
  }>;
};

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { taskId } = await params; // This part gets the value from the URL
  const task = await getTaskById(taskId);
  if (!task) {
    notFound();
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/tasks"
          className="text-sm font-medium text-blue-400 hover:text-blue-300"
        >
          Back to tasks
        </Link>

        <h2 className="mt-4 text-3xl font-bold tracking-tight">{task.title}</h2>

        <p className="mt-2 text-slate-300">
          Task detail page for task ID: {task.id}
        </p>
      </div>
      <TaskDetailCard task={task} />
    </section>
  );
}
