export default function TaskDetailLoading() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <div className="h-5 w-28 rounded bg-slate-800" />

        <div className="mt-4 h-9 w-72 rounded bg-slate-800" />

        <div className="mt-3 h-5 w-80 rounded bg-slate-800" />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <div className="h-4 w-16 rounded bg-slate-800" />
            <div className="mt-2 h-5 w-24 rounded bg-slate-800" />
          </div>

          <div>
            <div className="h-4 w-16 rounded bg-slate-800" />
            <div className="mt-2 h-5 w-24 rounded bg-slate-800" />
          </div>

          <div>
            <div className="h-4 w-20 rounded bg-slate-800" />
            <div className="mt-2 h-5 w-32 rounded bg-slate-800" />
          </div>

          <div>
            <div className="h-4 w-20 rounded bg-slate-800" />
            <div className="mt-2 h-5 w-32 rounded bg-slate-800" />
          </div>
        </div>

        <div className="mt-6 border-t border-slate-800 pt-6">
          <div className="h-5 w-28 rounded bg-slate-800" />
          <div className="mt-3 h-4 w-full rounded bg-slate-800" />
          <div className="mt-2 h-4 w-2/3 rounded bg-slate-800" />
        </div>
      </div>
    </section>
  );
}
