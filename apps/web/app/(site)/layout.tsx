import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// Every public marketing/content page (home, about, contact, give, sermons,
// announcements, first-timers, new-converts...) lives under this route group
// so it gets the shared nav/footer. /admin/** and /linktree deliberately sit
// outside this group so they render their own minimal chrome instead.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
