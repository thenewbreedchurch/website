"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Lock, Paperclip, X } from "lucide-react";
import type { ActionResult } from "@/lib/action-result";
import {
  WELFARE_DURATION_LABELS,
  WELFARE_GENDER_LABELS,
  WELFARE_MEMBERSHIP_STATUS_LABELS,
  WELFARE_SUPPORT_LABELS,
  labelEntries,
} from "@/lib/welfare";
import {
  WELFARE_ALLOWED_LABEL,
  WELFARE_MAX_FILES,
  WELFARE_MAX_FILE_BYTES,
  formatBytes,
} from "@/lib/welfare-attachments";
import { cn } from "@/lib/utils";

const inputClasses =
  "w-full rounded-none border border-border bg-surface px-4 py-2.5 text-sm text-current transition-colors focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/25 aria-[invalid=true]:border-red-500";

const YES_NO = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

type Errors = Record<string, string[] | undefined>;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-6 border-t border-current/20 pt-6">
      <h3 className="t-eyebrow text-brand-700 dark:text-brand-300">{title}</h3>
      {children}
    </section>
  );
}

function Label({ htmlFor, children, hint, optional }: { htmlFor?: string; children: React.ReactNode; hint?: string; optional?: boolean }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {children}
        {optional && <span className="font-normal text-current/50"> (optional)</span>}
      </label>
      {hint && <p className="mt-1 text-xs text-current/60">{hint}</p>}
    </div>
  );
}

function ErrorText({ errors, name }: { errors: Errors; name: string }) {
  const message = errors[name]?.[0];
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-red-600" role="alert">
      {message}
    </p>
  );
}

function RadioGroup({
  name,
  label,
  hint,
  options,
  value,
  onChange,
  errors,
  columns,
}: {
  name: string;
  label: string;
  hint?: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  errors: Errors;
  columns?: boolean;
}) {
  const invalid = Boolean(errors[name]?.[0]);
  return (
    <fieldset aria-invalid={invalid}>
      <legend className="text-sm font-medium">{label}</legend>
      {hint && <p className="mt-1 text-xs text-current/60">{hint}</p>}
      <div className={cn("mt-3 gap-2", columns ? "grid sm:grid-cols-2" : "flex flex-wrap")}>
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer items-center gap-2.5 border border-border bg-surface-muted px-3.5 py-2.5 text-sm has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50 dark:has-[:checked]:bg-white/5"
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              required
              {...(onChange ? { checked: value === opt.value, onChange: () => onChange(opt.value) } : {})}
              className="h-4 w-4 accent-brand-700"
            />
            {opt.label}
          </label>
        ))}
      </div>
      <ErrorText errors={errors} name={name} />
    </fieldset>
  );
}

function TextField({
  name,
  label,
  errors,
  type = "text",
  hint,
  optional,
  autoComplete,
  min,
  max,
}: {
  name: string;
  label: string;
  errors: Errors;
  type?: string;
  hint?: string;
  optional?: boolean;
  autoComplete?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <Label htmlFor={name} hint={hint} optional={optional}>
        {label}
      </Label>
      <input
        id={name}
        name={name}
        type={type}
        required={!optional}
        autoComplete={autoComplete}
        min={min}
        max={max}
        aria-invalid={Boolean(errors[name]?.[0])}
        className={cn(inputClasses, "mt-2.5")}
      />
      <ErrorText errors={errors} name={name} />
    </div>
  );
}

function TextArea({
  name,
  label,
  errors,
  hint,
  rows = 4,
  maxLength,
}: {
  name: string;
  label: string;
  errors: Errors;
  hint?: string;
  rows?: number;
  maxLength: number;
}) {
  const [length, setLength] = useState(0);
  return (
    <div>
      <Label htmlFor={name} hint={hint}>
        {label}
      </Label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        required
        maxLength={maxLength}
        onChange={(e) => setLength(e.target.value.length)}
        aria-invalid={Boolean(errors[name]?.[0])}
        className={cn(inputClasses, "mt-2.5 resize-y")}
      />
      <p className="mt-1 text-right text-xs text-current/60">
        {length}/{maxLength}
      </p>
      <ErrorText errors={errors} name={name} />
    </div>
  );
}

/**
 * The welfare team's intake form (replaces the generic contact fields when the
 * "Welfare / Member Care" category is chosen). Submitted manually rather than
 * through <form action> so a validation error never wipes a long form.
 */
export function WelfareForm() {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isWorker, setIsWorker] = useState<string>();
  const [supportType, setSupportType] = useState<string>();
  const [firstTime, setFirstTime] = useState<string>();
  const [lastType, setLastType] = useState<string>();
  const [hasDependents, setHasDependents] = useState<string>();
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const errors: Errors = result && !result.ok ? (result.fieldErrors ?? {}) : {};

  // After a failed submit, jump to the first field with an error.
  useEffect(() => {
    if (result && !result.ok && result.fieldErrors) {
      const el = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      el?.querySelector<HTMLElement>("input")?.focus();
      (el as HTMLInputElement | null)?.focus?.();
    }
  }, [result]);

  if (result?.ok) {
    return (
      <div role="status" className="border border-brand-200 bg-brand-50 p-8 text-brand-900 dark:border-brand-800/60 dark:bg-brand-900/20 dark:text-brand-100">
        <p className="font-display text-2xl font-bold uppercase tracking-tight">Request received</p>
        <p className="t-body mt-3 text-sm text-current/80">{result.message}</p>
      </div>
    );
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFileError(null);
    const next = [...files];
    for (const file of Array.from(list)) {
      if (next.length >= WELFARE_MAX_FILES) {
        setFileError(`You can attach up to ${WELFARE_MAX_FILES} documents.`);
        break;
      }
      if (file.size > WELFARE_MAX_FILE_BYTES) {
        setFileError(`“${file.name}” is ${formatBytes(file.size)} — each document must be 10 MB or smaller.`);
        continue;
      }
      next.push(file);
    }
    setFiles(next);
    if (fileInput.current) fileInput.current.value = "";
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Not <form action>: React would wipe the form on a validation error. Fields + documents go to a Route
    // Handler as multipart (it, not a Server Action, can carry 3 x 10 MB).
    const body = new FormData(e.currentTarget);
    for (const f of files) body.append("files", f);
    startTransition(async () => {
      try {
        const res = await fetch("/api/welfare", { method: "POST", body });
        setResult((await res.json()) as ActionResult);
      } catch {
        setResult({ ok: false, error: "We couldn't send your request — please check your connection and try again." });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10 text-foreground" noValidate>
      <p className="t-eyebrow flex items-center gap-2 text-current/70">
        <Lock size={14} aria-hidden="true" /> All information you share with us will remain confidential
      </p>

      <Section title="Applicant information">
        <TextField name="email" label="Email" type="email" autoComplete="email" errors={errors} />
        <TextField name="fullName" label="Full name" autoComplete="name" errors={errors} />
        <TextField name="occupation" label="Occupation" errors={errors} />
        <RadioGroup name="gender" label="Gender" options={labelEntries(WELFARE_GENDER_LABELS)} errors={errors} />
        <TextField name="age" label="Age" type="number" min={14} max={110} errors={errors} />
        <TextField name="phone" label="Phone number" type="tel" autoComplete="tel" errors={errors} />
        <div>
          <Label htmlFor="address">Full address</Label>
          <textarea
            id="address"
            name="address"
            rows={2}
            required
            maxLength={300}
            autoComplete="street-address"
            aria-invalid={Boolean(errors.address?.[0])}
            className={cn(inputClasses, "mt-2.5 resize-y")}
          />
          <ErrorText errors={errors} name="address" />
        </div>
      </Section>

      <Section title="Membership">
        <RadioGroup name="membershipStatus" label="Membership status" options={labelEntries(WELFARE_MEMBERSHIP_STATUS_LABELS)} errors={errors} />
        <RadioGroup name="membershipDuration" label="Duration of membership" options={labelEntries(WELFARE_DURATION_LABELS)} errors={errors} columns />
        <TextField name="fellowshipGroup" label="Fellowship group" errors={errors} />
        <RadioGroup
          name="isWorker"
          label="Are you a registered member of our workforce?"
          hint="i.e. you are either a volunteer or worker and you have a workers code"
          options={YES_NO}
          value={isWorker}
          onChange={setIsWorker}
          errors={errors}
        />
        {isWorker === "yes" && (
          <TextField
            name="department"
            label="What department do you serve with?"
            hint="Note: failure to answer this nullifies your answer above."
            errors={errors}
          />
        )}
      </Section>

      <Section title="Nature of assistance required">
        <RadioGroup
          name="supportType"
          label="Support type needed"
          options={labelEntries(WELFARE_SUPPORT_LABELS)}
          value={supportType}
          onChange={setSupportType}
          errors={errors}
          columns
        />
        {supportType === "OTHER" && <TextField name="supportOther" label="Please describe" errors={errors} />}
        <TextArea
          name="description"
          label="Description of situation"
          hint="Reason for request, urgency, context, etc."
          maxLength={2000}
          rows={6}
          errors={errors}
        />
        <TextField name="specificRequest" label="Specific request" hint="Specific amount, item, or service" errors={errors} />
      </Section>

      <Section title="Verification">
        <RadioGroup
          name="firstTimeSupport"
          label="Will this be your first time receiving TNBC support?"
          options={YES_NO}
          value={firstTime}
          onChange={setFirstTime}
          errors={errors}
        />
        {firstTime === "no" && (
          <>
            <TextField name="lastAssistanceDate" label="Date of last assistance" type="date" errors={errors} />
            <RadioGroup
              name="lastAssistanceType"
              label="Nature of last assistance"
              options={labelEntries(WELFARE_SUPPORT_LABELS)}
              value={lastType}
              onChange={setLastType}
              errors={errors}
              columns
            />
            {lastType === "OTHER" && <TextField name="lastAssistanceOther" label="Please describe" errors={errors} />}
          </>
        )}
        <TextArea
          name="triedElsewhere"
          label="What resolutions have you tried besides this?"
          hint="E.g. family members, personal efforts, etc."
          maxLength={1000}
          rows={3}
          errors={errors}
        />
        <RadioGroup
          name="hasDependents"
          label="Do you have dependents?"
          options={YES_NO}
          value={hasDependents}
          onChange={setHasDependents}
          errors={errors}
        />
        {hasDependents === "yes" && (
          <>
            <TextField name="dependentsCount" label="How many?" type="number" min={1} max={30} errors={errors} />
            <TextField name="dependentsAges" label="How old are they?" hint="E.g. 3, 7 and 12" errors={errors} />
          </>
        )}
        <RadioGroup name="homeVisitOk" label="Can a welfare member visit your home if necessary?" options={YES_NO} errors={errors} />
      </Section>

      <Section title="Supporting documents (optional)">
        <div>
          <p className="text-sm text-current/75">
            Attach anything that helps the team understand your request — e.g. a bill, invoice, medical report or admission letter.
            Up to {WELFARE_MAX_FILES} files, {WELFARE_ALLOWED_LABEL}, 10 MB each. They are seen only by the welfare team.
          </p>
          <input
            ref={fileInput}
            id="files"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.heic,image/*,application/pdf"
            onChange={(e) => addFiles(e.target.files)}
            className="sr-only"
          />
          <label
            htmlFor="files"
            className="mt-4 inline-flex cursor-pointer items-center gap-2 border border-current/40 px-4 py-3 text-sm font-bold uppercase tracking-tight hover:bg-current/5"
          >
            <Paperclip size={16} aria-hidden="true" /> Add documents
          </label>
          {files.length > 0 && (
            <ul className="mt-4 space-y-2">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 border border-border bg-surface-muted px-3.5 py-2.5 text-sm">
                  <span className="min-w-0 truncate">
                    {f.name} <span className="text-current/55">· {formatBytes(f.size)}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setFiles(files.filter((_, j) => j !== i))}
                    aria-label={`Remove ${f.name}`}
                    className="shrink-0 p-1 hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {(fileError || errors.files?.[0]) && (
            <p role="alert" className="mt-2 text-xs text-red-600">
              {fileError ?? errors.files?.[0]}
            </p>
          )}
        </div>
      </Section>

      {result && !result.ok && (
        <p role="alert" className="text-sm text-red-600">
          {result.fieldErrors ? "Please check the highlighted fields." : result.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-12 w-full items-center justify-center rounded-none bg-brand-700 px-8 text-sm font-bold uppercase tracking-tight text-white transition-colors hover:bg-brand-800 disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "Sending…" : "Submit request"}
      </button>
    </form>
  );
}
