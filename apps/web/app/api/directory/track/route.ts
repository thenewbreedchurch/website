import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@nb-church/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const bodySchema = z.object({
  vendorId: z.string().min(1).max(40),
  type: z.enum(["VIEW", "CALL", "WHATSAPP", "EMAIL", "WEBSITE", "SOCIAL"]),
});

const BOT_UA = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor/i;

// Anonymous, aggregate-only analytics: a daily counter per vendor and type.
// Stores no IP, user-agent or visitor id (same stance as /api/track).
export async function POST(request: Request) {
  if (BOT_UA.test(request.headers.get("user-agent") ?? "")) return new NextResponse(null, { status: 204 });

  let parsed;
  try {
    parsed = bodySchema.safeParse(await request.json());
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  const { vendorId, type } = parsed.data;

  const ip = await getClientIp();
  const limit = await checkRateLimit(`dirtrack:${ip}:${vendorId}:${type}`, { limit: 30, windowSeconds: 3600 });
  if (!limit.allowed) return new NextResponse(null, { status: 204 });

  const vendor = await prisma.vendor.findFirst({ where: { id: vendorId, status: "APPROVED" }, select: { id: true } });
  if (!vendor) return new NextResponse(null, { status: 204 });

  const now = new Date();
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  await prisma.$transaction([
    prisma.vendorStatDaily.upsert({
      where: { vendorId_date_type: { vendorId, date, type } },
      create: { vendorId, date, type, count: 1 },
      update: { count: { increment: 1 } },
    }),
    prisma.vendor.update({
      where: { id: vendorId },
      data: type === "VIEW" ? { viewsCount: { increment: 1 } } : { contactClicksCount: { increment: 1 } },
    }),
  ]);

  return new NextResponse(null, { status: 204 });
}
