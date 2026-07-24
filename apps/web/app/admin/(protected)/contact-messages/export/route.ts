import { NextResponse } from "next/server";
import { prisma } from "@nb-church/db";
import { getSessionFromCookie } from "@/lib/session";
import { toCsv } from "@/lib/csv";

const EXPORT_LIMIT = 20000;

export async function GET() {
  const user = await getSessionFromCookie();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: EXPORT_LIMIT,
  });

  const csv = toCsv(
    ["Name", "Email", "Phone", "Subject", "Message", "Category", "Status", "Created At"],
    messages.map((m) => [
      m.name,
      m.email,
      m.phone ?? "",
      m.subject,
      m.message,
      m.category,
      m.status,
      m.createdAt.toISOString(),
    ])
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="contact-messages.csv"',
    },
  });
}
