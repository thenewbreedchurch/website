import type { Metadata } from "next";
import { DirectoryAuthShell } from "@/components/directory/auth-shell";
import { VerifyEmailButton } from "@/components/directory/auth-forms";

export const metadata: Metadata = { title: "Verify email — Business Directory", robots: { index: false } };

// Consuming the token only happens on an explicit click (never while rendering),
// so email link scanners and prefetchers can't burn the single-use link.
export default async function VerifyEmailPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <DirectoryAuthShell eyebrow="Business directory" title="Verify your email" intro="One click to confirm this is your address.">
      <VerifyEmailButton token={token} />
    </DirectoryAuthShell>
  );
}
