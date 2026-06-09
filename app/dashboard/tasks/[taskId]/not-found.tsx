import Link from "next/link";

export default function TaskNotFound() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm font-medium uppercase tracking-wide text-blue-400">
        Task Not Found
      </p>

      <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
        We could not find this task.
      </h2>

      <p className="mt-3 max-w-2xl text-slate-300">
        The task may have been deleted, moved, or the URL may be incorrect.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/dashboard/tasks"
          className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-400"
        >
          Back to tasks
        </Link>

        <Link
          href="/dashboard"
          className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
        >
          Go to dashboard
        </Link>
      </div>
    </section>
  );
}
