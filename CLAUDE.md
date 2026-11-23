# Notes for Claude Code

@AGENTS.md

## Project

Imperium Solutions marketing site plus admin CRM. Next.js 16 App Router, TypeScript, plain CSS, Firebase (Firestore and Auth), deployed on Vercel. Read README.md for setup and the open items.

## Rules that must hold

- Copy rules from the client: no em dashes, no decorative symbols, no emojis anywhere in user facing text. No floating cards. Real photos only, never AI generated images.
- `cacheComponents` is on in `next.config.ts`. Do not call `new Date()`, `Date.now()`, or `Math.random()` while rendering anything that prerenders. In admin pages use `useNow()` from `src/components/admin/data.ts`.
- Do not add dynamic route segments under `/admin`. Record detail opens in the in page `Drawer`.
- The public site must never import the Firebase browser SDK. Public writes go through `src/app/api/*` with `firebase-admin` and zod validation in `src/lib/validation.ts`.
- `firestore.rules` allows access only with the `admin` custom claim. Keep it that way and redeploy rules after any change (`npm run rules:deploy`).
- Admin styles live in `src/app/admin/admin.css` and are scoped under `.adm`. Public styles live in `src/app/globals.css`.
- Motion: elements with `data-reveal` get `data-in` from `src/components/site/SiteMotion.tsx`. Respect reduced motion.
- Never commit `.env.local` or a service account file.

## Where things are

- Site copy and config: `src/lib/content.ts`
- CRM types, statuses, collections: `src/lib/crm.ts`
- Booking slot logic: `src/lib/server/availability.ts`, time zone helpers in `src/lib/time.ts`
- Admin data hooks: `src/components/admin/data.ts`, shared UI in `src/components/admin/ui.tsx`

## Before every push

Run `npm run typecheck`, `npm run lint`, and `npm run build`. All three pass on the delivered code.

## Video and social content

Before making any video, reel, or animated post for Imperium, read `VIDEO-GUIDELINES.md` and follow it. Hard rules: no tilted or perspective screens or pictures, no zoom or flash transitions, and screens must show complete, realistic information that matches what the voice says.

## Start here

The site is live and set up. Read `SESSION-HANDOVER.md` first. It has the current status, any uncommitted work, the open tasks, and how to test locally. Update it at the end of every session.
