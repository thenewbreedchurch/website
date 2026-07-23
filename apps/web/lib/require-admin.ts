import { redirect } from "next/navigation";
import { getSessionFromCookie } from "@/lib/session";

/** Shared guard for every admin CRUD page — same check the dashboard placeholder established. */
export async function requireAdmin() {
  const user = await getSessionFromCookie();
  if (!user) redirect("/admin/login");
  if (user.mustChangePassword) redirect("/admin/change-password");
  return user;
}
