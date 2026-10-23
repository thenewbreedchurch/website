"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@nb-church/db";
import type { VendorStatus } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import { adminVendorSchema, vendorCategorySchema } from "@/lib/validation";
import { uniqueVendorSlug } from "@/lib/directory-queries";
import { slugify } from "@/lib/directory";
import { sendVendorStatusEmail } from "@/lib/directory-email";
import type { ActionResult } from "@/lib/action-result";

function revalidateDirectory(slug?: string) {
  revalidatePath("/directory");
  revalidatePath("/directory/browse");
  if (slug) revalidatePath(`/directory/${slug}`);
  revalidatePath("/admin/directory/vendors");
}

type Parsed = z.infer<typeof adminVendorSchema>;

async function vendorData(v: Parsed): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; error: string; fieldErrors: Record<string, string[]> }> {
  let ownerId: string | null = null;
  if (v.ownerEmail) {
    const owner = await prisma.directoryUser.findUnique({ where: { email: v.ownerEmail.toLowerCase() }, select: { id: true } });
    if (!owner) {
      return { ok: false, error: "Please check the form for errors.", fieldErrors: { ownerEmail: ["No directory account uses that email yet."] } };
    }
    ownerId = owner.id;
  }
  const category = await prisma.vendorCategory.findUnique({ where: { id: v.categoryId }, select: { id: true } });
  if (!category) return { ok: false, error: "Please check the form for errors.", fieldErrors: { categoryId: ["Choose a category"] } };

  const { ownerEmail: _ownerEmail, ...rest } = v;
  void _ownerEmail;
  return {
    ok: true,
    data: {
      ...rest,
      email: v.email?.toLowerCase() ?? null,
      ownerId,
      subcategory: v.subcategory ?? null,
      serviceAreas: v.serviceAreas ?? null,
      yearStarted: v.yearStarted ?? null,
      registrationNumber: v.registrationNumber ?? null,
      phone: v.phone ?? null,
      whatsapp: v.whatsapp ?? null,
      website: v.website ?? null,
      instagram: v.instagram ?? null,
      facebook: v.facebook ?? null,
      linkedin: v.linkedin ?? null,
      tiktok: v.tiktok ?? null,
      businessHours: v.businessHours ?? null,
      priceRange: v.priceRange ?? null,
      logoUrl: v.logoUrl ?? null,
      coverUrl: v.coverUrl ?? null,
      adminNotes: v.adminNotes ?? null,
    },
  };
}

async function notifyOwner(vendorId: string, status: VendorStatus) {
  if (status === "PENDING") return;
  const v = await prisma.vendor.findUnique({ where: { id: vendorId }, include: { owner: true } });
  if (!v?.owner) return;
  void sendVendorStatusEmail({
    to: v.owner.email,
    name: v.owner.name,
    businessName: v.businessName,
    slug: v.slug,
    status,
    note: v.adminNotes,
  });
}

export async function createVendorAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = adminVendorSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const built = await vendorData(parsed.data);
  if (!built.ok) return built;

  const slug = await uniqueVendorSlug(parsed.data.businessName);
  const created = await prisma.vendor.create({ data: { ...(built.data as object), slug } as never });
  revalidateDirectory(slug);
  await notifyOwner(created.id, parsed.data.status);
  redirect(`/admin/directory/vendors/${created.id}`);
}

export async function updateVendorAction(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = adminVendorSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const built = await vendorData(parsed.data);
  if (!built.ok) return built;

  const before = await prisma.vendor.findUnique({ where: { id }, select: { status: true, slug: true } });
  if (!before) return { ok: false, error: "That listing no longer exists." };

  const updated = await prisma.vendor.update({ where: { id }, data: built.data as never });
  revalidateDirectory(before.slug);
  if (updated.status !== before.status) await notifyOwner(id, updated.status);
  return { ok: true, message: "Listing saved." };
}

export async function setVendorStatusAction(id: string, status: VendorStatus): Promise<void> {
  await requireAdmin();
  if (!["PENDING", "APPROVED", "REJECTED", "SUSPENDED"].includes(status)) return;
  const v = await prisma.vendor.update({ where: { id }, data: { status } });
  revalidateDirectory(v.slug);
  await notifyOwner(id, status);
}

export async function toggleVendorFlagAction(id: string, flag: "isVerified" | "isFeatured", value: boolean): Promise<void> {
  await requireAdmin();
  if (flag !== "isVerified" && flag !== "isFeatured") return;
  const v = await prisma.vendor.update({ where: { id }, data: { [flag]: value } });
  revalidateDirectory(v.slug);
}

export async function deleteVendorAction(id: string): Promise<void> {
  await requireAdmin();
  const v = await prisma.vendor.delete({ where: { id } });
  revalidateDirectory(v.slug);
  redirect("/admin/directory/vendors");
}

// ---- Categories ----

export async function createCategoryAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = vendorCategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const slug = slugify(parsed.data.name);
  const clash = await prisma.vendorCategory.findFirst({ where: { OR: [{ slug }, { name: parsed.data.name }] }, select: { id: true } });
  if (clash) return { ok: false, error: "Please check the form for errors.", fieldErrors: { name: ["A category with that name already exists."] } };
  await prisma.vendorCategory.create({ data: { ...parsed.data, slug } });
  revalidateDirectory();
  revalidatePath("/admin/directory/categories");
  return { ok: true, message: "Category added." };
}

export async function updateCategoryAction(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = vendorCategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  // The slug stays stable so existing links keep working after a rename.
  await prisma.vendorCategory.update({ where: { id }, data: parsed.data });
  revalidateDirectory();
  revalidatePath("/admin/directory/categories");
  return { ok: true, message: "Category saved." };
}

export async function deleteCategoryAction(id: string): Promise<void> {
  await requireAdmin();
  const count = await prisma.vendor.count({ where: { categoryId: id } });
  if (count > 0) return; // UI explains: move or delete its businesses first
  await prisma.vendorCategory.delete({ where: { id } });
  revalidateDirectory();
  revalidatePath("/admin/directory/categories");
}
