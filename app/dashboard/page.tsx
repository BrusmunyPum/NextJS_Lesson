import { StatCard } from "@/components/dashboard/stat-card";
import { RecentTaskList } from "@/components/tasks/recent-task-list";
import { PageHeader } from "@/components/ui/page-header";
import { getTasks, getCompletedTasks } from "@/features/tasks/data/task-queries";
import type { DashboardStat } from "@/features/tasks/types";

export default async function DashboardPage() {
  // Fetch both in parallel — faster than awaiting one then the other
  const [tasks, completedTasks] = await Promise.all([
    getTasks(),
    getCompletedTasks(),
  ]);

  const dashboardStats: DashboardStat[] = [
    { title: "Total Tasks", value: tasks.length, description: "All tasks in your workspace" },
    { title: "In Progress", value: tasks.filter((t) => t.status === "in-progress").length, description: "Tasks currently being worked on" },
    { title: "Completed", value: completedTasks.length, description: "Tasks finished successfully" },
    { title: "Overdue", value: 0, description: "Tasks that need attention" },
  ];

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Overview"
        description="Welcome back. Here's what's happening with your tasks."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
          />
        ))}
      </div>

      <RecentTaskList tasks={tasks} />
    </section>
  );
}
