import { Link } from "@react-email/components";
import { EmailButton, EmailLayout, Field, P, SectionHeading, Title, linkStyle } from "./components/email-layout";

export interface TestimonySubmissionEmailProps {
  name: string;
  email: string;
  body: string;
  adminUrl: string;
}

// Internal notification: a visitor shared a testimony. All fields are
// user-supplied and rendered as JSX children, never as raw HTML.
export default function TestimonySubmissionEmail({ name, email, body, adminUrl }: TestimonySubmissionEmailProps) {
  return (
    <EmailLayout
      preview={`New testimony from ${name}`}
      eyebrow="Testimony"
      orgName="The New Breed Church"
      footerNote="You're receiving this because someone shared a testimony on thenewbreedchurch.org. It is not public until approved."
    >
      <Title>{name} shared a testimony</Title>
      <P>It is saved as pending. Review it in the admin panel and approve it to show it on the home page, or reply to thank them.</P>

      <SectionHeading />

      <Field label="From">
        {name} &lt;
        <Link href={`mailto:${email}`} className="nb-link" style={linkStyle}>
          {email}
        </Link>
        &gt;
      </Field>
      <Field label="Testimony" pre last>
        {body}
      </Field>

      <EmailButton href={adminUrl}>Review &amp; approve</EmailButton>
    </EmailLayout>
  );
}
