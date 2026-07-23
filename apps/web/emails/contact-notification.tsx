import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface ContactNotificationEmailProps {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// Internal notification sent to church staff when a public contact form is
// submitted. All fields are user-supplied — rendered as JSX children, never
// interpolated into a raw HTML string, so this can't be used as an injection
// vector regardless of what a visitor types into the form.
export default function ContactNotificationEmail({
  name,
  email,
  phone,
  subject,
  message,
}: ContactNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New contact message: {subject}</Preview>
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
          <Heading style={{ color: "#5B21B6", fontSize: 20 }}>
            New contact form submission
          </Heading>
          <Section>
            <Text style={{ margin: "4px 0", fontSize: 14 }}>
              <strong>Name:</strong> {name}
            </Text>
            <Text style={{ margin: "4px 0", fontSize: 14 }}>
              <strong>Email:</strong> {email}
            </Text>
            {phone && (
              <Text style={{ margin: "4px 0", fontSize: 14 }}>
                <strong>Phone:</strong> {phone}
              </Text>
            )}
            <Text style={{ margin: "4px 0", fontSize: 14 }}>
              <strong>Subject:</strong> {subject}
            </Text>
          </Section>
          <Hr style={{ borderColor: "#e5e5e5", margin: "20px 0" }} />
          <Text style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6 }}>
            {message}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
