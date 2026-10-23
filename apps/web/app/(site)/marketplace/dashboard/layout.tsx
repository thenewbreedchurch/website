import type { Metadata } from "next";
import { SectionBand } from "@/components/ui/section-band";
import { Eyebrow } from "@/components/ui/eyebrow";
import { requireDirectoryUser } from "@/lib/directory-session";
import { signOutAction } from "@/actions/directory-auth";
import { DashboardNav } from "@/components/directory/dashboard-nav";

export const metadata: Metadata = { title: "Dashboard — Marketplace", robots: { index: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireDirectoryUser();
  return (
    <>
      <SectionBand tone="night" className="!pb-10 !pt-12 sm:!pt-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Marketplace</Eyebrow>
            <h1 className="t-display-sm mt-4">Your dashboard</h1>
            <p className="t-eyebrow mt-4 text-[11px] text-white/60">{user.email}</p>
          </div>
          <form action={signOutAction}>
            <button type="submit" className="t-eyebrow border border-white/30 px-4 py-3 text-white/80 hover:border-white hover:text-white">
              Sign out
            </button>
          </form>
        </div>
        <div className="mt-8">
          <DashboardNav />
        </div>
      </SectionBand>
      <SectionBand tone="white" className="min-h-[50vh] !pt-12">
        {children}
      </SectionBand>
    </>
  );
}
