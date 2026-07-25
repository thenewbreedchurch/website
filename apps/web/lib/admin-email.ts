import "server-only";
import { Resend } from "resend";
import AdminEmailVerificationEmail from "../emails/admin-email-verification";
import AdminPasswordResetEmail from "../emails/admin-password-reset";
import AdminAccountLockedEmail from "../emails/admin-account-locked";

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

// Fired when a failed-login streak actually trips the lockout (see
// actions/admin-auth.ts's loginAction) — gives the real admin visibility
// that an attack is happening rather than silently discovering it next time
// they try to sign in, and points straight at the one recovery path that
// still works while locked (password reset, which clears the lock as a
// side effect of a successful reset).
export async function sendAccountLockedEmail(to: string, lockedUntil: Date): Promise<void> {
  // Links to the generic forgot-password entry point rather than minting a
  // fresh reset token here — keeps this function decoupled from
  // lib/admin-tokens.ts and avoids generating an extra single-use token on
  // every lockout event (e.g. a repeated attack sending several of these).
  const resetUrl = `${SITE_URL}/admin/forgot-password`;
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: "Security alert: your admin account was locked",
      react: AdminAccountLockedEmail({
        lockedUntil: lockedUntil.toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        resetUrl,
      }),
    });
    if (error) console.error("[admin-email] account-locked send failed:", error);
  } catch (err) {
    console.error(
      "[admin-email] failed to send account-locked email:",
      err instanceof Error ? err.message : err
    );
  }
}
