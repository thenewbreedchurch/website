"use client";

import { useTransition } from "react";
import { Select } from "@/components/ui/select";

export function StatusSelectGeneric<T extends string>({
  id,
  status,
  options,
  action,
  label,
}: {
  id: string;
  status: T;
  options: { value: T; label: string }[];
  action: (id: string, status: T) => Promise<void>;
  label: string;
}) {
  const [pending, start] = useTransition();
  return (
    <Select className="h-8 w-auto text-xs" defaultValue={status} disabled={pending} aria-label={label} onChange={(e) => start(() => action(id, e.target.value as T))}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </Select>
  );
}
