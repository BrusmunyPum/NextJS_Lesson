type TaskCountProps = {
  visibleCount: number;
  totalCount: number;
};

export function TaskCount({ visibleCount, totalCount }: TaskCountProps) {
  return (
    <p className="text-sm text-slate-400">
      Showing {visibleCount} of {totalCount} tasks
    </p>
  );
}
