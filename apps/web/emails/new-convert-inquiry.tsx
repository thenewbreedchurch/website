import { Link } from "@react-email/components";
import type { NewConvertInterest } from "@nb-church/db";
import { EmailLayout, Field, P, SectionHeading, Title, linkStyle } from "./components/email-layout";

export interface NewConvertInquiryEmailProps {
  name: string;
  email: string;
  phone?: string;
  interests: NewConvertInterest[];
  message?: string;
}

const INTEREST_LABELS: Record<NewConvertInterest, string> = {
  BAPTISM: "Getting baptized",
  BIBLE_STUDY: "Joining Bible Study",
  MEET_LEADER: "Meeting a leader",
  SERVING: "Serving on a team",
  OTHER: "Something else",
};

// Sent to the follow-up team whenever someone submits the New Converts
// intake form — this is a real person to reach out to personally, so the
// tone leans warm/urgent-in-a-good-way rather than a dry notification.
export default function NewConvertInquiryEmail({ name, email, phone, interests, message }: NewConvertInquiryEmailProps) {
  return (
    <EmailLayout
      preview={`${name} just reached out from the New Converts page`}
      eyebrow="New converts — follow up"
      orgName="The New Breed Church"
      footerNote="Someone new took a step of faith and asked us to reach out — a timely follow-up means a lot."
    >
      <Title>{name} would like to connect</Title>
      <P>
        They filled out the &quot;Tell Us You&apos;re Here&quot; form on the New Converts page. Please reach out soon — reply
        directly to this email to get in touch with them.
      </P>

      <SectionHeading />

      <Field label="Name">{name}</Field>
      <Field label="Email">
        <Link href={`mailto:${email}`} className="nb-link" style={linkStyle}>
          {email}
        </Link>
      </Field>
      {phone && <Field label="Phone">{phone}</Field>}
      <Field label="Would like help with" last={!message}>
        {interests.map((i) => INTEREST_LABELS[i]).join(", ")}
      </Field>
      {message && (
        <Field label="Message" pre last>
          {message}
        </Field>
      )}
    </EmailLayout>
  );
}
