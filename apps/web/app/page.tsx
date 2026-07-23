import { getChurchSettings } from "@/lib/settings";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";

// Placeholder homepage — Phase D replaces this with the full hero
// carousel/parallax, weekly-activities, announcements teaser, testimonies,
// and sermons sections per the plan. This exists so Phase C (layout, nav,
// design tokens) can be verified end-to-end against real data in the
// meantime.
export default async function Home() {
  const settings = await getChurchSettings();

  return (
    <Container className="flex flex-col items-start gap-6 py-24">
      <h1 className="font-display text-4xl font-bold sm:text-5xl">
        {settings.orgName}
      </h1>
      <p className="max-w-xl text-lg text-current/70">{settings.tagline}</p>
      <div className="flex gap-3">
        <LinkButton href="/first-timers" variant="primary">
          I&apos;m New
        </LinkButton>
        <LinkButton href="/announcements" variant="outline">
          This Week
        </LinkButton>
      </div>
    </Container>
  );
}
