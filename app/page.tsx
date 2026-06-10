import { StatCard } from "@/components/dashboard/stat-card";
import { RecentTaskList } from "@/components/tasks/recent-task-list";
import { mockTasks } from "@/features/tasks/data/mock-tasks";
import Link from "next/link";

const dashboardStats = [
  {
    title: "Total Tasks",
    value: 24,
    description: "All tasks in your workspace",
  },
  {
    title: "In Progress",
    value: 8,
    description: "Tasks currently being worked on",
  },
  {
    title: "Completed",
    value: 16,
    description: "Tasks finished successfully",
  },
  {
    title: "Overdue",
    value: 3,
    description: "Tasks that need attention",
  },
  {
    title: "High Priority",
    value: 5,
    description: "Tasks that should be handled first",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-10">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-400">
            Task Management Frontend
          </p>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Manage your tasks with a clean Next.js dashboard.
          </h1>

          <p className="max-w-2xl text-lg text-slate-300">
            This project will grow step by step into a real frontend application
            with routing, forms, authentication UI, API integration, and
            reusable components.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/tasks"
              className="inline-flex rounded-xl bg-blue-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-400"
            >
              View Tasks
            </Link>
            <Link
              href="/dashboard/reports"
              className="inline-flex rounded-xl bg-slate-800 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
            >
              View Reports
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map((item) => (
            <StatCard
              key={item.title}
              title={item.title}
              value={item.value}
              description={item.description}
            />
          ))}
        </div>

        <RecentTaskList tasks={mockTasks} />
      </section>
    </main>
  );
}
