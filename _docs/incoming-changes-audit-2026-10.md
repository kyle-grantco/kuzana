# Incoming changes audit — 22 October 2026

## Scope and baseline

This audit was performed before changing the website. It compares the uncommitted
`redesign-2026-10` working tree, based on `8c5a09d`, with the eight incoming commits
ending at `origin/main` (`4d2b1bd`, 21 October). It supplements
`redesign-audit-2026-10.md`; that older document audits the prototype, not the
current uncommitted implementation.

The owner explicitly excluded `/connect/` and `/b4slides/` from redesign. Their
incoming redirect files must be retained byte for byte. No Next.js migration,
deployment, content-model change, or legal-copy rewrite is part of this work.

The existing changed and untracked files were backed up before implementation
to `/private/tmp/kuzana-before-incoming-redesign.tar.gz`. Git's earlier pull fetched
the incoming commits but refused to overwrite 19 locally modified files.

## What the uncommitted design actually implements

- Twenty-five pages use shared, comment-delimited `kz` partials. These are stamped
  by `scripts/kz/sync.py`; directly changing only a stamped header/footer would
  be lost the next time that script runs.
- Bricolage Grotesque supplies the display/body typography, IBM Plex Mono the
  labels. Cream `#FBF7EF`, navy `#101A2E`, ink `#18202F`, sand `#F2EBDD`, gold
  `#FDC469`, coral `#FE7272`, and blue `#4A6290` form the palette.
- The layout uses a 1,360px maximum width, fluid gutters, compact corner radii,
  bold tightly spaced headings, and the rising-curve motif. The mobile navigation
  breakpoint is 880px; the homepage's large split hero begins at 1,180px.
- The shared runtime supplies menus, Apply tracking, filtering, tabs, checklists,
  carousels, newsletter handoff, and reduced-motion-aware animation. Individual
  pages retain their real lead forms and external destinations.
- Static inspection of all 25 redesigned pages found one H1, one main landmark,
  one description, no duplicate IDs, no missing local image/script/stylesheet
  references, and no broken local links or fragment targets.
- Browser inspection covered all redesigned directory pages at 390px and the
  first desktop routes at 1,440px before Chrome terminated during the longer
  sweep. The completed captures showed no page-script errors or broken local
  images. The document remained viewport-width on mobile. Apparent overflow
  candidates were decorative SVGs, cropped images, intentional tables, and the
  horizontally scrolling fellowship navigation; these are not evidence of
  document overflow. The top of the homepage and class/fellowship pages were
  visually inspected against the actual rendered design.

External analytics, video, form, and data services were isolated during this
baseline browser sweep; their live delivery was not tested. Fonts were allowed.
Screenshots and machine-readable observations are in
`/private/tmp/kuzana-browser-audit/before/`.

## Findings that affect the incoming work

| Priority | Finding and evidence | Required treatment |
| --- | --- | --- |
| High | `/class/` in the redesign still exposes the older guided/free course, seven lesson panels, Tally `yPv7v0`, and obsolete valuation-tool metadata. Incoming commit `75799fe` intentionally replaces that flow with Finance for Founders, Tally `BE4OpA`. | Build the new form flow inside the existing design system; carry incoming query parameters through to the form; retain a direct-form fallback. Do not reintroduce removed lessons or the exit popup. |
| High | The redesign's `metricool` partial contains the old `9603…` tracking hash on nine pages. Sixteen redesigned pages have no Metricool block at all. Incoming `d7b3cd0` centralizes the tracker under `/metricool.js` with hash `25353…`. | Use the new shared tracker on every redesigned page, remove the old inline loaders, and prevent repeated initialization. Preserve the legacy-page bootstraps introduced upstream. |
| High | Finale streaming currently posts a fixed `source=finale_landing`; incoming `280850d` adds source/UTM capture, session persistence, and a fourth Sheets column. | Port the incoming client and Apps Script changes together. Verify the outgoing payload without submitting a real lead. |
| High | Incoming homepage commits add a YouTube embed, muted autoplay, and a watch link. The redesigned homepage contains none of these; copying the upstream homepage would erase the redesign. | Add a native `kz` feature section with the same video and external destination, preserving the main hero and the existing single H1. Use evergreen wording because the event date is 21 October. |
| Medium | `/finale/` still uses DM Sans/Instrument Serif, old navy/cream shades, radial gradients, a 608px column, and its own header/footer. | Restyle it with the established fonts, palette, curves, navigation, and responsive spacing while retaining ticket links, CTA identifiers, event details, and form behavior. |
| Medium | The fellowship redesign reintroduced both advisors bullets that incoming `7e79348` removes, beneath the complete advisor cards. | Remove only that redundant list. Preserve advisor cards, dates, applications, and tracking. |
| Medium | Shared footer links still describe `/class/` as “Valuation tool”. Neither excluded new redirect is present locally yet. | Update the class label at the partial source; copy both upstream redirects unchanged. |
| Medium | `attribution.js` lacks the incoming capture-phase Apply-click handler. Shared links can otherwise lose referral attribution when inserted or altered after initial decoration. | Retain the incoming handler and verify both initial and late-added Apply links. |
| Medium | Shared mobile-menu close paths remove the open class without resetting the toggle's `aria-expanded`; the toggle has no `aria-controls`. | Keep menu state and accessible state synchronized for pages inheriting this navigation. |

## Items that must not be silently “fixed”

- The Ksh300k values on Resources are **Zoho credits**, not the business revenue
  eligibility floor. They are intentional and must remain unchanged.
- Original legal values in `terms.html` were explicitly restored by the owner.
  Differences from `referral/terms.html` require an owner/legal decision; this
  design integration must not choose a different policy.
- The separate Connect membership app has real registration and authentication.
  Its source is outside this checkout. Its redirect is excluded by the owner.
- Finale is dated 21 October 2026. A complete transition from ticket sales to an
  event archive is a separate editorial decision. This work must not invent a
  new event, new availability, or an unverified guarantee.
- Other existing standalone/redirect pages are not newly introduced content.
  Incoming tracking updates can be retained without rewriting their flows.

## Implementation and verification contract

Reconcile upstream changes into the working files without replacing the owner’s
uncommitted redesign or creating a release commit. Keep shared code in partials
and assets, and sync the resulting partials. Check the new class form and fallback,
homepage video, mobile menu, Finale source payload, Apply attribution, Metricool
initialization, and the exact excluded redirects. Use desktop and mobile browser
checks, JavaScript syntax checks, and local asset/link/metadata checks. Record the
results below after implementation, including external-service limitations.

## Implementation results

Completed locally, without a release commit or deployment:

- Rebuilt `/class/` around Finance for Founders (`BE4OpA`) with the shared
  navigation/footer, navy-and-cream layout, existing Kyle image, rising curves,
  responsive form container, and direct-form/no-JavaScript fallbacks. Incoming
  query parameters and saved source/referral attribution reach the embed and
  direct-form links. The obsolete course panels and exit popup are removed.
- Added the incoming Batch 4 YouTube video to the homepage in the new design.
  The same video, muted autoplay, and YouTube destination are preserved. Its
  heading is evergreen rather than claiming the past event is currently live.
- Restyled `/finale/` with the shared system and a responsive split hero, keeping
  event content, ticket destinations and identifiers, and the streaming flow.
  Merged the source-persistence handler and the exact incoming Apps Script code.
- Removed the two redundant fellowship bullets while preserving advisor cards.
  Updated the shared class label and the Cofounders link to the removed `#free`
  section. Added narrow-screen fixes for homepage testimonial tabs and statistic
  values. Synchronized mobile-menu state and its accessible labels, added
  `aria-controls`, and retained keyboard focus on Escape.
- Centralized Metricool under the new hash with one loader on each redesigned
  page and a guard against repeated initialization. Imported the upstream legacy
  page/script updates so non-redesigned pages retain their new tracking too.
- Imported `/connect/` and `/b4slides/` **byte for byte** from `origin/main`.
  They retain their original redirects and contain no new design or tracking.

Verification:

| Check | Result |
| --- | --- |
| Local links, fragment targets, assets, H1/main landmarks, description count, duplicate IDs, and tracker references | Passed on all 26 redesigned pages |
| JavaScript/structured data | All 91 inline JavaScript blocks parsed; JSON-LD parsed; edited standalone scripts passed Node syntax checks |
| Desktop/mobile visuals | Homepage, class, fellowship, and Finale inspected at 390px and 1,440px; no page-script errors or document overflow. Isolated third-party frames are placeholders in these audit captures. |
| Small screens | Homepage verified at 320, 768, and 1,440px after fixing the narrow testimonial/statistic layout; class and Finale also checked at 320px |
| Class | Current form ID, query forwarding, saved referral/source, direct fallbacks, and removal of the old flow passed browser assertions |
| Apply attribution | Initial and dynamically inserted links preserved referral/source |
| Mobile menu | Open, Escape, focus return, accessible label/state, and desktop resize checks passed |
| Metricool | New hash initialized once, even when the loader was evaluated again |
| Finale client | Validation, source precedence, session persistence, ticket UTMs, outgoing lead fields, and success display passed with intercepted requests |
| Finale backend | Incoming Apps Script handler wrote source to column four in an in-memory sheet fixture; no real sheet or email operations occurred |
| Content preservation | Comparison with the original backup confirmed that other pre-existing redesigned pages changed only inside their shared partials; legal text and Zoho credit amounts were retained |
| Exclusions | Both redirect files are byte-identical to `origin/main`; Apps Script source is also byte-identical to upstream |
| Whitespace | Passed `git -c core.whitespace=cr-at-eol diff --check`, preserving upstream CRLF files |

The first screenshot sweep briefly classified a not-yet-decoded lazy image as
broken. Explicit decoding of the homepage's local images subsequently passed.
Decorative SVGs and intentional horizontal scrollers do not increase document
width at the verified sizes.

Browser scripts, assertions, captures, and results live in
`/private/tmp/kuzana-browser-audit/`. Tally submissions, analytics delivery,
SoldOutAfrica checkout, and production Sheets persistence were not exercised
against live services. The working tree contains the reconciled incoming source;
the Git branch pointer remains at its original base, and nothing was committed,
pushed, or deployed.
