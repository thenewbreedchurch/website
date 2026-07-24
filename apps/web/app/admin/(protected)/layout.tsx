import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionFromCookie } from "@/lib/session";
import { logoutAction } from "@/actions/admin-auth";
import { InactivityWatcher } from "@/components/admin/InactivityWatcher";

// Route group for every admin page that requires an authenticated session.
// middleware.ts already bounces requests with no session cookie at all, but
// the real check — hash lookup, absolute + idle expiry — happens here via
// getSessionFromCookie(), which is the only place allowed to touch Postgres
// for this (Node runtime, not Edge).
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionFromCookie();
  if (!user) {
    redirect("/admin/login");
  }

  const idleMinutes = Number(process.env.ADMIN_SESSION_IDLE_MINUTES ?? "15");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4">
      <InactivityWatcher idleMinutes={idleMinutes} />

      <header className="flex items-center justify-between border-b border-neutral-200 py-4">
        <Link href="/admin" className="font-semibold text-brand-800">
          NBC Admin
        </Link>
        <div className="flex items-center gap-4 text-sm text-neutral-600">
          <span>{user.email}</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100"
            >
              Log out
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 py-8">{children}</main>
    </div>
  );
}
