import { Container } from "@/components/ui/container";

export default function SermonsLoading() {
  return (
    <div className="py-16">
      <Container className="animate-pulse">
        <div className="h-9 w-40 rounded bg-surface-muted" />
        <div className="mt-3 h-5 w-80 max-w-full rounded bg-surface-muted" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-[4/5] rounded-2xl bg-surface-muted" />
          ))}
        </div>
      </Container>
    </div>
  );
}
