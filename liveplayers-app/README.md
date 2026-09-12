# Live Players Mittlemann Fellowship

Landing page for [liveplayers.kuzana.co](https://liveplayers.kuzana.co).

This is a standalone Next.js app so it can be deployed on Vercel without changing the static `kuzana.co` site.

## Edit content

- Copy, figures, companies, advisors and FAQ: `lib/content.ts`
- Application URL, Artizen URL, contact email and analytics event names: `lib/site.ts`

Replace the Artizen placeholder before launch:

```ts
export const ARTIZEN_URL = "https://artizen.fund/your-campaign";
```

Apply and Fund buttons open those URLs in a new tab. Tally is not embedded on page load.

## Fundraising figures

The funding section uses the deck’s headline figures:

- $50,000 total needed
- $25,738 raised from 16 individuals
- $21,994 Zanzalu match funding, 2:1
- $8,087 needed to close the first six fellows

The last deck page’s itemized budget table is intentionally omitted.

## Run locally

```bash
cd liveplayers-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Create a new Vercel project from this repository.
2. Set **Root Directory** to `liveplayers-app`.
3. Framework preset: Next.js.
4. Add the domain `liveplayers.kuzana.co`.
5. Deploy. No extra environment variables are required.

The existing `kuzana.co/liveplayers` page redirects to this subdomain.
