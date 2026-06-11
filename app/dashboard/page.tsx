import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { getCompletedTasks } from "@/features/tasks/data/task-queries";
import type { DashboardStat } from "@/features/tasks/types";

const dashboardStats: DashboardStat[] = [
  { title: "Total Tasks", value: 24, description: "All tasks in your workspace" },
  { title: "In Progress", value: 8, description: "Tasks currently being worked on" },
  { title: "Completed", value: 16, description: "Tasks finished successfully" },
  { title: "Overdue", value: 3, description: "Tasks that need attention" },
];

export default function DashboardPage() {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Overview"
        description={`Completed tasks: ${getCompletedTasks().length}`}
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
    </section>
  );
}
