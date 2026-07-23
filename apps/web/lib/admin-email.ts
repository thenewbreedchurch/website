import "server-only";
import { Resend } from "resend";

// Minimal, self-contained email sending for the two admin transactional
// emails (verification + password reset). Deliberately not sharing the other
// agent's lib/email.ts / emails/*.tsx — these are short, plain-HTML,
// low-volume emails not worth blocking this slice on shared infra for.
// Send failures are logged and swallowed, never thrown: a flaky email
// provider must not turn into an account-existence oracle or a broken UX for
// requestPasswordResetAction's always-generic response.

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "The New Breed Church <no-reply@thenewbreedchurch.org>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const url = `${SITE_URL}/admin/verify/${token}`;
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Verify your admin account email",
      html:
        `<p>Confirm your email address for The New Breed Church admin panel:</p>` +
        `<p><a href="${url}">${url}</a></p>` +
        `<p>This link expires in 24 hours. If you didn't request this, you can ignore this email.</p>`,
    });
  } catch (err) {
    console.error(
      "[admin-email] failed to send verification email:",
      err instanceof Error ? err.message : err
    );
  }
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const url = `${SITE_URL}/admin/reset-password/${token}`;
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Reset your admin password",
      html:
        `<p>A password reset was requested for your The New Breed Church admin account.</p>` +
        `<p><a href="${url}">${url}</a></p>` +
        `<p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password will not be changed.</p>`,
    });
  } catch (err) {
    console.error(
      "[admin-email] failed to send password reset email:",
      err instanceof Error ? err.message : err
    );
  }
}
