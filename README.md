# ScrollVerse, live site

The live website for ScrollVerse, deployed to Vercel at
https://sanatan-scroll.vercel.app/ from the GitHub repo
ANKITNEGI0/sanatan-scroll. Pushes to `main` auto deploy.

## The UI is a port of the space's actual code, not a recreation

The ScrollVerse space inside Muse is a full app with a server part
(React client, server actions, a database), so it cannot be published as
a static page and Vercel cannot run it as is. On 26 Nov 2026 the live
site was rebuilt by pulling the space's actual UI code and matching
everything to it, file by file:

| Space source (source of truth) | This site |
| --- | --- |
| `client/src/theme.css` (tokens, dark brown default #16110b, light palette, Tiro Devanagari Serif + Cormorant Garamond) | `styles.css` `:root` tokens and component classes |
| `client/src/App.tsx` (single top bar: streak pill, EN/हिं segmented toggle, "Learn your tradition" tagline, sun/moon segmented toggle, Google sign-in or avatar chip, gold Pro pill, text chips on their own row below; left rail with nav + chapters; right rail with Verse of the Day, streak, Pro; mobile bottom nav with icons; onboarding) | `index.html` shell + `app.js` header, rails, nav, onboarding |
| `client/src/lib/google.ts` + `client/src/lib/config.ts` (GIS OAuth token flow, pre-configured Client ID, account chooser, sign-in is free and never unlocks Pro, resume on the verse after the last one read) | `app.js` Google sign-in section, same Client ID, same flow |
| `client/src/components/Feed.tsx` (unboxed centred verses on the page background, Sanskrit first, Hindi meaning then English meaning, tap pill, round icon buttons, Study solid accent, Listen solid gold, progress bar, counter) | `app.js` verse cards, no card box anywhere |
| `client/src/components/StudySheet.tsx` (bottom sheet, tabs: Explain Simply free, Deep Study Pro, Word by Word with Sivananda commentary, Related Verses Pro) | `app.js` study sheet |
| `client/src/components/AudioSheet.tsx` (bottom sheet, mode pills, speed pills, big round play button, Play All gold button, voice card) | `app.js` audio sheet |
| `client/src/components/Paywall.tsx` (centred modal, plan list, geo pricing with no currency switch, simulated checkout) | `app.js` paywall |
| `client/src/components/screens.tsx` (Discover with Verse of the Day, Listen & Chant, moods, search, texts, sections; Plans; Saved; Profile) | `app.js` screens |
| `client/src/components/Legal.tsx` (Privacy Policy, Terms, Refund Policy, each at its own path, cross linked at the bottom) | `privacy-policy.html`, `terms.html`, `refund-policy.html` plus the Legal card at the bottom of Profile in `app.js` |
| `client/src/lib/i18n.ts` (every UI string, English and Hindi) | `app.js` string tables, copied verbatim |

No em dashes are used anywhere in this project, by Ankit's rule.

## What is in this folder

| File | What it is |
| --- | --- |
| `index.html`, `styles.css`, `app.js` | The whole site. Plain HTML, CSS and JavaScript, no framework, no build step, no server. |
| `data/corpus.json` | The real bundled text, 1,231 verses. Gita 701, Ramayana 332, Mahabharata 155, Hanuman Chalisa 43. Built by `tools/build-corpus.py` from the space source; Gita chapter Hindi meanings and summaries merged from the space's `gita.json`. |
| `data/gita-comm.json` | Swami Sivananda's public domain Gita commentary, copied from the space, used in the study sheet's Word by Word tab. |
| `audio/gita/` | Recorded audio, 144 MP3s, 9.4 MB. All of Gita Chapter 1 in Sanskrit, Hindi and English. Same finalized voices as the space: Sanskrit Chirp 3 HD Charon, Hindi Neural2-B, English Neural2-D. |
| `privacy-policy.html`, `terms.html`, `refund-policy.html`, `legal.css` | The three legal pages, linked from the bottom of Profile and served at their own paths with cleanUrls: /privacy-policy, /terms, /refund-policy. `refund.html` redirects /refund to /refund-policy. Each legal page links to the other two at the bottom. |
| `vercel.json` | Static site config (cleanUrls) and cache headers for the audio files. |
| `tools/build-corpus.py` | Regenerates `data/corpus.json` from the space source. Read only, it never writes to the space. |

## What is real here

- The full verse text for all four texts, Sanskrit first, then Hindi meaning, then English last, on unboxed centred cards exactly as the space renders them.
- Dark mode default in the space's dark brown (#16110b), light mode in its cream palette, sun and moon as a segmented toggle beside the EN/हिं toggle, theme stored on the device and applied before first paint. Every label takes its colour from the theme tokens, so text chips stay readable in dark mode.
- Discover (Verse of the Day, Listen & Chant collections, mood collections, search across all four texts, text picker, chapter and section lists), all three reading plans from the space (Gita in 21 Days, Sankhya Yoga in 7 Days, 40 Days of Chalisa) with day progress, Saved, Profile with streak stats, text size and language.
- Like, save, share (a real verse card image, drawn on a canvas in the space's colours), reading position per text, streak counted by IST calendar days. All kept in localStorage on this device.
- Google sign-in is live. The app's OAuth Client ID (the same one configured in the space) is built into `app.js`; tapping Sign in in the header, Profile or the paywall opens Google's own account chooser, with no Client ID or secret asked of the reader. The Client ID's authorised JavaScript origins in Google Cloud Console must include https://sanatan-scroll.vercel.app. Signing in is free and never unlocks Pro: Pro only comes from buying a plan, and a paid plan is never touched by signing in or out. A signed-in reader reopens the Gita on the verse after the last one read; switching texts also resumes at the saved verse plus one, clamped to the end of the text.
- The header Pro pill shows on desktop only (1024px and up). On phone widths it is hidden to declutter the header, Sign In and the dark/light toggle sit on the right, and Pro is still reachable from Profile.
- The study sheet with the space's four tabs. Word by Word shows the real bundled word meanings and the real Sivananda commentary for Gita verses.
- The Listen sheet with the space's five modes and speed control. Gita Chapter 1 plays the real recorded voices; Play All steps through a list hands free. Sanskrit chant is free, narration modes and Play All are Pro, the same boundary as the space.
- The Pro paywall, centred, with Ankit's geo pricing: India ₹29 a day, ₹99 a month, ₹599 a year; outside India $2 a day, $9 a month, $59 a year. Location is detected automatically, there is no currency switch. The 7 day free trial is on the yearly plan only.

## What differs from the space, honestly

- **No server.** The space keeps saves, likes, streak, plans and Pro on the reader's account, server side. Here they live in this browser's localStorage only. Open the site on another phone and the streak starts again.
- **Study explanations are composed on device.** The space generates Explain Simply and Deep Study once per verse with AI and caches them on its server. There is no server here, so those tabs are composed on device from the verse's own bundled translation and word meanings, and the sheet says so. Related Verses lists verses from the same text in the space's neighbour and spread pattern, without the AI written reasons.
- **Audio beyond Chapter 1 uses the device voice.** The full Gita audio is 2,097 MP3s, about 154 MB, too large for this deploy. Verses outside Chapter 1, and the other texts, are read by the device's own text to speech with the deepest male voice it finds, pitched lower, which is exactly what the space itself does for the Ramayana, Mahabharata and Chalisa. The voice card in the player says which voice is speaking.
- **Pro checkout is simulated.** Choosing a plan turns Pro on in this browser only. No payment is taken, no card is asked for. Real checkout needs Ankit's Razorpay account, bank and PAN.
- **Sign-in state lives on this device.** The space keys reader rows to the account server side; here the Google session, and the state tied to it, live in this browser's localStorage, so signing in on another device does not carry the streak over yet.
- **Meanings have the same gaps as the source.** Ramayana verses have no bundled Hindi meaning, Mahabharata verses have no bundled English or Hindi meaning. The cards show the space's preparing the meaning line there instead of inventing one.

## Deploy

The repo is connected to Vercel, pushes to `main` auto deploy, and the
live site updates a couple of minutes later. To change the site, change
the files, commit, and push. Nothing else.

## Regenerating the text

If the space's text changes, rerun:

```bash
python3 tools/build-corpus.py
```

That reads the space source and rewrites `data/corpus.json`. It never
edits the space. The Gita chapter Hindi meanings and summaries, and
`data/gita-comm.json`, are copied from the space's data files.
