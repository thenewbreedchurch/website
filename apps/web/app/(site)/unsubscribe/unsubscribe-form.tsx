"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { unsubscribeAction } from "@/actions/subscribe";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

// Deliberately not consumed as a side effect of rendering this page — see
// unsubscribeAction's own comment in actions/subscribe.ts. Only runs on an
// explicit click, so an email security scanner or link-prefetcher following
// the emailed link can't silently unsubscribe someone before they choose to.
export function UnsubscribeForm() {
  const token = useSearchParams().get("token");
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleUnsubscribe() {
    if (!token) return;
    startTransition(async () => {
      const res = await unsubscribeAction(token);
      setResult(res.ok ? { ok: true } : { ok: false, error: res.error });
    });
  }

  return (
    <section className="flex min-h-[55vh] items-center py-20">
      <Container className="max-w-md text-center">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Unsubscribe</h1>

        {!token ? (
          <p className="mt-4 text-current/70">
            This unsubscribe link is missing its token — please use the link from your email
            directly.
          </p>
        ) : result?.ok ? (
          <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400">
            You&apos;ve been unsubscribed from our newsletter. Sorry to see you go.
          </p>
        ) : result && !result.ok ? (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
            {result.error}
          </p>
        ) : (
          <>
            <p className="mt-4 text-current/70">
              Click below to unsubscribe from The New Breed Church newsletter. You can always
              resubscribe later from our homepage.
            </p>
            <Button onClick={handleUnsubscribe} disabled={isPending} className="mt-6">
              {isPending ? "Unsubscribing…" : "Unsubscribe me"}
            </Button>
          </>
        )}

        <div className="mt-8">
          <Link href="/" className="text-sm text-brand-700 hover:underline dark:text-brand-300">
            Back to homepage
          </Link>
        </div>
      </Container>
    </section>
  );
}
