"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export function DashboardSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  // useAuth now reads from AuthContext — no extra fetch
  const { user, logout } = useAuth();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
        aria-label="Open menu"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-800 bg-slate-900
          transition-transform duration-200 lg:static lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-blue-400">Dashboard</p>
            <p className="text-sm font-bold text-white">Task Management</p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1 text-slate-400 transition hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <DashboardNav onNavigate={() => setIsOpen(false)} />
        </div>

        <div className="border-t border-slate-800 px-4 py-4">
          {user && (
            <div className="mb-3">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
            </div>
          )}
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-xl border border-slate-700 py-2 text-sm text-slate-400 transition hover:border-red-800 hover:text-red-400"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
