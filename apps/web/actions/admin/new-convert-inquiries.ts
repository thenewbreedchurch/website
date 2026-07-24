"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import type { ContactStatus } from "@nb-church/db";

/** Sets a new-convert inquiry's status to an explicit value, chosen from the list page's status dropdown. */
export async function setNewConvertInquiryStatusAction(id: string, status: ContactStatus): Promise<void> {
  await requireAdmin();
  await prisma.newConvertInquiry.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/admin/new-convert-inquiries");
}
