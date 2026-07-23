"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { invalidateSessionAction } from "@/actions/admin-auth";

const REDIRECT_SECONDS = 5;

export default function SessionTimeoutPage() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    // Invalidate the session server-side immediately on mount — this is what
    // actually revokes access; the message below is just UX. Fire-and-forget
    // is fine here: there's nothing useful to do with the result, and the
    // user is being sent to /admin/login regardless.
    void invalidateSessionAction();
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
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-brand-800">Session Expired</h1>
        <p className="mt-4 text-sm text-neutral-600">
          Your session has expired due to inactivity. For your security, you&apos;ve been signed
          out.
        </p>
        <p className="mt-2 text-xs text-neutral-400">
          Redirecting to sign in in {secondsLeft}s…
        </p>
        <button
          type="button"
          onClick={() => router.push("/admin/login")}
          className="mt-6 w-full rounded-md bg-brand-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-800"
        >
          Return to sign in
        </button>
      </div>
    </div>
  );
}
