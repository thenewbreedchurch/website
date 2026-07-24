"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/actions/admin-auth";
import { AuthCard } from "@/components/admin/auth-card";

const inputClasses =
  "w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/25 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await loginAction(email, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(result.mustChangePassword ? "/admin/change-password" : "/admin");
      router.refresh();
    });
  }

  return (
    <AuthCard title="Admin Sign In" subtitle="The New Breed Church">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-2 ${inputClasses}`}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`mt-2 ${inputClasses}`}
          />
        </div>

        {error ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-brand-700 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-brand-800 disabled:opacity-60 dark:bg-brand-600 dark:hover:bg-brand-500"
        >
          {isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link href="/admin/forgot-password" className="text-brand-700 hover:underline dark:text-brand-300">
          Forgot your password?
        </Link>
      </div>
    </AuthCard>
  );
}
