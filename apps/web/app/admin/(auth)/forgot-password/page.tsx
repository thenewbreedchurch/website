"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "@/actions/admin-auth";
import { AuthCard } from "@/components/admin/auth-card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await requestPasswordResetAction(email);
      if (result.ok) {
        setMessage(result.message);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <AuthCard
      title="Forgot Password"
      subtitle="Enter your admin email and we'll send you a reset link if an account exists."
    >
      {message ? (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 admin-dark:bg-green-500/10 admin-dark:text-green-400">
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 admin-dark:text-neutral-300">
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
              className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/25 admin-dark:border-neutral-700 admin-dark:bg-neutral-900 admin-dark:text-neutral-100"
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-red-600 admin-dark:text-red-400">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-brand-700 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-brand-800 disabled:opacity-60 admin-dark:bg-brand-600 admin-dark:hover:bg-brand-500"
          >
            {isPending ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-sm">
        <Link href="/admin/login" className="text-brand-700 hover:underline admin-dark:text-brand-300">
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  );
}
