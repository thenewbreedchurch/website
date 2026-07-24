import { Hr, Link, Section, Text } from "@react-email/components";
import type { NewConvertInterest } from "@nb-church/db";
import { EmailLayout, labelStyle, textStyle, valueStyle } from "./components/email-layout";

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
export default function NewConvertInquiryEmail({
  name,
  email,
  phone,
  interests,
  message,
}: NewConvertInquiryEmailProps) {
  return (
    <EmailLayout
      preview={`${name} just reached out from the New Converts page`}
      eyebrow="New Converts — Follow Up"
      orgName="The New Breed Church"
      footerNote="Someone new took a step of faith and asked us to reach out — a timely follow-up means a lot."
    >
      <Text style={{ ...textStyle, fontSize: 19, fontWeight: 700, color: "#1f1730" }}>
        🌱 {name} would like to connect
      </Text>
      <Text style={textStyle}>
        They filled out the &quot;Tell Us You&apos;re Here&quot; form on the New Converts page.
        Please reach out soon — reply directly to this email to get in touch with them.
      </Text>

      <Hr style={{ borderColor: "#efeaf7", margin: "20px 0" }} />

      <Section>
        <Text style={labelStyle}>Name</Text>
        <Text style={valueStyle}>{name}</Text>

        <Text style={labelStyle}>Email</Text>
        <Text style={valueStyle}>
          <Link href={`mailto:${email}`} style={{ color: "#6b46c1" }}>
            {email}
          </Link>
        </Text>

        {phone && (
          <>
            <Text style={labelStyle}>Phone</Text>
            <Text style={valueStyle}>{phone}</Text>
          </>
        )}

        <Text style={labelStyle}>Would like help with</Text>
        <Text style={valueStyle}>
          {interests.map((i) => INTEREST_LABELS[i]).join(", ")}
        </Text>

        {message && (
          <>
            <Text style={labelStyle}>Message</Text>
            <Text style={{ ...valueStyle, whiteSpace: "pre-wrap" as const, margin: 0 }}>
              {message}
            </Text>
          </>
        )}
      </Section>
    </EmailLayout>
  );
}
