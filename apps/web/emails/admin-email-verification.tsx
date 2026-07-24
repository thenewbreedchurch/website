import { Button, Text } from "@react-email/components";
import { EmailLayout, textStyle } from "./components/email-layout";

export interface AdminEmailVerificationEmailProps {
  verifyUrl: string;
}

export default function AdminEmailVerificationEmail({
  verifyUrl,
}: AdminEmailVerificationEmailProps) {
  return (
    <EmailLayout
      preview="Verify your admin account email"
      eyebrow="Admin Panel"
      orgName="The New Breed Church"
    >
      <Text style={{ ...textStyle, fontSize: 19, fontWeight: 700, color: "#1f1730" }}>
        Confirm your email address
      </Text>
      <Text style={textStyle}>
        We just need to confirm this is really you before your admin account is fully set up.
      </Text>
      <Button
        href={verifyUrl}
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
        Verify my email
      </Button>
      <Text style={{ ...textStyle, marginTop: 20 }}>
        This link expires in 24 hours. If you didn&apos;t request this, you can safely ignore
        this email.
      </Text>
    </EmailLayout>
  );
}
