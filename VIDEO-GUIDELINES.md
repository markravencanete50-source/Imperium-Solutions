# Video and social guidelines

These rules come from Imperium's review of the first brand videos (November 2026). They apply to every video, reel, short and animated post made for Imperium Solutions. Read this before editing or animating anything.

## Hard rules

1. **No tilt. Ever.** Screens, photos and cards are always flat and face the camera straight on. No perspective angle, no 3D lean, no rotateX or rotateY on pictures or screens, no rotating carousels, no "floating device" mockups.
2. **No generic transitions.** No slow zoom (Ken Burns), no zoom in or zoom out between scenes, no white flash or blink. Use:
   - hard cuts on the beat
   - match cuts (a shape or element carries into the next scene)
   - shape panel wipes in brand colors
   - strip reveals and line splits
   - flat camera pans (horizontal or vertical)
   Fast moves get real motion blur (sub-frame sampling), never a two-frame ghost.
3. **Screens must look like the real thing, with complete information.** A CRM shows a real contact record (name, title, company, email, phone, owner, lead source, stage, activity with timestamps). A helpdesk shows real conversations, times, channels and statuses. Never use grey skeleton bars or placeholder blocks.
4. **The background matches what the voice says.** Talking about live chat shows a live chat. Talking about the CRM shows the CRM. Talking about calendars shows a calendar. No generic background loops.
5. **Real proof only.** Upwork or client proof must be the real figures from the public profile (see `src/lib/content.ts`). A screenshot of Upwork must come from the account owner. Never recreate or imitate Upwork's (or any other brand's) interface to look like a real screenshot.
6. **No empty illustrations.** Every icon, object or illustration carries real content. A message bubble shows the actual message, a card shows real fields, a chart shows labels and values, an envelope shows sender and subject, a calendar shows named events. Never an empty shape.
7. **Motion graphics are 3D.** Videos are built as 3D scenes (three.js: studio lighting, shadows, extruded objects, camera moves through the space). Screens and photos inside a 3D scene still face the camera straight on (rule 1).
8. **Client copy rules apply on screen too.** No em dashes, no decorative symbols, no emojis. Real photos only, never AI generated images.

## Sample data on screens

- Mark example dashboards and reports "Sample data".
- Use fictional people and companies, `example.com` email addresses and `555` phone numbers.
- Never show a real client's name or data without written approval.

## Story and pace

- **Hook in the first 2 to 3 seconds.** Open on the outcome ("Every message answered. Every lead followed up. Every report on time."), not on addressing "business owners".
- A new visual beat every 1 to 3 seconds. Target 45 to 60 seconds for a brand video.
- Every claim must already be on the website (`src/lib/content.ts`, `public/llms.txt`). Current figures: Top Rated on Upwork, 100% Job Success, 4,900+ hours, 27 jobs, on Upwork since 2020.
- Call to action: "Book a 15 minute call" at https://imperiumsolutionsinc.com/contact

## Voice and audio

- An AI voiceover is approved. **Use only Kokoro `af_heart` at 1.1x speed for every video.** Imperium reviewed the other voices (af_bella, am_michael, bm_george) on 2026-11-25 and rejected them. The voice speaks as the company. It never claims to be a real person ("I'm Tom" is only for Tom's own recordings).
- Tick the "AI-generated content" label on TikTok, Instagram and YouTube when the voice is AI.
- Mix: voice at -16 LUFS, music ducked under the voice, master at -14 LUFS integrated with -1.5 dBTP peaks.
- Burn in captions for every line. The spoken word lights up as it is said.

## Look

- Brand: ink `#0B0C15`, amber `#F6B312`, Archivo for text, Montserrat 800 for the wordmark.
- The background is a dark gradient with slow soft light and fine grain. No grids or particle fields.
- Text reveals use masked slides (words rise from behind a line), not bounces or slams on every word.

## Formats

- Master: 1080 x 1920, 30 fps, H.264, AAC 256 kbps.
- Also export 4:5 (1080 x 1350) for the LinkedIn and Facebook feeds.
