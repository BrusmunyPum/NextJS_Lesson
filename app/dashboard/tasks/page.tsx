import type { Metadata } from "next";
import Link from "next/link";
import { TaskInteractiveList } from "@/components/tasks/task-interactive-list";
import { PageHeader } from "@/components/ui/page-header";
import { getTasks } from "@/features/tasks/data/task-queries";
import type { TaskStatus } from "@/features/tasks/types";

export const metadata: Metadata = {
  title: "Tasks",
};

type TasksPageProps = {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
};

const VALID_STATUSES: TaskStatus[] = ["todo", "in-progress", "completed"];

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const tasks = await getTasks();
  const { status, search, page } = await searchParams;

  const activeStatus =
    status && VALID_STATUSES.includes(status as TaskStatus)
      ? (status as TaskStatus)
      : undefined;

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Task Management"
        title="Tasks"
        description="Browse, search, and filter all tasks in your workspace."
        action={
          <Link
            href="/dashboard/tasks/new"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            + New Task
          </Link>
        }
      />
      <TaskInteractiveList
        tasks={tasks}
        initialStatus={activeStatus}
        initialSearch={search ?? ""}
        initialPage={page ? Math.max(1, parseInt(page)) : 1}
      />
    </section>
  );
}
