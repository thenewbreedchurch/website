// Shown instantly the moment any admin nav link is clicked, replacing only
// the content area inside app/admin/(protected)/layout.tsx — the sidebar
// itself is part of that layout, not this segment, so it stays mounted and
// responsive the whole time. Before this file existed, there was no
// loading.tsx anywhere in the app, so the router waited for the destination
// page's full data fetch before swapping anything — from the sidebar's
// mobile drawer, that looked like "the drawer closes and the old page just
// sits there." One generic skeleton here covers every admin page with a
// single file rather than one per route.
export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-48 rounded bg-neutral-200 admin-dark:bg-neutral-800" />
      <div className="mt-2 h-4 w-72 rounded bg-neutral-200 admin-dark:bg-neutral-800" />

      <div className="mt-6 h-9 w-28 rounded-full bg-neutral-200 admin-dark:bg-neutral-800" />

      <div className="mt-6 space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-neutral-200 admin-dark:bg-neutral-800" />
        ))}
      </div>
    </div>
  );
}
