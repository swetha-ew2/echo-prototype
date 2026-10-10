# Echo meal check-in prototype (AT-01, build B1, web v1)

A clickable prototype for the formative cognitive walkthrough (EM-04, ER-01) of use case **UC01: Support Cleber through a planned meal**. It is a static site (HTML, CSS and plain JavaScript): no build step, no server of its own.

> **Simulation.** Nothing senses, decides or logs anything. The prototype plays Echo and Sarah's phone; evaluators imagine the persona.

## What is in it

| Part | UC01 steps | Notes |
| --- | --- | --- |
| Host briefing | – | Objective, scenario, both personas, the action sequence and what is walked. Hosts read it aloud. |
| **Path A: Cleber** (Echo in the kitchen) | 2, 4, 5, 7 | Three reminders; choices *go to the kitchen*, *say "not now"*, *do nothing*; one postponement restarts the sequence, a second does not; eating confirmed by "I'm done" or by Echo noticing; Echo stops and rests. |
| **Path B: Sarah** (phone view) | 6, 7 | Unresolved-meal alert (refusal, non-response or uncertain), *Call Cleber* / *I'll visit*, repeat after no response, Gilbert notified, "resolved" update. |
| Walkthrough form | all | The four questions (a to d) with Yes/No and a justification, success and failure stories, suggestions. |
| CL3 follow-up | – | The three open questions for UC01-F2-CL3 after the walkthrough. |
| Notes export | – | Printable page (save as PDF) and a `.json` download, including Sarah's notes when a phone was connected. |

Not in it (as in AT-01): steps 1, 3, 8, 9 (detection, camera logic, plate-away log, visit summary), real timing and sensing, rooms, and claims CL1, CL2, CL4, CL5.

## Two screens, one session

Cleber's screen creates a **session code**. Its QR code (briefing page, or ☰ → *Session and QR code*) opens Sarah's phone view, which then follows Cleber's evaluator: when Cleber's reminders end unresolved, Sarah's phone shows the alert; if Cleber later eats, it shows the "resolved" update. Sarah's notes are sent back to Cleber's screen so the hosts get everything in one export.

Without a second evaluator, ignore the QR code. Sarah's view also works **alone** (`#/sarah`, "Open without a session") with a scenario picker, so one evaluator can walk both paths one after the other.

How it connects: GitHub Pages has no backend, so the two devices pair with WebRTC through [PeerJS](https://peerjs.com). The free public PeerJS broker is only used to introduce the two devices; the messages go device to device. Only simulated state and the evaluators' notes are sent, and no personal data. Two tabs in the same browser also sync with no internet at all. If the broker is unreachable, the page says so and Cleber's path still works.

## Settings (⚙ on every screen)

Language (English, Deutsch, Português; for Echo's lines, Sarah's messages and the controls; the walkthrough form stays English), text size, high contrast, night mode, Echo movement (gentle lean + light, or light only), speak aloud, captions. Settings are per device. "Reduce motion" in the operating system defaults Echo to light only.

Echo's design avoids an uncanny look: no pupils, mouth or beak, no blinking or eye tracking, soft amber LEDs, and only a very slow, small lean before it speaks. The voice level is fixed on every reminder and shown as unchanged.

## Things to check before the session

- **Wording is placeholder.** Echo's lines 1 and 2 follow DS-01; line 3, the replies to "not now", Sarah's alert text and the "resolved" text are my wording, informed by IDP-01. Replace them in `js/i18n.js` if the team specifies others. The German and Portuguese texts need a native check.
- **Night mode is beyond AT-01.** AT-01 lists time-of-day adaptations (RP-01) as out of scope. Night mode here only changes the look (dark theme, dim room and LEDs) and is off by default. Do not present it as a verified behaviour.
- **Gilbert** is included (UC01 step 6) although AT-01's scope does not name him.
- **Echo tells Sarah silently:** after the third reminder Echo just rests and says nothing to Cleber about informing Sarah. UC01 does not say whether it should. Evaluators may raise this.
- The intervals (10 minutes between reminders, 30 minutes after "not now") and times (12:30 lunch) are illustrative.

## Run locally

```sh
cd prototype
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` directly also works for Cleber's path, but the QR link only works from a hosted address.

## Deploy with GitHub Pages

1. Push the repository to GitHub (`main` branch).
2. In the repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main`, folder `/ (root)` → Save.**
3. After a minute the site is at `https://<your-user>.github.io/echo-prototype/`. Open that address on Cleber's screen; the QR code then contains the hosted link.
4. Test the pairing on the real devices (and on the room's Wi-Fi if possible) before Tuesday. Keep the local copy as a fallback for Cleber's path.

## Files

- `index.html`, `css/style.css`
- `js/i18n.js` texts and translations · `js/settings.js` · `js/scene.js` kitchen and Echo · `js/sync.js` pairing · `js/walkthrough.js` form and export · `js/cleber.js` · `js/sarah.js` · `js/app.js` routing
- `vendor/` PeerJS 1.5.4 (MIT) and qrcode-generator 1.4.4 (MIT), copied in so the page needs no CDN
