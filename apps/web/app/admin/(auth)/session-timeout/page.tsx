"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { invalidateSessionAction } from "@/actions/admin-auth";
import { AuthCard } from "@/components/admin/auth-card";

const REDIRECT_SECONDS = 5;

export default function SessionTimeoutPage() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    // Invalidate the session server-side immediately on mount — this is what
    // actually revokes access; the countdown below is just UX. Awaited (not
    // fire-and-forget) so a failure is at least logged rather than silently
    // swallowed — the user is sent to /admin/login regardless, and
    // getSessionFromCookie() fails closed on the next request either way.
    invalidateSessionAction().catch((err) => {
      console.error("Failed to invalidate session on timeout:", err);
    });
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      router.push("/admin/login");
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, router]);

  return (
    <AuthCard title="Session Expired" center>
      <p className="text-sm text-neutral-600 admin-dark:text-neutral-400">
        Your session has expired due to inactivity. For your security, you&apos;ve been signed
        out.
      </p>
      <p className="mt-2 text-xs text-neutral-400 admin-dark:text-neutral-500">
        Redirecting to sign in in {secondsLeft}s…
      </p>
      <button
        type="button"
        onClick={() => router.push("/admin/login")}
        className="mt-6 w-full rounded-lg bg-brand-700 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-brand-800 admin-dark:bg-brand-600 admin-dark:hover:bg-brand-500"
      >
        Return to sign in
      </button>
    </AuthCard>
  );
}
