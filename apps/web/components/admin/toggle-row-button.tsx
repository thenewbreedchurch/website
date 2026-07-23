"use client";

import { useTransition } from "react";

export function ToggleRowButton({
  id,
  action,
  label,
}: {
  id: string;
  action: (id: string) => Promise<void>;
  label: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => action(id))}
      className="text-xs font-medium text-brand-700 hover:underline disabled:opacity-50"
    >
      {label}
    </button>
  );
}
