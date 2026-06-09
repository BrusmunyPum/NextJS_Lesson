// import { notFound } from "next/navigation";
// import { RecentTaskList } from "@/components/tasks/recent-task-list";
// import { mockTasks } from "@/features/tasks/data/mock-tasks";
//
// type TasksPageProps = {
//   searchParams: Promise<{
//     test?: string;
//   }>;
// };
//
// export default async function TasksPage({ searchParams }: TasksPageProps) {
//   const { test } = await searchParams;
//
//   if (test === "error") {
//     throw new Error("Testing app/dashboard/tasks/error.tsx");
//   }
//
//   if (test === "not-found") {
//     notFound();
//   }
//
//   return (
//     <section className="flex flex-col gap-6">
//       <div>
//         <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
//
//         <p className="mt-2 max-w-2xl text-slate-300">
//           This page shows task data using our reusable task list component.
//           Later, this page will support search, filter, sorting, pagination,
//           create, update, and delete actions.
//         </p>
//       </div>
//
//       <RecentTaskList tasks={mockTasks} />
//     </section>
//   );
// }

// import {RecentTaskList} from "@/components/tasks/recent-task-list";
// import {getTasks} from "@/features/tasks/data/task-queries";
//
// export default async function TasksPage() {
//   const tasks = await getTasks();
//
//   return (
//     <section className="flex flex-col gap-6">
//       <div>
//         <p className="text-sm font-medium uppercase tracking-wide text-blue-400">
//           Task Management
//         </p>
//
//         <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
//           Tasks
//         </h1>
//
//         <p className="mt-2 max-w-2xl text-slate-300">
//           This page is a Server Component. It loads task data on the server and
//           renders the task list before sending the UI to the browser.
//         </p>
//       </div>
//       <p className="text-sm text-slate-400">Total tasks: {tasks.length}</p>
//
//       <RecentTaskList tasks={tasks} />
//     </section>
//   );
// }

import { getTasks } from "@/features/tasks/data/task-queries";
import { TaskInteractiveList } from "@/components/tasks/task-interactive-list";

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
          This page is still a Server Component. Only the task filter below is a
          Client Component because it needs user interaction.
        </p>
      </div>

      {/*<TaskStatusFilter tasks={tasks} />*/}
      <TaskInteractiveList tasks={tasks} />
    </section>
  );
}
