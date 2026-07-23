import { redirect } from "next/navigation";
import { getSessionFromCookie } from "@/lib/session";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";

export default async function ChangePasswordPage() {
  const user = await getSessionFromCookie();
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Change Password</h1>
      <div className="mt-6">
        <ChangePasswordForm forced={user.mustChangePassword} />
      </div>
    </div>
  );
}
