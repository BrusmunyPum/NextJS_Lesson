import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Task Management</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to your account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
