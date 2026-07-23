"use server";

import { updateTag } from "next/cache";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { invalidateCache } from "@/lib/cache";
import { churchSettingsSchema, serviceTimeSchema } from "@/lib/admin-validation";
import type { ActionResult } from "@/lib/action-result";

// Every write here MUST invalidate both the Redis cache and the Next.js
// ISR tag for church-settings/service-times (see lib/settings.ts's own
// HANDOFF.md note) — otherwise public pages can show stale data for up to
// 120s after an edit, which defeats the point of an admin panel.

export async function updateChurchSettingsAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = churchSettingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.churchSettings.update({ where: { id: "singleton" }, data: parsed.data });

  await invalidateCache("church-settings");
  updateTag("church-settings");

  return { ok: true, message: "Settings saved." };
}

export async function createServiceTimeAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = serviceTimeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.serviceTime.create({ data: parsed.data });
  await invalidateCache("service-times");
  updateTag("service-times");

  return { ok: true, message: "Service time created." };
}

export async function updateServiceTimeAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = serviceTimeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.serviceTime.update({ where: { id }, data: parsed.data });
  await invalidateCache("service-times");
  updateTag("service-times");

  return { ok: true, message: "Service time updated." };
}

export async function deleteServiceTimeAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.serviceTime.delete({ where: { id } });
  await invalidateCache("service-times");
  updateTag("service-times");
}
