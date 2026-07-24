import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "@react-email/components";

// Shared visual shell for every transactional email in apps/web/emails/ —
// one place to keep tone/spacing consistent (a warm purple header band, a
// generously-padded white card, a quiet footer) instead of every template
// hand-rolling its own inline styles.

const BRAND_PURPLE = "#6b46c1";
const BRAND_PURPLE_DARK = "#5B21B6";

export function EmailLayout({
  preview,
  eyebrow,
  orgName,
  children,
  footerNote,
}: {
  preview: string;
  eyebrow: string;
  orgName: string;
  children: React.ReactNode;
  footerNote?: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: "#f4f2f9",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          padding: "32px 16px",
        }}
      >
        <Container style={{ maxWidth: 560, margin: "0 auto" }}>
          <Section
            style={{
              background: `linear-gradient(135deg, ${BRAND_PURPLE} 0%, ${BRAND_PURPLE_DARK} 100%)`,
              borderRadius: "16px 16px 0 0",
              padding: "28px 32px",
              textAlign: "center" as const,
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase" as const,
                margin: 0,
                opacity: 0.85,
              }}
            >
              {eyebrow}
            </Text>
            <Text
              style={{
                color: "#ffffff",
                fontSize: 20,
                fontWeight: 700,
                margin: "6px 0 0",
              }}
            >
              {orgName}
            </Text>
          </Section>

          <Section
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "0 0 16px 16px",
              padding: "32px",
              boxShadow: "0 2px 12px rgba(76, 29, 149, 0.06)",
            }}
          >
            {children}
          </Section>

          <Section style={{ padding: "20px 8px 0" }}>
            <Hr style={{ borderColor: "#e0d9f0", margin: "0 0 16px" }} />
            <Text style={{ color: "#8a7fa3", fontSize: 12, lineHeight: 1.6, margin: 0 }}>
              {footerNote ?? `This message was sent by ${orgName}.`}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const textStyle = { color: "#33293f", fontSize: 15, lineHeight: 1.65, margin: "0 0 14px" };
export const labelStyle = { color: "#6b46c1", fontSize: 11, fontWeight: 700 as const, letterSpacing: 0.5, textTransform: "uppercase" as const, margin: "0 0 3px" };
export const valueStyle = { color: "#33293f", fontSize: 15, margin: "0 0 16px" };
