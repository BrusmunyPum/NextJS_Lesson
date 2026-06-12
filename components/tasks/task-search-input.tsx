"use client";

import { useEffect, useRef } from "react";

type TaskSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function TaskSearchInput({ value, onChange }: TaskSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when the component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []); // empty deps = run once on mount

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <label
        htmlFor="task-search"
        className="text-sm font-medium text-slate-200"
      >
        Search tasks
      </label>

      <input
        ref={inputRef}
        id="task-search"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by task title..."
        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
      />
    </div>
  );
}
