"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";

interface ActionSubmitButtonProps {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  title?: string;
  disabled?: boolean;
}

export function ActionSubmitButton({ children, className, ariaLabel, title, disabled = false }: ActionSubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-label={ariaLabel}
      title={title}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70",
        className
      )}
    >
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
