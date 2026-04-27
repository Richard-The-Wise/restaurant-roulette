"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, UtensilsCrossed, X } from "lucide-react";

interface MobileSidebarDrawerProps {
  brandSubtitle: string;
  children: React.ReactNode;
}

export function MobileSidebarDrawer({ brandSubtitle, children }: MobileSidebarDrawerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
        <Link href="/" className="min-w-0">
          <div className="shell-panel flex items-center gap-3 px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-ink text-white">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-50">Restaurant Roulette</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-300">{brandSubtitle}</p>
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="touch-manipulation inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
          aria-label="Open navigation drawer"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {open ? (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
          />

          <aside className="absolute inset-y-0 left-0 z-[210] flex w-[min(88vw,360px)] max-w-full flex-col p-3">
            <div
              className="shell-panel flex h-full flex-col gap-5 overflow-y-auto overscroll-contain px-5 py-5 shadow-2xl"
              onSubmitCapture={() => {
                window.setTimeout(() => setOpen(false), 0);
              }}
              onClickCapture={(event) => {
                const target = event.target as HTMLElement | null;
                if (!target) {
                  return;
                }

                const interactiveTarget = target.closest("a, button, [role='button']");
                if (!interactiveTarget) {
                  return;
                }

                if (
                  (interactiveTarget as HTMLButtonElement).type === "button" &&
                  interactiveTarget.getAttribute("aria-label") === "Close navigation drawer"
                ) {
                  return;
                }

                if (interactiveTarget.tagName === "A") {
                  setOpen(false);
                }
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">Restaurant Roulette</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{brandSubtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                  aria-label="Close navigation drawer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {children}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
