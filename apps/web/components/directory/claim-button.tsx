"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { claimVendorAction } from "@/actions/directory-vendor";

export function ClaimButton({ vendorId }: { vendorId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <span className="flex items-center gap-3">
      {error && (
        <span role="alert" className="text-xs text-red-600">
          {error}
        </span>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await claimVendorAction(vendorId);
            if (res.ok) router.refresh();
            else setError(res.error);
          })
        }
        className="inline-flex h-10 items-center rounded-none bg-brand-700 px-5 text-xs font-bold uppercase tracking-tight text-white hover:bg-brand-800 disabled:opacity-60"
      >
        {pending ? "Claiming…" : "Claim this listing"}
      </button>
    </span>
  );
}
