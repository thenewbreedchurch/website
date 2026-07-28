import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Megaphone,
  Inbox,
  HeartHandshake,
  PlayCircle,
  Quote,
  Mail,
  TrendingUp,
  Eye,
} from "lucide-react";
import { prisma } from "@nb-church/db";
import { getSessionFromCookie } from "@/lib/session";
import { VisitsChart, type VisitsChartPoint } from "@/components/admin/visits-chart";

const VISIT_WINDOW_DAYS = 30;

// Known top-level public routes get a friendly label; anything else falls
// back to the raw path (or, for sermon/announcement detail pages, a real
// title resolved via a follow-up lookup — see getMostViewed()).
const STATIC_PATH_LABELS: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/sermons": "Sermons",
  "/announcements": "Announcements",
  "/give": "Give",
  "/contact": "Contact",
  "/first-timers": "First Timers",
  "/new-converts": "New Converts",
  "/leadership": "Leadership",
};

async function getStats() {
  const [
    publishedAnnouncements,
    newContactMessages,
    pendingInquiries,
    totalSermons,
    pendingTestimonies,
    activeSubscribers,
  ] = await Promise.all([
    prisma.announcement.count({ where: { status: "PUBLISHED" } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.newConvertInquiry.count({ where: { status: "NEW" } }),
    prisma.sermon.count(),
    prisma.testimony.count({ where: { isApproved: false } }),
    prisma.newsletterSubscriber.count({ where: { status: "ACTIVE" } }),
  ]);
  return {
    publishedAnnouncements,
    newContactMessages,
    pendingInquiries,
    totalSermons,
    pendingTestimonies,
    activeSubscribers,
  };
}

async function getVisitsOverTime(): Promise<{
  points: VisitsChartPoint[];
  totalViews: number;
  totalVisitors: number;
  windowDays: number;
}> {
  // The interval can't be interpolated directly into the raw SQL string —
  // $queryRaw treats every `${}` as a bind parameter, and a parameter can't
  // sit inside a quoted `INTERVAL '...'` literal. Computing the cutoff date
  // in JS and comparing timestamps directly sidesteps that entirely.
  const since = new Date(Date.now() - VISIT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const [rows, [totals], [earliest]] = await Promise.all([
    prisma.$queryRaw<{ day: Date; views: bigint; visitors: bigint }[]>`
      SELECT
        DATE_TRUNC('day', "createdAt") AS day,
        COUNT(*)::bigint AS views,
        COUNT(DISTINCT "visitorId")::bigint AS visitors
      FROM "PageView"
      WHERE "createdAt" >= ${since}
      GROUP BY day
      ORDER BY day ASC
    `,
    // A separate whole-window DISTINCT count, not a sum of the daily
    // per-day counts above — summing per-day would double-count a visitor
    // who returned on more than one day within the window.
    prisma.$queryRaw<{ views: bigint; visitors: bigint }[]>`
      SELECT COUNT(*)::bigint AS views, COUNT(DISTINCT "visitorId")::bigint AS visitors
      FROM "PageView"
      WHERE "createdAt" >= ${since}
    `,
    // Caps the chart's x-axis to how much history actually exists — without
    // this, a site with only a few days of real traffic (e.g. right after
    // launch) plots those days as a near-invisible sliver against ~30 empty
    // days, reading as "the chart is broken" even though the totals above
    // are already correct. Once real history exceeds VISIT_WINDOW_DAYS this
    // is a no-op (windowDays below just clamps back to the constant).
    prisma.$queryRaw<{ earliest: Date | null }[]>`SELECT MIN("createdAt") AS earliest FROM "PageView"`,
  ]);
  const byDay = new Map(
    rows.map((r) => [r.day.toISOString().slice(0, 10), { views: Number(r.views), visitors: Number(r.visitors) }])
  );

  const daysSinceFirst = earliest?.earliest
    ? Math.max(1, Math.ceil((Date.now() - earliest.earliest.getTime()) / (24 * 60 * 60 * 1000)))
    : VISIT_WINDOW_DAYS;
  const windowDays = Math.min(VISIT_WINDOW_DAYS, daysSinceFirst);

  const points: VisitsChartPoint[] = [];
  for (let i = windowDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const day = byDay.get(key);
    points.push({ date: key, views: day?.views ?? 0, visitors: day?.visitors ?? 0 });
  }
  return { points, totalViews: Number(totals.views), totalVisitors: Number(totals.visitors), windowDays };
}

async function getMostViewed() {
  const since = new Date(Date.now() - VISIT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const grouped = await prisma.pageView.groupBy({
    by: ["path"],
    where: { createdAt: { gte: since } },
    _count: { path: true },
    orderBy: { _count: { path: "desc" } },
    take: 8,
  });

  const sermonSlugs = grouped
    .filter((g) => g.path.startsWith("/sermons/"))
    .map((g) => g.path.slice("/sermons/".length));
  const announcementSlugs = grouped
    .filter((g) => g.path.startsWith("/announcements/"))
    .map((g) => g.path.slice("/announcements/".length));

  const [sermons, announcements] = await Promise.all([
    sermonSlugs.length
      ? prisma.sermon.findMany({ where: { slug: { in: sermonSlugs } }, select: { slug: true, title: true } })
      : [],
    announcementSlugs.length
      ? prisma.announcement.findMany({
          where: { slug: { in: announcementSlugs } },
          select: { slug: true, title: true },
        })
      : [],
  ]);
  const sermonTitleBySlug = new Map(sermons.map((s) => [s.slug, s.title]));
  const announcementTitleBySlug = new Map(announcements.map((a) => [a.slug, a.title]));

  return grouped.map((g) => {
    let label = STATIC_PATH_LABELS[g.path];
    if (!label && g.path.startsWith("/sermons/")) {
      const title = sermonTitleBySlug.get(g.path.slice("/sermons/".length));
      label = title ? `Sermon — ${title}` : g.path;
    } else if (!label && g.path.startsWith("/announcements/")) {
      const title = announcementTitleBySlug.get(g.path.slice("/announcements/".length));
      label = title ? `Announcement — ${title}` : g.path;
    } else if (!label) {
      label = g.path;
    }
    return { path: g.path, label, count: g._count.path };
  });
}

async function getRecentActivity() {
  const [messages, inquiries] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, subject: true, createdAt: true },
    }),
    prisma.newConvertInquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, createdAt: true },
    }),
  ]);

  const items = [
    ...messages.map((m) => ({
      id: `contact-${m.id}`,
      type: "contact" as const,
      title: m.name,
      subtitle: m.subject,
      createdAt: m.createdAt,
      href: "/admin/contact-messages",
    })),
    ...inquiries.map((i) => ({
      id: `inquiry-${i.id}`,
      type: "inquiry" as const,
      title: i.name,
      subtitle: "New convert inquiry",
      createdAt: i.createdAt,
      href: "/admin/new-convert-inquiries",
    })),
  ];

  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return items.slice(0, 8);
}

export default async function AdminDashboardPage() {
  const user = await getSessionFromCookie();
  if (!user) {
    redirect("/admin/login");
  }
  if (user.mustChangePassword) {
    redirect("/admin/change-password");
  }

  const [stats, { points: visits, totalViews, totalVisitors, windowDays }, mostViewed, recentActivity] = await Promise.all([
    getStats(),
    getVisitsOverTime(),
    getMostViewed(),
    getRecentActivity(),
  ]);

  const statTiles = [
    { href: "/admin/announcements", label: "Published announcements", value: stats.publishedAnnouncements, icon: Megaphone },
    { href: "/admin/contact-messages", label: "New contact messages", value: stats.newContactMessages, icon: Inbox },
    { href: "/admin/new-convert-inquiries", label: "Pending new-convert inquiries", value: stats.pendingInquiries, icon: HeartHandshake },
    { href: "/admin/sermons", label: "Total sermons", value: stats.totalSermons, icon: PlayCircle },
    { href: "/admin/testimonies", label: "Testimonies awaiting approval", value: stats.pendingTestimonies, icon: Quote },
    { href: "/admin/subscribers", label: "Active newsletter subscribers", value: stats.activeSubscribers, icon: Mail },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 admin-dark:text-neutral-100">
        Welcome back, {user.name ?? "Admin"}.
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statTiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="group flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md admin-dark:border-neutral-800 admin-dark:bg-neutral-900"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 admin-dark:bg-brand-500/15 admin-dark:text-brand-300">
              <tile.icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 admin-dark:text-neutral-100">{tile.value}</p>
              <p className="mt-0.5 text-sm text-neutral-500 admin-dark:text-neutral-400">{tile.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm admin-dark:border-neutral-800 admin-dark:bg-neutral-900 lg:col-span-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-brand-700 admin-dark:text-brand-300" />
            <h2 className="font-semibold text-neutral-900 admin-dark:text-neutral-100">
              Site visits — last {windowDays} day{windowDays === 1 ? "" : "s"}
            </h2>
          </div>
          <p className="mt-0.5 text-sm text-neutral-500 admin-dark:text-neutral-400">
            {totalViews.toLocaleString()} page view{totalViews === 1 ? "" : "s"} from{" "}
            {totalVisitors.toLocaleString()} unique visitor{totalVisitors === 1 ? "" : "s"} who accepted
            analytics cookies. Anonymous — no cross-site tracking.
          </p>
          <div className="mt-4">
            <VisitsChart data={visits} />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm admin-dark:border-neutral-800 admin-dark:bg-neutral-900">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-brand-700 admin-dark:text-brand-300" />
            <h2 className="font-semibold text-neutral-900 admin-dark:text-neutral-100">Most viewed</h2>
          </div>
          <p className="mt-0.5 text-sm text-neutral-500 admin-dark:text-neutral-400">Last {VISIT_WINDOW_DAYS} days</p>
          {mostViewed.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-400 admin-dark:text-neutral-500">No page views recorded yet.</p>
          ) : (
            <ol className="mt-4 space-y-2.5">
              {mostViewed.map((item, i) => (
                <li key={item.path} className="flex items-center gap-3 text-sm">
                  <span className="w-4 shrink-0 text-neutral-400 admin-dark:text-neutral-600">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-neutral-700 admin-dark:text-neutral-300">{item.label}</span>
                  <span className="shrink-0 font-medium text-neutral-900 admin-dark:text-neutral-100">{item.count}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm admin-dark:border-neutral-800 admin-dark:bg-neutral-900">
        <h2 className="font-semibold text-neutral-900 admin-dark:text-neutral-100">Recent activity</h2>
        <p className="mt-0.5 text-sm text-neutral-500 admin-dark:text-neutral-400">
          Latest contact messages and new-convert inquiries.
        </p>
        {recentActivity.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-400 admin-dark:text-neutral-500">Nothing yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-neutral-100 admin-dark:divide-neutral-800">
            {recentActivity.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 py-2.5 transition-colors hover:text-brand-700 admin-dark:hover:text-brand-300"
                >
                  <span
                    className={
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full " +
                      (item.type === "contact"
                        ? "bg-brand-50 text-brand-700 admin-dark:bg-brand-500/15 admin-dark:text-brand-300"
                        : "bg-rose-50 text-rose-700 admin-dark:bg-rose-500/15 admin-dark:text-rose-300")
                    }
                  >
                    {item.type === "contact" ? <Inbox size={14} /> : <HeartHandshake size={14} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-neutral-900 admin-dark:text-neutral-100">
                      {item.title}
                    </span>
                    <span className="block truncate text-xs text-neutral-500 admin-dark:text-neutral-400">
                      {item.subtitle}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-neutral-400 admin-dark:text-neutral-500">
                    {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
