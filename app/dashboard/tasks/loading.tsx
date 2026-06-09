import { mockTasks } from "@/features/tasks/data/mock-tasks";

export default function TasksLoading() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <div className="h-9 w-40 rounded bg-slate-800" />
        <div className="mt-3 h-5 w-96 rounded bg-slate-800" />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-5">
          <div className="h-6 w-32 rounded bg-slate-800" />
          <div className="mt-2 h-4 w-64 rounded bg-slate-800" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: mockTasks.length }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              <div className="h-5 w-56 rounded bg-slate-800" />
              <div className="mt-3 h-4 w-80 rounded bg-slate-800" />
              <div className="mt-4 h-4 w-40 rounded bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
