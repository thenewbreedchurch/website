"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@nb-church/db";
import type { WelfareStatus } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import type { ActionResult } from "@/lib/action-result";

const STATUSES = ["NEW", "IN_REVIEW", "ASSISTED", "CLOSED"] as const;

export async function setWelfareStatusAction(id: string, status: WelfareStatus): Promise<void> {
  await requireAdmin();
  if (!STATUSES.includes(status)) return;
  await prisma.welfareRequest.update({ where: { id }, data: { status } });
  revalidatePath("/admin/welfare-requests");
  revalidatePath(`/admin/welfare-requests/${id}`);
}

const notesSchema = z.object({ adminNotes: z.string().trim().max(4000).optional() });

export async function saveWelfareNotesAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = notesSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Notes are too long.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  await prisma.welfareRequest.update({
    where: { id },
    data: { adminNotes: parsed.data.adminNotes || null },
  });
  revalidatePath(`/admin/welfare-requests/${id}`);
  return { ok: true, message: "Notes saved." };
}

/** Permanently removes a request (e.g. once assisted and no longer needed). Redirects back to the list. */
export async function deleteWelfareRequestAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.welfareRequest.delete({ where: { id } });
  revalidatePath("/admin/welfare-requests");
  redirect("/admin/welfare-requests");
}
