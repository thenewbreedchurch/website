"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { staffMemberSchema } from "@/lib/admin-validation";
import type { ActionResult } from "@/lib/action-result";

function revalidateStaffPaths() {
  revalidatePath("/about");
  revalidatePath("/leadership");
}

export async function createStaffMemberAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = staffMemberSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.staffMember.create({ data: parsed.data });
  revalidateStaffPaths();
  return { ok: true, message: "Leader added." };
}

export async function updateStaffMemberAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = staffMemberSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.staffMember.update({ where: { id }, data: parsed.data });
  revalidateStaffPaths();
  return { ok: true, message: "Leader updated." };
}

export async function deleteStaffMemberAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.staffMember.delete({ where: { id } });
  revalidateStaffPaths();
}
