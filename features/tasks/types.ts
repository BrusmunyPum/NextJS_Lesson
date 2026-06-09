export type TaskStatus = "todo" | "in-progress" | "completed";

export type TaskPriority = "low" | "medium" | "high";

export type Task = {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
    assigneeName: string;
};