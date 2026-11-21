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
