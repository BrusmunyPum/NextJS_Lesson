import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    template: "%s | Task Management",
    default: "Task Management"
  },
  description: "A learning project built with Next.js and TypeScript."
};

export default function RootLayout({
                                     children
                                   }: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
    <body>{children}</body>
    </html>
  );
}
