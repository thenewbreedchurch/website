"use client";

import { useState, useTransition } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { verifyEmailAction } from "@/actions/admin-auth";
import { AuthCard } from "@/components/admin/auth-card";

// Deliberately NOT consumed as a side effect of rendering this page (that
// was the previous implementation, and it was a real bug: the single-use
// token would get burned by any link-scanner, email security gateway, or
// browser prefetcher that follows the emailed link before the admin
// actually clicks it, breaking verification for the real user). Consuming
// only happens on an explicit button click, matching the pattern already
// used correctly by the sibling reset-password page.
export default function VerifyEmailPage() {
  const params = useParams<{ token: string }>();
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleVerify() {
    startTransition(async () => {
      const res = await verifyEmailAction(params.token);
      setResult(res.ok ? { ok: true } : { ok: false, error: res.error });
    });
  }

  return (
    <AuthCard title="Email Verification" center>
      {result?.ok ? (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 admin-dark:bg-green-500/10 admin-dark:text-green-400">
          Your email address has been verified.
        </p>
      ) : result && !result.ok ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 admin-dark:bg-red-500/10 admin-dark:text-red-400">
          {result.error}
        </p>
      ) : (
        <>
          <p className="text-sm text-neutral-600 admin-dark:text-neutral-400">
            Click below to verify your admin account email address.
          </p>
          <button
            type="button"
            onClick={handleVerify}
            disabled={isPending}
            className="mt-6 w-full rounded-lg bg-brand-700 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-brand-800 disabled:opacity-60 admin-dark:bg-brand-600 admin-dark:hover:bg-brand-500"
          >
            {isPending ? "Verifying…" : "Verify my email"}
          </button>
        </>
      )}

      <Link
        href="/admin/login"
        className="mt-6 inline-block text-sm text-brand-700 hover:underline admin-dark:text-brand-300"
      >
        Back to sign in
      </Link>
    </AuthCard>
  );
}
