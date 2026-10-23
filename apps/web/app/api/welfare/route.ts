import { NextResponse } from "next/server";
import { prisma } from "@nb-church/db";
import { welfareRequestSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendWelfareRequestEmail } from "@/lib/email";
import {
  WELFARE_ALLOWED_LABEL,
  WELFARE_MAX_FILES,
  WELFARE_MAX_FILE_BYTES,
  safeFilename,
  sniffAttachment,
} from "@/lib/welfare-attachments";
import type { ActionResult } from "@/lib/action-result";

// A Route Handler (not a Server Action) because the form carries up to 3
// documents of 10 MB each, well past the Server Action body cap that the rest
// of the site relies on. Route Handlers don't get Next's automatic Origin
// check, so one is done explicitly below.

export const runtime = "nodejs";

function json(body: ActionResult, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  let host: string;
  try {
    host = new URL(origin).host;
  } catch {
    return false;
  }
  const allowed = new Set(
    [request.headers.get("host"), request.headers.get("x-forwarded-host")].filter((h): h is string => Boolean(h))
  );
  try {
    if (process.env.NEXT_PUBLIC_SITE_URL) allowed.add(new URL(process.env.NEXT_PUBLIC_SITE_URL).host);
  } catch {
    // ignore a malformed env value
  }
  return allowed.has(host);
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ ok: false, error: "Request not allowed." }, 403);

  const ip = await getClientIp();
  const rl = await checkRateLimit(`welfare:${ip}`, { limit: 5, windowSeconds: 600 });
  if (!rl.allowed) return json({ ok: false, error: "Too many attempts. Please try again in a few minutes." }, 429);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: "We couldn't read your submission. If you attached large files, try fewer or smaller ones." }, 400);
  }

  // ---- fields ----
  const fields: Record<string, FormDataEntryValue> = {};
  for (const [key, value] of form.entries()) if (key !== "files" && typeof value === "string") fields[key] = value;

  const parsed = welfareRequestSchema.safeParse(fields);
  if (!parsed.success) {
    return json({ ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors }, 422);
  }
  const v = parsed.data;

  // ---- documents ----
  const uploads = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (uploads.length > WELFARE_MAX_FILES) {
    return json({ ok: false, error: `Please attach at most ${WELFARE_MAX_FILES} documents.`, fieldErrors: { files: [`At most ${WELFARE_MAX_FILES} documents`] } }, 422);
  }
  const files: { filename: string; mimeType: string; size: number; data: Buffer }[] = [];
  for (const file of uploads) {
    if (file.size > WELFARE_MAX_FILE_BYTES) {
      return json({ ok: false, error: `“${file.name}” is larger than 10 MB.`, fieldErrors: { files: [`“${file.name}” is larger than 10 MB`] } }, 422);
    }
    const data = Buffer.from(await file.arrayBuffer());
    const kind = sniffAttachment(data.subarray(0, 16), file.name);
    if (!kind) {
      return json({ ok: false, error: `“${file.name}” isn't a supported file.`, fieldErrors: { files: [`“${file.name}” isn't supported. Use ${WELFARE_ALLOWED_LABEL}.`] } }, 422);
    }
    files.push({ filename: safeFilename(file.name, kind.ext), mimeType: kind.mime, size: data.length, data });
  }

  // Only keep the conditional answers that apply, so a toggled-then-hidden
  // field can never leave stale data behind.
  const data = {
    email: v.email,
    fullName: v.fullName,
    occupation: v.occupation,
    gender: v.gender,
    age: v.age,
    phone: v.phone,
    address: v.address,
    membershipStatus: v.membershipStatus,
    membershipDuration: v.membershipDuration,
    fellowshipGroup: v.fellowshipGroup,
    isWorker: v.isWorker,
    department: v.isWorker ? (v.department ?? null) : null,
    supportType: v.supportType,
    supportOther: v.supportType === "OTHER" ? (v.supportOther ?? null) : null,
    description: v.description,
    specificRequest: v.specificRequest,
    firstTimeSupport: v.firstTimeSupport,
    lastAssistanceDate: !v.firstTimeSupport && v.lastAssistanceDate ? new Date(v.lastAssistanceDate) : null,
    lastAssistanceType: !v.firstTimeSupport ? (v.lastAssistanceType ?? null) : null,
    lastAssistanceOther: !v.firstTimeSupport && v.lastAssistanceType === "OTHER" ? (v.lastAssistanceOther ?? null) : null,
    triedElsewhere: v.triedElsewhere,
    hasDependents: v.hasDependents,
    dependentsCount: v.hasDependents ? (v.dependentsCount ?? null) : null,
    dependentsAges: v.hasDependents ? (v.dependentsAges ?? null) : null,
    homeVisitOk: v.homeVisitOk,
  };

  const created = await prisma.welfareRequest.create({
    data: { ...data, status: "NEW", attachments: { create: files.map((f) => ({ ...f, data: new Uint8Array(f.data) })) } },
    select: { id: true },
  });

  // Fire and forget: the database row is the source of truth, a mail hiccup must not fail the submission.
  void sendWelfareRequestEmail({ ...data, requestId: created.id, files });

  return json({
    ok: true,
    message:
      "Thank you — your request has been received by the welfare team. Someone will reach out to you personally. Everything you shared stays confidential.",
  });
}
