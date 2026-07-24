import "server-only";
import { Resend } from "resend";
import AdminEmailVerificationEmail from "../emails/admin-email-verification";
import AdminPasswordResetEmail from "../emails/admin-password-reset";

// Sending for the two admin transactional emails (verification + password
// reset), now built on the same EmailLayout/react-email pattern as the
// public-facing emails in lib/email.ts for a consistent warm, branded tone.
// Send failures are logged and swallowed, never thrown: a flaky email
// provider must not turn into an account-existence oracle or a broken UX for
// requestPasswordResetAction's always-generic response.

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "The New Breed Church <no-reply@thenewbreedchurch.org>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const verifyUrl = `${SITE_URL}/admin/verify/${token}`;
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: "Verify your admin account email",
      react: AdminEmailVerificationEmail({ verifyUrl }),
    });
    if (error) console.error("[admin-email] verification send failed:", error);
  } catch (err) {
    console.error(
      "[admin-email] failed to send verification email:",
      err instanceof Error ? err.message : err
    );
  }
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const resetUrl = `${SITE_URL}/admin/reset-password/${token}`;
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: "Reset your admin password",
      react: AdminPasswordResetEmail({ resetUrl }),
    });
    if (error) console.error("[admin-email] password reset send failed:", error);
  } catch (err) {
    console.error(
      "[admin-email] failed to send password reset email:",
      err instanceof Error ? err.message : err
    );
  }
}
