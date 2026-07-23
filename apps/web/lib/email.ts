import { Resend } from "resend";
import NewsletterWelcomeEmail from "../emails/newsletter-welcome";
import ContactNotificationEmail from "../emails/contact-notification";
import EventRegistrationConfirmationEmail from "../emails/event-registration-confirmation";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM ?? "The New Breed Church <no-reply@thenewbreedchurch.org>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Every send function below catches and logs its own errors instead of
// throwing. The DB write in the calling Server Action is the source of
// truth — a Resend outage (or, right now, the placeholder RESEND_API_KEY)
// must never fail the underlying subscribe/contact/register mutation.

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

export async function sendContactNotificationEmail(params: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<void> {
  const to = process.env.CONTACT_NOTIFICATION_EMAIL;
  if (!to) {
    console.error("[email] CONTACT_NOTIFICATION_EMAIL is not set; skipping notification send");
    return;
  }
  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      replyTo: params.email,
      subject: `Contact form: ${params.subject}`,
      react: ContactNotificationEmail(params),
    });
    if (error) console.error("[email] contact notification send failed:", error);
  } catch (err) {
    console.error("[email] contact notification send threw:", err);
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
