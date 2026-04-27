"use client";

import { useActionState, useState } from "react";
import { BadgePlus, LockKeyhole, LogIn, X } from "lucide-react";

import { signInAction, signUpAction } from "@/app/(auth)/login/actions";
import { ActionSubmitButton } from "@/components/action-submit-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { FormState } from "@/types/domain";

const initialState: FormState = { status: "idle" };

function FormMessage({ state }: { state: FormState }) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  return (
    <p
      className={
        state.status === "success"
          ? "rounded-2xl bg-aurora-50 px-4 py-3 text-sm text-aurora-700"
          : "rounded-2xl bg-coral-100 px-4 py-3 text-sm text-coral-500"
      }
    >
      {state.message}
    </p>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.6 12 2.6 6.8 2.6 2.6 6.8 2.6 12S6.8 21.4 12 21.4c6.9 0 9.1-4.8 9.1-7.3 0-.5-.1-.9-.1-1.3H12Z" />
      <path fill="#34A853" d="M2.6 7.7l3.2 2.3C6.7 7.7 9.1 6 12 6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.6 12 2.6c-3.7 0-6.9 2.1-8.5 5.1Z" />
      <path fill="#FBBC05" d="M12 21.4c2.5 0 4.7-.8 6.3-2.3l-2.9-2.4c-.8.6-1.9 1-3.4 1-3.9 0-5.2-2.6-5.5-3.9l-3.2 2.4c1.6 3.1 4.8 5.2 8.7 5.2Z" />
      <path fill="#4285F4" d="M21.1 12.8c0-.5-.1-.9-.1-1.3H12v3.9h5.5c-.3 1.3-1.5 2.8-2.9 3.6l2.9 2.4c1.7-1.6 3.6-4.4 3.6-8.6Z" />
    </svg>
  );
}

export function AuthCard({ locale, next }: { locale: Locale; next: string }) {
  const [signInState, signInFormAction] = useActionState(signInAction, initialState);
  const [signUpState, signUpFormAction] = useActionState(signUpAction, initialState);
  const [showSignUp, setShowSignUp] = useState(false);
  const dict = getDictionary(locale);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="shell-panel px-8 py-8 sm:px-10">
          <div className="mb-8 flex justify-end">
            <LanguageSwitcher locale={locale} compact />
          </div>
          <div className="max-w-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-aurora-600">{dict.login.eyebrow}</p>
            <h1 className="font-[var(--font-display)] text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              {dict.login.title}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">{dict.login.description}</p>
          </div>
        </section>

        <section className="grid gap-4">
          <form action={signInFormAction} className="surface-panel space-y-4 px-6 py-6" autoComplete="off" suppressHydrationWarning>
            <input type="hidden" name="next" value={next} suppressHydrationWarning />
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <LogIn className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">{dict.login.signInTitle}</h2>
                <p className="text-sm text-slate-500">{dict.login.signInDescription}</p>
              </div>
            </div>
            <div>
              <label htmlFor="sign-in-email" className="label">
                {dict.common.email}
              </label>
              <input
                id="sign-in-email"
                name="email"
                type="email"
                className="field"
                placeholder={dict.login.emailPlaceholder}
                autoComplete="off"
                suppressHydrationWarning
              />
            </div>
            <div>
              <label htmlFor="sign-in-password" className="label">
                {dict.common.password}
              </label>
              <input
                id="sign-in-password"
                name="password"
                type="password"
                className="field"
                placeholder={dict.login.passwordPlaceholder}
                autoComplete="new-password"
                suppressHydrationWarning
              />
            </div>
            <FormMessage state={signInState} />
            <ActionSubmitButton className="w-full">
              <LockKeyhole className="h-4 w-4" />
              {dict.login.signInButton}
            </ActionSubmitButton>
          </form>

          <a
            href={`/auth/google?next=${encodeURIComponent(next)}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 transition hover:bg-slate-50 dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-900"
          >
            <GoogleIcon />
            {dict.login.googleButton}
          </a>

          <button
            type="button"
            onClick={() => setShowSignUp(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            <BadgePlus className="h-4 w-4 text-aurora-600" />
            {dict.login.openSignUpButton}
          </button>
        </section>
      </div>

      {showSignUp ? (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label={dict.login.closeSignUp}
            onClick={() => setShowSignUp(false)}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
          />

          <section className="surface-panel relative z-10 w-full max-w-md space-y-4 px-6 py-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-aurora-50 p-3 text-aurora-700">
                  <BadgePlus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">{dict.login.signUpTitle}</h2>
                  <p className="text-sm text-slate-500">{dict.login.signUpDescription}</p>
                </div>
              </div>
              <button
                type="button"
                aria-label={dict.login.closeSignUp}
                onClick={() => setShowSignUp(false)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={signUpFormAction} className="space-y-4" autoComplete="off" suppressHydrationWarning>
              <input type="hidden" name="next" value={next} suppressHydrationWarning />
              <div>
                <label htmlFor="sign-up-email" className="label">
                  {dict.common.email}
                </label>
                <input
                  id="sign-up-email"
                  name="email"
                  type="email"
                  className="field"
                  placeholder={dict.login.emailPlaceholder}
                  autoComplete="off"
                  suppressHydrationWarning
                />
              </div>
              <div>
                <label htmlFor="sign-up-password" className="label">
                  {dict.common.password}
                </label>
                <input
                  id="sign-up-password"
                  name="password"
                  type="password"
                  className="field"
                  placeholder={dict.login.strongPasswordPlaceholder}
                  autoComplete="new-password"
                  suppressHydrationWarning
                />
              </div>
              <FormMessage state={signUpState} />
              <ActionSubmitButton className="w-full bg-aurora-600 hover:bg-aurora-700">
                {dict.login.signUpButton}
              </ActionSubmitButton>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
