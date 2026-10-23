"use client";

import { useAdminForm } from "@/lib/use-admin-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormStatus } from "@/components/admin/form-status";
import type { ActionResult } from "@/lib/action-result";

export function CategoryForm({
  category,
  action,
  submitLabel,
}: {
  category?: { name: string; sortOrder: number; subcategories: string[] };
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
}) {
  const { state, formAction, isPending, onFormChange } = useAdminForm(action);
  const err = (f: string) => (state && !state.ok ? state.fieldErrors?.[f]?.[0] : undefined);
  return (
    <form action={formAction} onChange={onFormChange} className="grid gap-3 sm:grid-cols-[1fr_6rem]">
      <div className="space-y-1">
        <Input name="name" defaultValue={category?.name} placeholder="Category name" required aria-label="Category name" />
        {err("name") && <p className="text-xs text-red-600">{err("name")}</p>}
      </div>
      <Input name="sortOrder" type="number" min={0} max={999} defaultValue={category?.sortOrder ?? 0} aria-label="Sort order" />
      <div className="sm:col-span-2">
        <Textarea
          name="subcategories"
          rows={2}
          defaultValue={category?.subcategories.join("\n")}
          placeholder="Subcategories — one per line (suggestions shown on the listing form)"
          aria-label="Subcategories"
        />
      </div>
      <div className="flex items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-9 items-center rounded-none bg-brand-700 px-5 text-xs font-bold uppercase tracking-tight text-white hover:bg-brand-800 disabled:opacity-60"
        >
          {isPending ? "Saving…" : submitLabel}
        </button>
        <FormStatus state={state} />
      </div>
    </form>
  );
}
