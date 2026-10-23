import { EmailButton, EmailLayout, P, Title } from "./components/email-layout";

export interface AdminPasswordResetEmailProps {
  resetUrl: string;
}

export default function AdminPasswordResetEmail({ resetUrl }: AdminPasswordResetEmailProps) {
  return (
    <EmailLayout preview="Reset your admin password" eyebrow="Admin Panel" orgName="The New Breed Church">
      <Title>Reset your password</Title>
      <P>A password reset was requested for your The New Breed Church admin account.</P>
      <EmailButton href={resetUrl}>Reset my password</EmailButton>
      <P style={{ marginTop: 22 }}>
        This link expires in 1 hour. If you didn&apos;t request this, you can safely ignore this email — your password will not
        be changed.
      </P>
    </EmailLayout>
  );
}
