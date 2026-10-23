import { Resend } from "resend";

let client: Resend | null = null;

/**
 * The shared Resend client, created on first use rather than at import time.
 * `new Resend()` throws when RESEND_API_KEY is missing, and `next build`
 * (e.g. in the Docker image build, which has no runtime secrets) imports every
 * route handler — an import-time client crashed the build. Senders call this
 * inside their try/catch, so a missing key at runtime is logged, never thrown.
 */
export function getResend(): Resend {
  return (client ??= new Resend(process.env.RESEND_API_KEY));
}
