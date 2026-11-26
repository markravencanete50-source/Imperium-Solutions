# Session handover

Last updated: 2026-11-21. Read this first, then CLAUDE.md and README.md.

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

## 2026-11-26: Blog

- New `/blog` index and `/blog/[slug]` article pages. Posts are structured data in `src/lib/blog/posts.ts` (paragraphs, headings, lists, bold lead lists, a closing call to action, FAQ). To add a post: add an entry at the top of `posts`, keep the description 140 to 160 characters, use a real photo from `public/images` that is credited on /credits, and bump `CONTENT_LAST_MODIFIED`.
- First post: "7 Signs Your SaaS Company Needs Outsourced Customer Support" (from Lee's Blog_ideas.docx). Text is verbatim except: "Days 1--30" style ranges became "Days 1 to 30" (client dash rule), the closing "Visit imperiumsolutionsinc.com" line became booking buttons, and four internal links were added (/services#coverage, /services, /how-it-works, Upwork profile) plus one short "See how coverage hours work" link sentence.
- SEO: absolute title, meta description, canonical, Open Graph type article with published and modified times, JSON-LD graph (WebPage, ImageObject, BreadcrumbList Home > Blog > post, BlogPosting authored and published by the Organization, FAQPage). /blog carries a Blog node listing every post. Posts are in the sitemap (lastModified = post.updated) and in llms.txt. Blog is in the header nav and footer.
- With cacheComponents, `dynamicParams` is not allowed. Unknown slugs call notFound(). With Partial Prefetching the first hit on an unknown slug streams with status 200 but carries noindex and the not found page; repeat hits return 404.
- After deploy: request indexing for /blog and the post in Search Console.
