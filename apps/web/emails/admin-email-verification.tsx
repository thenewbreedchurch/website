import { EmailButton, EmailLayout, P, Title } from "./components/email-layout";

export interface AdminEmailVerificationEmailProps {
  verifyUrl: string;
}

export default function AdminEmailVerificationEmail({ verifyUrl }: AdminEmailVerificationEmailProps) {
  return (
    <EmailLayout preview="Verify your admin account email" eyebrow="Admin Panel" orgName="The New Breed Church">
      <Title>Confirm your email address</Title>
      <P>We just need to confirm this is really you before your admin account is fully set up.</P>
      <EmailButton href={verifyUrl}>Verify my email</EmailButton>
      <P style={{ marginTop: 22 }}>This link expires in 24 hours. If you didn&apos;t request this, you can safely ignore this email.</P>
    </EmailLayout>
  );
}
