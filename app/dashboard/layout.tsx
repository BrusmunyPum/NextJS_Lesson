import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import React from "react";

export const metadata: Metadata = {
  title: "Dashboard | Task Management Frontend",
  description: "Manage tasks, reports, and settings.",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardShell>{children}</DashboardShell>;
}
