"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changePasswordAction } from "@/actions/admin-auth";

export function ChangePasswordForm({ forced }: { forced: boolean }) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    startTransition(async () => {
      const result = await changePasswordAction(currentPassword, newPassword);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 1500);
    });
  }

  if (success) {
    return (
      <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 admin-dark:bg-green-500/10 admin-dark:text-green-400">
        Password updated. Redirecting…
      </p>
    );
  }

  return (
    <div className="max-w-sm">
      {forced ? (
        <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 admin-dark:bg-amber-500/10 admin-dark:text-amber-400">
          You must set a new password before continuing.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-neutral-700 admin-dark:text-neutral-300">
            Current password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700 admin-dark:border-neutral-700 admin-dark:bg-neutral-900 admin-dark:text-neutral-100"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700 admin-dark:text-neutral-300">
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
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700 admin-dark:border-neutral-700 admin-dark:bg-neutral-900 admin-dark:text-neutral-100"
          />
          <p className="mt-1 text-xs text-neutral-500 admin-dark:text-neutral-400">
            At least 12 characters, with a letter and a number.
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 admin-dark:text-neutral-300">
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
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700 admin-dark:border-neutral-700 admin-dark:bg-neutral-900 admin-dark:text-neutral-100"
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
          className="w-full rounded-md bg-brand-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-800 disabled:opacity-60 admin-dark:bg-brand-600 admin-dark:hover:bg-brand-500"
        >
          {isPending ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
