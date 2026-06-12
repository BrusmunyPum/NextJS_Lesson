import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Task Management",
    default: "Task Management",
  },
  description: "A learning project built with Next.js and TypeScript.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* AuthProvider fetches the current user once and shares it everywhere */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
