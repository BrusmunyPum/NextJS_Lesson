type TaskFilterButtonProps<Tvalue extends string> = {
  label: string;
  value: Tvalue;
  activeValue: Tvalue;
  onSelect: (value: Tvalue) => void;
};

export function TaskFilterButton<Tvalue extends string>({
  label,
  value,
  activeValue,
  onSelect,
}: TaskFilterButtonProps<Tvalue>) {
  const isActive = value === activeValue;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={
        isActive
          ? "rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white"
          : "rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
      }
    >
      {label}
    </button>
  );
}
