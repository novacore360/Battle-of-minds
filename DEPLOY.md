# Deploying QuizMe Offline to GitHub + Render

This app is pure static files (HTML/CSS/JS + PNG icons) — no build step, no
backend, no database. That makes it a perfect fit for a Render **Static
Site**, and it's also exactly what you need for the PWA/service-worker
features to work (they require `https://`, which Render gives you for free).

## 1. Push this folder to GitHub

From inside this folder (the one with `index.html`, `manifest.json`,
`sw.js`, `render.yaml`, and `icons/`):

```bash
git init
git add .
git commit -m "QuizMe Offline"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

(Create the empty repo on GitHub first if you haven't — github.com/new —
then use the remote URL it gives you.)

**Important:** make sure `index.html`, `manifest.json`, `sw.js`,
`render.yaml`, and the `icons/` folder end up at the **root** of the repo,
not nested inside another folder — otherwise Render won't find them at the
paths the app expects.

## 2. Deploy on Render

You have two options — pick whichever's easier:

### Option A — Blueprint (uses the included `render.yaml`, zero manual config)
1. Go to the [Render Dashboard](https://dashboard.render.com) → **New +** → **Blueprint**.
2. Connect the GitHub repo you just pushed.
3. Render detects `render.yaml` automatically and shows you a static site
   named `quizme-offline` ready to create. Click **Apply**.

### Option B — Manual static site
1. **New +** → **Static Site** → connect the same repo.
2. **Build Command:** leave blank (or `echo "no build"`).
3. **Publish Directory:** `.` (repo root).
4. Click **Create Static Site**.

Either way, Render builds and deploys in under a minute and gives you a
URL like `https://quizme-offline.onrender.com` — with HTTPS already set up.

## 3. Install it as an app

Open that URL on your phone/laptop, then:
- **Android/Chrome/Edge:** tap the install icon in the address bar, or the
  "Install app" prompt.
- **iOS Safari:** Share button → "Add to Home Screen".

After that first visit, the service worker has cached the whole app
(including every icon), so it keeps working with **zero network** — you
can turn on Airplane Mode and it still opens and plays fine. Multiplayer
battles still connect two phones **directly** to each other over a Wi-Fi
hotspot via WebRTC — Render only ever serves the app files themselves, it's
never involved in an actual quiz battle or in storing any of your data
(profile, quiz sets, rankings, and history all stay in each device's local
browser storage).

## 4. Pushing updates later

Every `git push` to your connected branch auto-redeploys on Render. Two
things to remember so installed devices actually pick up the change:

1. **Bump `CACHE_NAME`** at the top of `sw.js` (e.g. `'quizme-offline-v2'`).
   The service worker only re-caches files when this changes — otherwise
   it keeps serving the old cached version forever, even after you deploy.
2. That's it — `render.yaml` already sets `Cache-Control: no-cache` on
   `sw.js` and `manifest.json` so browsers always fetch the latest copy of
   *those two files* to check whether an update exists, instead of an
   upstream CDN cache hiding it from them.
