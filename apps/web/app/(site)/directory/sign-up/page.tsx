import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDirectoryUser } from "@/lib/directory-session";
import { DirectoryAuthShell } from "@/components/directory/auth-shell";
import { SignUpForm } from "@/components/directory/auth-forms";

export const metadata: Metadata = { title: "Create an account — Business Directory", robots: { index: false } };

export default async function SignUpPage() {
  if (await getDirectoryUser()) redirect("/directory/dashboard");
  return (
    <DirectoryAuthShell eyebrow="Business directory" title="Create an account" intro="List your business for the church community, or just sign up to leave reviews.">
      <SignUpForm />
    </DirectoryAuthShell>
  );
}
