import { NextResponse } from "next/server";
import { prisma } from "@nb-church/db";
import { getSessionFromCookie } from "@/lib/session";
import { toCsv } from "@/lib/csv";

const EXPORT_LIMIT = 5000;

// Route Handler (not a Server Action) since this returns a file download —
// replaces the legacy site's event-export.js, which had no auth at all
// beyond URL obscurity; this is behind the same session check as every
// other /admin page.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionFromCookie();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) return new NextResponse("Not found", { status: 404 });

  const registrations = await prisma.eventRegistration.findMany({
    where: { announcementId: id },
    orderBy: { createdAt: "desc" },
    take: EXPORT_LIMIT,
  });

  const csv = toCsv(
    ["Name", "Email", "Phone", "Guests", "Notes", "Registered At"],
    registrations.map((r) => [
      r.name,
      r.email,
      r.phone ?? "",
      r.guestsCount,
      r.notes ?? "",
      r.createdAt.toISOString(),
    ])
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${announcement.slug}-registrations.csv"`,
    },
  });
}
