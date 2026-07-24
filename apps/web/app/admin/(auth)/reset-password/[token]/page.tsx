"use client";

import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { resetPasswordAction } from "@/actions/admin-auth";
import { AuthCard } from "@/components/admin/auth-card";

const inputClasses =
  "w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/25 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";

export default function ResetPasswordPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const result = await resetPasswordAction(params.token, newPassword);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/admin/login"), 2500);
    });
  }

  return (
    <AuthCard title="Reset Password">
      {success ? (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400">
          Your password has been reset. All other sessions have been signed out. Redirecting to
          sign in…
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              New password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`mt-2 ${inputClasses}`}
            />
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              At least 12 characters, with a letter and a number.
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {isPending ? "Resetting…" : "Reset password"}
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-sm">
        <Link href="/admin/login" className="text-brand-700 hover:underline dark:text-brand-300">
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  );
}
