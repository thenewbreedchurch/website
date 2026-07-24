import { NextResponse } from "next/server";
import { prisma } from "@nb-church/db";
import { getSessionFromCookie } from "@/lib/session";
import { toCsv } from "@/lib/csv";

const EXPORT_LIMIT = 20000;

export async function GET() {
  const user = await getSessionFromCookie();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const inquiries = await prisma.newConvertInquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: EXPORT_LIMIT,
  });

  const csv = toCsv(
    ["Name", "Email", "Phone", "Interests", "Message", "Status", "Created At"],
    inquiries.map((inq) => [
      inq.name,
      inq.email,
      inq.phone ?? "",
      inq.interests.join("; "),
      inq.message ?? "",
      inq.status,
      inq.createdAt.toISOString(),
    ])
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="new-convert-inquiries.csv"',
    },
  });
}
