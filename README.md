# Sanatan Scroll, Vercel preview

A standalone copy of Sanatan Scroll that deploys to Vercel on the free Hobby
plan, on a free `.vercel.app` address. It is a preview, not the launch build.
It shows the real verse text and plays real server audio for Gita Chapter 1,
so Ankit can open it on his phone and see how the site looks and feels in a
real browser, outside Muse.

No em dashes are used anywhere in this project, by Ankit's rule.

## What is in this folder

| File | What it is |
| --- | --- |
| `index.html`, `styles.css`, `app.js` | The whole preview app. Plain HTML, CSS and JavaScript, no framework, no build step, no server. |
| `data/corpus.json` | The real bundled text, 1,231 verses. Gita 701, Ramayana 332, Mahabharata 155, Hanuman Chalisa 43. Built by `tools/build-corpus.py` from the Muse app source. |
| `audio/gita/` | Preview audio only, 144 MP3s, 9.4 MB. All of Gita Chapter 1 in Sanskrit, Hindi and English, plus Gita 2.47. Same finalized voices as the Muse app: Sanskrit Chirp 3 HD Charon, Hindi Neural2-B, English Neural2-D. |
| `vercel.json` | Static site config and cache headers for the audio files. |
| `tools/build-corpus.py` | Regenerates `data/corpus.json` from the Muse app source. Read only, it never writes to the Muse artifact. |

## What is real in this preview

- The full verse text for all four texts, Sanskrit first, then Hindi meaning, then English last, exactly as Ankit set the card order.
- Verse of the Day, search across all four texts, chapter and section lists, the 21 day Gita plan, like and save, share, tap to understand, word by word for Gita.
- The Pro paywall with Ankit's geo pricing: India Rs 29 for a day, Rs 99 for a month, Rs 599 for a year; outside India $2 a day, $9 a month, $59 a year. Location is detected from the device timezone, with a manual INR/USD toggle. The 7 day free trial is on the yearly plan only.
- The Listen player with a real audio element, speed control, previous and next, and Play All for a chapter. Sanskrit chant is free, Hindi and English narration and Play All are Pro, same boundary as the live app.
- Streak and verses read, counted from the days you read in this browser.

## What is stubbed, honestly

- **Pro checkout is simulated.** Tapping Buy or Start trial turns Pro on in this browser only. No payment is taken, no card is asked for, nothing is charged. There is no Razorpay link and no payment link anywhere in this project. Real checkout is a launch decision, see below.
- **No sign in.** There is no Google login button and no fake one. In the Muse app you are signed in with your Muse account. On Vercel that identity does not exist, so this preview keeps likes, saves, streak and Pro in this browser only, in localStorage. If you open it on another phone, your streak starts again. For launch, sign in needs to be connected first.
- **Audio is Chapter 1 only.** The full Gita audio is 2,097 MP3s, 154 MB. That does not fit a free Vercel deploy, see the audio section below. Verses outside Chapter 1 and Gita 2.47 show a clear note instead of a broken player.
- **Study content is bundled text only.** Deep Study and Related Verses are Pro locked, as in the live app. In this preview, Pro unlock shows the word by word meanings. Full Deep Study generation needs the server, it is not faked here.
- **Hindi and English meanings have gaps.** Gita has Hindi for all 701 verses. Ramayana has Sanskrit and English only. Mahabharata has Sanskrit and transliteration only, no English or Hindi meaning bundled. The cards say so plainly where a meaning is missing, instead of inventing one.

## The audio size problem, and the decision

- Full Gita audio: 2,097 files, 154 MB, about 73 KB per file.
- Vercel Hobby: the CLI upload is capped at 100 MB, and a 154 MB audio folder alone breaks that. Individual files are fine, the total is the problem. Hobby also allows 10 GB of deployment storage, but a 154 MB deploy on every change is slow and fragile.
- So this preview bundles only Gita Chapter 1 (141 files, 9.3 MB) plus Gita 2.47 (3 files). Total deploy is about 11 MB, well inside the limit, and it is enough to hear all three voices and test the player.
- For the full launch, host the audio outside the Vercel deploy. Good options, in order: a public object store such as Cloudflare R2 or Amazon S3, served over a CDN, with the app loading each MP3 on demand by URL; or a paid Vercel plan with the audio in Blob storage. Do not copy all 2,097 files into this folder. When the Ramayana and Mahabharata audio is finished, the same rule applies, those files are also large.

## How to deploy, free `.vercel.app` domain, with auto deploy

Use Ankit's existing Vercel account, the one under ankitnegi4128@gmail.com.
Do not create a new account. Vercel lets you sign in with Google, so sign in
with that Google account.

The project is set up the proper way, connected to GitHub, so every change
lands on the live site automatically. This folder is already a Git repo with
one commit. No GitHub repo exists yet, and nothing has been deployed yet.

### Auto deploy flow

1. A change is made to Sanatan Scroll and committed to this folder.
2. The commit is pushed to the `main` branch of the GitHub repo.
3. Vercel sees the push and deploys it by itself. No manual redeploy, no CLI
   command, no button to press.
4. The live site at `sanatan-scroll.vercel.app` updates a couple of minutes
   later.
5. A push to any other branch, or a pull request, gets its own preview link
   instead, so unfinished work never touches the live site.

That is the whole point of the GitHub connection. Once it is set up, Ankit
never has to redeploy by hand.

### What Ankit needs to do once

Step 1, make the GitHub repo. On GitHub, signed in with the account linked
to ankitnegi4128@gmail.com, create a new empty repo called `sanatan-scroll`.
Do not add a README or a license in GitHub, the folder already has them.

Step 2, push this folder to it, from a terminal in this folder:

```bash
git remote add origin https://github.com/<your-github-username>/sanatan-scroll.git
git push -u origin main
```

Replace `<your-github-username>` with Ankit's GitHub username. If GitHub asks
for sign in, use the account linked to ankitnegi4128@gmail.com.

Step 3, connect it in Vercel. In the Vercel dashboard, Add New, Project,
Import the `sanatan-scroll` repo. If Vercel asks to install the GitHub app,
accept it, that is what lets Vercel see pushes. Framework preset: Other.
Build command: leave empty, this is a static site with no build step. Output
directory: leave as the project root. Deploy.

Step 4, check the address. Vercel gives a free address from the project
name, for example `sanatan-scroll.vercel.app`. If the name is taken, Vercel
suggests another. That address is the live site, public to anyone with the
link, no install needed.

From then on, every push to `main` auto deploys. To change something on the
site, change the files, commit, and push. That is all.

### If GitHub is not wanted

Fallback, Vercel CLI, no Git needed, but no auto deploy either. Every change
then needs a manual redeploy:

1. Install Node.js, then install the CLI once: `npm install -g vercel`
2. In this folder, run: `vercel`
3. Sign in with Google using ankitnegi4128@gmail.com.
4. Project name: `sanatan-scroll`. Vercel gives the free `.vercel.app`
   address from that name.
5. Every later change: run `vercel --prod` from this folder to update it.

The GitHub way above is the recommended one, because Ankit asked that
changes reflect automatically.

## What still needs Ankit's decision before a real launch

1. **Database.** On Vercel there is no built in SQLite file like the Muse app
   has. Likes, saves, streak, plans and Pro need a hosted database, for
   example Vercel Postgres, Supabase, or Neon. Until then, everything is
   per browser only.
2. **Sign in.** Google sign in on Vercel is real and possible, unlike in the
   Muse app. It needs a Google OAuth client and a small auth layer, for
   example Auth.js or Firebase Auth. Until then, Pro cannot be tied to a
   person, and a user who pays on one phone would lose Pro on another.
3. **Payments.** Razorpay for India, plus the store or card checkout outside
   India. Razorpay setup is free, about 2 percent per payment, and it needs
   Ankit's Razorpay account, bank and PAN. Nothing is linked in this preview.
4. **Audio hosting.** Pick the object store for the full 154 MB of Gita audio,
   plus Ramayana and Mahabharata audio when it is ready. See the audio section
   above.
5. **Plan.** Vercel Hobby is for personal, non commercial use. Sanatan Scroll
   with paid Pro is a commercial product, so a real launch likely needs
   Vercel Pro, about $20 a month, or another host. The Hobby preview for
   Ankit to look at is fine, but do not launch the paid product on Hobby.

## Regenerating the text

If the Muse app text changes, rerun:

```bash
python3 tools/build-corpus.py
```

That reads the Muse artifact source and the audio corpus, and rewrites
`data/corpus.json`. It never edits the Muse artifact.
