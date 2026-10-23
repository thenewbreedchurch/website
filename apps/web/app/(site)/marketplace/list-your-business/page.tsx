import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDirectoryUser } from "@/lib/directory-session";
import { SectionBand } from "@/components/ui/section-band";
import { Eyebrow } from "@/components/ui/eyebrow";
import { StaggeredHeading } from "@/components/ui/staggered-heading";
import { LinkButton } from "@/components/ui/link-button";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "List your business",
  description: "Get your business in front of The New Breed Church community — free to list.",
  path: "/marketplace/list-your-business",
});

const STEPS = [
  { title: "Create an account", body: "It takes a minute. We'll email you a link to confirm your address." },
  { title: "Tell us about your business", body: "Add what you do, where you're based, your prices and how to reach you. Photos help a lot." },
  { title: "We review it", body: "A member of the team checks every listing before it goes live. You'll get an email when it's approved." },
];

export default async function ListYourBusinessPage() {
  if (await getDirectoryUser()) redirect("/marketplace/dashboard/listing");
  return (
    <>
      <SectionBand tone="night" className="!pt-16 sm:!pt-24">
        <Eyebrow>For business owners</Eyebrow>
        <StaggeredHeading as="h1" className="mt-6" lines={["List your", "business"]} haloLine={1} />
        <p className="t-body mt-8 max-w-xl text-base text-white/80 sm:text-lg">
          Join the church community&apos;s marketplace — it&apos;s free, and members can find and contact you directly.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <LinkButton href="/marketplace/sign-up" size="lg">
            Create an account
          </LinkButton>
          <LinkButton href="/marketplace/sign-in?next=/marketplace/dashboard/listing" size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10">
            I already have one
          </LinkButton>
        </div>
      </SectionBand>
      <SectionBand tone="white">
        <ol>
          {STEPS.map((s, i) => (
            <li key={s.title} className="grid gap-4 border-t border-current/20 py-8 last:border-b sm:grid-cols-[5rem_18rem_1fr] sm:gap-8">
              <span className="font-display text-5xl font-bold leading-none text-brand-600">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="font-display text-2xl font-bold uppercase leading-none tracking-tight sm:text-3xl">{s.title}</h2>
              <p className="t-body max-w-md text-current/75">{s.body}</p>
            </li>
          ))}
        </ol>
      </SectionBand>
    </>
  );
}
