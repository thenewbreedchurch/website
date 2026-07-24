import { Hr, Link, Section, Text } from "@react-email/components";
import type { ContactCategory } from "@nb-church/db";
import { EmailLayout, labelStyle, textStyle, valueStyle } from "./components/email-layout";

export interface ContactNotificationEmailProps {
  name: string;
  email: string;
  phone?: string;
  category: ContactCategory;
  subject: string;
  message: string;
}

const CATEGORY_LABELS: Record<ContactCategory, string> = {
  GENERAL: "General",
  PRAYER: "Prayer Request",
  MEMBERSHIP: "Membership & Follow-up",
  WELFARE: "Welfare / Member Care",
};

const CATEGORY_TONE: Record<ContactCategory, { bg: string; fg: string }> = {
  GENERAL: { bg: "#f2eefa", fg: "#5B21B6" },
  PRAYER: { bg: "#eef4fc", fg: "#1d4ed8" },
  MEMBERSHIP: { bg: "#eafbf1", fg: "#15803d" },
  WELFARE: { bg: "#fff3e6", fg: "#c2410c" },
};

// Internal notification sent to church staff when a public contact form is
// submitted. All fields are user-supplied — rendered as JSX children, never
// interpolated into a raw HTML string, so this can't be used as an injection
// vector regardless of what a visitor types into the form.
export default function ContactNotificationEmail({
  name,
  email,
  phone,
  category,
  subject,
  message,
}: ContactNotificationEmailProps) {
  const tone = CATEGORY_TONE[category];

  return (
    <EmailLayout
      preview={`New message from ${name}: ${subject}`}
      eyebrow="Website Contact Form"
      orgName="The New Breed Church"
      footerNote="You're receiving this because someone submitted the contact form on thenewbreedchurch.org."
    >
      <Text
        style={{
          display: "inline-block",
          backgroundColor: tone.bg,
          color: tone.fg,
          fontSize: 12,
          fontWeight: 700,
          padding: "4px 12px",
          borderRadius: 999,
          margin: "0 0 16px",
        }}
      >
        {CATEGORY_LABELS[category]}
      </Text>

      <Text style={{ ...textStyle, fontSize: 17, fontWeight: 700, color: "#1f1730" }}>
        {name} reached out through the website
      </Text>
      <Text style={textStyle}>Here&apos;s what they shared — you can reply directly to this email to respond to them.</Text>

      <Hr style={{ borderColor: "#efeaf7", margin: "20px 0" }} />

      <Section>
        <Text style={labelStyle}>From</Text>
        <Text style={valueStyle}>
          {name} &lt;
          <Link href={`mailto:${email}`} style={{ color: "#6b46c1" }}>
            {email}
          </Link>
          &gt;
        </Text>

        {phone && (
          <>
            <Text style={labelStyle}>Phone</Text>
            <Text style={valueStyle}>{phone}</Text>
          </>
        )}

        <Text style={labelStyle}>Subject</Text>
        <Text style={valueStyle}>{subject}</Text>

        <Text style={labelStyle}>Message</Text>
        <Text style={{ ...valueStyle, whiteSpace: "pre-wrap" as const }}>{message}</Text>
      </Section>
    </EmailLayout>
  );
}
