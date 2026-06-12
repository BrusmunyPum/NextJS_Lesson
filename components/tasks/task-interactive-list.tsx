"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskTable } from "@/components/tasks/task-table";
import { TaskEmptyState } from "@/components/tasks/task-empty-state";
import { TaskSearchInput } from "@/components/tasks/task-search-input";
import { TaskFilterButton } from "@/components/tasks/task-filter-button";
import { TaskCount } from "@/components/tasks/task-count";
import { Tabs } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import type { Task, TaskStatus } from "@/features/tasks/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterValue = "all" | TaskStatus;

type TaskInteractiveListProps = {
  tasks: Task[];
  initialStatus?: TaskStatus;
  initialSearch?: string;
  initialPage?: number;
};

type FilterState = {
  status: FilterValue;
  search: string;
  page: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export function TaskInteractiveList({
  tasks,
  initialStatus,
  initialSearch = "",
  initialPage = 1,
}: TaskInteractiveListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filterState, setFilterState] = useState<FilterState>({
    status: initialStatus ?? "all",
    search: initialSearch,
    page: initialPage,
  });

  const debouncedSearch = useDebounce(filterState.search, 300);

  // ─── Fix: keep searchParams in a ref ─────────────────────────────────────
  // Problem: updateParams depended on searchParams. When router.replace() ran,
  // searchParams changed → updateParams got a new reference → useEffect fired
  // again → router.replace() again → infinite loop.
  //
  // Solution: read searchParams from a ref inside updateParams. The ref always
  // holds the latest value but is NOT a dependency — so updateParams never
  // gets recreated when the URL changes.
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  // ─── URL sync helper ──────────────────────────────────────────────────────
  // Depends only on router + pathname (stable values) — NOT searchParams.
  const updateParams = useCallback(
    (updates: Partial<Record<"status" | "search" | "page", string | undefined>>) => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname],
  );

  // ─── Fix: skip first render ───────────────────────────────────────────────
  // Problem: useEffect fires on mount even when nothing changed. This caused
  // an immediate router.replace() which triggered a server re-fetch on load.
  //
  // Solution: track first render with a ref. Skip the effect on mount —
  // only fire it when the user actually types (debouncedSearch changes).
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    updateParams({ search: debouncedSearch || undefined, page: undefined });
  }, [debouncedSearch, updateParams]);

  // ─── Event handlers ───────────────────────────────────────────────────────

  function handleFilterChange(value: FilterValue) {
    setFilterState((prev) => ({ ...prev, status: value, page: 1 }));
    updateParams({ status: value === "all" ? undefined : value, page: undefined });
  }

  function handleSearchChange(value: string) {
    setFilterState((prev) => ({ ...prev, search: value, page: 1 }));
  }

  function handlePageChange(page: number) {
    setFilterState((prev) => ({ ...prev, page }));
    updateParams({ page: page === 1 ? undefined : String(page) });
  }

  // ─── Derived data ─────────────────────────────────────────────────────────

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const matchesStatus =
          filterState.status === "all" || task.status === filterState.status;
        const matchesSearch = task.title
          .toLowerCase()
          .includes(filterState.search.toLowerCase());
        return matchesStatus && matchesSearch;
      }),
    [tasks, filterState.status, filterState.search],
  );

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);

  const paginatedTasks = filteredTasks.slice(
    (filterState.page - 1) * ITEMS_PER_PAGE,
    filterState.page * ITEMS_PER_PAGE,
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <section className="flex flex-col gap-5">
      <TaskSearchInput value={filterState.search} onChange={handleSearchChange} />

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <TaskFilterButton
            key={filter.value}
            label={filter.label}
            value={filter.value}
            activeValue={filterState.status}
            onSelect={handleFilterChange}
          />
        ))}
      </div>

      <TaskCount visibleCount={filteredTasks.length} totalCount={tasks.length} />

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
              {activeTab === "table" && <TaskTable tasks={paginatedTasks} />}
              <Pagination
                currentPage={filterState.page}
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
