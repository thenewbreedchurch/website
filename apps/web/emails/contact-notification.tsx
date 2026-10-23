import { Link, Text } from "@react-email/components";
import type { ContactCategory } from "@nb-church/db";
import { EmailLayout, Field, P, SectionHeading, Title, linkStyle } from "./components/email-layout";

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
  TESTIMONY: "Testimony",
};

// Explicit background AND text colours, so the tag reads the same in light and dark mode.
const CATEGORY_TONE: Record<ContactCategory, { bg: string; fg: string }> = {
  GENERAL: { bg: "#ede9fe", fg: "#4c1d95" },
  PRAYER: { bg: "#dbeafe", fg: "#1e3a8a" },
  MEMBERSHIP: { bg: "#dcfce7", fg: "#14532d" },
  WELFARE: { bg: "#ffedd5", fg: "#7c2d12" },
  TESTIMONY: { bg: "#fee2e2", fg: "#7f1d1d" },
};

// Internal notification sent to church staff when a public contact form is
// submitted. All fields are user-supplied — rendered as JSX children, never
// interpolated into a raw HTML string, so this can't be used as an injection
// vector regardless of what a visitor types into the form.
export default function ContactNotificationEmail({ name, email, phone, category, subject, message }: ContactNotificationEmailProps) {
  const tone = CATEGORY_TONE[category];
  return (
    <EmailLayout
      preview={`New message from ${name}: ${subject}`}
      eyebrow="Website contact form"
      orgName="The New Breed Church"
      footerNote="You're receiving this because someone submitted the contact form on thenewbreedchurch.org."
    >
      <Text
        style={{
          display: "inline-block",
          backgroundColor: tone.bg,
          color: tone.fg,
          fontFamily: "Menlo, Consolas, 'Courier New', monospace",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          padding: "6px 10px",
          margin: "0 0 18px",
        }}
      >
        {CATEGORY_LABELS[category]}
      </Text>

      <Title>{name} reached out</Title>
      <P>Here&apos;s what they shared — reply directly to this email to respond to them.</P>

      <SectionHeading />

      <Field label="From">
        {name} &lt;
        <Link href={`mailto:${email}`} className="nb-link" style={linkStyle}>
          {email}
        </Link>
        &gt;
      </Field>
      {phone && <Field label="Phone">{phone}</Field>}
      <Field label="Subject">{subject}</Field>
      <Field label="Message" pre last>
        {message}
      </Field>
    </EmailLayout>
  );
}
