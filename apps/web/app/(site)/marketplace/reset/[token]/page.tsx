import type { Metadata } from "next";
import { DirectoryAuthShell } from "@/components/directory/auth-shell";
import { ResetPasswordForm } from "@/components/directory/auth-forms";

export const metadata: Metadata = { title: "Reset password — Marketplace", robots: { index: false } };

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <DirectoryAuthShell eyebrow="Marketplace" title="Choose a new password">
      <ResetPasswordForm token={token} />
    </DirectoryAuthShell>
  );
}
