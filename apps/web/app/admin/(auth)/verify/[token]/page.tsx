import Link from "next/link";
import { verifyEmailAction } from "@/actions/admin-auth";
import { AuthCard } from "@/components/admin/auth-card";

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await verifyEmailAction(token);

  return (
    <AuthCard title="Email Verification" center>
      {result.ok ? (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          Your email address has been verified.
        </p>
      ) : (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{result.error}</p>
      )}

      <Link href="/admin/login" className="mt-6 inline-block text-sm text-brand-700 hover:underline">
        Back to sign in
      </Link>
    </AuthCard>
  );
}
