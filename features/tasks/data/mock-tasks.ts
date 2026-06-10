import type { Task } from "@/features/tasks/types";

export const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Design dashboard layout",
    description: "Create the first dashboard layout with stat cards.",
    status: "in-progress",
    priority: "high",
    dueDate: "2026-02-10",
    assigneeName: "Sokha",
  },
  {
    id: "task-2",
    title: "Create task list page",
    status: "todo",
    priority: "medium",
    dueDate: "2026-02-12",
    assigneeName: "Dara",
  },
  {
    id: "task-3",
    title: "Prepare completed task UI",
    description: "Show how completed tasks should look in the dashboard.",
    status: "completed",
    priority: "low",
    dueDate: "2026-02-15",
    assigneeName: "Malis",
  },
  {
    id: "task-4",
    title: "Build task filter UI",
    status: "todo",
    priority: "high",
    dueDate: "2026-02-18",
    assigneeName: "Rotha",
  },
  {
    id: "task-5",
    title: "Create task detail page",
    description: "Build a dynamic route for viewing one task.",
    status: "completed",
    priority: "high",
    dueDate: "2026-02-20",
    assigneeName: "Rotha",
  },
];
