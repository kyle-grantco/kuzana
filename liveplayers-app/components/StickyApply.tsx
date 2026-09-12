"use client";

import { APPLY_URL, EVENTS } from "@/lib/site";
import { CtaButton } from "./CtaButton";

/**
 * Persistent apply action on small screens so the primary goal stays in reach.
 */
export function StickyApply() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy/10 bg-ivory/95 px-4 py-3 backdrop-blur md:hidden">
      <CtaButton href={APPLY_URL} eventName={EVENTS.apply} className="w-full">
        Apply Now
      </CtaButton>
    </div>
  );
}
