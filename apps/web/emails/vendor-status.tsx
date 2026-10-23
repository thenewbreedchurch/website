import { Callout, EmailButton, EmailLayout, P, Title } from "./components/email-layout";

export interface VendorStatusEmailProps {
  name: string;
  businessName: string;
  status: "APPROVED" | "REJECTED" | "SUSPENDED";
  note?: string | null;
  profileUrl: string;
  dashboardUrl: string;
}

const COPY = {
  APPROVED: {
    title: "Your listing is live",
    body: "Your business has been approved and is now visible in the New Breed Church directory.",
    cta: "View your public profile",
  },
  REJECTED: {
    title: "Your listing needs changes",
    body: "We weren't able to approve your listing yet. Please review the note below, update your listing, and it will be looked at again.",
    cta: "Open your dashboard",
  },
  SUSPENDED: {
    title: "Your listing has been paused",
    body: "Your listing has been temporarily hidden from the directory.",
    cta: "Open your dashboard",
  },
} as const;

// All values are rendered as JSX children (auto-escaped), never HTML strings.
export default function VendorStatusEmail({ name, businessName, status, note, profileUrl, dashboardUrl }: VendorStatusEmailProps) {
  const c = COPY[status];
  return (
    <EmailLayout
      preview={`${businessName}: ${c.title}`}
      eyebrow="Business directory"
      orgName="The New Breed Church"
      footerNote="You're receiving this because you manage a listing on the New Breed Church business directory."
    >
      <Title>{c.title}</Title>
      <P>Hi {name},</P>
      <P>
        <strong>{businessName}</strong> — {c.body}
      </P>
      {note && <Callout>{note}</Callout>}
      <div style={{ marginTop: 8 }}>
        <EmailButton href={status === "APPROVED" ? profileUrl : dashboardUrl}>{c.cta}</EmailButton>
      </div>
    </EmailLayout>
  );
}
