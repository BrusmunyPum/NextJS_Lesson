import { z } from "zod";

// Zod schema — defines the shape AND validation rules for a task form
export const TaskFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be under 100 characters"),

  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .optional(),

  status: z.enum(["todo", "in-progress", "completed"], {
    errorMap: () => ({ message: "Please select a valid status" })
  }),

  priority: z.enum(["low", "medium", "high"], {
    errorMap: () => ({ message: "Please select a valid priority" })
  }),

  dueDate: z
    .string()
    .min(1, "Due date is required"),

  assigneeName: z
    .string()
    .min(1, "Assignee name is required")
    .max(50, "Name must be under 50 characters")
});

// Derive the TypeScript type from the schema — no duplication
// TaskFormData has exactly the same shape as TaskFormSchema
export type TaskFormData = z.infer<typeof TaskFormSchema>;
