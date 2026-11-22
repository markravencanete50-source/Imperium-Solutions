# Session handover

Last updated: 2026-11-22. Read this first, then CLAUDE.md and README.md.

## Where things stand

The site is LIVE at https://imperiumsolutionsinc.com. The public pages, the contact form, bookings, and the admin CRM all work in production.

| Piece | Status |
| --- | --- |
| Code | GitHub `markravencanete50-source/Imperium-Solutions`, branch `main`. Local copy: `Documents\Imperium-Site\imperium-site` |
| Hosting | Vercel project `imperium-solutions`, team `markravencanete50-1710s-projects`. Every push to `main` deploys automatically |
| Domain | `imperiumsolutionsinc.com` (GoDaddy). DNS: `A @` to `216.150.1.1` and `216.150.16.1`, `CNAME www` to `7825985177e6793b.vercel-dns-016.com`. `www` redirects (308) to the main domain |
| GoDaddy email | Untouched. MX, `email` CNAME and DKIM still point to GoDaddy (secureserver) |
| Rollback | In GoDaddy DNS, set `A @` back to "WebsiteBuilder Site" to bring back the old site |
| Second domain | `imperiumsolutionshq.com` is NOT the website. It is the Google Workspace domain Tom sends cold outreach from. Leave it alone |
| Firebase | Project `imperium-solutions-crm` (Spark plan), owner markravencanete50@gmail.com. Firestore in nam5, rules and indexes deployed, Email/Password sign in on. Authorized domains: localhost, the vercel.app URL, imperiumsolutionsinc.com, www |
| Env vars | All 10 Firebase and site variables are set in Vercel (Production, Preview, Development). `NEXT_PUBLIC_SITE_URL=https://imperiumsolutionsinc.com`. The local `.env.local` holds the same values (gitignored, never commit it) |
| Admin login | https://imperiumsolutionsinc.com/admin, user markravencanete50@gmail.com. Its password is weak, so tell Lee to change it: `npm run admin:create -- markravencanete50@gmail.com NewPassword` |

## Uncommitted work (check this first)

On 2026-11-20 a full admin QA pass found 7 bugs, and all of them are fixed in the working tree. Typecheck, lint and build pass, and the fixes were re-tested in the browser against the emulators. They are NOT committed or pushed yet, because Lee had not approved the push at the end of the session. Run `git status` to see the 12 files. Ask Lee before you push, since a push deploys to the live site.

The fixes:
1. A cancelled booking slot can be booked again. The booking route now uses a transaction.
2. Convert to client is atomic, using a batch.
3. The admin no longer hangs on "Loading" when a token read fails.
4. Settings no longer saves defaults over the real settings after a failed load. Call length is clamped to 5..120.
5. The pipeline drawer reads the live deal instead of a stale copy.
6. Deleting a lead removes its notes. Deleting a client clears `clientId` on its leads.
7. Every admin write now shows an error message when it fails (`useAction` and `ErrorNote` in `src/components/admin/ui.tsx`).

The `.gitignore` change in that diff adds `.vercel` only. `vercel link` had also added `.env*`, which would have hidden `.env.example`, so that line was removed on purpose.

## Outbound email (built 2026-11-21, NOT committed or deployed)

Resend is wired in. Needs `RESEND_API_KEY` added in Vercel (Production, Preview, Development) before anything is sent. Optional: `EMAIL_FROM` (default `Imperium Solutions <tom@imperiumsolutionshq.com>`) and `EMAIL_TEAM_TO` (default tom@imperiumsolutionshq.com, comma separated allowed). The Resend domain imperiumsolutionshq.com is verified. Until the key is set, everything works and emails are skipped.

- `src/lib/server/email.ts`: `sendEmail()`, never throws, returns `{ok,id}` or `{ok:false,error}` (`not_configured` when no key, Resend is not called).
- `src/lib/server/emailTemplates.ts`: HTML plus text for the estimate lead (team, visitor) and booking (team, visitor with `.ics`), plus the manual admin email. All visitor input is escaped.
- `src/lib/server/outbound.ts`: sends and writes the log row to `leads/{leadId}/emails` (kind, to, subject, text, status sent/failed/skipped, resendId, error, by, createdAt). No key means status `skipped`.
- `src/app/api/leads` and `src/app/api/bookings` call it inside `after()` after the Firestore write. `notify()` is unchanged.
- `src/app/api/admin/email/route.ts`: admin compose. Needs `Authorization: Bearer <ID token>` with the `admin` claim. 401 without a token, 403 without the claim, 503 `email_not_configured` without the key (nothing logged). On success it logs kind `manual` and adds the activity note "Email sent: subject".
- Lead drawer has an Email section (compose plus history). Deleting a lead now also deletes its `emails` rows.
- `firestore.rules` already covers `emails` (recursive admin only rule), so no rules change.
- Inbound: replies go to Tom's Gmail through reply-to. Showing inbound replies in the CRM is a later phase (Resend inbound webhook).
- Open: the visitor email promises a reply "usually within one business day". Confirm Imperium is happy with that wording.

## Still to do

1. **Email with Resend.** Outbound is built (see above), waiting on `RESEND_API_KEY` in Vercel and a push. Inbound replies in the CRM are not built.
2. **Contact and careers emails.** The site shows `hello@example.com` and `careers@example.com` until `NEXT_PUBLIC_CONTACT_EMAIL` and `NEXT_PUBLIC_CAREERS_EMAIL` are set in Vercel. Waiting on Lee.
3. **Vercel plan.** The team is on Hobby, which does not allow commercial use. Upgrade to Pro or move the project to an Imperium account.
4. **Spam check.** Cloudflare Turnstile keys are not set. Only the honeypot field is active.
5. **Content decisions from README "Before launch":** team location (Manila), founding year, coverage windows, the real About photo, client reviews, the privacy policy review, and no HIPAA claims.
6. **Minor, not fixed:** "Open pipeline" and the won-deal totals add monthly and one-time deal values together.

## How to work on it

- **Local QA without touching production.** Run `npm run emulators` (Java is installed). Then, in the same shell, export the emulator variables so they override `.env.local`: `NEXT_PUBLIC_USE_EMULATORS=1`, `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`, `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099`, `FIREBASE_PROJECT_ID=demo-imperium`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-imperium`, `NEXT_PUBLIC_FIREBASE_API_KEY=demo-key`. Next, run `npm run admin:create -- test@imperium.test <pw>`, then `npm run seed:demo`, then `npx next dev`. Emulator data disappears when the emulators stop.
- **Vercel CLI.** Logged in as `markravencanete50-1710`, and the repo is linked. Use `npx vercel@latest env ls`, `env add`, and `redeploy imperium-solutions-one.vercel.app --environment production`. The Vercel MCP connector often fails with ECONNRESET here, so prefer the CLI.
- **Firebase CLI.** Logged in as markravencanete50@gmail.com. Deploy the rules with `npm run rules:deploy -- --project imperium-solutions-crm`.
- **Testing the live domain with curl.** Add `--ssl-no-revoke`, because the Windows certificate revocation check fails on this network.
- **Admin deletes.** These use an in-page "Yes, delete" button, not `confirm()`, so browser automation is safe.
- **Writing rules.** Never print the service account private key into chat. Write no em dashes, emojis or decorative symbols in user-facing copy.

## 2026-11-21 update

- Resend is LIVE. `RESEND_API_KEY` is set in Vercel (Production). Domain imperiumsolutionshq.com is verified in Resend (us-east-1). DNS added in GoDaddy for hq: TXT `resend._domainkey`, CNAME `send` and `rsend` to `*.forge.rmta.net`. Google Workspace MX/SPF/DMARC untouched. Resend "receiving" is deliberately OFF (it would replace Tom's Gmail MX).
- Live test passed: a test lead sent both the team notification (tom@) and the visitor confirmation; the test lead was deleted.
- Contact and careers emails are `tom@imperiumsolutionshq.com` (Vercel env).
- Do NOT import `firebase-admin/auth` in app code. It loads `jose` via require() and crashes every route on the Vercel runtime (this took the live API down for about 6 minutes on 2026-11-21). Admin ID tokens are verified with `src/lib/server/verifyAdmin.ts` (Identity Toolkit `accounts:lookup`). Scripts under `scripts/` may still use it locally.
- Not yet clicked through in the browser: the Email box in the lead drawer on production.

## 2026-11-21 booking flow rebuild (NOT committed or deployed)

- Booking form is now two steps in `src/components/site/BookingForm.tsx` (details and needs, then time zone, calendar, 15 minute slot grid) with `DatePicker.tsx`, `TimeZoneSelect.tsx`, `BookingSuccess.tsx`; shared form bits moved to `formKit.tsx`. Option lists live in `content.ts` (`bookingIndustryOptions`, `bookingNeedOptions`, `bookingBudgetOptions`).
- `BookingSettings` gained `allDay` (default true) and `slotStepMinutes` (15). Defaults now: 7 weekdays, 24 hours, 15 minute calls, 1 hour notice, 60 days ahead (clamp 90). Production has no settings doc, so these go live as is. Admin, Settings has an "Open 24 hours" toggle.
- `GET /api/availability?start=YYYY-MM-DD&days=1..42&tz=Zone[&summary=1]` returns open and taken slots (ISO) for days in the visitor's zone; `summary=1` returns only per day counts. The booking route keeps the slot id transaction and re-checks the slot server side, and also rejects overlaps when a call is longer than the step.
- Answers (company, industry, needs[], budget, notes) are stored on the booking and the lead, shown in the admin lead drawer and bookings page, and included in both emails.
- Tested on the emulators only. Not yet clicked through on production.

## 2026-11-21 SEO / AEO / GEO pass (branch seo-audit, NOT pushed)

- SEO facts live in `src/lib/seo/`: `pages.ts` (titles, descriptions, schema types, `CONTENT_LAST_MODIFIED` constant used by the sitemap), `schema.ts` (typed JSON-LD builders), `faq.ts`, `services.ts`, `metadata.ts` (`pageMetadata(path)`), `config.ts`.
- Every public page calls `pageMetadata(path)` and renders `<Breadcrumbs path />` once near the top (visible trail plus one JSON-LD graph: Organization, WebSite, page, BreadcrumbList, Services on /services). Home has a visible FAQ (`src/components/seo/Faq.tsx`) with FAQPage JSON-LD. `RelatedPages` exists but is unused.
- Share card is `/og.png` and the Organization logo is `/logo.png`, both drawn by `next/og` (brand text only). Replace the logo with the real file when one exists.
- `robots.ts` names the search and AI crawlers explicitly; `public/llms.txt`; `X-Robots-Tag` on /admin and /api; custom `not-found.tsx` (noindex).
- When page copy changes, update the matching description in `src/lib/seo/pages.ts` (140 to 160 chars) and bump `CONTENT_LAST_MODIFIED`.

## 2026-11-21 late: redesign, SEO, testimonials, Search Console

- LIVE: redesign (5 second hero, tile layout), SEO/AEO/GEO pass (per page metadata, JSON-LD graph, robots with named AI crawlers, /llms.txt, /og.png, sitemap, breadcrumbs, home FAQ, footer link hub), and /testimonials (3 verbatim written Upwork reviews; only written reviews that exist across the 4 member profiles as of 2026-11-21). No Review/AggregateRating markup on purpose (self-serving reviews are not eligible and are a policy risk).
- Google Search Console: Domain property `imperiumsolutionsinc.com` under markravencanete50@gmail.com, verified by DNS TXT `google-site-verification=...` on @ in GoDaddy (do not delete that record). Sitemap https://imperiumsolutionsinc.com/sitemap.xml submitted 2026-11-21. Indexing requested for /, /services, /contact, /testimonials.
- Check in about a week: Pages report, sitemap "Success" with 10 URLs, and any "Google chose different canonical" (vercel.app duplicate host).
- Open content items: privacy policy legal review, real team photos, Upwork figures kept current, more written reviews.

## 2026-11-22: UX audit, quick wins, motion and modal cards (branch `claude/laughing-albattani-rh7hmq`, NOT on main)

- UX audit and redesign proposal published as a private Claude artifact (ask Lee for the link). Top findings: no real people or team photos, all proof is Upwork hours, weak reviews, a home page that repeats itself, no pricing.
- Quick wins done: removed the October 2025 farewell review from `testimonials` in `content.ts`; photo credits moved off the footer to the new `/credits` page (registered in `src/lib/seo/pages.ts`, so it is in the sitemap); footer has a Contact column; the hero rotates only industries tagged Delivered; the booking form is a real two step flow (`step` state in `BookingForm.tsx`, Continue validates step 1, Edit details goes back, focus moves to each step heading).
- Home page: the Your hours coverage clock and the repeated About block are removed (the clock stays on /services). Home is about 7,600px on desktop, down from 9,600.
- New `src/components/site/DetailCard.tsx`: a flat tile whose whole surface opens a native `<dialog>` modal card. Tiles never lift or cast a shadow (client rule: no floating cards); Lee approved modals on 2026-11-22.
- New `src/components/site/graphics.tsx`: six small SVG motion graphics for the service tiles. CSS lives under "Motion graphics" at the end of `globals.css`. Loops run only after `[data-in]` and never under `html.reduce`; the still frame shows the finished state.
- Services is now a deck of six capability tiles (front office and back office) that open modal cards. The operating model (`Model`) is an animated flow with three stage tiles that open modals. Results and Industries open modals on the home page only (`compact`).
- Typecheck, lint and build pass. Not merged to main, so not live. Merge to main to deploy.

## 2026-11-22 Team management (admin users) (NOT committed or deployed)

Admin, Team (`/admin/team`, in the nav) lists every Firebase Auth user and lets an admin invite, resend an invite, block, unblock, revoke, restore, and send a password reset. Latest 20 audit rows show on the same page. Tested end to end on the emulators only (27 browser checks plus API checks). Not yet clicked through on production.

- **No `firebase-admin/auth`.** `src/lib/server/authAdmin.ts` calls the Identity Toolkit REST admin API directly. It signs an RS256 service account JWT with `node:crypto`, exchanges it at `oauth2.googleapis.com/token`, and caches the access token in module scope (refreshed 5 minutes before expiry). With `FIREBASE_AUTH_EMULATOR_HOST` set it skips the token and sends `Authorization: Bearer owner`. Endpoints used: `projects/{p}/accounts` (create), `accounts:update`, `accounts:batchGet`, `accounts:lookup`, `accounts:sendOobCode` (PASSWORD_RESET with `returnOobLink`). Errors map to `AuthAdminError` codes (EMAIL_EXISTS, USER_NOT_FOUND, INVALID_EMAIL, INVALID_CONTINUE_URI, PERMISSION_DENIED, TOKEN_ERROR, NETWORK_ERROR, NOT_CONFIGURED).
- **Routes** (all need `Authorization: Bearer <ID token>` with the admin claim, zod validated): `GET /api/admin/team`, `POST /api/admin/team/invite` ({name,email,restore?}), `POST /api/admin/team/action` ({uid,action}, action one of block, unblock, revoke, restore, reset_password, resend_invite). Shared guard and audit helpers: `src/lib/server/adminRoute.ts`. Status and safety rules (pure, shared with the page): `src/lib/team.ts`. `verifyAdminToken` now also returns the caller `uid`.
- **Status** is derived: disabled gives Blocked, no admin claim gives Revoked, admin claim with no password set and no real sign in gives Invited, otherwise Active.
- **Safety:** an admin cannot block or revoke themselves (`cannot_modify_self`), and no action may leave zero admins who hold the claim and are not disabled (`last_admin`). Because the caller is always such an admin, `last_admin` cannot be hit through the UI, it is a guard for races. It is unit checked only.
- **Email:** invite and reset go through Resend (`adminInviteEmail`, `adminResetEmail` in `emailTemplates.ts`). If Resend is not configured or fails, the API returns the password link in `link` and the Team page shows it with a Copy button so it can be sent by hand. The link is never returned when the email was sent. The login URL in the email is `${NEXT_PUBLIC_SITE_URL}/admin/login`. Firebase password links expire after a limited time (believed to be about an hour, unverified), so use Resend invite if one expires.
- **Audit log:** Firestore `auditLog` (`{action,targetEmail,targetUid,by,at}`), written server side only. `firestore.rules` already allows admin read and write on every path through its wildcard, so no rules change and no redeploy is needed. `auditLog` is in `COLLECTIONS`.
- **Residual window for blocked or revoked users.** Block and revoke set `validSince` to now, which kills their refresh tokens and makes every server API route reject their old tokens immediately (verified). Firestore rules only read the `admin` claim inside the ID token, and an ID token stays valid for up to one hour, so a blocked or revoked user can still read Firestore directly until the token expires or is refreshed. Mitigation: `src/components/admin/auth.tsx` calls `getIdToken(true)` when a user signs in, every 5 minutes, and whenever the tab becomes visible. If Firebase rejects the refresh (user-disabled, user-token-expired, user-not-found) the app signs out and the login page shows the reason (blocked message, or "You no longer have access, or your session has ended..."). If the refresh succeeds without the admin claim the shell shows "You no longer have access". So the worst case is about 5 minutes for an open tab, and up to an hour for a tab that is asleep and still has direct Firestore access.
- **Emulator caveat:** the Auth emulator does not reject a refresh after `validSince` changes, so on the emulator a revoked user is removed through the missing claim path (shell notice), not the refresh failure path. Production should use the refresh failure path. Not verifiable without a real project.
- Login page now maps `auth/user-disabled` to "This account has been blocked. Contact your administrator." Settings, Admin access now points to the Team page.
- The first admin still comes from `npm run admin:create`. Existing admins show as Active (they have a password).

