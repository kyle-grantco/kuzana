/**
 * Pushes a named event to GTM/GA when those scripts are present.
 * Safe to call before analytics loads.
 * @param eventName Stable event id used in the dataLayer
 */
export function trackEvent(eventName: string): void {
  if (typeof window === "undefined") return;

  const win = window as Window & {
    dataLayer?: Record<string, string>[];
    gtag?: (...args: unknown[]) => void;
  };

  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push({ event: eventName });
  win.gtag?.("event", eventName);
}
