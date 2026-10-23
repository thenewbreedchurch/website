import { ImageResponse } from "next/og";
import { EMAIL_LOGO_CID, emailInlineLogos } from "@/lib/email-logos";
import { ogFonts } from "@/lib/og-fonts";

// Branded 1200x630 link-preview card for any page: /api/og?title=…&eyebrow=…
// Referenced by pageMetadata() as the og:image / twitter:image, so every page
// gets a proper preview instead of one shared square logo. Title-only on
// purpose: no photos, so the PNG stays ~80 KB (WhatsApp drops previews whose
// image is over ~300 KB) and the route never fetches external URLs.

export const runtime = "nodejs";

const NIGHT = "#0a0710";
const BRAND_LIGHT = "#c4b5fd";

function dataUri(cid: string): string {
  const f = emailInlineLogos().find((a) => a.contentId === cid)!;
  return `data:image/png;base64,${f.content.toString("base64")}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") ?? "The New Breed Church").slice(0, 90);
  const eyebrow = (searchParams.get("eyebrow") ?? "").slice(0, 40);

  const size = title.length <= 22 ? 128 : title.length <= 38 ? 100 : title.length <= 56 ? 78 : 64;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: NIGHT, color: "white" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 16, display: "flex", background: "#6b46c1" }} />

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 80px 60px 96px", width: "100%", height: "100%", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dataUri(EMAIL_LOGO_CID.mark)} alt="" height={72} style={{ height: 72 }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dataUri(EMAIL_LOGO_CID.wordmark)} alt="" height={54} style={{ height: 54 }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {eyebrow && (
              <div style={{ display: "flex", fontFamily: "Manrope", fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: BRAND_LIGHT, marginBottom: 28 }}>
                {eyebrow}
              </div>
            )}
            <div
              style={{
                display: "flex",
                fontFamily: "Fraunces",
                fontSize: size,
                lineHeight: 1,
                letterSpacing: -size * 0.03,
                textTransform: "uppercase",
                maxWidth: 1000,
              }}
            >
              {title}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "Manrope", fontSize: 26, color: "rgba(255,255,255,0.7)" }}>
            <div style={{ display: "flex" }}>thenewbreedchurch.org</div>
            <div style={{ display: "flex", width: 220, height: 6, background: "#8b5cf6" }} />
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: ogFonts(),
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400" },
    }
  );
}
