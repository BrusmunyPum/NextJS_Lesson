"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof LoginSchema>;

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginData) {
    setServerError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Login failed");
      }

      // Redirect to where they were going, or dashboard
      const from = searchParams.get("from") ?? "/dashboard";
      router.push(from);
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6"
    >
      {serverError && (
        <div className="rounded-xl border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-400">
          {serverError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300">Email</label>
        <input
          type="email"
          placeholder="admin@example.com"
          className={inputClass}
          disabled={isSubmitting}
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300">Password</label>
        <input
          type="password"
          placeholder="••••••••"
          className={inputClass}
          disabled={isSubmitting}
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-center text-xs text-slate-500">
        Demo: admin@example.com / password123
      </p>
    </form>
  );
}
