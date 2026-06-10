"use client";

import { useState } from "react";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskEmptyState } from "@/components/tasks/task-empty-state";
import { TaskSearchInput } from "@/components/tasks/task-search-input";
import type { Task, TaskStatus } from "@/features/tasks/types";
import { TaskFilterButton } from "@/components/tasks/task-filter-button";
import { TaskCount } from "@/components/tasks/task-count";

type FilterValue = "all" | TaskStatus;

type TaskInteractiveListProps = {
  tasks: Task[];
};

const filters: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
];

export function TaskInteractiveList({ tasks }: TaskInteractiveListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [searchText, setSearchText] = useState("");

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      activeFilter === "all" || task.status === activeFilter;
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchText.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <section className="flex flex-col gap-5">
      <TaskSearchInput value={searchText} onChange={setSearchText} />

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <TaskFilterButton
            key={filter.value}
            label={filter.label}
            value={filter.value}
            activeValue={activeFilter}
            onSelect={setActiveFilter}
          />
        ))}
      </div>

      <TaskCount
        visibleCount={filteredTasks.length}
        totalCount={tasks.length}
      />

      {filteredTasks.length === 0 ? (
        <TaskEmptyState
          title="No tasks found"
          description="Try changing your search text or selected filter."
        />
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </section>
  );
}
