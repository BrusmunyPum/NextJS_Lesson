"use client";

import Link from "next/link";
import { useEffect } from "react";

type TasksPageErrorProps = {
  error: Error & {
    digest?: string;
  };
  unstable_retry: () => void;
};

export default function TasksPageError({
  error,
  unstable_retry,
}: TasksPageErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="rounded-2xl border border-red-900/60 bg-red-950/30 p-6">
      <p className="text-sm font-medium uppercase tracking-wide text-red-300">
        Tasks Page Error
      </p>

      <h2 className="mt-3 text-2xl font-bold text-white">
        Something went wrong while loading tasks.
      </h2>

      <p className="mt-3 max-w-2xl text-sm text-red-100/80">
        We could not load the tasks page right now. This may be a temporary
        problem, so please try again.
      </p>

      {error.digest ? (
        <p className="mt-3 text-xs text-red-200/60">
          Error reference: {error.digest}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400"
        >
          Try again
        </button>

        <Link
          href="/dashboard"
          className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
        >
          Back to dashboard
        </Link>
      </div>
    </section>
  );
}
