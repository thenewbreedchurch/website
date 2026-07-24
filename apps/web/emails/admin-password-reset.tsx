import { Button, Text } from "@react-email/components";
import { EmailLayout, textStyle } from "./components/email-layout";

export interface AdminPasswordResetEmailProps {
  resetUrl: string;
}

export default function AdminPasswordResetEmail({ resetUrl }: AdminPasswordResetEmailProps) {
  return (
    <EmailLayout
      preview="Reset your admin password"
      eyebrow="Admin Panel"
      orgName="The New Breed Church"
    >
      <Text style={{ ...textStyle, fontSize: 19, fontWeight: 700, color: "#1f1730" }}>
        Reset your password
      </Text>
      <Text style={textStyle}>
        A password reset was requested for your The New Breed Church admin account.
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
        This link expires in 1 hour. If you didn&apos;t request this, you can safely ignore this
        email — your password will not be changed.
      </Text>
    </EmailLayout>
  );
}
