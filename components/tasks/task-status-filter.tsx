"use client";

import { Task, TaskStatus } from "@/features/tasks/types";
import { useState } from "react";

type FilterValue = "all" | TaskStatus | "high-priority";

type TaskStatusFilterProps = {
  tasks: Task[];
};

const filters: {
  label: string;
  value: FilterValue;
}[] = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Todo",
    value: "todo",
  },
  {
    label: "In Progress",
    value: "in-progress",
  },
  {
    label: "Completed",
    value: "completed",
  },
  {
    label: "High Priority",
    value: "high-priority",
  },
];

export function TaskStatusFilter({ tasks }: TaskStatusFilterProps) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");

  // const filteredTasks =
  //   activeFilter === "all"
  //     ? tasks
  //     : tasks.filter((task) => task.status === activeFilter);

  const filteredTasks = activeFilter === "all" ?
    tasks : activeFilter === "high-priority" ?
      tasks.filter((task)=>task.priority === "high") : tasks.filter((task)=>task.status === activeFilter);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={
                isActive
                  ? "rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white"
                  : "rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
              }
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <p className="text-sm text-slate-400">
        Showing {filteredTasks.length} of {tasks.length} tasks
      </p>

      <div className="grid gap-4">
        {filteredTasks.map((task) => (
          <article
            key={task.id}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {task.title}
                </h3>

                {task.description ? (
                  <p className="mt-2 text-sm text-slate-400">
                    {task.description}
                  </p>
                ) : null}
              </div>

              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                {task.status}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
              <span>Priority: {task.priority}</span>
              <span>Assignee: {task.assigneeName}</span>
              <span>Due: {task.dueDate}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
