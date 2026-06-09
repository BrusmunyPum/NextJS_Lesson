import { TaskInteractiveList } from "@/components/tasks/task-interactive-list";
import { getTasks } from "@/features/tasks/data/task-queries";

export default async function TasksPage() {
  const tasks = await getTasks();

  return (
    <section className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-400">
          Task Management
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Tasks
        </h1>

        <p className="mt-2 max-w-2xl text-slate-300">
          This page is a Server Component. The interactive list handles search
          and filtering in the browser.
        </p>
      </div>

      <TaskInteractiveList tasks={tasks} />
    </section>
  );
}
