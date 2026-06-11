"use client";

import { useCallback, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskTable } from "@/components/tasks/task-table";
import { TaskEmptyState } from "@/components/tasks/task-empty-state";
import { TaskSearchInput } from "@/components/tasks/task-search-input";
import { TaskFilterButton } from "@/components/tasks/task-filter-button";
import { TaskCount } from "@/components/tasks/task-count";
import { Tabs } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import type { Task, TaskStatus } from "@/features/tasks/types";

type FilterValue = "all" | TaskStatus;

type TaskInteractiveListProps = {
  tasks: Task[];
  initialStatus?: TaskStatus;
  initialSearch?: string;
  initialPage?: number;
};

const filters: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
];

const tabs = [
  { label: "Card View", value: "cards" },
  { label: "Table View", value: "table" },
];

const ITEMS_PER_PAGE = 3;

export function TaskInteractiveList({
  tasks,
  initialStatus,
  initialSearch = "",
  initialPage = 1,
}: TaskInteractiveListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeFilter, setActiveFilter] = useState<FilterValue>(
    initialStatus ?? "all",
  );
  const [searchText, setSearchText] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Update URL search params helper
  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  function handleFilterChange(value: FilterValue) {
    setActiveFilter(value);
    setCurrentPage(1);
    updateParams({
      status: value === "all" ? undefined : value,
      page: undefined,
    });
  }

  function handleSearchChange(value: string) {
    setSearchText(value);
    setCurrentPage(1);
    updateParams({ search: value || undefined, page: undefined });
  }

  function handlePageChange(page: number) {
    setCurrentPage(page);
    updateParams({ page: page === 1 ? undefined : String(page) });
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      activeFilter === "all" || task.status === activeFilter;
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchText.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <section className="flex flex-col gap-5">
      <TaskSearchInput value={searchText} onChange={handleSearchChange} />

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <TaskFilterButton
            key={filter.value}
            label={filter.label}
            value={filter.value}
            activeValue={activeFilter}
            onSelect={handleFilterChange}
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
        <Tabs tabs={tabs} defaultValue="cards">
          {(activeTab) => (
            <div className="flex flex-col gap-4">
              {activeTab === "cards" && (
                <div className="grid gap-4">
                  {paginatedTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
              {activeTab === "table" && (
                <TaskTable tasks={paginatedTasks} />
              )}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </Tabs>
      )}
    </section>
  );
}
