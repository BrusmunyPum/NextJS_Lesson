import type { Metadata } from "next";
import { TaskForm } from "@/components/tasks/task-form";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "New Task",
};

export default function NewTaskPage() {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Task Management"
        title="Create New Task"
        description="Fill in the details below to add a new task to your workspace."
      />

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <TaskForm />
      </div>
    </section>
  );
}
