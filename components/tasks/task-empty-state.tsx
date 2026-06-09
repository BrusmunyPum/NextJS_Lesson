type TaskEmptyStateProps = {
  title: string;
  description: string;
};

export function TaskEmptyState({ title, description }: TaskEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-8 text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>

      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
}
