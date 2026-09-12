/**
 * Editable site constants for the Live Players Mittlemann Fellowship.
 * Replace the placeholder URLs before launch.
 */

/** Tally application form. Opens in a new tab so the page stays fast. */
export const APPLY_URL = "https://tally.so/r/xXLlry";

/** Artizen campaign where donors fund a fellow. */
export const ARTIZEN_URL = "https://artizen.fund/your-campaign";

/** Public contact for applicants and donors. */
export const CONTACT_EMAIL = "info@kuzana.co";

export const SITE_URL = "https://liveplayers.kuzana.co";

export const SITE_TITLE = "Live Players Mittlemann Fellowship";

export const SITE_DESCRIPTION =
  "Do real work inside ambitious Kenyan companies. A four-month fellowship in Nairobi, May–September 2027, for Kenyan and Kenyan-diaspora operators aged 18–35.";

/**
 * Analytics event names. Fired on CTA clicks via dataLayer and gtag when present.
 */
export const EVENTS = {
  apply: "liveplayers_apply_click",
  fund: "liveplayers_fund_click",
  contact: "liveplayers_contact_click",
} as const;
