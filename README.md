# Imperium Solutions website and CRM

Public marketing site, contact and booking back end, and a private admin dashboard (built in CRM) in one Next.js app.

Stack: Next.js 16 (App Router, TypeScript), Firebase (Firestore and Auth), GitHub, Vercel.

## What is inside

| Part | Where | Notes |
| --- | --- | --- |
| Public site | `src/app/(site)` | Home, Services, How it works, Results, Industries, About, Careers, Contact, Privacy |
| Site copy | `src/lib/content.ts` | Edit text, stats, industries, and nav here |
| Photos | `public/images` | Real photos from Unsplash and Pexels, credits in `content.ts` |
| API | `src/app/api` | `POST /api/leads`, `GET /api/availability`, `POST /api/bookings` |
| Admin | `src/app/admin` | Dashboard, Leads, Pipeline, Clients, Sales, Bookings, Settings |
| CRM model | `src/lib/crm.ts` | Collections, statuses, types |
| Security rules | `firestore.rules` | Only users with the admin claim can read or write |
| Scripts | `scripts` | Create an admin, add or clear demo data |

How data flows: the public site never talks to Firestore directly. The forms post to the API routes, which validate the input with zod and write with the Firebase Admin SDK. The admin dashboard reads and writes Firestore live from the browser, and the security rules allow that only for signed in users that carry the `admin` custom claim.

Firestore collections: `leads` (with `activities` for notes and `emails` for the outbound email log), `bookings`, `clients`, `deals`, `payments`, `settings/booking`.

## Setup

1. Install: `npm install`
2. Create a Firebase project at console.firebase.google.com.
   - Build, Firestore Database, Create database (production mode).
   - Build, Authentication, Sign in method, enable Email and Password.
   - Project settings, Your apps, add a Web app, copy the config values.
   - Project settings, Service accounts, Generate new private key.
3. Copy `.env.example` to `.env.local` and fill in the values. For `FIREBASE_PRIVATE_KEY`, paste the `private_key` value from the service account file in double quotes on one line, keeping the `\n` sequences.
4. Deploy the security rules:
   `npx firebase-tools login` then `npx firebase-tools use --add` (pick the project) then `npm run rules:deploy`
5. Create the first admin: `npm run admin:create -- you@company.com a-strong-password`
6. Run it: `npm run dev`, then open http://localhost:3000 and http://localhost:3000/admin
7. Optional demo data so the dashboard is not empty: `npm run seed:demo`. Remove it with `npm run seed:demo -- clear`. Every demo record is marked `demo: true`.

## Deploy

1. Create an empty GitHub repository, then `git init`, `git add .`, `git commit`, `git remote add origin`, `git push -u origin main`.
2. In Vercel, Add New Project, import the repository. Framework preset is detected as Next.js.
3. Add every variable from `.env.local` under Project Settings, Environment Variables. Set `NEXT_PUBLIC_SITE_URL` to the live domain.
4. Deploy, then add the custom domain in Vercel.
5. In Firebase, Authentication, Settings, Authorized domains, add the live domain so admin sign in works.

Every push to `main` deploys automatically.

## Optional extras

- Notifications: set `MAKE_WEBHOOK_URL` to a Make.com custom webhook. Every new lead and booking is posted there as JSON (`event` is `lead.created` or `booking.created`), so a scenario can send the email to the team and the confirmation to the visitor. Without it, leads still land in the admin dashboard but nobody is notified.
- Email (Resend): set `RESEND_API_KEY` (also in Vercel). Every estimate request and booking then sends a notification to the team (`EMAIL_TEAM_TO`, default tom@imperiumsolutionshq.com) and a confirmation to the visitor from `EMAIL_FROM` (default `Imperium Solutions <tom@imperiumsolutionshq.com>`, a verified Resend domain). Booking confirmations carry an .ics calendar file. Replies go to the team address through reply-to. Admins can also write to a lead from the lead drawer. Every email is logged under `leads/{id}/emails`. Without the key the site works as before and automatic emails are logged with status `skipped`.
- Spam check: set both Turnstile keys from the Cloudflare dashboard. The forms also carry a hidden honeypot field either way.

## Local testing without a Firebase project

`npm run emulators` starts the Auth and Firestore emulators (needs Java). In `.env.local` set `NEXT_PUBLIC_USE_EMULATORS=1`, `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`, `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099`, `FIREBASE_PROJECT_ID=demo-imperium`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-imperium`, and any text for `NEXT_PUBLIC_FIREBASE_API_KEY`. The scripts honour the same variables.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run admin:create -- email password` | Create an admin or reset its password |
| `npm run seed:demo` | Add demo CRM data (`-- clear` removes it) |
| `npm run rules:deploy` | Deploy Firestore rules and indexes |
| `npm run emulators` | Start local Firebase emulators |

## Before launch

These are placeholders or assumptions that need a decision from Imperium:

1. Contact and careers email addresses (`NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CAREERS_EMAIL`).
2. Team location. The site says the team is in the Philippines (Manila time). That is not stated on the Upwork profile, so confirm it or change `teamCity` and `teamZone` in `src/lib/content.ts`.
3. Founding year. Confirm which date to show; the copy only uses the Upwork history.
4. Consultation availability. Defaults are weekdays, eight start times, US Eastern. Change it in Admin, Settings.
5. Coverage windows on the home page are examples.
6. The About photo is a stock placeholder. Swap in real team photos.
7. No client names or reviews are quoted. Add real ones only with permission.
8. The privacy policy is a template. Have it reviewed.
9. The healthcare copy makes no HIPAA claim. Keep it that way unless a compliance program is in place.
10. Hosting plan. Vercel Hobby is for non commercial use, so a company site needs Vercel Pro. The Firebase free tier covers this workload.

## Known limits of this first version

- No confirmation email is sent by the app itself. Use the Make.com webhook for that.
- Bookings do not sync to Google Calendar. The admin Bookings page is the source of truth, or add a calendar step in the Make scenario.
- All admins have full access. There are no roles.
- Dashboard totals are computed in the browser from live collections. Fine for thousands of records, worth moving to aggregates past that.
- The API has no rate limiting beyond the honeypot and optional Turnstile.
