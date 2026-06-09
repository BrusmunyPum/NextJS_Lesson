import Link from "next/link";
import React from "react";

type DashboardShellProps = {
  children: React.ReactNode;
};

const dashboardNavItems = [
  {
    label: "Overview",
    href: "/dashboard",
  },
  {
    label: "Tasks",
    href: "/dashboard/tasks",
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
  },
  {
    label: "Team",
    href: "/dashboard/team",
  },
];

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-blue-400">
                Dashboard
              </p>
              <h1 className="mt-1 text-2xl font-bold">Task Management</h1>
            </div>

            <nav className="flex flex-wrap gap-3 text-sm">
              {dashboardNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-slate-200 transition hover:bg-slate-700"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
