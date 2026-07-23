import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

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
    <Html>
      <Head />
      <Preview>Welcome to the {orgName} family</Preview>
      <Body style={{ backgroundColor: "#f5f5f5", fontFamily: "Arial, sans-serif" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            margin: "40px auto",
            padding: 32,
            maxWidth: 560,
          }}
        >
          <Heading style={{ color: "#5B21B6", fontSize: 22 }}>
            Welcome{name ? `, ${name}` : ""}!
          </Heading>
          <Text style={{ color: "#333333", fontSize: 15, lineHeight: 1.6 }}>
            Thank you for subscribing to the {orgName} newsletter. We&apos;re
            blessed to have you join our community and look forward to
            growing together in faith and fellowship.
          </Text>
          <Text style={{ color: "#333333", fontSize: 15, lineHeight: 1.6 }}>
            You&apos;ll hear from us with service updates, announcements, and
            news from the church.
          </Text>
          <Hr style={{ borderColor: "#e5e5e5", margin: "24px 0" }} />
          <Section>
            <Text style={{ color: "#666666", fontSize: 12 }}>
              If you no longer wish to receive these emails, you can{" "}
              <Link href={unsubscribeUrl} style={{ color: "#5B21B6" }}>
                unsubscribe here
              </Link>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
