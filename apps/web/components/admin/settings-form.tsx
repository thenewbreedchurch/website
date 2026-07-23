"use client";

import { useActionState } from "react";
import type { ChurchSettings } from "@nb-church/db";
import { updateChurchSettingsAction } from "@/actions/admin/settings";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormStatus } from "@/components/admin/form-status";
import type { ActionResult } from "@/lib/action-result";

export function SettingsForm({ settings }: { settings: ChurchSettings }) {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    updateChurchSettingsAction,
    null
  );
  const err = (f: string) => (state && !state.ok ? state.fieldErrors?.[f] : undefined);

  return (
    <form action={formAction} className="max-w-2xl space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Organization
        </h2>
        <Field label="Organization name" htmlFor="orgName" error={err("orgName")}>
          <Input id="orgName" name="orgName" defaultValue={settings.orgName} required />
        </Field>
        <Field label="Tagline" htmlFor="tagline" error={err("tagline")}>
          <Input id="tagline" name="tagline" defaultValue={settings.tagline} required />
        </Field>
        <Field label="Mission statement" htmlFor="missionStatement" error={err("missionStatement")}>
          <Textarea
            id="missionStatement"
            name="missionStatement"
            defaultValue={settings.missionStatement}
          />
        </Field>
        <Field label="Vision statement" htmlFor="visionStatement" error={err("visionStatement")}>
          <Textarea
            id="visionStatement"
            name="visionStatement"
            defaultValue={settings.visionStatement}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Contact
        </h2>
        <Field label="Street address" htmlFor="streetAddress" error={err("streetAddress")}>
          <Input id="streetAddress" name="streetAddress" defaultValue={settings.streetAddress} required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Locality" htmlFor="addressLocality" error={err("addressLocality")}>
            <Input id="addressLocality" name="addressLocality" defaultValue={settings.addressLocality} required />
          </Field>
          <Field label="Region" htmlFor="addressRegion" error={err("addressRegion")}>
            <Input id="addressRegion" name="addressRegion" defaultValue={settings.addressRegion} required />
          </Field>
          <Field label="Country" htmlFor="addressCountry" error={err("addressCountry")}>
            <Input id="addressCountry" name="addressCountry" defaultValue={settings.addressCountry} required />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" htmlFor="phone" error={err("phone")}>
            <Input id="phone" name="phone" defaultValue={settings.phone} required />
          </Field>
          <Field label="Email" htmlFor="email" error={err("email")}>
            <Input id="email" name="email" type="email" defaultValue={settings.email} required />
          </Field>
        </div>
        <Field label="Map embed URL" htmlFor="mapEmbedUrl" error={err("mapEmbedUrl")} hint="Optional — falls back to a Google Maps search link if left blank.">
          <Input id="mapEmbedUrl" name="mapEmbedUrl" defaultValue={settings.mapEmbedUrl ?? ""} />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Links
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Instagram URL" htmlFor="instagramUrl" error={err("instagramUrl")}>
            <Input id="instagramUrl" name="instagramUrl" defaultValue={settings.instagramUrl ?? ""} />
          </Field>
          <Field label="YouTube URL" htmlFor="youtubeUrl" error={err("youtubeUrl")}>
            <Input id="youtubeUrl" name="youtubeUrl" defaultValue={settings.youtubeUrl ?? ""} />
          </Field>
          <Field label="Facebook URL" htmlFor="facebookUrl" error={err("facebookUrl")}>
            <Input id="facebookUrl" name="facebookUrl" defaultValue={settings.facebookUrl ?? ""} />
          </Field>
          <Field label="TikTok URL" htmlFor="tiktokUrl" error={err("tiktokUrl")}>
            <Input id="tiktokUrl" name="tiktokUrl" defaultValue={settings.tiktokUrl ?? ""} />
          </Field>
          <Field label="Livestream URL" htmlFor="livestreamUrl" error={err("livestreamUrl")}>
            <Input id="livestreamUrl" name="livestreamUrl" defaultValue={settings.livestreamUrl ?? ""} />
          </Field>
          <Field label="Member registration URL" htmlFor="memberRegistrationUrl" error={err("memberRegistrationUrl")}>
            <Input
              id="memberRegistrationUrl"
              name="memberRegistrationUrl"
              defaultValue={settings.memberRegistrationUrl ?? ""}
            />
          </Field>
          <Field label="Online meeting URL" htmlFor="onlineMeetingUrl" error={err("onlineMeetingUrl")}>
            <Input
              id="onlineMeetingUrl"
              name="onlineMeetingUrl"
              defaultValue={settings.onlineMeetingUrl ?? ""}
            />
          </Field>
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center rounded-full bg-brand-700 px-6 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save Settings"}
        </button>
        <FormStatus state={state} />
      </div>
    </form>
  );
}
