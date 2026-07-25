import { Container } from "@/components/ui/container";

// Shared fallback for every public page that doesn't have its own
// shape-matched loading.tsx (see sermons/ and announcements/ for those) —
// Header/Footer live in the (site) layout, not here, so they stay mounted
// and responsive while this shows. Existing before this file: zero
// loading.tsx anywhere in the app, so every navigation waited for the full
// destination page before the router swapped anything.
export default function SiteLoading() {
  return (
    <Container className="animate-pulse py-16">
      <div className="mx-auto h-9 w-64 rounded bg-surface-muted" />
      <div className="mx-auto mt-3 h-5 w-96 max-w-full rounded bg-surface-muted" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-56 rounded-2xl bg-surface-muted" />
        ))}
      </div>
    </Container>
  );
}
