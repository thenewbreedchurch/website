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

export interface EventRegistrationConfirmationEmailProps {
  name: string;
  orgName: string;
  eventTitle: string;
  eventDateTime: string;
  location?: string;
  onlineUrl?: string;
  guestsCount: number;
}

export default function EventRegistrationConfirmationEmail({
  name,
  orgName,
  eventTitle,
  eventDateTime,
  location,
  onlineUrl,
  guestsCount,
}: EventRegistrationConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You&apos;re registered for {eventTitle}</Preview>
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
          <Heading style={{ color: "#5B21B6", fontSize: 22 }}>Hi {name},</Heading>
          <Text style={{ color: "#333333", fontSize: 15, lineHeight: 1.6 }}>
            Thank you for registering for <strong>{eventTitle}</strong> at{" "}
            {orgName}. We&apos;re excited to see you there!
          </Text>
          <Hr style={{ borderColor: "#e5e5e5", margin: "20px 0" }} />
          <Section>
            <Text style={{ margin: "4px 0", fontSize: 14 }}>
              <strong>When:</strong> {eventDateTime}
            </Text>
            {location && (
              <Text style={{ margin: "4px 0", fontSize: 14 }}>
                <strong>Where:</strong> {location}
              </Text>
            )}
            {onlineUrl && (
              <Text style={{ margin: "4px 0", fontSize: 14 }}>
                <strong>Join online:</strong> {onlineUrl}
              </Text>
            )}
            <Text style={{ margin: "4px 0", fontSize: 14 }}>
              <strong>Guests:</strong> {guestsCount}
            </Text>
          </Section>
          <Hr style={{ borderColor: "#e5e5e5", margin: "20px 0" }} />
          <Text style={{ fontSize: 12, color: "#666666" }}>
            This is an automated message from {orgName}. Please do not reply
            to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
