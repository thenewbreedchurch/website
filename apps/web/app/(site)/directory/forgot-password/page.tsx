import type { Metadata } from "next";
import { DirectoryAuthShell } from "@/components/directory/auth-shell";
import { ForgotPasswordForm } from "@/components/directory/auth-forms";

export const metadata: Metadata = { title: "Forgot password — Business Directory", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <DirectoryAuthShell eyebrow="Business directory" title="Forgot your password?" intro="Enter your email and we'll send you a link to choose a new one.">
      <ForgotPasswordForm />
    </DirectoryAuthShell>
  );
}
