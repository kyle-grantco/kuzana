"use client";

import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

type CtaButtonProps = {
  href: string;
  children: ReactNode;
  /** Analytics-ready event name, e.g. liveplayers_apply_click */
  eventName: string;
  variant?: "coral" | "gold" | "ghost";
  className?: string;
};

/**
 * Primary and secondary calls to action.
 * Apply and fund links open in a new tab so Tally and Artizen never load on this page.
 */
export function CtaButton({
  href,
  children,
  eventName,
  variant = "coral",
  className = "",
}: CtaButtonProps) {
  const styles = {
    coral: "bg-coral text-navy hover:bg-[#ff8a72]",
    gold: "bg-gold text-navy hover:bg-[#ffd68a]",
    ghost: "bg-transparent text-ivory border border-ivory/70 hover:border-gold hover:text-gold",
  }[variant];

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-event={eventName}
      onClick={() => trackEvent(eventName)}
      className={`inline-flex items-center justify-center px-5 py-3 text-sm font-medium tracking-wide transition-colors duration-200 ${styles} ${className}`}
    >
      {children}
    </a>
  );
}
