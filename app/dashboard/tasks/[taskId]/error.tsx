"use client";

import Link from "next/link";
import { useEffect } from "react";

type TaskDetailErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function TaskDetailError({ error, reset }: TaskDetailErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="rounded-2xl border border-red-900/60 bg-red-950/30 p-6">
      <p className="text-sm font-medium uppercase tracking-wide text-red-300">
        Task Detail Error
      </p>

      <h2 className="mt-3 text-2xl font-bold text-white">
        Something went wrong while loading this task.
      </h2>

      <p className="mt-3 max-w-2xl text-sm text-red-100/80">
        The task detail page could not be loaded. This may be temporary, so you
        can try again.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400"
        >
          Try again
        </button>

        <Link
          href="/dashboard/tasks"
          className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
        >
          Back to tasks
        </Link>
      </div>
    </section>
  );
}
