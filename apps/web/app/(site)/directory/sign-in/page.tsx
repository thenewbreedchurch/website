import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDirectoryUser } from "@/lib/directory-session";
import { DirectoryAuthShell } from "@/components/directory/auth-shell";
import { SignInForm } from "@/components/directory/auth-forms";

export const metadata: Metadata = { title: "Sign in — Business Directory", robots: { index: false } };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getDirectoryUser()) redirect(next && /^\/directory(\/|$)/.test(next) ? next : "/directory/dashboard");
  return (
    <DirectoryAuthShell eyebrow="Business directory" title="Sign in" intro="Manage your listing, see how it's performing and leave reviews.">
      <SignInForm next={next} />
    </DirectoryAuthShell>
  );
}
