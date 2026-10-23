import { NextResponse } from "next/server";
import { prisma } from "@nb-church/db";
import { getSessionFromCookie } from "@/lib/session";

// Authenticated download/preview of a welfare document. The files live in the
// database (never the public R2 bucket) and can only be fetched here, with a
// valid admin session. `?inline=1` opens PDFs/images in the browser; anything
// else (and the default) downloads. The MIME type was sniffed from the file's
// own bytes at upload time, never taken from the browser.

const PREVIEWABLE = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

export async function GET(request: Request, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  const user = await getSessionFromCookie();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { id, fileId } = await params;
  const file = await prisma.welfareAttachment.findFirst({ where: { id: fileId, requestId: id } });
  if (!file) return new NextResponse("Not found", { status: 404 });

  const inline = new URL(request.url).searchParams.get("inline") === "1" && PREVIEWABLE.has(file.mimeType);
  const encoded = encodeURIComponent(file.filename);

  return new NextResponse(Buffer.from(file.data), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": String(file.size),
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${file.filename.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "")}"; filename*=UTF-8''${encoded}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
