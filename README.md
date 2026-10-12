# Echo meal check-in prototype (AT-01, build B1, web v2)

A clickable prototype for the formative cognitive walkthrough (EM-04, ER-01) of use case **UC01: Support Cleber through a planned meal**. It is a static site (HTML, CSS and plain JavaScript): no build step, no server of its own.

> **Simulation.** Nothing senses, decides or logs anything. The prototype plays Echo and Sarah's phone; evaluators imagine the persona.

## What is in it

| Part | UC01 steps | Notes |
| --- | --- | --- |
| Host briefing | – | Objective, scenario, both personas, the action sequence and what is walked. Hosts read it aloud. |
| **Path A: Cleber** (Echo in the kitchen) | 2, 4, 5, 7 | Three reminders; choices *go to the kitchen*, *say "not now"*, *do nothing*; one postponement restarts the sequence, a second does not; eating confirmed by "I'm done" or by Echo noticing; Echo stops and rests. |
| **Path B: Sarah** (phone view) | 6, 7 | Unresolved-meal alert (refusal, non-response or uncertain), *Call Cleber* / *I'll visit*, repeat after no response, Gilbert notified, "resolved" update. |
| Walkthrough form | all | The four questions (a to d) are answered **at every step**, next to the step (EM-04, ER-01). Yes/No is **required**: the button that leaves a step stays disabled until a to d are answered; a short reason box opens after each tap. The success story, failure story, suggestion and "other problem" fields are always visible (not folded away). There is no "answer at the end" mode. |
| CL3 follow-up | – | The three open questions for UC01-F2-CL3 after the walkthrough. |
| Notes export | – | Printable page (save as PDF) and a `.json` download, including Sarah's notes when a phone was connected. |

Not in it (as in AT-01): steps 1, 3, 8, 9 (detection, camera logic, plate-away log, visit summary), real timing and sensing, rooms, and claims CL1, CL2, CL4, CL5.

## Scenarios, runs and your data

Cleber's path has **295 distinct paths** (three reminders; at each one Cleber can eat, go to the kitchen and leave, do nothing or say "not now"; the first "not now" restarts the sequence; 393 if "I'm done" and eating silently are counted apart). They are grouped into **16 scenarios** in the **Scenarios panel** on the left: 12 for Cleber's screen (eats at once, misses one or two reminders, never responds, kitchen but no eating, "not now" then eats / misses a reminder / never responds / says it twice / goes to the kitchen without eating, and so on) and 4 for Sarah's phone (call, visit, no response then Gilbert, "resolved" update).

- Click a scenario to make it the target: the panel shows what to do. Click it again for a free path.
- A Cleber scenario is **ticked automatically** when the run matches it. Sarah's scenarios are ticked when her phone reports them; the tick box can also be set by hand (for example when Sarah's view runs alone).
- When a scenario ends, the evaluator is asked: **do another scenario, or end** (end leads to the CL3 follow-up questions). Each run keeps its own notes; the print page and the `.json` list every run in order.
- **Nothing is overwritten.** Finished runs are archived, never reset; Sarah's phone archives its notes whenever Cleber moves to the next scenario. Starting a new session, or *Start over*, asks first, and leaves a safety copy in the browser (`localStorage` keys starting `echo.backup.`).

## Two screens, one session

Cleber's screen creates a **session code**. Its QR code (briefing page, or ☰ → *Session and QR code*) opens Sarah's phone view, which then follows Cleber's evaluator: when Cleber's reminders end unresolved, Sarah's phone shows the alert; if Cleber later eats, it shows the "resolved" update. Sarah's notes are sent back to Cleber's screen so the hosts get everything in one export.

Without a second evaluator, ignore the QR code. Sarah's view also works **alone** (`#/sarah`, "Open without a session") with a scenario picker, so one evaluator can walk both paths one after the other.

How it connects: GitHub Pages has no backend, so the two devices pair with WebRTC through [PeerJS](https://peerjs.com). The free public PeerJS broker is only used to introduce the two devices; the messages go device to device. Only simulated state and the evaluators' notes are sent, and no personal data. Two tabs in the same browser also sync with no internet at all. If the broker is unreachable, the page says so and Cleber's path still works.

## Echo's look and voice

- **Look:** the robot from the team's interim presentation (`img/echo.png`, cut out of the title slide). The picture cannot turn its head, so attention is shown softly: the chest lights and a halo brighten, then Echo leans about 2.5° and floats by a few pixels. "Light only" in the settings removes all movement, and the operating system's *reduce motion* setting does the same by default. Echo's lines appear in a speech bubble styled like the one on the slide.
- **Voice:** pre-rendered audio files (`audio/<lang>/<key>.mp3`), the same on every device, in a slow, lowered, calm neural voice (Microsoft *Sonia*, British English, for English; *Amala* for German), played at one fixed level on every reminder. If a file cannot be played, the browser's own voice is used as a fallback. Alternatives to listen to are in `tools/voice-samples/`.
- **Variations:** every line has four wordings (`r1`, `r1_2`, `r1_3`, `r1_4`, and so on, in `js/i18n.js`, with matching audio files). Each time Echo says the same line in a session it uses the next wording (the first time is the DS-01 wording), so the first reminder after a postponement is not the same sentence again. "Hear again" repeats the wording just heard. The counter restarts with the walkthrough.
- **Changing the voice or the wording:** edit the text in `js/i18n.js` or the voice in `tools/make_audio.py`, then run `python3 -m pip install edge-tts && python3 tools/make_audio.py`. To use ElevenLabs (or anyone's recording) instead, just replace the mp3 files with the same names. The audio is a recording of the text at the time, so regenerate after any wording change.

## Settings (⚙ on every screen)

Language (English, Deutsch; for Echo's lines, Sarah's messages and the controls; the walkthrough form stays English), text size, high contrast, night mode, Echo movement (gentle lean + light, or light only), speak aloud, captions. Settings are per device.

## Things to check before the session

- **The robot is not the owl of RP-01.** RP-01 and AT-01 describe Echo as an owl-like tabletop robot with an orientable head and a soft head turn before speech. This prototype uses the slide's astronaut-style robot and cannot turn its head. If the team keeps this look, RP-01's embodiment text should change.
- **Wording is placeholder.** Echo's lines 1 and 2 follow DS-01; line 3, the replies to "not now", Sarah's alert text and the "resolved" text are my wording, informed by IDP-01. Replace them in `js/i18n.js` if the team specifies others. The German texts need a native check.
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
- `js/scenarios.js` the 16 scenarios and how a run is matched to them
- `js/i18n.js` texts and translations · `js/settings.js` · `js/scene.js` kitchen, Echo and audio playback · `js/sync.js` pairing · `js/walkthrough.js` form and export · `js/cleber.js` · `js/sarah.js` · `js/app.js` routing
- `img/` the robot picture · `audio/` Echo's voice lines · `tools/` voice generation script and voice samples
- `vendor/` PeerJS 1.5.4 (MIT) and qrcode-generator 1.4.4 (MIT), copied in so the page needs no CDN
