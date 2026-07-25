"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

export function DeleteButton({
  action,
  confirmMessage = "Delete this item? This cannot be undone.",
}: {
  action: () => Promise<void>;
  confirmMessage?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (window.confirm(confirmMessage)) {
          startTransition(() => {
            void action();
          });
        }
      }}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 admin-dark:text-red-400 admin-dark:hover:bg-red-950/30"
    >
      <Trash2 size={13} /> Delete
    </button>
  );
}

/** Same as DeleteButton, but binds a `(id) => Promise<void>` server action to a specific row id — avoids needing a per-entity wrapper file. */
export function DeleteRowButton({
  id,
  action,
  confirmMessage,
}: {
  id: string;
  action: (id: string) => Promise<void>;
  confirmMessage?: string;
}) {
  return <DeleteButton action={() => action(id)} confirmMessage={confirmMessage} />;
}
