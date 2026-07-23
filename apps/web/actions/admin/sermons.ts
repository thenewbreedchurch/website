"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { sermonSchema } from "@/lib/admin-validation";
import type { ActionResult } from "@/lib/action-result";

function revalidateSermonPaths(slug?: string) {
  revalidatePath("/sermons");
  revalidatePath("/");
  if (slug) revalidatePath(`/sermons/${slug}`);
}

function toData(parsed: ReturnType<typeof sermonSchema.safeParse>) {
  if (!parsed.success) return null;
  const d = parsed.data;
  return {
    ...d,
    publishedAt: new Date(d.publishedAt),
    series: d.series ?? null,
    scripture: d.scripture ?? null,
    description: d.description ?? null,
    thumbnailUrl: d.thumbnailUrl ?? null,
    tags: d.tags ? d.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
  };
}

export async function createSermonAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = sermonSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = toData(parsed)!;

  const existing = await prisma.sermon.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return { ok: false, error: "A sermon with this slug already exists.", fieldErrors: { slug: ["Already in use"] } };
  }

  await prisma.sermon.create({ data });
  revalidateSermonPaths(data.slug);
  return { ok: true, message: "Sermon created." };
}

export async function updateSermonAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = sermonSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = toData(parsed)!;

  await prisma.sermon.update({ where: { id }, data });
  revalidateSermonPaths(data.slug);
  return { ok: true, message: "Sermon updated." };
}

export async function deleteSermonAction(id: string): Promise<void> {
  await requireAdmin();
  const deleted = await prisma.sermon.delete({ where: { id } });
  revalidateSermonPaths(deleted.slug);
}
