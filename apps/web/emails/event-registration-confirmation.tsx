import { Hr, Section, Text } from "@react-email/components";
import { EmailLayout, labelStyle, textStyle, valueStyle } from "./components/email-layout";

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
    <EmailLayout
      preview={`You're registered for ${eventTitle}`}
      eyebrow="You're Registered"
      orgName={orgName}
      footerNote={`This is an automated confirmation from ${orgName}. If anything about your registration needs to change, just reach out — we're happy to help.`}
    >
      <Text style={{ ...textStyle, fontSize: 19, fontWeight: 700, color: "#1f1730" }}>
        Hi {name}, you&apos;re all set! ✅
      </Text>
      <Text style={textStyle}>
        Thank you for registering for <strong>{eventTitle}</strong> — we can&apos;t wait to see
        you there.
      </Text>

      <Hr style={{ borderColor: "#efeaf7", margin: "20px 0" }} />

      <Section>
        <Text style={labelStyle}>When</Text>
        <Text style={valueStyle}>{eventDateTime}</Text>

        {location && (
          <>
            <Text style={labelStyle}>Where</Text>
            <Text style={valueStyle}>{location}</Text>
          </>
        )}

        {onlineUrl && (
          <>
            <Text style={labelStyle}>Join Online</Text>
            <Text style={valueStyle}>{onlineUrl}</Text>
          </>
        )}

        <Text style={labelStyle}>Guests</Text>
        <Text style={{ ...valueStyle, margin: 0 }}>{guestsCount}</Text>
      </Section>
    </EmailLayout>
  );
}
