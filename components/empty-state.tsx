import Link from "next/link";
import { ArrowRight, UtensilsCrossed } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
}

export function EmptyState({ title, description, ctaHref, ctaLabel }: EmptyStateProps) {
  return (
    <div className="surface-panel flex flex-col items-start gap-6 px-6 py-10">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-aurora-50 text-aurora-600">
        <UtensilsCrossed className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <p className="max-w-lg text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <Link
        href={ctaHref}
        className="inline-flex items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        {ctaLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
