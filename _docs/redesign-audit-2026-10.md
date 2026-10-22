# Kuzana redesign audit (Oct 2026)

**User scope confirmed 2026-10-22:** Upgrade the design while preserving every existing connection and destination. Substack signup stays with Kuzana Substack; WhatsApp links keep their existing destinations; forms retain their current providers, field types, submissions, integrations and confirmation redirects. Keep Apply's existing form provider and attribution; an on-site Apply presentation is authorized by the subsequent Apply-page request. Do not replace services or add backend or tracking behavior as part of visual work. Leave `/connect/` and `/b4slides/` alone. Recommendations below that change connections are audit observations, not authorization to implement them.

**Legacy-page styling completed, 2026-10-22:** Payment, Waitlist, Bottleneck confirmation, application success and screening success now use the new design. All 32 content pages are styled; redirects and the excluded Connect/B4 slides pages retain their behavior. Section 14 supersedes the five-page styling gap recorded in the earlier verification snapshot. Production issues remain as documented.

What this compares: the Claude Design export in `~/Downloads/Kuzana new website direction/` against the live repo (`main` @ 8c5a09d). No files in the live site were changed to produce this audit.

**Motion update, 2026-10-22:** Testimonial quotes now crossfade and animate their container height. FAQ answers, filtered results, checklist feedback and the mobile menu have short interaction animations. The shared runtime starts decorative and entrance animations when their elements enter view; previously several decorations ran at page load, including offscreen and hidden responsive variants, while initially visible reveal elements were skipped. Hover effects are limited to pointer devices, with press feedback for touch. Reduced-motion changes are handled while the page is open, and content remains visible when the animation API is unavailable. Desktop and Chrome mobile touch emulation cover rapid selections, keyboard tabs, FAQ reversal, menu closure, filters and reduced-motion behavior. Existing destinations and form integrations are preserved.

**Phone follow-up, 2026-10-22:** A fresh phone viewport had zero entrance animations on the opening Finale section. Its copy and video now have explicit entrance hooks, and the shared runtime adds missing heading hooks across redesigned pages. Mobile reveals use a more visible 24px rise over 680ms, and hero photos gently zoom between three-second changes. Entrances reset when crossing a responsive layout breakpoint, while browser-bar height changes do not restart them. Counter runs are cancelled safely during layout changes. Shared motion assets and homepage gallery assets have content-versioned URLs to refresh mobile caches; update those hashes when changing the files. Chrome and WebKit phone checks cover all 26 redesigned pages, actual computed photo movement, photo rotation, touch interactions, responsive replay and reduced motion. This is browser-engine testing, not confirmation of behavior on the user's physical device.

## 1. What the design export is

| File | What it is | Use |
|---|---|---|
| `Kuzana Website.dc.html` | Master prototype: 31 page templates in one file, hash-routed (`#/apply`, `#/faq`…) | Source of truth for every page |
| `Kuzana Homepage / How It Works / Portfolio / Resources / About / Investors / Referral .dc.html` | Standalone copies of 7 of those pages | Same content as the master |
| `Kuzana Website/*.html`, `site/index.html` | Self-unpacking JS bundles (0.6–26 MB each) | Not deployable: blank without JS, no SEO, huge |
| `Kuzana Phase 1 Strategy.dc.html` | Designer's conversion audit, IA and wireframe notes | Intent ("every existing URL stays"; "Apply stays a plain link to form.kuzana.co/apply so attribution.js keeps tagging it") |
| `Kuzana Visual Directions.dc.html` | Two discarded visual directions | Reference only |
| `assets/kuzana-logo.png`, `kuzana-logo-reversed.png`, `kuzana-mark.png` | New logo files (reversed logo for dark backgrounds) | Must be copied into the repo |
| `site/.vercel/` | A Vercel project link | Ignore; kuzana.co is GitHub Pages |

The prototype has **no backend wiring at all**: no GTM, GA4, Clarity, Metricool, `attribution.js`, `<head>` meta, canonical, OG or JSON-LD, and every form is a mock that only flips a "submitted" state. The design must be rebuilt as static HTML pages, with each page's existing wiring carried over by hand.

Design system: Bricolage Grotesque + IBM Plex Mono; navy `#101A2E`/`#18202F`, cream `#FBF7EF`, sand `#F2EBDD`, gold `#FDC469`, coral `#FE7272`, blue `#4A6290`; three rising "growth curves" as the signature device; 1360px max width.

## 2. Page map: design ↔ live URL

| Design page | Live URL | Status |
|---|---|---|
| home | `/` | Restyle + rewrite (your fixes) |
| how | `/how-it-works/` | Restyled, but repeats claims you asked to remove (see §4) |
| pf | `/portfolio/` | Restyle + re-categorise by sales channel |
| res | `/resources/` | Restyle (approved) |
| ab | `/about/` | Restyle |
| inv | `/invest/` | **Different page.** Live `/invest/` is the pitch-deck email gate (Apps Script → "Investors" tab, emails the deck). The design is a holding-company investor pitch with no form |
| ref | `/referral/` | Restyle; must keep the real short-link generator |
| apl | `/apply/` | Design draws an on-site form; live is a redirect to form.kuzana.co/apply |
| tea | `/tea/` | Design draws a page; live is a redirect to form.kuzana.co/tea |
| quiz | `/quiz/` | Design **replaces the question set and scoring** |
| pay | `/payment/` | "Buy Kuzana shares" (see §5) |
| faq | `/faq/` | Restyle, 33 Q&As kept, regrouped |
| fdr | `/founder/` | Restyle |
| lib | `/library/` | Restyle; catalogue is a static snapshot |
| cls | `/class/` | Restyle; **drops Tally signup + videos** |
| cof | `/cofounders/` | Restyle |
| tal | `/talent/` | Restyle |
| fel | `/fellowship/` | Restyle; **drops apply-click tracking + sticky CTA** |
| fap | — (new) | Mocked on-site fellowship form; live uses form.kuzana.co/fellowship |
| t40 | `/40things/` | Restyle |
| sal | `/sales/` | Restyle |
| dek | `/deck/` | Restyle |
| d0 | `/day0/` | Restyle |
| b2 | `/batch2final/` | Restyle |
| saf | `/bizisafari/` | Restyle |
| acc | `/startup-accelerator-kenya/` | Restyle; also fixes live's shifted FAQ answers |
| pri | `/privacypolicy/` | Restyle |
| ter / rtm | `/terms.html`, `/referral/terms.html` | Restyle |
| blog | — (new) | Blog lives at blog.kuzana.co; no on-site page exists |
| bot | `/bottleneck/` | Restyle; **drops Tally registration** |

**Live pages with no design** (keep as-is): `/waitlist/`, `/bottleneck/confirmation/`, `/finale/` and `/finale/tickets/`, `/application-success.html`, `/screening-success.html`, `/404.html`, and the redirect stubs `/apply/`, `/applyli/`, `/c/`, `/event/`, `/community/`, `/40ThingsBeforeTheDeck/`, `/liveplayers/`. Also `liveplayers-app/`, a separate Next.js app.

## 3. Connections that must survive (the design drops all of these)

### Analytics on the live site today
- GTM `GTM-TZS5FPT8` (it also injects the second GA4 property, G-3YH39XESVF) is on 30 pages. GA4 `G-FB5N4P252E` (gtag) is on 14. Clarity `xudn3i0jbj` is on 20. Metricool is on `/deck/` and `/library/`.
- Pages with **no GTM/GA4 today**:
  - `/about/`, `/how-it-works/`, `/founder/`, `/startup-accelerator-kenya/`, `/quiz/`, `/class/`, `/library/`, `/day0/`, `/bottleneck/`, `/tea/`, `/deck/`, `/referral/terms.html`
  - As a result, the quiz's `investment_readiness_quiz_submit` event never fires today.
- The homepage defines a `handleApplyClick()` → `dataLayer.push({event:'apply_click'})` handler that **nothing calls**. Any GTM trigger on `apply_click` is currently dead.
- `/attribution.js` stores `source/campaign/referrer` and the referral code, and rewrites every `form.kuzana.co/apply` link. It is **missing from `/` (homepage)**, `/about/`, `/how-it-works/`, `/founder/`, `/startup-accelerator-kenya/`, `/40things/`, `/quiz/` and `/library/`, so referral and Google-search attribution is lost when people apply from the homepage.

### Lead forms → Google Sheets
- All of these POST to Apps Script `AKfycbyv42j…/exec`.
- **Routing is by `context`**, not `source`, but both must be sent unchanged.

| Page | context | Sheet tab | Extra |
|---|---|---|---|
| /40things/ | `40things_before_deck` | Founders (gid 1695097223) | sendBeacon; gtag `40things_before_deck_submit`; redirect to memo Doc |
| /sales/ | `frontier_sales_workshop` | Founders | gtag `frontier_sales_workshop_submit`; redirect to Slides |
| /quiz/ | `InvestmentReadinessQuiz` | Founders | gtag `investment_readiness_quiz_submit`; result CTAs hand `?email=` to /40things and /bottleneck |
| /deck/ | `deck_request` | Investors | **Server emails the deck** and notifies Kyle |
| /waitlist/ | `course_waitlist` | Waitlist | gtag `course_waitlist_submit` |
| /finale/ | (finale) | finale streaming | gtag `finale_streaming_submit`, `finale_ticket_click` |

Other wiring:
- `/invest/` uses its own Apps Script, `AKfycbyZfww…`, for deck requests.
- `/library/` uses Apps Script `AKfycbyqFoz…`:
  - `action=borrow` with fields `borrowerUrl` and `book`, written to the Borrowers tab;
  - `action=lend` with fields `lenderUrl` and `bookName`, written to the Lend Offers tab;
  - the book list is read live from the sheet CSV.
- Tally:
  - `/bottleneck/` embeds `jakW49` with email prefill from `?email=`.
  - `/class/` embeds `yPv7v0` plus an exit-intent popup. Its free path is hidden by `data-show-free-class="false"`.
- `/fellowship/`:
  - apply links go to `form.kuzana.co/fellowship` (some with `?source=website`);
  - `data-event="fellowship_apply_click"` and `fellowship_contact_click` are pushed to dataLayer and gtag.
- `/referral/` builds a short link from the email username; the `referral/<handle>/` folders feed attribution.js's `referral` param.
- The footer Substack signup is an iframe today. The design form opens `kuzana.substack.com/subscribe?email=` in a new tab.
- `info+website@kuzana.co` is used on live; the design changes it to `info@`. This probably breaks an inbox filter.

## 4. Content conflicts with your new direction

Your direction: loan-first, revenue-based finance plus services (Lead Gen marketing), direct and digital-sales companies that own the customer, and no supermarket-dependent businesses.

- **"Equity first, never a loan"** appears on the homepage ("Is this a loan? No", the capital row), on Investors ("First instrument: always equity, never a loan"), in the How it works requirement "Want equity investment, not a loan or grant", in the accelerator page's "not a grant or loan", and in FAQ #3/#21/#26.
- **Workshop cadence** varies across the site: "12 months of Friday workshops", "All-day Fridays", "12 Friday workshops", FAQ "weekly on Friday all day / up to 4 online", the accelerator page's "monthly in-person sessions" vs "every Friday", the design apply form's "one full Friday every 2 weeks for 6 months", and FAQ "12-week program". Your new rule is 1 in person, 2 online and 1 one-to-one at their office each month.
- **"How does Kuzana make its money back"** currently says it lists on the Stock Exchange of Mauritius like Africa Eats (homepage FAQ, /faq #15, Investors "Liquidity"). New answer: revenue-based finance plus services.
- **Name-drops to remove:**
  - Berkshire Hathaway: Investors hero, How it works "We Never Exit", /founder philosophy, /faq #15
  - Warren Buffett: About principles, How it works "Smart Money", /faq #15
  - Montessori/Waldorf: About, How it works, live homepage
  - a16z: live homepage
- **KRA:** the homepage plateau #4, the colour block "Professionalise", How it works "KRA Compliance Support", About "Operations and Compliance".
- **KUZANA acronym block** ("Klear is kind…"): on the homepage Team section only.
- **Reporting requirements:** "Accounts completed by the 5th", "Professional accounting (Zoho)" and the Investors underwriting "closed by the 5th" are written as entry requirements. Per your note they apply only after investment, alongside a new rule to separate personal and business accounts.
- **Numbers do not agree with each other:**
  - Portfolio: 19 on the page, 20 in your sheet including Fastline.
  - "15 investments in 2025".
  - "Top 7 per batch".
  - Investment size: $20K equity vs $40K "cash + support" vs FAQ "$10k–20k cash".
  - Time to cash: 2 months vs about 3 months vs 4–8 weeks.
  - Revenue floor: Ksh300k (FAQ), 400k–20m (homepage), 300k–10m (accelerator) or 500k+ (design FAQ, apply form and quiz).
- **Portfolio:**
  - The design uses sector tabs; your sheet uses sales channels.
  - SoldOutAfrica appears as "StdioX Labs" in your sheet.
  - Fastline is missing: there is no logo, description or link in the repo.
- **Placeholders in the design:** next batch date ("[NEEDS FACT: date]"), the Batch 1 valuation curve ("[NEEDS DATA]", drawn as an illustration), and the Investors legal disclaimer ("[NEEDS LEGAL]").
- **Positioning:**
  - The homepage eligibility list, How it works "8 sectors", the accelerator "Businesses we help grow" and the Investors "Sector" screen are all sector-based. None mentions owning the customer or direct sales channels.
  - The quiz (live) already asks about customer channel.

## 5. Shares for sale

Several surfaces present Kuzana shares as something the public can buy:
- The design's Investors page has a primary CTA "Buy Kuzana shares" (×2), plus footer "Investors → Buy Kuzana shares" on every page.
- Live `/payment/` ("Invest in Kuzana Shares – Pay with Wire or Crypto") shows payment instructions.

Recommendation:
- Remove every public link and CTA to it.
- Set `/payment/` to `noindex` and take it out of `sitemap.xml`.
- Have counsel decide whether the page should exist at all.

## 6. Defects in the design itself (fixed in the build)

- **Homepage:**
  - A stray `iv>` text node under the logo strip.
  - The "Why Kuzana" 7-column grid overflows sideways at 390px.
- **Investors:**
  - The hero underline cuts through the headline.
  - The "7" stat is covered by the decorative curves.
- **Navigation and labels:**
  - The homepage sticky nav "Team" points to `#/about/team`.
  - The footer labels `/cofounders/` as "Cofounders" (the page recruits Kuzana partners).
- **/class/:** the "7 classes. Slides and a quiz for each" heading is wrong, because Class 7 has neither.
- **Library:**
  - The stat "Cities reached 6" is not backed by data.
  - The form field names don't match the Apps Script.
- **Talent vs fellowship dates:** talent says "May–Sep 2027", fellowship says "June 1–Sep 30 2027".

## 7. Existing SEO/markup bugs found along the way

- `og:url` points to the homepage on /faq/, /cofounders/, /deck/, /class/ and /library/.
- /class/ has two meta descriptions.
- /class/ and /library/ render the header before `<body>`.
- /founder/ and /startup-accelerator-kenya/ have no description or canonical, and share a duplicate title.
- sitemap.xml omits /founder/, /startup-accelerator-kenya/, /cofounders/, /talent/ and /fellowship/.
- Live /startup-accelerator-kenya/ FAQ answers are shifted one question off.

## 8. More findings from the per-page audits

- **The live referral bug is on the homepage.**
  - How short links work: `kuzana.co/<handle>` hits `404.html`, which redirects to `/?referral=<handle>`. `attribution.js` should then save `kuzanaReferralCode` and add `&referral=` to the Apply links.
  - The homepage stopped loading `attribution.js` in commit c27baf6 (2026-07-08), so the referral code is never saved. Only GA4 sees it, in the page URL.
  - The rebuilt homepage must load `attribution.js`.
- **Referral terms disagree with each other.**
  - `terms.html` says "up to Ksh 50,000", paid by M-Pesa or bank within 30 days.
  - `referral/terms.html` says Ksh100,000, paid half cash and half stock options.
  - The live homepage still says Ksh50,000.
  - The design copies `terms.html` but silently changes it to Ksh100,000 and "Ksh500k+", while keeping the 2024 effective date.
- **The design's referral generator must not ship.** It base64-encodes the referrer's full email into a `#/apply?ref=` hash, which `attribution.js` can't read and anyone can decode. Keep the live handle-based link.
- **`/apply/` (design pg_apl):** the design builds an on-site form with "Batch5 starts Jan 2027", "Soft deadline Nov 15 2026", "$40k", "one Friday every 2 weeks for 6 months" and "want equity (no loans)", and pages 2–7 are placeholders. Keep `/apply/` as the attribution-aware redirect to form.kuzana.co/apply.
- **`/tea/` (design pg_tea):** keep the 2-second redirect so LinkedIn can preview the page, and keep its `utm_*` params. The design's mock form says "batch4" while the apply form says Batch5.
- **`/payment/`:** shows Choice Financial wire details, account 202406228438, and `kuzana.eth`. No live page links to it, but it is in `sitemap.xml` and `llms.txt`.
- **`/bizisafari/`:** the canonical points to `/bizisafaritest/`. The page has LinkedIn conversion 26280729 plus gtag `bizisafari_email_click` on the mailto CTA.
- **`/batch2final/`** (event past, "Apply for Batch3") and **`/bizisafari/`** ("Batch 3 final pitch") contain stale copy in both the live pages and the design.
- **`/applyli/`** carries LinkedIn Insight partner 8820217. Keep it.
- **`/application-success.html` and `/screening-success.html`** have no conversion tracking.
- **`sitemap.xml`** lists `noindex` redirect pages (`/apply/`, `/applyli/`, `/community/`) and `/payment/`, and is missing about, how-it-works, founder, cofounders, talent, fellowship, quiz, sales, 40things, startup-accelerator-kenya, bottleneck and tea.
- **The privacy policy** doesn't disclose Clarity session recording or LinkedIn Insight.
- **`liveplayers-app/`** is a stale Next.js app (Tally `xXLlry`, placeholder Artizen URL). The design doesn't touch it.

## 9. Current route coverage audit — 22 October 2026

This section audits the current working implementation, rather than the historical
prototype findings above. It compares the original website routes in fetched
`origin/main` (`4d2b1bd`), the 31 templates in `Kuzana Website.dc.html`, and the
local redesign. The public `/cofounders/` page was also fetched directly.

The original website has **44 active HTML routes** after excluding `index-old.html`
and the separate `liveplayers-app/` project. All 44 route files still exist.
The current implementation contains:

| Status | Routes |
| --- | ---: |
| Redesigned local pages | 27 |
| Content pages retaining their old visual design | 5 |
| External application/booking redirects | 1 |
| Standalone page consolidated into the homepage | 1 |
| Other utility redirects | 10 |
| **Total** | **44** |

The complete route-by-route inventory is in
[`redesign-route-coverage-2026-10.csv`](redesign-route-coverage-2026-10.csv).

### Cofounders is implemented locally; its public page is still the older version

- The original design includes `pg_cof`, so Cofounders is not absent from the export.
- `cofounders/index.html` uses the new shared assets, header/footer, typography,
  palette and motion. It retains the six role descriptions and the original
  `mailto:info+website@kuzana.co` contact destination.
- The public `https://kuzana.co/cofounders/` still loads
  `../assets/css/style.css` and contains none of the new `/assets/kz/` assets.
  The local redesign has not replaced that public page.
- Local preview: `http://localhost:8765/cofounders/`.

### Actual gaps and differences

| Route | Present in the original design export? | Current local implementation | Gap |
| --- | --- | --- | --- |
| `/tea/` | Yes, incomplete form mockup | Existing booking-form redirect | The on-site booking mockup has not been implemented. Mockup pages 2–5 are placeholders. |
| `/how-it-works/` | Yes | Redirects to `/#how`, preserving query parameters | The standalone original page and its separate design have been consolidated into the homepage. |
| `/payment/` | Yes | Existing payment page with old styling | The new payment design has not been applied. |
| `/waitlist/` | No | Existing functional course waitlist, using Outfit/Instrument Serif | No redesign in the new shared visual system. |
| `/bottleneck/confirmation/` | No | Existing confirmation page with system fonts and its own styles | No redesign to match the Bottleneck registration page. |
| `/application-success.html` | No | Existing success page with system fonts and its own styles | No redesign to match the main site. |
| `/screening-success.html` | No | Existing screening confirmation page with system fonts and its own styles | No redesign to match the main site. |

These are **seven coverage gaps/differences**, not seven deleted or broken routes.
Of these, five retain legacy page styling, one retains an external booking flow, and one
has been merged into another page. Any future implementation must preserve the
existing submission, booking, payment and redirect connections unless the owner
explicitly changes that scope.

### Pages already using the new design locally

`/`, `/40things/`, `/about/`, `/apply/`, `/batch2final/`, `/bizisafari/`, `/bottleneck/`,
`/class/`, `/cofounders/`, `/day0/`, `/deck/`, `/faq/`, `/fellowship/`, `/finale/`,
`/founder/`, `/invest/`, `/library/`, `/portfolio/`, `/privacypolicy/`, `/quiz/`,
`/referral/`, `/referral/terms.html`, `/resources/`, `/sales/`,
`/startup-accelerator-kenya/`, `/talent/`, and `/terms.html`.

### Original routes without a prototype, and intentional exclusions

The prototype omitted the five original content pages `/finale/`, `/waitlist/`,
`/bottleneck/confirmation/`, `/application-success.html`, and
`/screening-success.html`. Finale has since been redesigned locally; the other four
are in the gap table above.

It also omitted ten utility routes: `/404.html`, `/40ThingsBeforeTheDeck/`,
`/applyli/`, `/b4slides/`, `/c/`, `/community/`, `/connect/`, `/event/`,
`/finale/tickets/`, and `/liveplayers/`. These are redirects or referral routing,
not missing content pages. `/connect/` and `/b4slides/` remain explicitly excluded
from redesign. Preserve their behavior.

The prototype's additional `pg_fap` fellowship application and `pg_blog` screens
do not correspond to original on-site routes. The existing external fellowship
application and blog destinations remain connected; they are not deleted pages.

No website behavior or page implementation was changed during this coverage audit.


## 10. Apply implementation — 22 October 2026

The owner requested the new styling on Apply. `/apply/` is now a page in the shared
Kuzana design system, with a navy introduction, cream form layout, responsive
founder guidance, shared navigation/footer and the real application embedded.
The page retains `noindex` and has a self-referencing canonical.

The existing application is Tally form `gDaEBD`, served at
`https://form.kuzana.co/apply`. The embed uses that same custom-domain URL with the
official embed and dynamic-height options. Its complete schema, eligibility
logic, later pages, partial submissions, save-for-later behavior and integrations
remain controlled by the original form. No copied mockup, new submission endpoint
or replacement form schema was introduced. No live test application was submitted.

Apply links in the redesigned site and the legacy payment page now open `/apply/`.
The LinkedIn `/applyli/` alias retains its Insight tag and forwards its original
`source=linkedin&campaign=apply` parameters to the styled page. The attribution
helper now recognizes both local Apply links and the original hosted form; stored
and incoming source/campaign/referrer/referral values still carry through, with
explicit URL values taking precedence. The embed also forwards other incoming
query parameters. Direct hosted-form fallbacks remain available if embedding or
JavaScript is unavailable. Existing Apply-click event names and payload keys remain.

**Field theme status:** the website can style the surrounding page, but it cannot
inject CSS into the cross-origin Tally document. The matching field/button theme is
prepared in `scripts/kz/tally/apply.css`; it must be pasted into this form's Tally
Customize → Custom CSS settings, or applied using authenticated Tally access.
It has not been applied to the live Tally account. The page does not claim otherwise.
This theme changes presentation only and must preserve all 270 form blocks, field
IDs, required flags, eligibility logic, integrations and completion behavior.

The owner confirmed they do not have Tally access and requested that submissions
continue to their existing destinations. The optional field theme is therefore
deferred; it is not required for the embedded form to accept applications. Keep
the live form and its provider-managed submission flow. Do not replace it with a
custom form, change its integrations or request account access to complete this
presentation update. Browser verification confirmed the original form identity
and client behavior, with external writes blocked; delivery to private downstream
integrations has not been tested or independently inspected.

`/connect/` and `/b4slides/` were not changed. Substack, WhatsApp and other form
providers retain their destinations.

## 11. Resources navbar dropdown (2026-10-22)

Resources is now a shared disclosure across all 27 redesigned pages. Its links
restore the original site's Blog, Library, FAQ, Cofounders and Referral menu, with
an additional All resources link to preserve access to `/resources/`. Blog retains
`https://blog.kuzana.co/`; the other entries retain their existing site routes.

Desktop uses a cream dropdown with the shared coral accent, supporting hover,
click, native keyboard activation, Arrow Down, Escape and outside dismissal.
Mobile uses a navy accordion within the existing menu, with 44px minimum link
targets. The focus trap includes the accordion summary and only visible links;
Escape closes the nested disclosure before the main menu. Responsive changes
clear hidden disclosures. Native details provide a desktop fallback without
JavaScript; the short opening animation respects reduced motion. Link navigation
finishes before the menu is hidden, and focus changes during pointer activation
do not prematurely close the disclosure.

The shared CSS/runtime URLs have refreshed content versions and the partials are
synchronized. No form provider, submission handling or external destination was
changed; `/connect/` and `/b4slides/` remain excluded.

Chrome and WebKit checks passed for keyboard navigation, Escape/focus handling,
desktop disclosure, touch opening/closing, 320px/390px layouts, responsive resets,
reduced motion, navigation to Cofounders and the desktop no-JavaScript fallback.
Chrome additionally verified hover, movement into the panel and hover/click
interaction. Static checks passed for all 27 pages, shared asset versions match
their contents, and the partial sync reports no outstanding changes.

## 12. Homepage Finale placement (2026-10-22)

The programme hero is now the first section. The existing Batch 4 Finale video
has moved after Results and its founder testimonials, before the plateau section.
This gives the video context alongside the results and founders it discusses.
The hero includes a smaller play link, “Watch the Batch 4 Finale”, alongside the
tea link beneath Apply and WhatsApp. It scrolls to `#batch-4-finale`, with space
for both sticky navigation rows and reduced-motion support from the shared CSS.

The video title, copy, YouTube embed, muted autoplay parameters and external
YouTube fallback are preserved. The iframe now uses native lazy loading at its
new position. No modal or additional video provider was introduced. A comparison
against the preceding homepage confirms every existing link remains; the only
additional destination is the new section anchor. Styles are scoped to the
homepage in `assets/kz/kz-home.css`, with a content-versioned URL.

The hero gallery and video entrance hooks remain active. Static checks pass for
all 27 redesigned pages, including the excluded routes and original backend.

## 13. Full verification against the public site — 22 October 2026

**Verdict: a complete production sign-off is blocked.** The local redesign has
passed the browser and intercepted-flow checks below, with fixes made during the
audit. The public Library backend fails before it can process a request, a
screening follow-up form is missing, and five local content pages retain legacy
styling. The public website still serves the previous design. No release, backend
deployment or real submission was performed during verification.

This section describes the final verification status and supersedes earlier
counts or assumptions about complete coverage and production delivery in this
document. Source and connection preservation does not prove that a deployed
external service is healthy.

### Baseline and route coverage

- Fetched all **44 original public HTML routes** directly from `kuzana.co`.
  All returned HTTP 200, and all matched fetched `origin/main` (`4d2b1bd`),
  normalizing line endings. None contained the new `/assets/kz/` design assets.
- All 44 routes exist locally: **27 redesigned content pages, 5 legacy content
  pages, 1 external booking redirect, 1 consolidated How it works route, and 10
  other utility routes**. See the complete
  [route inventory](redesign-route-coverage-2026-10.csv).
- The five pages still using legacy styling are `/payment/`, `/waitlist/`,
  `/bottleneck/confirmation/`, `/application-success.html`, and
  `/screening-success.html`. Payment's navigation and small-screen defects were
  repaired during this audit; it has not received the new visual design.
- `/tea/` retains its original external booking form. `/how-it-works/` retains
  its query-preserving redirect to `/#how`. These are differences from the
  standalone prototype screens, not deleted routes.
- The prototype's on-site Blog and fellowship-application mockups are not wired
  replacements for the original external services. Those services remain in use.
- `/connect/` and `/b4slides/` remain byte-identical to upstream. Their outgoing
  redirects were checked; membership authentication and the separate Connect app
  were outside the redesign and were not exercised.

### Verification evidence

| Check | Evidence and final status |
| --- | --- |
| Public routes | 44/44 responded, with the old site still deployed |
| Outgoing links | All 97 distinct current outbound anchor destinations checked; detailed status and source pages in the [outbound audit CSV](outbound-link-audit-2026-10-22.csv) |
| Chrome layout sweep | All 32 content pages checked at 320, 390, 768 and 1440px; discovered defects received targeted rechecks after fixes |
| WebKit layout sweep | 64/64 route/viewport checks passed across all 32 content pages at 390 and 1440px |
| Interactive flows | 19 distinct scenarios passed in Chrome and 19 in WebKit, including invalid input, retry paths and all four quiz-result levels; two Chrome disclosure cases were verified separately after correcting their initial-open-state assumptions |
| Redirects and referral routing | 14 cases passed, including source/referral forwarding, existing aliases, arbitrary referral handles and `/class/<referrer>` via the GitHub Pages 404 document |
| Images | All 88 unique local image paths checked; all raster files decoded in Pillow. Chrome decoded 87 immediately; the logo decoded successfully in an independent byte-fetch/blob retry. No unresolved image defect remains |
| Runtime and structure | 93 inline scripts parsed; shared/page runtime scripts parsed; JSON-LD, local assets/links/fragments, duplicate IDs and page landmarks checked on all 27 redesigned pages |
| Mobile motion | All 27 redesigned pages passed WebKit phone-viewport heading-entrance checks; actual hero photo movement/rotation, touch testimonials/menu, responsive replay and reduced motion passed |
| Original form identity | Apply `gDaEBD`, Class `BE4OpA`, Bottleneck `jakW49`, Tea `dW2d2z`, and Fellowship `xXLlry` are publicly available and open |
| Real Apply resize | Original provider iframe matched its document height at 390, 1440 and 320px (4070, 3615 and 4582px in the WebKit check); no horizontal overflow |
| Calendar | Five fixed-time cases passed, including Tuesday, Wednesday before/during the AMA, the 6PM EAT rollover, and Thursday; weekly Wednesday recurrence retained |
| Backend source | Ten in-memory routing/validation scenarios passed with mocked Sheets and Gmail; no live rows or emails created |
| Metadata and caches | Sitemap now includes every indexable content route, including Finale and Waitlist; versioned shared assets match their hashes; partial sync is idempotent; whitespace checks pass |

Layout snapshots and contact sheets were inspected across the redesigned and
legacy pages. Third-party frames were isolated during the broad visual sweep;
the real Tally embeds were checked separately. This is Chrome/WebKit browser
testing, including touch emulation, not a test on the owner's physical phone or a
complete accessibility certification.

### Flows traced and their practical limits

| Flow | What was confirmed | Production boundary |
| --- | --- | --- |
| Apply | Local entry, original live iframe and required-field validation, source/campaign/referral forwarding, retained answers on same-page Apply clicks, direct-form/no-JS fallback | Complete application submission and private Tally integrations were not exercised |
| Finance for Founders | Original `BE4OpA`, incoming parameters, direct fallback, real mobile form and resize initialization | Submission/payment behavior inside Tally was not exercised |
| Bottleneck | Original `jakW49`, incoming email and other parameters, original provider confirmation configuration | Real registration and follow-up email/WhatsApp delivery were not exercised |
| Bottleneck confirmation | Original Meet destination and generated weekly Google Calendar template, including EAT rollover | No calendar event was saved and no meeting was joined |
| Tea / Fellowship | Original redirects/application destinations and open public forms | No booking or fellowship application was submitted |
| 40 things | Validation and prefill, original `40things_before_deck` payload, memo redirect | Outgoing write intercepted; public memo readable |
| Sales | Validation and prefill, original `frontier_sales_workshop` payload, beacon/fetch fallback and slides redirect | Outgoing write intercepted; public slides readable |
| Deck | Required email, `deck_request` payload, success display and network-failure retry | Outgoing write intercepted; actual email arrival unverified |
| Investor deck | Existing separate JSON endpoint and original deck handoff | Handler fixtures send two mocked emails. The checked-in separate investor handler does not log a Sheets row |
| Quiz | Exact seven-question schema compared with live source; four score bands, email gate, retake, result CTAs carrying email/source/campaign | `InvestmentReadinessQuiz` write intercepted; scoring schema unchanged |
| Library catalogue | Original published CSV readable; 70 unique dropdown titles, 69 display cards (the placeholder title is intentionally omitted), search/reset/empty state and selection | Live read works |
| Library Borrow / Lend | Validation, original separate `action=borrow` / `action=lend` fields, correct Sheets routing in fixtures, failure/retry and CSV fallback behavior | **Live Apps Script execution is blocked by the Rhino runtime error** |
| Waitlist | Required fields, email prefill, unchanged `course_waitlist` payload and Waitlist column order | Outgoing write intercepted |
| Finale | Email/phone validation, original streaming payload, source precedence/session persistence and ticket UTMs | Streaming lead write intercepted; checkout not completed |
| Referrals | Email normalization, existing-page collisions, short-link handling, copy and original WhatsApp/LinkedIn/email sharing URLs | No share or message was sent |
| Newsletter | Original Substack handoff with email prefill, browser validation, visible continuation link if a new tab is blocked, native GET fallback without JS | No subscription or confirmation email was requested |
| Navigation and content controls | Resources disclosure, mobile menu/focus handling, testimonials, checklist, every Portfolio/Resources filter, and FAQ disclosures | FAQ has 35 current questions: 33 original questions with three reworded for the new terminology/criteria, plus two additions; earlier 33-question counts described the old source |
| Event / tickets | Original redirects and public destinations preserved | Event form reports closed/full; no ticket purchase or event registration attempted |

### Defects repaired locally during verification

1. **Class iframe resize:** removed simultaneous `src` and `data-tally-src`, which
   prevented Tally's widget from attaching to the existing iframe. Verified
   initialization and original form identity; refreshed the page script version.
2. **Narrow-screen text:** adjusted minimum display sizes on Founder, Investors,
   Referral and Resources, and allowed the long legal heading to wrap in Terms.
   These fixes preserve the body text and legal values.
3. **Payment runtime:** removed its incompatible second menu runtime, which
   attempted to reassign the other script's global `const hamburger`; retained
   the runtime for its actual `#hamburger` / `#navMenu` header. Removed its obsolete
   duplicate Metricool loader, preserving the centralized incoming tracker.
4. **Payment layout:** fixed its content width, social-link wrapping and footer
   iframe sizing at 320px. Payment instructions and destinations were unchanged.
5. **Deck failure display:** a rejected network request no longer falls through
   to the success message and clears the entered email. The error supports retry;
   the existing endpoint and payload are unchanged. An opaque no-CORS response
   still cannot prove server-side acceptance or email delivery.
6. **Substack fallback:** added the existing subscription URL as the form's native
   GET action and added an email-prefilled continuation link after handoff. A
   blocked new tab no longer leaves the visitor without a usable next step.
7. **Sitemap coverage:** added the existing Finale and Waitlist routes. Existing
   canonical variations with/without trailing slashes were normalized for checks.
8. **Library runtime preparation:** added `"runtimeVersion": "V8"` to
   `apps-script/library/appsscript.json`. This is a local manifest change only;
   it does not fix the currently deployed web app until its deployment is updated.

The underlying Library handler code and submission URLs were preserved. The
central `gas-40things-deck/Code.js` remains byte-identical to fetched upstream.

### Remaining production issues, coverage gaps and unavailable evidence

| Priority | Finding | Required resolution or limit |
| --- | --- | --- |
| High | Library `/exec` returns HTTP 200 **with an Apps Script error HTML document**: “Execution failed. The Rhino runtime is deprecated and no longer supported.” This is not a healthy JSON response | Enable V8 and update the existing Library deployment to a new version while retaining its current `/exec` URL. Recheck health, then verify a controlled Borrow and Lend transaction against the real sheets |
| High | `/screening-success.html` sends “Continue to Full Application” to `https://tally.so/r/Gx6Og2`, which returns 404 | The correct second-stage application destination must be supplied or restored. Do not silently substitute the main Apply form |
| Design coverage | Five legacy pages listed above still use old styling | Complete their visual migration while preserving their connections; no page is missing from disk |
| Publication | All 44 public routes still match the previous site, with no redesigned assets | Local verification does not mean the redesign is deployed |
| Flow consistency | `/c/` still targets `form.kuzana.co/class`, which serves the older open form `yPv7v0`; `/class/` uses the newer `BE4OpA` | Existing alias preserved under the connection constraint; decide whether it should intentionally follow the new class flow |
| External availability | `/event/` leads to `LZXzvj`, which says “The Event is FULL” and is closed | This is the existing service state, not a newly introduced redirect defect |
| External link | Resources' `http://esha.ai` does not resolve | Preserve until a correct destination or removal is approved |
| External link | The Bizi Safari article at `www.africanaccelerationism.com/p/the-best-african-investment-no-one?...` returns 404 | A verified replacement article URL is needed |
| Automated access limit | 13 LinkedIn URLs return 999; Carta, Neil Patel and SCORE return 403 challenges. The Doola affiliate URL loops in a cookie-free HTTP client | These are not certified dead links. Interactive/signed-in checks remain necessary where applicable; the original URLs were retained |
| Legacy placeholder | Payment's “Information collection notice” is still `href="#"` | A real notice destination is needed; no legal document was invented |
| Preserved copy differences | Referral Terms advertises Ksh100,000 while the owner-restored `/terms.html` retains Ksh50,000 and older eligibility values | Existing owner-directed legal values preserved; this audit does not choose a different policy |
| Delivery and transactions | Real Sheets persistence, Gmail delivery, private Tally integrations, Substack confirmation, actual WhatsApp joining, checkout and Connect authentication were not executed | No genuine applications, emails, memberships, subscriptions, purchases or calendar events were created for testing |

Google's [V8 runtime instructions](https://developers.google.com/apps-script/guides/v8-runtime)
document the manifest setting. Its [migration procedure](https://developers.google.com/apps-script/guides/v8-runtime/migration)
also requires updating deployed web apps to a version with the runtime changes.
The local manifest fix is ready for that deployment step; the production runtime
remains a blocker at the end of this audit.

### Saved evidence

- [Machine-readable verification summary](verification-results-2026-10-22.json).
- [Every outbound URL, status and source page](outbound-link-audit-2026-10-22.csv).
- [Every original route and current design status](redesign-route-coverage-2026-10.csv).
- Raw public HTML, provider metadata, intercepted request payloads, browser
  observations, screenshots/contact sheets and the executable audit scripts:
  `/private/tmp/kuzana-verification-2026-10-22/`.

The broad Chrome process crashed during one long run; the sweep was completed
using smaller browser batches. Initial mock-script syntax errors and disclosure
initial-state assumptions were corrected in the test harness. The final 19-scenario
results for each engine reflect the corrected checks. A separate long Apply run
also lost Chrome after its form/layout/no-JS checks; its alias was independently
verified in the redirect suite, and the real iframe's identity and responsive
height passed the independent WebKit check. These infrastructure/test-harness
issues are retained in raw evidence and are not reported as production defects.


## 14. Remaining legacy-page styling completed (2026-10-22)

The five old-style content pages identified in section 13 now use the shared
Bricolage/IBM Plex typography, navy/cream/gold palette, Resources dropdown,
responsive navigation, footer and entrance animations. The route inventory now
contains **32 redesigned content pages and zero legacy-design content pages**.
Utility redirects, the consolidated How it works route and the existing Tea
provider handoff retain their existing behavior.

| Page | Updated presentation | Preserved behavior |
| --- | --- | --- |
| `/payment/` | Branded investor hero; separate bank and cryptocurrency cards; readable, selectable payment details | Every SWIFT/routing/account/address value, fees and subscription notices, Ethereum instructions and original real Substack iframe |
| `/waitlist/` | Split introduction and form panel; matching inputs, labels, focus states and validation feedback; stacked mobile fields | Original IDs, names, required fields, placeholders, revenue options, endpoint, email prefill, `course_waitlist` context/source and inline submission handler |
| `/bottleneck/confirmation/` | Branded confirmation hero; preparation checklist and AMA card with clear Meet/Calendar actions | Original preparation items, Meet URL, email contact, Africa/Nairobi calendar computation and Wednesday recurrence |
| `/application-success.html` | Application confirmation and clear next-step card | Original review/email message and home destination; no analytics loaders added |
| `/screening-success.html` | Screening progress indicator and full-application next-step card | Original second-stage Tally destination and rolling-review message; no analytics loaders added |

All five suppress the sticky mobile Apply bar to avoid competing with the form,
payment instructions or confirmation action. The shared utility styling lives in
`assets/kz/kz-completion.css` and uses a content-versioned URL. Payment's footer
variant preserves its original embedded newsletter; the confirmation pages use a
shared script variant without Metricool to preserve their previous tracking state.
The existing Waitlist and calendar handlers were compared byte-for-byte with the
pre-restyle copies. Connect, B4 slides and the central Apps Script backend remain
byte-identical to fetched upstream.

Verification performed after restyling:

- Chrome: all five pages at 320, 390, 768 and 1440px; WebKit: all five at 390 and
  1440px. No clipped text, horizontal overflow, unlabeled controls, unnamed buttons,
  JavaScript exceptions or missing local responses. A transient Chrome footer-logo
  decode failed once; fresh checks decoded that logo on all five pages in both
  engines, and the independent Bottleneck screenshot includes the loaded logo.
- Both engines: touch menu, nested Resources disclosure, Escape closure, desktop
  dropdown and mobile entrance animations on all five pages. Content remains
  readable without JavaScript at 320px. The broad layout sweep used reduced motion;
  normal-motion interactions were tested separately. No physical phone was tested.
- Waitlist: required-field validation, email prefill, original payload, success
  feedback, beacon transport and fetch fallback passed in both engines. Requests
  were intercepted; real Sheets persistence and delivery were not exercised.
- Calendar: all five fixed-time recurrence/rollover cases passed, including the
  Wednesday 6PM EAT boundary. No event was saved and no meeting was joined.
- Real Payment Substack iframe loaded through its existing custom-domain redirect
  to `blog.kuzana.co/embed`; its email input and Subscribe button fit at 320, 390
  and 1440px. No subscription was submitted.
- Static structure, local links/assets/fragments, JSON-LD, duplicate IDs and script
  parsing passed across all 32 redesigned pages (99 inline script blocks). Partial
  synchronization is idempotent. Whitespace checks pass for the five edited pages;
  existing unrelated CRLF changes in the working tree were left untouched.

This follow-up completes the styling gap; it does not resolve the known screening
Tally 404 or the Library production runtime issue from section 13. No deployment
was performed and no real application, lead, email, subscription or transaction
was created. Follow-up scripts, intercepted payloads, screenshots and results are
saved in `/private/tmp/kuzana-legacy-restyle-2026-10-22/`; the machine-readable
summary includes the follow-up separately from the earlier broad audit results.


## 15. Publication preparation (2026-10-22)

The owner authorized pushing the latest design after the preservation checks.
The final preparation rechecked all 32 redesigned page structures, shared partial
synchronization, original Connect/B4 slides redirects and central form handler,
plus homepage interactions in Chrome and WebKit. The Apply header's redundant
“Open separately” link was removed as requested; its original embedded form and
provider fallback remain.

GitHub Pages is configured to publish `main` from the repository root. The branch
includes the latest eight upstream additions before the redesign release. Earlier
verification summaries describe pre-publication snapshots; the actual release
state should be checked against GitHub Pages and the live site. The known
screening Tally 404 and Library service runtime issue remain unchanged; publishing
static HTML does not update either external service.
