QUIZME OFFLINE — Hotspot Tap-to-Answer Quiz Battles
=========================================================

WHAT THIS IS
-------------
A single-page app (index.html + icons/ folder) that runs completely offline.
No server, no build step, no internet connection required — ever. Just open
index.html in a browser (double-click it, or copy the whole "quizme-offline"
folder onto a phone/laptop and open it there).

Everything is stored in the browser's localStorage on each device:
profile, custom quiz sets, rankings, and battle history.

Every player answers by tapping one of four choices — no typing during
battle. Each question auto-generates 4 tap-able options (the correct
answer plus 3 distractors pulled from other questions), so answering is
instant for everyone, host and guests alike.

It's also now a full PWA: installable to your home screen/app list, with a
service worker (sw.js) and manifest (manifest.json) that cache the entire
app shell — including every icon — so it keeps working with zero network
at all, even after closing and reopening it days later. See "INSTALLING AS
AN APP" below.


INSTALLING AS AN APP (PWA)
------------------------------
Opening index.html directly by double-clicking it (file://) still works
exactly as before, with no install step. But service workers (the thing
that lets a browser install a page as an app and guarantee true offline
reloads) only activate when a page is served over http/https or
localhost — not over file://. So to get the "Add to Home Screen" /
"Install app" prompt and full service-worker offline caching, serve the
folder over a tiny local web server first:

  Option A — Python (already on most systems):
    cd quizme-offline
    python3 -m http.server 8080
  Then open http://localhost:8080 in your phone's/computer's browser.

  Option B — Node:
    npx serve quizme-offline

  Option C — host it for free: drag the "quizme-offline" folder onto
    Netlify Drop (netlify.com/drop), or push it to GitHub Pages. Either
    gives you a real https:// URL you can open and install on any device,
    while the app itself still makes zero network calls after that first
    load — everything is cached locally, and multiplayer still only ever
    talks directly device-to-device over your hotspot, never through that
    server.

Once served over http(s)/localhost, open it in Chrome/Edge/Safari and use
"Add to Home Screen" (iOS Safari) or the install icon in the address bar
(Chrome/Edge/Android) to install it like a native app — with its own icon,
splash screen, and standalone window (no browser bar). After the first
visit it works completely offline: turn on Airplane Mode and reopen it —
the app shell and every icon load instantly from the service worker cache,
no blank/broken images.

If you'd rather just keep opening index.html straight from disk with no
server at all, that's completely fine too — quiz sets, hotspot battles,
solo quiz, and rankings all work identically either way. The service
worker is a pure offline/installability upgrade on top, not a requirement.


HOW THE HOTSPOT BATTLE WORKS
------------------------------
1. User A opens the app, taps "Create Lobby", picks a quiz set and turns on
   their phone's Wi-Fi hotspot — with "client isolation" / "AP isolation"
   turned OFF in the hotspot settings (see note below, this is the #1 cause
   of failed connections).
2. Users B and C connect their phones' Wi-Fi to A's hotspot (normal phone
   Settings, not inside this app).
3. Because a web page cannot open a server or scan the network by itself
   (this is a deliberate browser security restriction, not a limitation of
   this app), devices connect using a one-time "connect code" instead of
   automatic pairing — but it's now streamlined to a couple of taps:
     - A's invite code is generated automatically as soon as they open the
       lobby. They tap "Share" to send it straight to B via any app,
       AirDrop, or Bluetooth (nothing needs the internet), or "Copy".
     - B opens "Join Lobby" and pastes the code (or taps "Paste from
       clipboard"). Their reply code is generated and copied automatically
       — no extra button needed.
     - B taps "Share" to send the reply code back to A, who pastes it (or
       taps "Paste") into "Connect player". The two devices are now
       directly connected over the local hotspot network via WebRTC (no
       STUN/TURN/relay servers are used — the app is configured with an
       empty ICE server list, so it can only ever connect over the same
       local network, never over the internet).
   Repeat for each extra player (C, D, ...). Codes are now gzip-compressed
   before being encoded, so they're meaningfully shorter than before.
4. Once at least one player has joined, A taps "Start Battle". Everyone taps
   their answer for the same questions at the same time; the app scores
   speed + accuracy and shows a live leaderboard, then final results. Every
   device saves its own copy of the results locally.

TROUBLESHOOTING "CAN'T CONNECT"
------------------------------
The most common real-world cause is the hotspot's "client isolation" (also
called "AP isolation") setting, which many phones enable by default. It
lets connected devices reach the internet through the hotspot but blocks
them from talking directly to each other — which is exactly what this app
needs. Turn it off in the hotspot device's settings, or host from a home
Wi-Fi router instead (most don't isolate clients by default). The app will
also show a toast/error if a connection attempt fails so you're not left
guessing.

A HONEST NOTE ON "DISCOVER"
------------------------------
True automatic discovery (scanning the hotspot for other phones without any
code exchange) is not something a browser page is allowed to do for privacy/
security reasons — no website can silently enumerate devices on your Wi-Fi.
So the "Discover" tab does two honest things instead:
  - It remembers lobby codes you've connected to before, so reconnecting is
    one tap instead of retyping a code.
  - It includes a fully automatic "Same-device test mode" (built on the
    BroadcastChannel API) that instantly finds and connects other browser
    tabs/windows open on the SAME computer — no codes needed. This is great
    for trying out the whole app (host + 2 guests) by yourself, in three
    browser tabs, before doing it for real over a hotspot with friends.

WHAT'S INCLUDED
------------------
- 5 built-in tap-to-answer quiz sets (General Knowledge, Science, Quick
  Math, Geography, Language & Words), 10 questions each.
- Solo Quiz mode — play by yourself any time, no other players or hotspot
  needed; results still save to your local history and rankings.
- A quiz-set editor so you can write your own questions (use ____ for the
  blank; the first listed answer is what's shown as the correct tap choice).
- Local rankings leaderboard (aggregated across every battle played on that
  device) and a battle history log.
- All icons are plain PNG files in the icons/ folder — no external fonts,
  images, or scripts are loaded from the internet anywhere in this app.
- Installable as a PWA with full offline caching (see above) — optional.

FILES
------
  index.html    – the entire app (HTML + CSS + JavaScript)
  manifest.json – PWA manifest (name, icons, standalone display mode)
  sw.js         – service worker that caches the app shell for offline use
  icons/*.png   – all UI icons, avatars, and the app logo, pre-rendered as PNG
  README.txt    – this file

TIPS
-----
- Keep this folder together (don't move index.html away from icons/,
  manifest.json, or sw.js).
- Works fully offline — you can even turn on Airplane Mode with hotspot/Wi-Fi
  still on and it will work fine, since nothing ever touches the internet.
- Each device keeps its own local rankings/history; there's no shared cloud
  leaderboard by design (100% offline, no backend).
- If you update index.html later, bump CACHE_NAME at the top of sw.js (e.g.
  'quizme-offline-v2') so installed devices pick up the change instead of
  serving the old cached version forever.
