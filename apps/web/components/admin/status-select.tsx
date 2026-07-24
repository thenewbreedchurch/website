"use client";

import { useTransition } from "react";
import { Select } from "@/components/ui/select";
import type { ContactStatus } from "@nb-church/db";

const STATUS_LABELS: Record<ContactStatus, string> = {
  NEW: "New",
  READ: "Read",
  RESPONDED: "Responded",
};

export function StatusSelect({
  id,
  status,
  action,
}: {
  id: string;
  status: ContactStatus;
  action: (id: string, status: ContactStatus) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <Select
      className="h-8 w-auto text-xs"
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => startTransition(() => action(id, e.target.value as ContactStatus))}
    >
      {(Object.keys(STATUS_LABELS) as ContactStatus[]).map((value) => (
        <option key={value} value={value}>
          {STATUS_LABELS[value]}
        </option>
      ))}
    </Select>
  );
}
