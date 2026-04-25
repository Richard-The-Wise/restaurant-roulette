"use client";

import { useActionState } from "react";
import { BadgePlus, LockKeyhole, LogIn } from "lucide-react";

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

export function AuthCard({ locale }: { locale: Locale }) {
  const [signInState, signInFormAction] = useActionState(signInAction, initialState);
  const [signUpState, signUpFormAction] = useActionState(signUpAction, initialState);
  const dict = getDictionary(locale);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
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
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {dict.login.cards.map(([title, description]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5">
        <form action={signInFormAction} className="surface-panel space-y-4 px-6 py-6">
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
            <input id="sign-in-email" name="email" type="email" className="field" placeholder={dict.login.emailPlaceholder} />
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
            />
          </div>
          <FormMessage state={signInState} />
          <ActionSubmitButton className="w-full">
            <LockKeyhole className="h-4 w-4" />
            {dict.login.signInButton}
          </ActionSubmitButton>
        </form>

        <form action={signUpFormAction} className="surface-panel space-y-4 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-aurora-50 p-3 text-aurora-700">
              <BadgePlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">{dict.login.signUpTitle}</h2>
              <p className="text-sm text-slate-500">{dict.login.signUpDescription}</p>
            </div>
          </div>
          <div>
            <label htmlFor="sign-up-email" className="label">
              {dict.common.email}
            </label>
            <input id="sign-up-email" name="email" type="email" className="field" placeholder={dict.login.emailPlaceholder} />
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
            />
          </div>
          <FormMessage state={signUpState} />
          <ActionSubmitButton className="w-full bg-aurora-600 hover:bg-aurora-700">
            {dict.login.signUpButton}
          </ActionSubmitButton>
        </form>
      </section>
    </div>
  );
}
