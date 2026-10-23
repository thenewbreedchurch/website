import { EmailLayout, Field, P, SectionHeading, Title } from "./components/email-layout";

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
      eyebrow="You're registered"
      orgName={orgName}
      footerNote={`This is an automated confirmation from ${orgName}. If anything about your registration needs to change, just reach out — we're happy to help.`}
    >
      <Title>You&apos;re all set, {name}</Title>
      <P>
        Thank you for registering for <strong>{eventTitle}</strong> — we can&apos;t wait to see you there.
      </P>

      <SectionHeading />

      <Field label="When">{eventDateTime}</Field>
      {location && <Field label="Where">{location}</Field>}
      {onlineUrl && <Field label="Join online">{onlineUrl}</Field>}
      <Field label="Guests" last>
        {guestsCount}
      </Field>
    </EmailLayout>
  );
}
