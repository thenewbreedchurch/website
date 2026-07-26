import { Link, Text } from "@react-email/components";
import { EmailLayout, textStyle } from "./components/email-layout";

// JSX-rendered email — user-supplied values (name) are interpolated as React
// children, so they're auto-escaped. This is the structural fix for the
// legacy pattern of raw string interpolation into HTML email bodies (see
// _legacy-static-site/server/routes/subscribe.js).

export interface NewsletterWelcomeEmailProps {
  name?: string;
  orgName: string;
  unsubscribeUrl: string;
}

export default function NewsletterWelcomeEmail({
  name,
  orgName,
  unsubscribeUrl,
}: NewsletterWelcomeEmailProps) {
  return (
    <EmailLayout
      preview={`Welcome to ${orgName}`}
      eyebrow="Welcome"
      orgName={orgName}
      footerNote={
        <>
          If you no longer wish to receive these emails, you can{" "}
          <Link href={unsubscribeUrl} style={{ color: "#6b46c1" }}>
            unsubscribe here
          </Link>
          .
        </>
      }
    >
      <Text style={{ ...textStyle, fontSize: 19, fontWeight: 700, color: "#1f1730" }}>
        Welcome{name ? `, ${name}` : ""} — we&apos;re so glad you&apos;re here! 🎉
      </Text>
      <Text style={textStyle}>
        Thank you for subscribing to {orgName}&apos;s newsletter. Whether you&apos;ve been part
        of our family for years or just found us, we&apos;re genuinely happy to have you along.
      </Text>
      <Text style={textStyle}>
        You&apos;ll hear from us with service updates, upcoming announcements, and news from
        around the church — nothing more, nothing spammy.
      </Text>
      <Text style={textStyle}>See you soon,</Text>
      <Text style={{ ...textStyle, fontWeight: 700, margin: 0 }}>{orgName} Team</Text>
    </EmailLayout>
  );
}
