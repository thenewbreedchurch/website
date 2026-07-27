import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionFromCookie, SESSION_COOKIE_NAME } from "@/lib/session";
import { InactivityWatcher } from "@/components/admin/InactivityWatcher";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminFooter } from "@/components/admin/admin-footer";

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
    // getSessionFromCookie() can't distinguish "never logged in" from
    // "session expired" in its return value (both are just null), but its
    // own cookie deletion on expiry is best-effort/no-op here (Server
    // Components can't write cookies) — so a stale cookie physically
    // survives in the browser past expiry. That makes cookie presence a
    // reliable proxy: present-but-invalid means it expired, absent means
    // the visitor was never logged in.
    const hadSessionCookie = (await cookies()).has(SESSION_COOKIE_NAME);
    redirect(hadSessionCookie ? "/admin/session-timeout" : "/admin/login");
  }

  const idleMinutes = Number(process.env.ADMIN_SESSION_IDLE_MINUTES ?? "15");

  return (
    <div className="flex min-h-screen flex-1 flex-col lg:flex-row">
      <InactivityWatcher idleMinutes={idleMinutes} />
      <AdminSidebar email={user.email} />
      <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-5xl">
          {children}
          <AdminFooter />
        </div>
      </main>
    </div>
  );
}
