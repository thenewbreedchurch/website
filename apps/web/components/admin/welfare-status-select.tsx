"use client";

import { useTransition } from "react";
import { Select } from "@/components/ui/select";
import type { WelfareStatus } from "@nb-church/db";
import { WELFARE_STATUS_LABELS, labelEntries } from "@/lib/welfare";

export function WelfareStatusSelect({
  id,
  status,
  action,
}: {
  id: string;
  status: WelfareStatus;
  action: (id: string, status: WelfareStatus) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <Select
      className="h-8 w-auto text-xs"
      defaultValue={status}
      disabled={isPending}
      aria-label="Request status"
      onChange={(e) => startTransition(() => action(id, e.target.value as WelfareStatus))}
    >
      {labelEntries(WELFARE_STATUS_LABELS).map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </Select>
  );
}
