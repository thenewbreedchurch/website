"use server";

import { revalidatePath } from "next/cache";
import { fromZonedTime } from "date-fns-tz";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { announcementSchema } from "@/lib/admin-validation";
import { CHURCH_TZ } from "@/lib/announcements";
import type { ActionResult } from "@/lib/action-result";

function revalidateAnnouncementPaths(slug?: string) {
  revalidatePath("/announcements");
  revalidatePath("/");
  if (slug) revalidatePath(`/announcements/${slug}`);
}

function toData(parsed: ReturnType<typeof announcementSchema.safeParse>) {
  if (!parsed.success) return null;
  const d = parsed.data;
  // datetime-local inputs have no timezone offset — the admin panel is used
  // by Lagos-based staff entering Lagos-local times, so interpret them as
  // Africa/Lagos rather than the server process's own timezone (UTC on
  // Vercel), or a Sunday 9am entry would silently store as 9am UTC = 10am
  // Lagos.
  return {
    ...d,
    startDateTime: fromZonedTime(d.startDateTime, CHURCH_TZ),
    endDateTime: d.endDateTime ? fromZonedTime(d.endDateTime, CHURCH_TZ) : null,
    registrationDeadline: d.registrationDeadline
      ? fromZonedTime(d.registrationDeadline, CHURCH_TZ)
      : null,
    capacity: d.capacity ?? null,
    recurrenceRule: d.recurrenceRule ?? null,
    location: d.location ?? null,
    onlineUrl: d.onlineUrl ?? null,
    heroImageUrl: d.heroImageUrl ?? null,
  };
}

export async function createAnnouncementAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = announcementSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = toData(parsed)!;

  const existing = await prisma.announcement.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return { ok: false, error: "An announcement with this slug already exists.", fieldErrors: { slug: ["Already in use"] } };
  }

  await prisma.announcement.create({ data });
  revalidateAnnouncementPaths(data.slug);
  return { ok: true, message: "Announcement created." };
}

export async function updateAnnouncementAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = announcementSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = toData(parsed)!;

  await prisma.announcement.update({ where: { id }, data });
  revalidateAnnouncementPaths(data.slug);
  return { ok: true, message: "Announcement updated." };
}

export async function deleteAnnouncementAction(id: string): Promise<void> {
  await requireAdmin();
  const deleted = await prisma.announcement.delete({ where: { id } });
  revalidateAnnouncementPaths(deleted.slug);
}
