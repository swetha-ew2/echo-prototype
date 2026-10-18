# Echo meal check-in prototype (AT-01, build B2; B1 = the walkthrough build, git tag `b1-walkthrough`)

A clickable prototype for the formative cognitive walkthrough (EM-04, ER-01) of use case **UC01: Support Cleber through a planned meal**. It is a static site (HTML, CSS and plain JavaScript): no build step, no server of its own.

> **Simulation.** Nothing senses, decides or logs anything. The prototype plays Echo and Sarah's phone; evaluators imagine the persona.

## Build B2 (branch `v2-demo`)

B2 is the demo build. Open the page as it is for the **demo**: the same scenarios, Echo, Sarah's phone, event log and visit summary, but **no walkthrough questions** (no Yes/No form, no reasons, no follow-up screen, no gating of Continue; Sarah's phone shows no questions either). Add `?walkthrough=1` before the `#` (for example `index.html?walkthrough=1#/cleber`) to get the B1 walkthrough form back.

What changed from B1:

- **Announced postponement.** After the first "not now" Echo says it will remind Cleber in 30 minutes (four wordings, English and German, new audio). The log gets an *Announcement* entry. A second "not now" is still acknowledged without a new time.
- **Chime and light (log only).** Nothing is played or shown; each reminder is preceded by a *Chime and light* log entry. Rule R14 checks it.
- **Rule R6 dropped** ("the camera stays off until kitchen activity" is a technology constraint in TECH-02, not a Premise criterion). The other rules keep their B1 numbers, so the set is R1–R5 and R7–R14 (13 rules). R1 skips the chime and announcement entries; R3 also requires the 30-minute announcement.
- **Coverage readout.** The Event log, the printed notes and the `.json` export show, for each rule, how many scenarios passed, failed or were n/a, and mark any rule that no scenario has exercised as *not covered*.
- **Four facilitator scenarios** in Cleber's panel (C13 plate leaves and returns, C14 plate away over an hour, C15 plate never returns, C16 sensor goes offline), so the plate and sensor rules and the visit summary data gaps get exercised. The panel now lists 16 scenarios for Cleber's screen.
- Not done on purpose: the kitchen cue for why Cleber is in the kitchen, praise or check-in dialogue, and sleep detection (a limitation, see AT-01).

## What is in it

| Part | UC01 steps | Notes |
| --- | --- | --- |
| Host briefing | – | Objective, scenario, both personas, the action sequence and what is walked. Hosts read it aloud. |
| **Path A: Cleber** (Echo in the kitchen) | 2, 4, 5, 7 | Three reminders; choices *go to the kitchen*, *say "not now"*, *do nothing*; one postponement (at reminder 1 or 2) restarts the sequence, a second does not, and there is no "not now" at reminder 3; eating confirmed by "I'm done" or by Echo noticing; Echo stops and rests. |
| **Path B: Sarah** (phone view) | 6, 7 | Unresolved-meal alert (refusal, non-response or uncertain), *Call Cleber* / *I'll visit*, repeat after no response, Gilbert notified, "resolved" update. |
| Walkthrough form | all | Each step has its **own Yes/No questions** (two or three, only those that apply: initial reminder, postponement, entering the kitchen, repeated reminder, final reminder, ending confirmed / not confirmed; for Sarah, the alert and the "resolved" update), answered next to the step (EM-04, ER-01). A step's questions are asked **in full the first time** that step appears in the session (a repeated reminder, a later scenario, Sarah's second alert); after that the panel shows one optional box, "Was anything different this time?", so evaluators do not answer the same questions up to four times per scenario. Yes/No is **required**: the button that leaves a step stays disabled until every question shown for that step is answered; a short reason box opens after each tap. There is no "answer at the end" mode for the step questions. |
| CL3 follow-up | – | The three open questions for UC01-F2-CL3 after the walkthrough. |
| Notes export | – | Printable page (save as PDF) and a `.json` download, including Sarah's notes when a phone was connected. |

Not in it (as in AT-01): real timing and sensing, rooms, and claims CL1, CL2. **Added beyond AT-01 B1 (a B2-style step, so AT-01 should be updated if you keep it):** a simulated event log with a conformance check (steps 8, 9 and EM-03/M-04), a mock visit summary for Sarah (F4, CL5 Part B), and open-ended questions for Sarah after the alert and the summary (CL4, CL5), next to the CL3 questions for Cleber. Everything is still simulated: the facilitator chooses the events, and nothing is sensed.

## Scenarios, runs and your data

Cleber's path has **108 distinct paths** (three reminders; at each one Cleber can eat, go to the kitchen and leave, do nothing or say "not now"; "not now" is only possible at reminders 1 and 2, and the first one restarts the sequence, so Echo gives at most **5 reminders**; 154 if "I'm done" and eating silently are counted apart). They are grouped into **16 scenarios** in the **Scenarios panel** on the left: 12 for Cleber's screen (eats at once, misses one or two reminders, never responds, kitchen but no eating, "not now" then eats / misses a reminder / never responds / says it twice / goes to the kitchen without eating, and so on) and 4 for Sarah's phone (call, visit, no response then Gilbert, "resolved" update).

- **One scenario at a time:** while a scenario is running the others are greyed out and cannot be picked or ticked; they unlock on the end-of-scenario screen.
- **Questions are always open:** the right-hand panel shows three stages (Echo speaks, Answer the questions, Continue). On the steps where Cleber acts, the evaluator can listen, answer, then choose what Cleber does, in either order. Only the Continue button waits for the Yes/No answers. A collapsible persona card (Cleber, or Sarah on the phone) sits at the top of the panel; Cleber's is also open on the briefing.
- Click a scenario to make it the target: the panel shows what to do. Click it again for a free path.
- The panel works like a **single-choice list** (pick the scenario to do next). Evaluators cannot tick anything: a scenario is marked "✓ done" by the app when the run matches it, and the scenario descriptions say what Cleber does, not what Sarah's phone will show. Cleber's panel lists only the twelve Cleber scenarios; Sarah's four are on Sarah's phone page only, marked done when her phone detects them.
- When a scenario ends, the evaluator is asked: **do another scenario, or end** (end leads to the CL3 follow-up questions). Each run keeps its own notes; the print page and the `.json` list every run in order.
- **Nothing is overwritten.** Finished runs are archived, never reset; Sarah's phone archives its notes whenever Cleber moves to the next scenario. Starting a new session, or *Start over*, asks first, and leaves a safety copy in the browser (`localStorage` keys starting `echo.backup.`).

## Event log, summary and open questions

- **No host-notes form.** The hosts cannot write during the session, so the success stories, failure stories, design suggestions and problems outside the sequence are asked as open questions at the end: Cleber's last screen (questions 5 to 8) and the end of Sarah's open questions (C1 and C2). The per-step "why" boxes carry the step-level stories.
- **Event log** (header button): every scenario writes a timestamped log (trigger, each reminder, response, postponement, kitchen entry, camera on/off, eating state, escalation and its recipient, Sarah's response, the "resolved" update, closure). In the same window the facilitator can add **meal-state events** as in EM-03: *plate leaves the table* (then returns after N minutes, or never returns) and *kitchen sensor reported offline*. While the plate is away Echo sends no reminder (the next one is withheld until the plate returns); a plate that never returns is logged as not returned and sends no alert.
- **Conformance check (M-04):** 13 rules checked on the log (reminder order and count, one announced postponement, no prompt after closure, escalation recipient and stated reason, repeat once then Gilbert, no reminder while the plate is away, plate-away time and the over-one-hour flag, missing data shown, closure, chime before each reminder; B1 also had R6, camera off until kitchen activity). A scenario passes only if no rule fails. This verifies the prototype's scripted logic only (EM-03 limitation).
- **Visit summary** (Sarah's phone, "Open visit summary"): built from the finished scenarios' logs. Items needing attention come first; plate-away over one hour and sensor gaps are called out; missing data is shown as a gap. When Sarah's view runs alone it shows a small sample.
- **Open questions, no scores** (this is a formative cycle, so there are no Likert items): Cleber answers the follow-up questions on the last screen: three on autonomy (the open question of M-03), one on task progress, and four findings questions (what worked, what could go wrong, what to change, what was not covered). Sarah has an *Open questions* tab: after the alert (what it told her, what she would do and why, what was unclear) and after the visit summary (which meals were eaten, whether timing, plate-away times and missing data were understandable). The real reason for the alert is stored beside her answer so the hosts can compare. M-03's and M-05's Likert items are not used.

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
- `js/log.js` event log, conformance check, visit summary and questionnaires
- `js/scenarios.js` the 16 scenarios and how a run is matched to them
- `js/i18n.js` texts and translations · `js/settings.js` · `js/scene.js` kitchen, Echo and audio playback · `js/sync.js` pairing · `js/walkthrough.js` form and export · `js/cleber.js` · `js/sarah.js` · `js/app.js` routing
- `img/` the robot picture · `audio/` Echo's voice lines · `tools/` voice generation script and voice samples
- `vendor/` PeerJS 1.5.4 (MIT) and qrcode-generator 1.4.4 (MIT), copied in so the page needs no CDN
