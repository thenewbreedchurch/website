import { NextResponse } from "next/server";
import { prisma } from "@nb-church/db";
import { getSessionFromCookie } from "@/lib/session";
import { toCsv } from "@/lib/csv";

// Replaces the legacy site's export.js, which dumped subscriber PII via a
// URL protected by nothing but obscurity — this is behind the same session
// check as every other /admin page.
const EXPORT_LIMIT = 20000;

export async function GET() {
  const user = await getSessionFromCookie();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { subscribedAt: "desc" },
    take: EXPORT_LIMIT,
  });

  const csv = toCsv(
    ["Email", "Name", "Status", "Subscribed At"],
    subscribers.map((s) => [s.email, s.name ?? "", s.status, s.subscribedAt.toISOString()])
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="newsletter-subscribers.csv"',
    },
  });
}
