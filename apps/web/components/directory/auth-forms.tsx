"use client";

import { useState, useTransition } from "react";
import { useKeepForm } from "@/lib/use-keep-form";
import Link from "next/link";
import {
  requestResetAction,
  resetPasswordAction,
  resendVerificationAction,
  signInAction,
  signUpAction,
  verifyDirectoryEmailAction,
} from "@/actions/directory-auth";
import type { ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";

const input =
  "mt-2 h-12 w-full rounded-none border border-white/30 bg-white/10 px-4 text-sm text-white placeholder:text-white/50 focus:border-white focus:outline-none aria-[invalid=true]:border-red-400";
const submit =
  "h-12 w-full rounded-none bg-brand-600 px-6 text-sm font-bold uppercase tracking-tight text-white transition-colors hover:bg-brand-500 disabled:opacity-60";
const link = "text-white/80 underline underline-offset-4 hover:text-white";

function Field({ name, label, type = "text", autoComplete, errors, hint }: { name: string; label: string; type?: string; autoComplete?: string; errors?: string[]; hint?: string }) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input id={name} name={name} type={type} autoComplete={autoComplete} required aria-invalid={Boolean(errors?.[0])} className={input} />
      {hint && !errors?.[0] && <p className="mt-1.5 text-xs text-white/55">{hint}</p>}
      {errors?.[0] && (
        <p role="alert" className="mt-1.5 text-xs text-red-300">
          {errors[0]}
        </p>
      )}
    </div>
  );
}

function Status({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  if (state.ok)
    return (
      <p role="status" className="border border-white/25 bg-white/10 p-4 text-sm">
        {state.message}
      </p>
    );
  if (state.fieldErrors) return null;
  return (
    <p role="alert" className="text-sm text-red-300">
      {state.error}
    </p>
  );
}

const fe = (s: ActionResult | null, f: string) => (s && !s.ok ? s.fieldErrors?.[f] : undefined);

export function SignInForm({ next }: { next?: string }) {
  const { state, onSubmit, isPending: pending } = useKeepForm(signInAction);
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}
      <Field name="email" label="Email" type="email" autoComplete="username" errors={fe(state, "email")} />
      <Field name="password" label="Password" type="password" autoComplete="current-password" errors={fe(state, "password")} />
      <Status state={state} />
      <button type="submit" disabled={pending} className={submit}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="flex flex-wrap justify-between gap-3 text-sm">
        <Link href="/marketplace/forgot-password" className={link}>
          Forgot your password?
        </Link>
        <Link href="/marketplace/sign-up" className={link}>
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm() {
  const { state, onSubmit, isPending: pending } = useKeepForm(signUpAction);
  if (state?.ok) return <Status state={state} />;
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field name="name" label="Your name" autoComplete="name" errors={fe(state, "name")} />
      <Field name="email" label="Email" type="email" autoComplete="email" errors={fe(state, "email")} />
      <Field name="password" label="Password" type="password" autoComplete="new-password" errors={fe(state, "password")} hint="At least 12 characters, with a letter and a number." />
      <Status state={state} />
      <button type="submit" disabled={pending} className={submit}>
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-sm">
        Already have an account?{" "}
        <Link href="/marketplace/sign-in" className={link}>
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const { state, onSubmit, isPending: pending } = useKeepForm(requestResetAction);
  if (state?.ok) return <Status state={state} />;
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field name="email" label="Email" type="email" autoComplete="email" errors={fe(state, "email")} />
      <Status state={state} />
      <button type="submit" disabled={pending} className={submit}>
        {pending ? "Sending…" : "Email me a reset link"}
      </button>
      <p className="text-sm">
        <Link href="/marketplace/sign-in" className={link}>
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const { state, onSubmit, isPending: pending } = useKeepForm(resetPasswordAction.bind(null, token));
  if (state?.ok)
    return (
      <div className="space-y-5">
        <Status state={state} />
        <Link href="/marketplace/sign-in" className={cn(submit, "inline-flex items-center justify-center")}>
          Sign in
        </Link>
      </div>
    );
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field name="password" label="New password" type="password" autoComplete="new-password" errors={fe(state, "password")} hint="At least 12 characters, with a letter and a number." />
      <Status state={state} />
      <button type="submit" disabled={pending} className={submit}>
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}

export function VerifyEmailButton({ token }: { token: string }) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  if (result?.ok)
    return (
      <div className="space-y-5">
        <Status state={result} />
        <Link href="/marketplace/sign-in" className={cn(submit, "inline-flex items-center justify-center")}>
          Continue
        </Link>
      </div>
    );
  return (
    <div className="space-y-5">
      <Status state={result} />
      <button type="button" disabled={pending} onClick={() => start(async () => setResult(await verifyDirectoryEmailAction(token)))} className={submit}>
        {pending ? "Verifying…" : "Verify my email"}
      </button>
    </div>
  );
}

export function ResendVerificationButton() {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  return (
    <span>
      <button type="button" disabled={pending} onClick={() => start(async () => setResult(await resendVerificationAction()))} className="underline underline-offset-4 disabled:opacity-60">
        {pending ? "Sending…" : "Resend verification email"}
      </button>
      {result && <span className="ml-3 text-xs">{result.ok ? result.message : result.error}</span>}
    </span>
  );
}
