import type { ActionResult } from "@/lib/action-result";

export function FormStatus({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  if (state.ok) {
    return (
      <p role="status" className="text-sm font-medium text-green-700 dark:text-green-400">
        {state.message ?? "Saved."}
      </p>
    );
  }
  return (
    <p role="alert" className="text-sm font-medium text-red-600">
      {state.error}
    </p>
  );
}
