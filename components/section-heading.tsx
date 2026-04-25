interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-aurora-600">{eyebrow}</p>
      <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">{title}</h1>
      <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
    </div>
  );
}
