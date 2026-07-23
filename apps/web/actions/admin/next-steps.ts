"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { nextStepSchema } from "@/lib/admin-validation";
import type { ActionResult } from "@/lib/action-result";

function revalidateNextStepPaths() {
  revalidatePath("/first-timers");
  revalidatePath("/new-converts");
}

export async function createNextStepAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = nextStepSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;

  await prisma.nextStep.create({
    data: { ...d, imageUrl: d.imageUrl ?? null, ctaLabel: d.ctaLabel ?? null, ctaUrl: d.ctaUrl ?? null },
  });
  revalidateNextStepPaths();
  return { ok: true, message: "Next step created." };
}

export async function updateNextStepAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = nextStepSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const d = parsed.data;

  await prisma.nextStep.update({
    where: { id },
    data: { ...d, imageUrl: d.imageUrl ?? null, ctaLabel: d.ctaLabel ?? null, ctaUrl: d.ctaUrl ?? null },
  });
  revalidateNextStepPaths();
  return { ok: true, message: "Next step updated." };
}

export async function deleteNextStepAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.nextStep.delete({ where: { id } });
  revalidateNextStepPaths();
}
