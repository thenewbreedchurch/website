import { Link } from "@react-email/components";
import { EmailLayout, P, Title, linkStyle } from "./components/email-layout";

// JSX-rendered email — user-supplied values (name) are interpolated as React
// children, so they're auto-escaped. This is the structural fix for the
// legacy pattern of raw string interpolation into HTML email bodies (see
// _legacy-static-site/server/routes/subscribe.js).

export interface NewsletterWelcomeEmailProps {
  name?: string;
  orgName: string;
  unsubscribeUrl: string;
}

export default function NewsletterWelcomeEmail({ name, orgName, unsubscribeUrl }: NewsletterWelcomeEmailProps) {
  return (
    <EmailLayout
      preview={`Welcome to ${orgName}`}
      eyebrow="Welcome"
      orgName={orgName}
      footerNote={
        <>
          If you no longer wish to receive these emails, you can{" "}
          <Link href={unsubscribeUrl} className="nb-link" style={linkStyle}>
            unsubscribe here
          </Link>
          .
        </>
      }
    >
      <Title>Welcome{name ? `, ${name}` : ""} — we&apos;re so glad you&apos;re here</Title>
      <P>
        Thank you for subscribing to {orgName}&apos;s newsletter. Whether you&apos;ve been part of our family for years or just
        found us, we&apos;re genuinely happy to have you along.
      </P>
      <P>
        You&apos;ll hear from us with service updates, upcoming announcements, and news from around the church — nothing more,
        nothing spammy.
      </P>
      <P>See you soon,</P>
      <P style={{ fontWeight: 700, margin: 0 }}>{orgName} Team</P>
    </EmailLayout>
  );
}
