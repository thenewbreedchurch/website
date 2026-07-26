import { Resend } from "resend";
import type { ContactCategory, NewConvertInterest } from "@nb-church/db";
import NewsletterWelcomeEmail from "../emails/newsletter-welcome";
import ContactNotificationEmail from "../emails/contact-notification";
import EventRegistrationConfirmationEmail from "../emails/event-registration-confirmation";
import NewConvertInquiryEmail from "../emails/new-convert-inquiry";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM ?? "The New Breed Church <no-reply@thenewbreedchurch.org>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Every send function below catches and logs its own errors instead of
// throwing. The DB write in the calling Server Action is the source of
// truth — a Resend outage (or a missing/misconfigured API key or unverified
// sending domain) must never fail the underlying subscribe/contact/register
// mutation.

export async function sendNewsletterWelcomeEmail(params: {
  to: string;
  name?: string;
  orgName: string;
  unsubscribeToken: string;
}): Promise<void> {
  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: params.to,
      subject: `Welcome to ${params.orgName}!`,
      react: NewsletterWelcomeEmail({
        name: params.name,
        orgName: params.orgName,
        unsubscribeUrl: `${SITE_URL}/unsubscribe?token=${params.unsubscribeToken}`,
      }),
    });
    if (error) console.error("[email] newsletter welcome send failed:", error);
  } catch (err) {
    console.error("[email] newsletter welcome send threw:", err);
  }
}

export const CONTACT_CATEGORY_LABELS: Record<ContactCategory, string> = {
  GENERAL: "General",
  PRAYER: "Prayer Request",
  MEMBERSHIP: "Membership & Follow-up",
  WELFARE: "Welfare / Member Care",
  TESTIMONY: "Testimony",
};

// admin@ is always included; each non-GENERAL/TESTIMONY category adds its
// own dedicated address on top (confirmed routing model — see HANDOFF.md).
// TESTIMONY has no dedicated inbox of its own yet — same as GENERAL, it
// just goes to admin@ — since none was requested; add one here the same
// way PRAYER/MEMBERSHIP/WELFARE do if that changes.
function resolveContactRecipients(category: ContactCategory): string[] {
  const categoryEnvVar: Record<ContactCategory, string | undefined> = {
    GENERAL: undefined,
    PRAYER: process.env.PRAYER_NOTIFICATION_EMAIL,
    MEMBERSHIP: process.env.MEMBERSHIP_NOTIFICATION_EMAIL,
    WELFARE: process.env.WELFARE_NOTIFICATION_EMAIL,
    TESTIMONY: undefined,
  };

  const admin = process.env.CONTACT_NOTIFICATION_EMAIL;
  const recipients = [admin, categoryEnvVar[category]].filter(
    (v): v is string => Boolean(v)
  );

  if (recipients.length === 0) {
    console.error("[email] no notification recipient env vars are set; skipping send");
  }

  return Array.from(new Set(recipients));
}

export async function sendContactNotificationEmail(params: {
  name: string;
  email: string;
  phone?: string;
  category: ContactCategory;
  subject: string;
  message: string;
}): Promise<void> {
  const to = resolveContactRecipients(params.category);
  if (to.length === 0) return;

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      replyTo: params.email,
      subject: `[${CONTACT_CATEGORY_LABELS[params.category]}] ${params.subject}`,
      react: ContactNotificationEmail(params),
    });
    if (error) console.error("[email] contact notification send failed:", error);
  } catch (err) {
    console.error("[email] contact notification send threw:", err);
  }
}

export const NEW_CONVERT_INTEREST_LABELS: Record<NewConvertInterest, string> = {
  BAPTISM: "Getting baptized",
  BIBLE_STUDY: "Joining Bible Study",
  MEET_LEADER: "Meeting a leader",
  SERVING: "Serving on a team",
  OTHER: "Something else",
};

// Always routed to the follow-up team, regardless of what's checked — this
// form is inherently a follow-up-team submission, not category-routed like
// the general contact form.
export async function sendNewConvertInquiryEmail(params: {
  name: string;
  email: string;
  phone?: string;
  interests: NewConvertInterest[];
  message?: string;
}): Promise<void> {
  const to = process.env.MEMBERSHIP_NOTIFICATION_EMAIL;
  if (!to) {
    console.error("[email] MEMBERSHIP_NOTIFICATION_EMAIL is not set; skipping notification send");
    return;
  }
  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      replyTo: params.email,
      subject: `New Converts: ${params.name} would like to connect`,
      react: NewConvertInquiryEmail(params),
    });
    if (error) console.error("[email] new convert inquiry send failed:", error);
  } catch (err) {
    console.error("[email] new convert inquiry send threw:", err);
  }
}

export async function sendEventRegistrationConfirmation(params: {
  to: string;
  name: string;
  orgName: string;
  eventTitle: string;
  eventDateTime: string;
  location?: string;
  onlineUrl?: string;
  guestsCount: number;
}): Promise<void> {
  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: params.to,
      subject: `You're registered for ${params.eventTitle}`,
      react: EventRegistrationConfirmationEmail({
        name: params.name,
        orgName: params.orgName,
        eventTitle: params.eventTitle,
        eventDateTime: params.eventDateTime,
        location: params.location,
        onlineUrl: params.onlineUrl,
        guestsCount: params.guestsCount,
      }),
    });
    if (error) console.error("[email] event registration confirmation send failed:", error);
  } catch (err) {
    console.error("[email] event registration confirmation send threw:", err);
  }
}
