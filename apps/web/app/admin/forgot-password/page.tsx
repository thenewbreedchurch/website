"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "@/actions/admin-auth";

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
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-brand-800">Forgot Password</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Enter your admin email and we&apos;ll send you a reset link if an account exists.
        </p>

        {message ? (
          <p className="mt-6 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
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
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
              />
            </div>

            {error ? (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-md bg-brand-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-800 disabled:opacity-60"
            >
              {isPending ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <div className="mt-4 text-center text-sm">
          <Link href="/admin/login" className="text-brand-700 hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
