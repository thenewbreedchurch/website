"use client";

import { useTransition } from "react";
import { Select } from "@/components/ui/select";
import type { VendorStatus } from "@nb-church/db";
import { VENDOR_STATUS_LABELS } from "@/lib/directory";

export function VendorStatusSelect({
  id,
  status,
  action,
}: {
  id: string;
  status: VendorStatus;
  action: (id: string, status: VendorStatus) => Promise<void>;
}) {
  const [pending, start] = useTransition();
  return (
    <Select
      className="h-8 w-auto text-xs"
      defaultValue={status}
      disabled={pending}
      aria-label="Listing status"
      onChange={(e) => start(() => action(id, e.target.value as VendorStatus))}
    >
      {(Object.keys(VENDOR_STATUS_LABELS) as VendorStatus[]).map((v) => (
        <option key={v} value={v}>
          {VENDOR_STATUS_LABELS[v]}
        </option>
      ))}
    </Select>
  );
}

/** A small on/off pill that flips a boolean flag (Verified / Featured). */
export function VendorFlagToggle({
  id,
  flag,
  value,
  label,
  action,
}: {
  id: string;
  flag: "isVerified" | "isFeatured";
  value: boolean;
  label: string;
  action: (id: string, flag: "isVerified" | "isFeatured", value: boolean) => Promise<void>;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={value}
      onClick={() => start(() => action(id, flag, !value))}
      className={
        value
          ? "t-eyebrow border border-brand-700 bg-brand-700 px-2 py-1 text-[10px] text-white disabled:opacity-50"
          : "t-eyebrow border border-neutral-300 px-2 py-1 text-[10px] text-neutral-500 hover:border-brand-500 disabled:opacity-50 admin-dark:border-neutral-700 admin-dark:text-neutral-400"
      }
    >
      {label}
    </button>
  );
}
