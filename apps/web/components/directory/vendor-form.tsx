"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { useKeepForm } from "@/lib/use-keep-form";
import type { ActionResult } from "@/lib/action-result";
import type { Vendor, VendorStatus } from "@nb-church/db";
import { VENDOR_STATUS_LABELS } from "@/lib/directory";
import { cn } from "@/lib/utils";

type UploadFn = (category: string, formData: FormData) => Promise<{ ok: true; url: string } | { ok: false; error: string }>;

export interface VendorFormCategory {
  id: string;
  name: string;
  subcategories: string[];
}

interface VendorFormProps {
  /** "admin" uses the neutral admin look and shows moderation controls; "owner" uses the public site look. */
  variant: "admin" | "owner";
  categories: VendorFormCategory[];
  vendor?: Vendor & { owner?: { email: string } | null };
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  upload: UploadFn;
  submitLabel?: string;
}

const STYLES = {
  admin: {
    input:
      "h-10 w-full rounded-none border border-neutral-300 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/30 admin-dark:border-neutral-700 admin-dark:bg-neutral-900 admin-dark:text-neutral-100",
    textarea:
      "w-full rounded-none border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/30 admin-dark:border-neutral-700 admin-dark:bg-neutral-900 admin-dark:text-neutral-100",
    label: "text-sm font-medium text-neutral-900 admin-dark:text-neutral-100",
    hint: "text-xs text-neutral-500 admin-dark:text-neutral-400",
    section: "t-eyebrow text-brand-700 admin-dark:text-brand-300",
    rule: "border-neutral-200 admin-dark:border-neutral-800",
  },
  owner: {
    input:
      "h-11 w-full rounded-none border border-border bg-surface px-4 text-sm text-foreground focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/25",
    textarea:
      "w-full rounded-none border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/25",
    label: "text-sm font-medium",
    hint: "text-xs text-current/60",
    section: "t-eyebrow text-brand-700 dark:text-brand-300",
    rule: "border-current/20",
  },
} as const;

type FormStyles = (typeof STYLES)[keyof typeof STYLES];

function Field({
  name,
  label,
  hint,
  error,
  styles,
  children,
  span,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  styles: FormStyles;
  children: React.ReactNode;
  span?: boolean;
}) {
  return (
    <div className={cn("space-y-1.5", span && "sm:col-span-2")}>
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>
      {children}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
      {error && (
        <p role="alert" data-field-error className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

// Plain-English names for the "please fix:" summary next to the Save button.
const FIELD_LABELS: Record<string, string> = {
  businessName: "Business name",
  categoryId: "Category",
  subcategory: "Subcategory",
  description: "About your business",
  services: "Services",
  location: "Based in",
  serviceAreas: "Areas you serve",
  businessHours: "Business hours",
  priceRange: "Price range",
  yearStarted: "Year started",
  registrationNumber: "Registration number",
  phone: "Phone",
  whatsapp: "WhatsApp",
  email: "Email",
  website: "Website",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  logoUrl: "Logo",
  coverUrl: "Cover image",
  status: "Status",
  ownerEmail: "Owner account email",
  adminNotes: "Note to owner",
};

export function VendorForm({ variant, categories, vendor, action, upload, submitLabel = "Save" }: VendorFormProps) {
  const s = STYLES[variant];
  const { state, onSubmit, isPending } = useKeepForm(action);
  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  const err = (f: string) => errors[f]?.[0];
  const formRef = useRef<HTMLFormElement>(null);

  // After a failed save, bring the first problem into view — on a long form it is
  // usually far above the Save button, which made Save look like it did nothing.
  useEffect(() => {
    if (state && !state.ok && state.fieldErrors) {
      formRef.current?.querySelector("[data-field-error]")?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [state]);

  const [categoryId, setCategoryId] = useState(vendor?.categoryId ?? "");
  const subOptions = categories.find((c) => c.id === categoryId)?.subcategories ?? [];

  const text = (name: keyof Vendor, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input id={name} name={name} defaultValue={(vendor?.[name] as string | null | undefined) ?? ""} className={s.input} aria-invalid={Boolean(err(name))} {...props} />
  );

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="max-w-3xl space-y-10">
      <section className="space-y-5">
        <h2 className={s.section}>Basics</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field styles={s} error={err("businessName")} name="businessName" label="Business name" span>
            {text("businessName", { required: true, maxLength: 120 })}
          </Field>
          <Field styles={s} error={err("categoryId")} name="categoryId" label="Category">
            <select id="categoryId" name="categoryId" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={s.input}>
              <option value="">Choose a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field styles={s} error={err("subcategory")} name="subcategory" label="Subcategory" hint="Pick a suggestion or type your own.">
            {text("subcategory", { list: "subcategory-options", maxLength: 80 })}
            <datalist id="subcategory-options">
              {subOptions.map((o) => (
                <option key={o} value={o} />
              ))}
            </datalist>
          </Field>
          <Field styles={s} error={err("description")} name="description" label="About your business" span hint="What you do, what makes you different. Shown on your profile.">
            <textarea id="description" name="description" rows={5} required maxLength={1500} defaultValue={vendor?.description ?? ""} className={s.textarea} aria-invalid={Boolean(err("description"))} />
          </Field>
        </div>
      </section>

      <section className={cn("space-y-5 border-t pt-8", s.rule)}>
        <h2 className={s.section}>Services &amp; coverage</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field styles={s} error={err("services")} name="services" label="Services" span hint="One per line, or separate with commas / semicolons (up to 20).">
            <textarea id="services" name="services" rows={3} maxLength={800} defaultValue={vendor?.services.join("\n") ?? ""} className={s.textarea} />
          </Field>
          <Field styles={s} error={err("location")} name="location" label="Based in">
            {text("location", { required: true, placeholder: "e.g. Surulere, Lagos" })}
          </Field>
          <Field styles={s} error={err("serviceAreas")} name="serviceAreas" label="Areas you serve">
            {text("serviceAreas", { placeholder: "e.g. Mainland and Island" })}
          </Field>
          <Field styles={s} error={err("businessHours")} name="businessHours" label="Business hours">
            {text("businessHours", { placeholder: "e.g. Mon–Sat, 9am–6pm" })}
          </Field>
          <Field styles={s} error={err("priceRange")} name="priceRange" label="Price range">
            {text("priceRange", { placeholder: "e.g. ₦5,000 – ₦50,000" })}
          </Field>
          <Field styles={s} error={err("yearStarted")} name="yearStarted" label="Year started">
            {text("yearStarted", { type: "number", min: 1950, max: new Date().getFullYear() })}
          </Field>
          <div className="flex items-end gap-3 pb-2">
            <input id="isRegistered" name="isRegistered" type="checkbox" defaultChecked={vendor?.isRegistered ?? false} className="h-4 w-4 accent-brand-700" />
            <label htmlFor="isRegistered" className={s.label}>
              Registered business (CAC)
            </label>
          </div>
          <Field styles={s} error={err("registrationNumber")} name="registrationNumber" label="Registration number">
            {text("registrationNumber", { maxLength: 60 })}
          </Field>
        </div>
      </section>

      <section className={cn("space-y-5 border-t pt-8", s.rule)}>
        <h2 className={s.section}>Contact</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field styles={s} error={err("phone")} name="phone" label="Phone">
            {text("phone", { type: "tel", autoComplete: "tel" })}
          </Field>
          <Field styles={s} error={err("whatsapp")} name="whatsapp" label="WhatsApp" hint="Leave blank to use your phone number.">
            {text("whatsapp", { type: "tel" })}
          </Field>
          <Field styles={s} error={err("email")} name="email" label="Email">
            {text("email", { type: "email" })}
          </Field>
          <Field styles={s} error={err("website")} name="website" label="Website">
            {text("website", { placeholder: "yourbusiness.com" })}
          </Field>
          <Field styles={s} error={err("instagram")} name="instagram" label="Instagram" hint="Handle or link.">
            {text("instagram")}
          </Field>
          <Field styles={s} error={err("facebook")} name="facebook" label="Facebook">
            {text("facebook")}
          </Field>
          <Field styles={s} error={err("linkedin")} name="linkedin" label="LinkedIn">
            {text("linkedin")}
          </Field>
          <Field styles={s} error={err("tiktok")} name="tiktok" label="TikTok">
            {text("tiktok")}
          </Field>
        </div>
      </section>

      <section className={cn("space-y-5 border-t pt-8", s.rule)}>
        <h2 className={s.section}>Images</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <ImageField name="logoUrl" label="Logo" category="vendor-logos" defaultValue={vendor?.logoUrl ?? ""} upload={upload} styles={s} error={err("logoUrl")} />
          <ImageField name="coverUrl" label="Cover image" category="vendor-covers" defaultValue={vendor?.coverUrl ?? ""} upload={upload} styles={s} error={err("coverUrl")} />
        </div>
      </section>

      {variant === "admin" && (
        <section className={cn("space-y-5 border-t pt-8", s.rule)}>
          <h2 className={s.section}>Moderation</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field styles={s} error={err("status")} name="status" label="Status">
              <select id="status" name="status" defaultValue={vendor?.status ?? "APPROVED"} className={s.input}>
                {(Object.keys(VENDOR_STATUS_LABELS) as VendorStatus[]).map((v) => (
                  <option key={v} value={v}>
                    {VENDOR_STATUS_LABELS[v]}
                  </option>
                ))}
              </select>
            </Field>
            <Field styles={s} error={err("ownerEmail")} name="ownerEmail" label="Owner account email" hint="Attach this listing to a marketplace account (must already exist). Leave blank for no owner.">
              <input id="ownerEmail" name="ownerEmail" type="email" defaultValue={vendor?.owner?.email ?? ""} className={s.input} />
            </Field>
            <label className="flex items-center gap-3 text-sm">
              <input name="isVerified" type="checkbox" defaultChecked={vendor?.isVerified ?? false} className="h-4 w-4 accent-brand-700" /> Verified
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input name="isFeatured" type="checkbox" defaultChecked={vendor?.isFeatured ?? false} className="h-4 w-4 accent-brand-700" /> Featured
            </label>
            <Field styles={s} error={err("adminNotes")} name="adminNotes" label="Note to owner" span hint="Shown to the owner in their dashboard (e.g. why a listing was rejected).">
              <textarea id="adminNotes" name="adminNotes" rows={3} maxLength={1000} defaultValue={vendor?.adminNotes ?? ""} className={s.textarea} />
            </Field>
          </div>
        </section>
      )}

      {state && !state.ok && (
        <div role="alert" className="space-y-1 text-sm font-medium text-red-600">
          {state.fieldErrors ? (
            <>
              <p>Not saved yet — please fix:</p>
              <ul className="list-inside list-disc font-normal">
                {Object.entries(state.fieldErrors).map(([field, messages]) => (
                  <li key={field}>
                    <strong className="font-semibold">{FIELD_LABELS[field] ?? field}:</strong> {messages?.[0]}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>{state.error}</p>
          )}
        </div>
      )}
      {state?.ok && (
        <p role="status" className="text-sm font-medium text-green-700 dark:text-green-400">
          {state.message ?? "Saved."}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 items-center rounded-none bg-brand-700 px-8 text-sm font-bold uppercase tracking-tight text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
      >
        {isPending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

function ImageField({
  name,
  label,
  category,
  defaultValue,
  upload,
  styles,
  error,
}: {
  name: string;
  label: string;
  category: string;
  defaultValue: string;
  upload: UploadFn;
  styles: (typeof STYLES)[keyof typeof STYLES];
  error?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg(null);
    const fd = new FormData();
    fd.set("file", file);
    start(async () => {
      const res = await upload(category, fd);
      if (res.ok) {
        setValue(res.url);
        ref.current?.form?.dispatchEvent(new Event("change", { bubbles: true }));
      } else setMsg(res.error);
      if (ref.current) ref.current.value = "";
    });
  }

  return (
    <div className="space-y-2">
      <label htmlFor={name} className={styles.label}>
        {label}
      </label>
      {value.trim() && (
        <div className="relative h-28 w-28 overflow-hidden border border-neutral-300 bg-neutral-100">
          <Image src={value.trim()} alt="" fill sizes="112px" className="object-cover" unoptimized />
        </div>
      )}
      <div className="flex gap-2">
        <input id={name} name={name} value={value} onChange={(e) => setValue(e.target.value)} placeholder="Paste a URL or upload" className={styles.input} aria-invalid={Boolean(error)} />
        <button
          type="button"
          disabled={pending}
          onClick={() => ref.current?.click()}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-none border border-neutral-300 px-3 text-xs font-bold uppercase tracking-tight hover:bg-neutral-100 disabled:opacity-60 admin-dark:border-neutral-700 admin-dark:hover:bg-neutral-800"
        >
          <Upload size={14} /> {pending ? "Uploading…" : "Upload"}
        </button>
        <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} className="hidden" />
      </div>
      {(msg || error) && (
        <p role="alert" className="text-xs text-red-600">
          {msg ?? error}
        </p>
      )}
    </div>
  );
}
