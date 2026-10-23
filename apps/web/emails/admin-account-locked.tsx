import { EmailButton, EmailLayout, P, Title } from "./components/email-layout";

export interface AdminAccountLockedEmailProps {
  lockedUntil: string;
  resetUrl: string;
}

export default function AdminAccountLockedEmail({ lockedUntil, resetUrl }: AdminAccountLockedEmailProps) {
  return (
    <EmailLayout preview="Your admin account was temporarily locked" eyebrow="Admin Panel — Security alert" orgName="The New Breed Church">
      <Title>Your account was locked</Title>
      <P>
        There were 5 failed sign-in attempts on your The New Breed Church admin account. As a precaution, sign-in has been
        temporarily disabled until {lockedUntil}.
      </P>
      <P>
        If this wasn&apos;t you, someone may be trying to guess your password — you can reset it now to regain access immediately
        and log out anyone using your old password.
      </P>
      <EmailButton href={resetUrl}>Reset my password</EmailButton>
      <P style={{ marginTop: 22 }}>
        If this was you — a few too many mistyped passwords — no action is needed. Sign-in will work again automatically once the
        lock expires.
      </P>
    </EmailLayout>
  );
}
