"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/features/tasks/types";

const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard" },
  { label: "Tasks", href: "/dashboard/tasks" },
  { label: "Reports", href: "/dashboard/reports" },
  { label: "Settings", href: "/dashboard/settings" },
  { label: "Team", href: "/dashboard/team" },
];

type DashboardNavProps = {
  onNavigate?: () => void;
};

export function DashboardNav({ onNavigate }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === item.href
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={
              isActive
                ? "rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-medium text-white"
                : "rounded-xl px-4 py-2.5 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
