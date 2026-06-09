import { StatCard } from "@/components/dashboard/stat-card";
import { getCompletedTasks } from "@/features/tasks/data/task-queries";

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
];

export default function DashboardPage() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="mt-2 text-slate-300">
          This dashboard overview shows high-level task statistics.
        </p>
        <p className="text-slate-300">
          Completed task count: {getCompletedTasks().length}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
          />
        ))}
      </div>
    </section>
  );
}
