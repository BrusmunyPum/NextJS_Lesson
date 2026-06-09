import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm font-medium uppercase tracking-wide text-blue-400">
        Dashboard Page Not Found
      </p>

      <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
        This dashboard page does not exist.
      </h2>

      <p className="mt-3 max-w-2xl text-slate-300">
        The page may have been moved, renamed, or removed. Please go back to the
        dashboard and choose another section.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-400"
        >
          Back to dashboard
        </Link>

        <Link
          href="/dashboard/tasks"
          className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
        >
          View tasks
        </Link>
      </div>
    </section>
  );
}
