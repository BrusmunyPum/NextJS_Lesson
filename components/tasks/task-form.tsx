"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { TaskFormData } from "@/features/tasks/schemas/task-schema";
import { TaskFormSchema } from "@/features/tasks/schemas/task-schema";
import { Button } from "@/components/ui/button";

// ── Field error helper ────────────────────────────────────────────────────────
// Shows the Zod error message below a field
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

// ── Label helper ──────────────────────────────────────────────────────────────
function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-300">
      {children}
    </label>
  );
}

// ── Input class ───────────────────────────────────────────────────────────────
const inputClass =
  "mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 disabled:opacity-50";

const selectClass =
  "mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 disabled:opacity-50";

// ── Component ─────────────────────────────────────────────────────────────────
export function TaskForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,       // connects <input> to RHF
    handleSubmit,   // runs validation, then calls onSubmit
    formState: { errors, isSubmitting }, // errors per field, submission state
    reset          // clear the form
  } = useForm<TaskFormData>({
    resolver: zodResolver(TaskFormSchema), // plug Zod into RHF
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
      assigneeName: ""
    }
  });

  async function onSubmit(data: TaskFormData) {
    setServerError(null);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to create task");
      }

      // Success — go back to task list
      router.push("/dashboard/tasks");
      router.refresh(); // re-fetch server component data
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Server-level error (e.g. network failure) */}
      {serverError && (
        <div className="rounded-xl border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400">
          {serverError}
        </div>
      )}

      {/* Title */}
      <div>
        <Label htmlFor="title">Title *</Label>
        <input
          id="title"
          type="text"
          placeholder="e.g. Fix login bug"
          className={inputClass}
          disabled={isSubmitting}
          {...register("title")}
        />
        <FieldError message={errors.title?.message} />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          rows={3}
          placeholder="Optional details about this task..."
          className={inputClass}
          disabled={isSubmitting}
          {...register("description")}
        />
        <FieldError message={errors.description?.message} />
      </div>

      {/* Status + Priority — two columns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="status">Status *</Label>
          <select
            id="status"
            className={selectClass}
            disabled={isSubmitting}
            {...register("status")}
          >
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <FieldError message={errors.status?.message} />
        </div>

        <div>
          <Label htmlFor="priority">Priority *</Label>
          <select
            id="priority"
            className={selectClass}
            disabled={isSubmitting}
            {...register("priority")}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <FieldError message={errors.priority?.message} />
        </div>
      </div>

      {/* Due date + Assignee — two columns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="dueDate">Due Date *</Label>
          <input
            id="dueDate"
            type="date"
            className={inputClass}
            disabled={isSubmitting}
            {...register("dueDate")}
          />
          <FieldError message={errors.dueDate?.message} />
        </div>

        <div>
          <Label htmlFor="assigneeName">Assignee *</Label>
          <input
            id="assigneeName"
            type="text"
            placeholder="e.g. Sokha"
            className={inputClass}
            disabled={isSubmitting}
            {...register("assigneeName")}
          />
          <FieldError message={errors.assigneeName?.message} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Task"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={isSubmitting}
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
