import type { Metadata } from "next";
import { getChurchSettings } from "@/lib/settings";
import { pageMetadata } from "@/lib/metadata";
import { SectionBand } from "@/components/ui/section-band";
import { PageHero } from "@/components/ui/page-hero";
import { TextLink } from "@/components/ui/text-link";
import { ContactForm } from "@/components/contact/contact-form";
import { RevealSection } from "@/components/journey/reveal-section";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Contact Us",
    description:
      "Get in touch with The New Breed Church in Victoria Island, Lagos — send us a message, find our address and directions, or reach us by phone or email.",
    path: "/contact",
  });
}

export default async function ContactPage() {
  const settings = await getChurchSettings();
  const fullAddress = `${settings.streetAddress}, ${settings.addressLocality}, ${settings.addressRegion}, ${settings.addressCountry}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  const rows = [
    {
      label: "Visit us",
      href: mapsUrl,
      external: true,
      value: (
        <>
          {settings.streetAddress}
          <br />
          {settings.addressLocality}, {settings.addressRegion}, {settings.addressCountry}
        </>
      ),
      cta: "Get directions",
    },
    {
      label: "Call us",
      href: `tel:${settings.phone.replace(/\s+/g, "")}`,
      value: settings.phone,
      cta: "Call now",
    },
    {
      label: "Email us",
      href: `mailto:${settings.email}`,
      value: settings.email,
      cta: "Send email",
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        lines={["Get", "in touch"]}
        image="/images/general/general-congregation-worship-2.jpg"
        description="Have a question, a prayer request, or just want to say hello? We'd love to hear from you — send us a message and someone from our team will get back to you soon."
      />

      <SectionBand tone="white">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-5">
          <RevealSection className="min-w-0 lg:col-span-3">
            <ContactForm />
          </RevealSection>

          <ul className="min-w-0 lg:col-span-2">
            {rows.map((row) => (
              <li key={row.label} className="border-t border-current/20 py-7 last:border-b">
                <p className="t-eyebrow text-brand-700 dark:text-brand-300">{row.label}</p>
                <p className="mt-3 break-words font-display text-xl font-bold uppercase leading-tight tracking-tight sm:text-2xl">
                  {row.value}
                </p>
                <div className="mt-4">
                  <TextLink href={row.href} external={row.external} prefetch={false}>
                    {row.cta}
                  </TextLink>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </SectionBand>
    </>
  );
}
