import { Container } from "@/components/ui/container";

export default function AnnouncementsLoading() {
  return (
    <div className="py-16">
      <Container className="animate-pulse">
        <div className="h-9 w-64 rounded bg-surface-muted" />
        <div className="mt-3 h-5 w-96 max-w-full rounded bg-surface-muted" />

        <div className="mt-10 h-8 w-48 rounded bg-surface-muted" />
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-surface-muted" />
          ))}
        </div>

        <div className="mt-12 h-8 w-40 rounded bg-surface-muted" />
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-surface-muted" />
          ))}
        </div>
      </Container>
    </div>
  );
}
