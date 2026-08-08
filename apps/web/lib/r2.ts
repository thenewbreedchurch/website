import "server-only";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 is S3-API-compatible — the same @aws-sdk/client-s3 package
// works against it with just a different `endpoint` (R2's account-scoped
// URL) and `region: "auto"`. Chosen over real S3 for zero egress fees: this
// bucket serves public-facing site images, so every visitor's image request
// would otherwise be a billed S3 GET — R2 never charges for that.
//
// Singleton client, mirroring the hot-reload-safe pattern in lib/redis.ts —
// a fresh client per Next.js dev hot-reload would otherwise leak connection
// pools. Only constructed when all required env vars are present; upload.ts
// checks isR2Configured() first and fails with a clear message instead of
// letting this throw, so local dev without real R2 credentials still works
// (the manual path/URL field on every image form is always available as a
// fallback regardless of upload configuration).

declare global {
  var __nbChurchR2Client: S3Client | undefined;
}

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

export function isR2Configured(): boolean {
  return Boolean(ACCOUNT_ID && ACCESS_KEY_ID && SECRET_ACCESS_KEY && R2_BUCKET_NAME && R2_PUBLIC_URL);
}

function getClient(): S3Client {
  if (global.__nbChurchR2Client) return global.__nbChurchR2Client;
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: ACCESS_KEY_ID!, secretAccessKey: SECRET_ACCESS_KEY! },
  });
  if (process.env.NODE_ENV !== "production") {
    global.__nbChurchR2Client = client;
  }
  return client;
}

/**
 * Uploads a processed image buffer to R2 under `${category}/${key}` and
 * returns its public URL. Callers must check `isR2Configured()` first —
 * this throws if the required env vars are missing rather than silently
 * no-op-ing, so a misconfiguration is loud in the server logs.
 */
export async function uploadImageToR2(params: {
  category: string;
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<string> {
  if (!isR2Configured()) {
    throw new Error("R2 is not configured — set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_URL.");
  }
  const objectKey = `${params.category}/${params.key}`;
  await getClient().send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
      Body: params.body,
      ContentType: params.contentType,
      // 1 year — these are content-addressed by a random UUID and never
      // overwritten in place (a replaced image gets a new key), so a
      // long-lived cache header is always safe.
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return `${R2_PUBLIC_URL}/${objectKey}`;
}
