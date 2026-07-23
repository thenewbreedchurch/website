"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { testimonySchema } from "@/lib/admin-validation";
import type { ActionResult } from "@/lib/action-result";

export async function createTestimonyAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = testimonySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;

  await prisma.testimony.create({
    data: {
      ...d,
      authorPhotoUrl: d.authorPhotoUrl ?? null,
      publishedAt: d.isApproved ? new Date() : null,
    },
  });
  revalidatePath("/");
  return { ok: true, message: "Testimony created." };
}

export async function updateTestimonyAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = testimonySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;

  const existing = await prisma.testimony.findUnique({ where: { id } });
  await prisma.testimony.update({
    where: { id },
    data: {
      ...d,
      authorPhotoUrl: d.authorPhotoUrl ?? null,
      // Set publishedAt the first time a testimony is approved; don't clear
      // it if later unapproved, so re-approving keeps its original date.
      publishedAt: d.isApproved && !existing?.publishedAt ? new Date() : existing?.publishedAt,
    },
  });
  revalidatePath("/");
  return { ok: true, message: "Testimony updated." };
}

/** One-click approve toggle from the list page — same effect as editing isApproved via the form. */
export async function toggleTestimonyApprovalAction(id: string): Promise<void> {
  await requireAdmin();
  const existing = await prisma.testimony.findUniqueOrThrow({ where: { id } });
  await prisma.testimony.update({
    where: { id },
    data: {
      isApproved: !existing.isApproved,
      publishedAt: !existing.isApproved && !existing.publishedAt ? new Date() : existing.publishedAt,
    },
  });
  revalidatePath("/");
}

export async function deleteTestimonyAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.testimony.delete({ where: { id } });
  revalidatePath("/");
}
