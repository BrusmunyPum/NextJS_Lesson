import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <DashboardSidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar — mobile only */}
        <header className="flex h-16 items-center gap-4 border-b border-slate-800 bg-slate-900 px-5 lg:hidden">
          {/* Hamburger is rendered inside DashboardSidebar */}
          <p className="text-sm font-bold">Task Management</p>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
