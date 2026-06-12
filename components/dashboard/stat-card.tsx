import { memo } from "react";

type StatCardProps = {
  title: string;
  value: number;
  description: string;
};

// memo — stat cards only re-render when their number changes.
// The dashboard fetches data once; these cards never need to re-render
// unless the parent passes new values.
export const StatCard = memo(function StatCard({ title, value, description }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm font-medium text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
});
