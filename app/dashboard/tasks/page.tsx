import type { Metadata } from "next";
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

  // Validate — ignore unknown status values from URL
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
