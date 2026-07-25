import { NextResponse } from "next/server";
import { prisma } from "@nb-church/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_PATH_LENGTH = 300;
const MAX_VISITOR_ID_LENGTH = 100;

// Public, unauthenticated write endpoint (fired by
// components/analytics/page-view-tracker.tsx on every public-page view), so
// it gets the same fixed-window rate limit already used for the public
// contact/newsletter forms rather than trusting the body blindly.
export async function POST(request: Request) {
  const ip = await getClientIp();
  const { allowed } = await checkRateLimit(`track:${ip}`, { limit: 120, windowSeconds: 60 });
  if (!allowed) {
    return new NextResponse(null, { status: 429 });
  }

  let path: unknown;
  let visitorId: unknown;
  try {
    ({ path, visitorId } = await request.json());
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  if (typeof path !== "string" || !path.startsWith("/") || path.length > MAX_PATH_LENGTH) {
    return new NextResponse(null, { status: 400 });
  }

  // Only ever present when the visitor accepted the cookie-consent banner's
  // optional analytics cookie (see page-view-tracker.tsx) — trusted as-is,
  // since worst case a fabricated id just skews the "unique visitors"
  // count, not a security boundary.
  const validVisitorId =
    typeof visitorId === "string" && visitorId.length > 0 && visitorId.length <= MAX_VISITOR_ID_LENGTH
      ? visitorId
      : undefined;

  await prisma.pageView.create({ data: { path, visitorId: validVisitorId } });

  return new NextResponse(null, { status: 204 });
}
