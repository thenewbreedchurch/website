import { Button, Text } from "@react-email/components";
import { EmailLayout, textStyle } from "./components/email-layout";

export interface AdminAccountLockedEmailProps {
  lockedUntil: string;
  resetUrl: string;
}

export default function AdminAccountLockedEmail({
  lockedUntil,
  resetUrl,
}: AdminAccountLockedEmailProps) {
  return (
    <EmailLayout
      preview="Your admin account was temporarily locked"
      eyebrow="Admin Panel — Security Alert"
      orgName="The New Breed Church"
    >
      <Text style={{ ...textStyle, fontSize: 19, fontWeight: 700, color: "#1f1730" }}>
        Your account was locked
      </Text>
      <Text style={textStyle}>
        There were 5 failed sign-in attempts on your The New Breed Church admin account. As a
        precaution, sign-in has been temporarily disabled until {lockedUntil}.
      </Text>
      <Text style={textStyle}>
        If this wasn&apos;t you, someone may be trying to guess your password — you can reset it
        now to regain access immediately and log out anyone using your old password.
      </Text>
      <Button
        href={resetUrl}
        style={{
          backgroundColor: "#6b46c1",
          borderRadius: 10,
          color: "#ffffff",
          fontSize: 15,
          fontWeight: 700,
          padding: "12px 24px",
          textDecoration: "none",
        }}
      >
        Reset my password
      </Button>
      <Text style={{ ...textStyle, marginTop: 20 }}>
        If this was you — a few too many mistyped passwords — no action is needed. Sign-in will
        work again automatically once the lock expires.
      </Text>
    </EmailLayout>
  );
}
