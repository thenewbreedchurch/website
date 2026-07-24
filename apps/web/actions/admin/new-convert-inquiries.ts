"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@nb-church/db";
import { requireAdmin } from "@/lib/require-admin";
import type { ContactStatus } from "@nb-church/db";

const NEXT_STATUS: Record<ContactStatus, ContactStatus> = {
  NEW: "READ",
  READ: "RESPONDED",
  RESPONDED: "NEW",
};

/** Cycles NEW -> READ -> RESPONDED -> NEW, one click at a time from the list page. */
export async function advanceNewConvertInquiryStatusAction(id: string): Promise<void> {
  await requireAdmin();
  const existing = await prisma.newConvertInquiry.findUniqueOrThrow({ where: { id } });
  await prisma.newConvertInquiry.update({
    where: { id },
    data: { status: NEXT_STATUS[existing.status] },
  });
  revalidatePath("/admin/new-convert-inquiries");
}
