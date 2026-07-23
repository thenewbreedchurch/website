import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { getChurchSettings } from "@/lib/settings";
import { pageMetadata } from "@/lib/metadata";
import { Container } from "@/components/ui/container";
import { ContactForm } from "@/components/contact/contact-form";

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

  return (
    <Container className="py-16 sm:py-20">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Get in Touch</h1>
        <p className="mt-4 text-lg text-current/70">
          Have a question, a prayer request, or just want to say hello? We&apos;d love to hear
          from you — send us a message and someone from our team will get back to you soon.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-5 lg:gap-16">
        <div className="lg:col-span-3">
          <ContactForm />
        </div>

        <div className="space-y-4 lg:col-span-2">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-brand-300 dark:hover:border-brand-700"
          >
            <MapPin size={20} className="mt-0.5 shrink-0 text-brand-700 dark:text-brand-300" />
            <div>
              <p className="text-sm font-semibold">Visit Us</p>
              <p className="mt-1 text-sm text-current/70">
                {settings.streetAddress}
                <br />
                {settings.addressLocality}, {settings.addressRegion}, {settings.addressCountry}
              </p>
              <span className="mt-2 inline-block text-sm font-medium text-brand-700 dark:text-brand-300">
                Get directions →
              </span>
            </div>
          </a>

          <a
            href={`tel:${settings.phone.replace(/\s+/g, "")}`}
            className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-brand-300 dark:hover:border-brand-700"
          >
            <Phone size={20} className="shrink-0 text-brand-700 dark:text-brand-300" />
            <div>
              <p className="text-sm font-semibold">Call Us</p>
              <p className="mt-1 text-sm text-current/70">{settings.phone}</p>
            </div>
          </a>

          <a
            href={`mailto:${settings.email}`}
            className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-brand-300 dark:hover:border-brand-700"
          >
            <Mail size={20} className="shrink-0 text-brand-700 dark:text-brand-300" />
            <div>
              <p className="text-sm font-semibold">Email Us</p>
              <p className="mt-1 text-sm text-current/70">{settings.email}</p>
            </div>
          </a>
        </div>
      </div>
    </Container>
  );
}
