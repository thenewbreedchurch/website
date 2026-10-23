import { emailInlineLogos } from "./email-logos";
import "server-only";
import { getResend } from "./resend-client";
import VendorStatusEmail, { type VendorStatusEmailProps } from "../emails/vendor-status";
import DirectoryActionEmail, { type DirectoryActionEmailProps } from "../emails/directory-action";

const EMAIL_FROM = process.env.EMAIL_FROM ?? "The New Breed Church <no-reply@thenewbreedchurch.org>";
export const DIRECTORY_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Like lib/email.ts: every sender catches and logs its own errors — the DB
// write in the calling action is the source of truth, and a Resend problem
// must never fail a sign-up or an approval.

export async function sendVendorStatusEmail(params: {
  to: string;
  name: string;
  businessName: string;
  slug: string;
  status: VendorStatusEmailProps["status"];
  note?: string | null;
}): Promise<void> {
  try {
    const { error } = await getResend().emails.send({ attachments: emailInlineLogos(),
      from: EMAIL_FROM,
      to: params.to,
      subject: `${params.businessName}: ${
        params.status === "APPROVED" ? "your listing is live" : params.status === "REJECTED" ? "your listing needs changes" : "your listing has been paused"
      }`,
      react: VendorStatusEmail({
        name: params.name,
        businessName: params.businessName,
        status: params.status,
        note: params.note,
        profileUrl: `${DIRECTORY_SITE_URL}/marketplace/${params.slug}`,
        dashboardUrl: `${DIRECTORY_SITE_URL}/marketplace/dashboard`,
      }),
    });
    if (error) console.error("[email] vendor status send failed:", error);
  } catch (err) {
    console.error("[email] vendor status send threw:", err);
  }
}

async function sendAction(to: string | string[], subject: string, props: DirectoryActionEmailProps, replyTo?: string): Promise<void> {
  try {
    const { error } = await getResend().emails.send({ attachments: emailInlineLogos(), from: EMAIL_FROM, to, replyTo, subject, react: DirectoryActionEmail(props) });
    if (error) console.error("[email] directory email send failed:", error);
  } catch (err) {
    console.error("[email] directory email send threw:", err);
  }
}

export function sendDirectoryVerificationEmail(to: string, name: string, token: string) {
  const url = `${DIRECTORY_SITE_URL}/marketplace/verify/${token}`;
  return sendAction(to, "Verify your email — New Breed marketplace", {
    preview: "Confirm your email to finish setting up your marketplace account",
    title: "Confirm your email",
    body: [`Hi ${name},`, "Thanks for joining the New Breed Church marketplace. Please confirm your email address to list your business or leave reviews.", "This link expires in 24 hours."],
    buttonLabel: "Verify my email",
    url,
    footerNote: "If you didn't create this account you can safely ignore this email.",
  });
}

export function sendDirectoryResetEmail(to: string, name: string, token: string) {
  const url = `${DIRECTORY_SITE_URL}/marketplace/reset/${token}`;
  return sendAction(to, "Reset your marketplace password", {
    preview: "Reset your marketplace password",
    title: "Reset your password",
    body: [`Hi ${name},`, "A password reset was requested for your marketplace account. This link expires in 1 hour.", "If you didn't ask for this, ignore this email — your password won't change."],
    buttonLabel: "Reset my password",
    url,
  });
}

/** Internal notice to church staff (new listing to review, new report, …). */
export function sendDirectoryAdminNotice(params: { subject: string; title: string; body: string[]; path: string; replyTo?: string }) {
  const to = process.env.CONTACT_NOTIFICATION_EMAIL;
  if (!to) {
    console.error("[email] CONTACT_NOTIFICATION_EMAIL is not set; skipping directory admin notice");
    return Promise.resolve();
  }
  return sendAction(
    to,
    params.subject,
    {
      preview: params.title,
      title: params.title,
      body: params.body,
      buttonLabel: "Open in admin",
      url: `${DIRECTORY_SITE_URL}${params.path}`,
      eyebrow: "Marketplace — Admin",
    },
    params.replyTo
  );
}
