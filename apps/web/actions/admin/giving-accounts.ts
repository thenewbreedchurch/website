"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { givingAccountSchema } from "@/lib/admin-validation";
import type { ActionResult } from "@/lib/action-result";

export async function createGivingAccountAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = givingAccountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.givingAccount.create({ data: { ...parsed.data, swiftCode: parsed.data.swiftCode ?? null } });
  revalidatePath("/give");
  return { ok: true, message: "Giving account created." };
}

export async function updateGivingAccountAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = givingAccountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.givingAccount.update({
    where: { id },
    data: { ...parsed.data, swiftCode: parsed.data.swiftCode ?? null },
  });
  revalidatePath("/give");
  return { ok: true, message: "Giving account updated." };
}

export async function deleteGivingAccountAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.givingAccount.delete({ where: { id } });
  revalidatePath("/give");
}
