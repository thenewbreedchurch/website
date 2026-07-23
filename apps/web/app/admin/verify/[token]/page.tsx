import Link from "next/link";
import { verifyEmailAction } from "@/actions/admin-auth";

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await verifyEmailAction(token);

  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-brand-800">Email Verification</h1>

        {result.ok ? (
          <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            Your email address has been verified.
          </p>
        ) : (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {result.error}
          </p>
        )}

        <Link href="/admin/login" className="mt-6 inline-block text-sm text-brand-700 hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
