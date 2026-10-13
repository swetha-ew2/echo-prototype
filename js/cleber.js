/* Cleber's evaluator screen (Path A) and the session host.
   Walks steps 2, 4, 5 and 7 and drives what Sarah's phone shows (steps 6 and 7). */
(function () {
  var KEY = 'echo.cleber';
  var ST = null;          // persisted walkthrough state
  var syncStatus = 'init';
  var el = null;          // container

  /* Everything that belongs to one scenario run; a new run starts from this and the old one is archived in ST.runs. */
  function runFields() {
    return {
      screen: 'brief', n: 1, postponed: 0, last: 'none', clock: 12 * 60 + 30,
      times: [], pending: null, say: null, escalated: false, outcome: null, alertAt: null, resolvedAt: null,
      sarahPhase: 'none', notes: {}, visited: [], plate: 'cold', spoken: {}, line: null, card: null, trail: [], matched: [],
      log: [], plateAway: null, plateGone: false, sensorOff: false, cameraOn: false, finished: false, withheld: false
    };
  }
  function fresh(code) {
    return Object.assign(runFields(), {
      code: code || EP.sync.newCode(), followup: {}, sarahNotes: {}, sarahRuns: [], sarahRunId: null, sarahEvents: [],
      runs: [], runId: 1, target: 'C1', done: {}, manual: {}, sarahOQ: null
    });
  }
  function save() { EP.store.set(KEY, ST); }
  /* One timestamped entry in the episode's event log (the time is the simulated clock). */
  function logEv(type, text, data, at) {
    var t = at != null ? at : ST.clock;
    ST.log.push({ at: t, time: EP.fmtTime(t), type: type, text: text, data: data || {} });
  }
  function cardId() { return ST.screen === 'closure' || ST.screen === 'after' ? 'CLOSE' : (ST.card || 'R1'); }

  /* ---------- session / sync ---------- */
  function snapshot() {
    return {
      type: 'state', ts: Date.now(), code: ST.code, runId: ST.runId, phase: ST.sarahPhase, outcome: ST.outcome,
      times: ST.times.map(EP.fmtTime), postponed: ST.postponed > 0, mealTime: '12:30',
      alertAt: ST.alertAt != null ? EP.fmtTime(ST.alertAt) : null,
      resolvedAt: ST.resolvedAt != null ? EP.fmtTime(ST.resolvedAt) : null,
      episodes: ST.runs.concat(ST.finished ? [curRun()] : []).map(EP.log.episode)
    };
  }
  function pushState() { EP.sync.send(snapshot()); }

  function onMsg(msg) {
    if (msg.type === 'hello') pushState();
    else if (msg.type === 'sarahEvent') {
      if (!ST.sarahEvents.some(function (e) { return e.id === msg.id; })) { ST.sarahEvents.push({ id: msg.id, kind: msg.kind, at: msg.at, run: ST.runId }); logSarah(msg.kind); save(); refreshScn(); }
    } else if (msg.type === 'sarahNotes') { ST.sarahNotes = msg.notes || {}; ST.sarahRuns = msg.runs || []; ST.sarahRunId = msg.runId || null; ST.sarahOQ = msg.oq || ST.sarahOQ; save(); }
  }
  /* Sarah's phone reports what she did; the log records the escalation steps (the 15-minute waits are simulated). */
  function logSarah(kind) {
    if (ST.alertAt == null || ST.screen === 'brief') return;
    if (kind === 'call' || kind === 'visit') logEv('sarah_response', 'Sarah responded: ' + (kind === 'call' ? 'calling Cleber.' : 'will visit.'), { kind: kind }, ST.alertAt);
    else if (kind === 'repeat-after-no-response') logEv('escalation_repeat', 'No response from Sarah: the message is repeated once.', { to: 'Sarah' }, ST.alertAt + 15);
    else if (kind === 'gilbert-notified') logEv('escalation_backup', 'Still no response: Gilbert is notified as backup.', { to: 'Gilbert' }, ST.alertAt + 30);
  }
  function onStatus(st) {
    if (st === 'idtaken') { ST.code = EP.sync.newCode(); save(); openSync(); return; }
    syncStatus = st;
    var chip = document.getElementById('sync-chip');
    if (chip) chip.outerHTML = syncChip();
    var host = document.getElementById('host-sync');
    if (host) host.innerHTML = syncText();
    if (st === 'connected') pushState();
  }
  function openSync() { EP.sync.open('host', ST.code, onMsg, onStatus); }

  function link() { return location.href.split('#')[0] + '#/sarah?s=' + ST.code; }
  function syncText() {
    var m = {
      init: 'Starting…', ready: 'Waiting for Sarah’s phone to join.', connected: 'Sarah’s phone is connected.',
      offline: 'No connection to the pairing service. Phone link unavailable; Cleber’s path still works.',
      nopeer: 'Pairing library not loaded. Phone link unavailable; Cleber’s path still works.'
    };
    return EP.esc(m[syncStatus] || m.init);
  }
  function syncChip() {
    var cls = syncStatus === 'connected' ? 'ok' : (syncStatus === 'offline' || syncStatus === 'nopeer' ? 'bad' : 'wait');
    var txt = syncStatus === 'connected' ? 'Sarah’s phone connected' : (cls === 'bad' ? 'Phone link offline' : 'Session ' + ST.code);
    return '<button id="sync-chip" class="chip-btn ' + cls + '" data-action="open-session"><i></i>' + EP.esc(txt) + '</button>';
  }

  function sessionCard() {
    var local = location.protocol === 'file:';
    var qrHtml = '';
    try {
      var qr = qrcode(0, 'M'); qr.addData(link()); qr.make();
      qrHtml = qr.createImgTag(6, 8, 'QR code that opens Sarah’s phone view');
    } catch (e) { qrHtml = '<p class="hint">QR code could not be generated.</p>'; }
    return '<div class="session-card"><div class="qr">' + qrHtml + '</div><div>' +
      '<h3>Sarah’s phone (optional second evaluator)</h3>' +
      '<p>Scan the code or open this link on another device. Session code: <b class="code">' + EP.esc(ST.code) + '</b></p>' +
      '<p class="linkline"><input readonly value="' + EP.esc(link()) + '" aria-label="Link to Sarah’s view" onclick="this.select()"> ' +
      '<button class="btn ghost" data-action="copy-link">Copy</button></p>' +
      '<p id="host-sync" class="status-line">' + syncText() + '</p>' +
      (local ? '<p class="warn">This copy is opened from a file, so the link will not work on another device. Use the hosted (GitHub Pages) address.</p>' : '') +
      '<p class="hint">Without a second evaluator, ignore this: the Cleber path works on its own.</p></div></div>';
  }

  /* ---------- rendering ---------- */
  function header() {
    return '<header class="topbar"><div class="brand"><span class="logo" aria-hidden="true"></span><div><b>Echo</b><small>Meal check-in prototype</small></div></div>' +
      '<div class="top-actions">' + syncChip() +
      '<button class="btn ghost small" data-action="open-hostnotes">Host notes</button>' +
      '<button class="btn ghost small" data-action="open-log">Event log</button>' +
      '<button class="icon-btn" data-action="open-settings" aria-label="' + EP.esc(EP.t('ui_settings')) + '">⚙</button>' +
      '<button class="icon-btn" data-action="open-menu" aria-label="' + EP.esc(EP.t('ui_menu')) + '">☰</button></div></header>';
  }

  function simNotice() {
    return '<p class="sim-note">Simulation: nothing here senses or logs anything.</p>';
  }

  function briefing() {
    var again = ST.runs.length > 0;
    return '<main class="brief">' +
      (again ? '<div class="card next-run"><b>Next scenario.</b> Your notes for ' + ST.runs.length + ' earlier scenario' + (ST.runs.length === 1 ? ' is' : 's are') + ' saved. Pick the next one in the panel (or walk any path you like) and start.</div>' : '') +
      '<h1>Support Cleber through a planned meal</h1>' +
      '<p class="lead"><b>Goal:</b> as Cleber, respond to Echo’s lunch reminders the way you want.<br><b>Scenario:</b> it is 12:30. Sarah left a meal for Cleber; he has not been near the kitchen.</p>' +
      '<p>Evaluators: step through as your persona and answer the Yes/No questions shown at each step; they are required before you can continue.</p>' +
      EP.personas.cleber(true) +
      '<details class="card"><summary><b>Action sequence</b> (for the hosts)</summary>' +
      '<p><b>Cleber</b> lives alone, eats three planned meals a day, and sometimes misses his alarm or notes (other room, asleep). He values independence and security.</p>' +
      '<p><b>Sarah</b>, his caregiver, visits every two to three days and also supports other clients, so she cannot always respond at once. She wants alerts only for concerning situations and does not want Cleber to feel watched.</p>' +
      '<ol class="steps">' +
      '<li class="off">1. Echo detects the meal condition <em>(not walked)</em></li>' +
      '<li class="on">2. Echo gives a gentle spoken prompt.</li>' +
      '<li class="off">3. Echo observes the response <em>(not walked)</em></li>' +
      '<li class="on">4. Cleber responds (eats, “not now” at reminder 1 or 2, once, restarts the sequence, or no response); Echo waits and reminds again.</li>' +
      '<li class="on">5. At most three reminders in a sequence, with no more pressure or volume. “Not now” is only offered at reminders 1 and 2, and a postponement restarts the sequence, so there are at most five reminders in total.</li>' +
      '<li class="on">6. Still unconfirmed: Echo tells Sarah (Sarah’s path).</li>' +
      '<li class="on">7. Echo stops and rests; Sarah gets a “resolved” update if Cleber eats.</li>' +
      '<li class="off">8–9. Plate-away log and visit summary <em>(not walked)</em></li></ol></details>' +
      sessionCard() +
      '<div class="center"><button class="btn primary big" data-action="start">' + (again ? 'Start next scenario' : 'Start as Cleber') + '</button></div></main>';
  }

  function stage(opts) {
    var s = ST;
    var pill = opts.pill ? '<span class="pill">' + EP.esc(opts.pill) + '</span>' : '<span></span>';
    return '<div class="stage-wrap">' +
      '<div class="stage-top">' + pill + '<span class="pill clock" title="' + EP.esc(EP.t('sim_time')) + '">🕑 ' + EP.fmtTime(s.clock) + '</span></div>' +
      '<div class="scene-box">' + EP.scene.html() + '<div id="caption" class="caption" aria-live="polite"></div></div>' +
      '<div class="voice" role="img" aria-label="' + EP.esc(EP.t('voice_level') + ': ' + EP.t('voice_same')) + '"><span>' + EP.esc(EP.t('voice_level')) + '</span><i></i><i></i><i></i><em>' + EP.esc(EP.t('voice_same')) + '</em>' +
      '<button class="btn ghost small" data-action="replay">' + EP.esc(EP.t('replay')) + '</button></div>' +
      '<p id="status-text" class="status-text" aria-live="polite">' + (opts.status ? EP.esc(opts.status) : '') + '</p>' +
      '<div class="choices">' + (opts.choices || '') + '</div></div>';
  }

  function btn(action, label, extra) {
    return '<button class="btn choice" data-action="' + action + '"' + (extra || '') + '>' + EP.esc(label) + '</button>';
  }

  /* Which question set applies on the screen being shown. */
  function remSet() { return ST.n >= 3 ? 'final' : (ST.n === 1 && !ST.postponed ? 'init' : 'repeat'); }
  function endSet() { return ST.escalated || ST.plateGone ? 'end_open' : 'end_ok'; }

  function gateMsg() { return '<p id="gate-msg" class="hint gate-msg">Answer all the Yes/No questions for this step to continue.</p>'; }

  /* The questions panel for a step. On the steps where Cleber acts, the questions are open at once: the evaluator can
     listen to Echo, answer, and then choose what Cleber does, in either order. */
  function stepPanel(html, actMsg) {
    var state = EP.wt.answered(ST.notes[cardId()]) ? 3 : 2;
    var stepper = '<ol class="stepper" id="wt-stepper" data-state="' + state + '"><li><i>1</i>Echo speaks</li><li><i>2</i>Answer the questions</li><li><i>3</i>Continue</li></ol>';
    return panel(EP.personas.cleber() + stepper + '<p class="unlock-msg" id="unlock-msg">' + (actMsg ? EP.esc(actMsg) : unlockText(state === 3)) + '</p>' + html);
  }
  function unlockText(answered) { return answered ? '✔ All answered. Press Continue.' : 'Answer the questions below, then press Continue.'; }

  function panel(inner) { return '<aside class="panel" id="panel">' + inner + '</aside>'; }

  function view() {
    if (ST.screen === 'brief') { el.innerHTML = header() + '<div class="layout with-scn two">' + scnPanel() + briefing() + '</div>'; return; }
    var s = ST, id = cardId(), body = '';
    EP.wt.ctx = { notes: s.notes, followup: s.followup, save: save, onChange: syncGate };

    function P(html, lockMsg) { return stepPanel(html, lockMsg); }
    var qNote = 'After Cleber’s action: what did Echo do, and was it clear what was happening?';
    if (s.screen === 'reminder') {
      body = stage({
        pill: EP.t('reminder_of', { n: s.n }),
        choices: btn('kitchen', EP.t('a_kitchen')) + (s.n < 3 ? btn('notnow', EP.t('a_notnow')) : btn('notnow', EP.t('a_notnow'), ' disabled') + '<p class="hint">“Not now” is only available at reminders 1 and 2.</p>') + btn('nothing', EP.t('a_nothing'))
      }) + P(EP.wt.formHtml(s.notes, id, { set: remSet() }), 'Listen to Echo. You can answer the questions now or after you choose what Cleber does; the order is up to you.');
    } else if (s.screen === 'kitchen') {
      body = stage({
        pill: EP.t('reminder_of', { n: s.n }), status: EP.t('kitchen_quiet'),
        choices: btn('eat_done', EP.t('a_eat_done')) + btn('eat_silent', EP.t('a_eat_silent')) + btn('leave', EP.t('a_leave'))
      }) + P(EP.wt.formHtml(s.notes, id, { set: 'kitchen', after: qNote }), 'Choose what Cleber does in the kitchen. You can answer the questions before or after.');
    } else if (s.screen === 'result') {
      var p = s.pending || {}, status = '';
      if (p.type === 'advance') status = EP.t('wait_n', { n: p.wait });
      else if (p.type === 'restart') status = EP.t('wait_restart', { n: p.wait });
      else if (p.type === 'close' && !s.say) status = EP.t('meal_finished');
      body = stage({ pill: EP.t('reminder_of', { n: s.n }), status: status, choices: btn('next', EP.t('next'), ' data-primary="1" data-gate="1"') + gateMsg() }) +
        P(EP.wt.formHtml(s.notes, id, { set: (ST.trail[ST.trail.length - 1] || {}).a === 'notnow' ? 'postpone' : null, after: qNote }));
    } else if (s.screen === 'closure') {
      var behind = s.plateGone
        ? '<p class="behind"><b>Behind the scenes:</b> the plate did not return. Echo logs it as not returned, sends no alert and stops prompting.</p>'
        : s.escalated
        ? '<p class="behind"><b>Behind the scenes (not seen by Cleber):</b> Echo has told Sarah that lunch is unresolved (' + EP.esc(outcomeName(s.outcome)) + '). Sarah’s phone shows the alert now.</p>'
        : '<p class="behind"><b>Behind the scenes:</b> eating is confirmed, so Echo stops prompting for this meal.</p>';
      body = stage({ status: EP.t('echo_rests'), choices: btn('next', EP.t('next'), ' data-primary="1" data-gate="1"') + gateMsg() + behind }) + P(EP.wt.formHtml(s.notes, 'CLOSE', { set: endSet() }));
    } else if (s.screen === 'after') {
      body = stage({
        status: EP.t('echo_rests'),
        choices: '<p class="choice-title">Scenario: what happens next? (Sarah’s phone shows the “resolved” update only if Cleber eats)</p>' +
          btn('later_eats', EP.t('a_later_eats'), ' data-gate="1"') + btn('later_no', EP.t('a_later_no'), ' data-gate="1"') + gateMsg()
      }) + P(EP.wt.formHtml(s.notes, 'CLOSE', { set: endSet() }));
    } else if (s.screen === 'runend') {
      body = runEndHtml();
    } else if (s.screen === 'followup') {
      body = '<div class="stage-wrap solo final"><p class="eyebrow">Last step</p><h1>A few last questions</h1>' +
        '<p class="lead">Think back over all the scenarios you walked, as Cleber. Short answers are fine, and you can leave a box empty.</p>' +
        EP.wt.followupHtml(s.followup) +
        '<div class="choices"><button class="btn primary big" data-action="finish">Finish</button><p class="hint">Your answers are saved as you type.</p></div></div>';
    } else if (s.screen === 'done') {
      body = '<div class="stage-wrap solo"><h1>Done. Hand your notes to the hosts.</h1>' +
        summary() + '<div class="choices row"><button class="btn primary" data-action="print">Print / save as PDF</button><button class="btn" data-action="download">Download notes (.json)</button><button class="btn ghost" data-action="confirm-restart">Start over (deletes all notes)</button></div></div>';
    }
    var single = s.screen === 'done' || s.screen === 'followup';
    var scn = ['reminder', 'kitchen', 'result', 'closure', 'after', 'runend'].indexOf(s.screen) >= 0 ? scnPanel() : '';
    el.innerHTML = header() + '<div class="layout' + (single ? ' single' : '') + (scn ? ' with-scn' : '') + (s.screen === 'runend' ? ' two' : '') + '">' + scn + body + '</div>' + simNotice();
    afterRender(false);
    syncGate();
    var pn = document.getElementById('panel');
    if (pn && !pn.querySelector('.wt-lock') && ['result', 'closure'].indexOf(s.screen) >= 0 && window.innerWidth <= 920) pn.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  /* Yes/No answers are required: the buttons that leave a step stay disabled until the step's questions are answered. */
  function syncGate() {
    var s = ST;
    if (['result', 'closure', 'after'].indexOf(s.screen) < 0) return;
    var ok = EP.wt.answered(s.notes[cardId()]);
    var btns = el.querySelectorAll('[data-gate]');
    for (var i = 0; i < btns.length; i++) btns[i].disabled = !ok;
    var msg = document.getElementById('gate-msg');
    if (msg) msg.hidden = ok;
    var st = document.getElementById('wt-stepper'); if (st) st.setAttribute('data-state', ok ? '3' : '2');
    var um = document.getElementById('unlock-msg'); if (um) um.textContent = unlockText(ok);
  }

  /* Why the meal is unresolved, judged on the final sequence (after the postponement, if any):
     it ended with a kitchen visit and no eating, or Cleber said "not now" again, or he did not respond. */
  function finalOutcome() {
    var t = ST.trail, i = -1;
    for (var k = 0; k < t.length; k++) if (t[k].a === 'notnow') { i = k; break; }
    var seq = i >= 0 ? t.slice(i + 1) : t;
    if (seq.length && seq[seq.length - 1].a === 'leave') return 'kitchen';
    return seq.some(function (e) { return e.a === 'notnow'; }) ? 'notnow' : 'none';
  }

  function outcomeName(o) { return o === 'notnow' ? 'refusal' : (o === 'kitchen' ? 'uncertain' : 'non-response'); }

  function summary() {
    var runs = allRuns();
    if (!runs.length) return '<p class="hint">No answers were recorded.</p>';
    return '<ul class="sumlist">' + runs.map(function (r) {
      var sc = (r.scenarios || []).map(function (id) { return EP.scenarios.byId(id).title; }).join('; ') || 'free path';
      var items = Object.keys(r.notes).map(function (id) {
        var e = r.notes[id], cy = EP.wt.countYes(e);
        return '<li>' + EP.esc(e.step) + ' ' + EP.esc(e.title) + ': ' + cy.yes + ' of ' + cy.total + ' answered yes</li>';
      }).join('');
      return '<li><b>Scenario ' + r.run + ':</b> ' + EP.esc(sc) + '<ul>' + items + '</ul></li>';
    }).join('') + '</ul>';
  }

  /* What Echo does on each screen (light, lean, speech). */
  function afterRender(gated, speak) {
    EP.scene.mount();
    var s = ST;
    EP.scene.set({ plate: s.plate, lean: false });
    if (s.screen === 'reminder') {
      EP.scene.set({ mode: 'awake', lean: true });
      if (speak) EP.scene.say(s.line || 'r' + s.n);
      else { var c = document.getElementById('caption'); if (c && EP.settings.captions) { c.textContent = EP.t(s.line || 'r' + s.n); c.classList.add('show'); } }
    } else if (s.screen === 'kitchen') {
      EP.scene.set({ mode: 'quiet' });
    } else if (s.screen === 'result') {
      EP.scene.set({ mode: s.say ? 'awake' : 'rest' });
      if (s.say && speak) EP.scene.say(s.say, { instant: true, lean: false, rest: true });
      else if (s.say) { var c2 = document.getElementById('caption'); if (c2 && EP.settings.captions) { c2.textContent = EP.t(s.say); c2.classList.add('show'); } }
    } else {
      EP.scene.set({ mode: 'rest' });
    }
  }

  /* ---------- transitions ---------- */
  function go(screen, speak) { ST.screen = screen; save(); view(); if (speak) afterRender(false, true); }

  /* The next wording of one of Echo's lines: 1st time the DS-01 wording, then the alternatives in turn,
     so e.g. the first reminder after a postponement is not the same sentence again. */
  function pick(key) {
    var vs = EP.variants(key), n = ST.spoken[key] || 0;
    ST.spoken[key] = n + 1;
    return vs[n % vs.length];
  }

  function eatLog(source) {
    logEv('response', 'Cleber started eating.', { state: 'eating started' });
    logEv('eating', 'Eating confirmed: ' + source + '.', { state: 'confirmed', source: source });
    if (ST.cameraOn) { ST.cameraOn = false; logEv('camera', 'Table camera switched off (meal complete).', { on: false }); }
  }

  function trail(a) { ST.trail.push({ n: ST.n, a: a }); }

  function visit(id) { EP.wt.ensure(ST.notes, id); if (ST.visited.indexOf(id) < 0) ST.visited.push(id); }
  function giveReminder(speak) { ST.times.push(ST.clock); ST.line = pick('r' + ST.n); logEv('reminder', 'Reminder ' + ST.n + ' of 3 spoken on the speakers.', { n: ST.n, seq: ST.postponed > 0 ? 2 : 1, channel: 'speaker' }); ST.screen = 'reminder'; ST.card = 'R' + ST.n + (ST.postponed > 0 ? 'b' : ''); visit(ST.card); save(); view(); if (speak) afterRender(false, true); pushState(); }

  var actions = {
    start: function () {
      ST.trail = []; ST.log = []; ST.plate = 'cold'; ST.clock = 12 * 60 + 30; ST.times = [];
      logEv('trigger', 'Planned mealtime reached and the prepared meal appears untouched.');
      giveReminder(true);
    },
    kitchen: function () {
      ST.last = 'kitchen'; ST.plate = 'warm'; ST.say = null;
      logEv('kitchen_entry', 'Kitchen activity detected. Activity alone is not treated as eating.');
      if (!ST.cameraOn) { ST.cameraOn = true; logEv('camera', 'Table camera switched on (kitchen activity).', { on: true }); }
      logEv('eating', 'Eating state: unconfirmed.', { state: 'unconfirmed' });
      go('kitchen');
    },
    notnow: function () {
      if (ST.n >= 3) return;   // “not now” is only possible at reminders 1 and 2
      trail('notnow'); ST.last = 'notnow';
      logEv('response', 'Cleber said “not now”.', { state: 'refusal or postponement' });
      if (ST.postponed === 0) { ST.postponed = 1; ST.pending = { type: 'restart', wait: 30 }; ST.say = pick('ack1'); logEv('postponement', 'Postponement: the sequence pauses and restarts from reminder 1 in 30 minutes.', { reset: true }); }
      else { ST.pending = { type: 'advance', wait: 10 }; ST.say = pick('ack2'); logEv('postponement', 'Second “not now”: the sequence is not reset.', { reset: false }); }
      go('result', true);
    },
    nothing: function () { trail('nothing'); logEv('response', 'No response from Cleber.', { state: 'no response' }); ST.last = 'none'; ST.pending = { type: 'advance', wait: 10 }; ST.say = null; go('result'); },
    leave: function () { trail('leave'); logEv('response', 'Cleber left the kitchen without eating.', { state: 'uncertain' }); logEv('eating', 'Eating state: uncertain (kitchen activity only).', { state: 'uncertain' }); ST.last = 'kitchen'; ST.pending = { type: 'advance', wait: 10 }; ST.say = null; go('result'); },
    eat_done: function () { trail('done'); eatLog('Cleber said he is done'); ST.plate = 'eaten'; ST.pending = { type: 'close' }; ST.say = pick('done'); go('result', true); },
    eat_silent: function () { trail('silent'); eatLog('Echo noticed the meal had ended (table camera)'); ST.plate = 'eaten'; ST.pending = { type: 'close' }; ST.say = null; go('result'); },
    next: function () {
      var p = ST.pending || {};
      if (ST.plateAway != null && (p.type === 'restart' || p.type === 'advance')) {
        if (ST.plateGone) {   // the plate never came back: Echo stops, logs it, and sends no alert
          EP.scene.clear(); ST.say = null; ST.escalated = false; logEv('closure', 'Echo stops prompting and returns to rest. The plate was not returned; no alert was sent.'); visit('CLOSE'); go('closure'); return;
        }
        if (!ST.withheld) { ST.withheld = true; logEv('reminder_withheld', 'Next reminder withheld: the plate is away from the table.'); save(); }
        var st = document.getElementById('status-text');
        if (st) st.textContent = 'The plate is away from the table, so Echo sends no reminder. Log “Plate returns” in the Event log to continue.';
        return;
      }
      EP.scene.clear();
      ST.say = null;
      if (p.type === 'restart') { ST.clock += p.wait; ST.n = 1; giveReminder(true); }
      else if (p.type === 'advance') {
        if (ST.n < 3) { ST.n++; ST.clock += p.wait; giveReminder(true); }
        else {
          ST.clock += p.wait; ST.escalated = true; ST.outcome = finalOutcome(); ST.alertAt = ST.clock; ST.sarahPhase = 'alert';
          logEv('escalation', 'Eating still unconfirmed after the final reminder: Sarah is notified (' + outcomeName(ST.outcome) + ').', { to: 'Sarah', outcome: outcomeName(ST.outcome) });
          pushState(); go('closure');
        }
      } else { ST.escalated = false; go('closure'); }
      if (ST.screen === 'closure') { logEv('closure', 'Echo stops prompting and returns to rest.'); visit('CLOSE'); save(); }
    },
    'to-followup': function () { go('followup'); },
    'scn-pick': function (t) { if (isRunning()) return; var id = t.getAttribute('data-id'); ST.target = ST.target === id ? null : id; save(); refreshScn(); },
    'scn-check': function (t) { if (isRunning()) return; var id = t.getAttribute('data-id'); ST.manual[id] = !ST.manual[id]; save(); refreshScn(); },
    another: function () {
      EP.scene.clear();
      archiveRun();
      ST.runId++; ST.target = nextTarget(); ST.screen = 'brief';
      save(); pushState(); view(); window.scrollTo(0, 0);
    },
    'end-session': function () { EP.scene.clear(); archiveRun(); go('followup'); },
    replay: function () {
      var s = ST;
      if (s.screen === 'reminder') EP.scene.say(s.line || 'r' + s.n);
      else if (s.screen === 'result' && s.say) EP.scene.say(s.say, { instant: true, lean: false, rest: true });
    },
    later_eats: function () { ST.clock += 25; ST.resolvedAt = ST.clock; ST.sarahPhase = 'resolved'; logEv('eating', 'Eating confirmed later (Cleber ate after the alert).', { state: 'confirmed', source: 'Echo noticed the meal had ended (table camera)' }); logEv('resolved', 'A “resolved” update is sent to Sarah.', { to: 'Sarah' }); pushState(); go(afterWalk()); },
    later_no: function () { go(afterWalk()); },
    finish: function () { go('done'); },
    'open-log': function () { modal(logHtml()); },
    'open-hostnotes': function () { modal(hostNotesHtml()); },
    'log-plate-leave': function () {
      ST.plateAway = ST.clock; ST.withheld = false;
      logEv('plate_left', 'The table camera sees the plate leave the table. No reminder or alert is sent while it is away.');
      save(); modal(logHtml());
    },
    'log-plate-return': function () {
      var sel = document.getElementById('plate-min'), min = sel ? parseInt(sel.value, 10) : 15;
      ST.clock += min; ST.plateAway = null; ST.withheld = false;
      logEv('plate_returned', 'The plate returns after ' + min + ' minutes' + (min > 60 ? ' (over one hour: highlighted for Sarah)' : '') + '.', { away: min });
      save(); pushState(); modal(logHtml()); if (isRunning()) view();
    },
    'log-plate-never': function () {
      ST.plateGone = true;
      logEv('plate_not_returned', 'The plate did not return: logged as not returned. No alert is sent.');
      save(); modal(logHtml());
    },
    'log-sensor': function () {
      ST.sensorOff = true;
      logEv('sensor_offline', 'A kitchen sensor reported offline: data is missing for this meal and will show as a gap in the visit summary.');
      save(); pushState(); modal(logHtml());
    },
    print: function () { EP.router.go('#/notes'); },
    download: function () { EP.wt.download(exportAll(), 'echo-walkthrough-' + ST.code + '.json'); },
    restart: function () { restart(); },
    'copy-link': function () {
      var inp = el.querySelector('.session-card input') || document.querySelector('.session-card input');
      try { navigator.clipboard.writeText(link()); } catch (e) { if (inp) { inp.select(); document.execCommand('copy'); } }
    }
  };
  // the closure screen's "Continue" differs from the result screen's
  var resultNext = actions.next;
  actions.next = function () {
    if (ST.screen === 'closure') { go(ST.escalated ? 'after' : afterWalk()); return; }
    resultNext();
  };

  /* The run is over: match it to the scenarios and show the "another scenario or end" choice. */
  function afterWalk() {
    if (ST.cameraOn) { ST.cameraOn = false; logEv('camera', 'Table camera switched off (escalation finished).', { on: false }); }
    ST.finished = true;
    ST.matched = EP.scenarios.match(runObj());
    ST.matched.forEach(function (id) { if (!ST.done[id]) ST.done[id] = ST.runId; });
    save(); pushState();
    return 'runend';
  }

  function runObj() { return { trail: ST.trail, escalated: ST.escalated, outcome: ST.outcome, postponed: ST.postponed }; }
  function outcomeText(r) { return r.escalated ? 'unresolved, Sarah alerted (' + outcomeName(r.outcome) + ')' : 'eating confirmed'; }
  function curRun() {
    return { run: ST.runId, target: ST.target, scenarios: ST.matched, trail: ST.trail, outcome: outcomeText(ST), postponements: ST.postponed,
      resolvedAt: ST.resolvedAt != null ? EP.fmtTime(ST.resolvedAt) : null, notes: ST.notes, log: ST.log, finished: ST.finished, endedAt: new Date().toISOString() };
  }
  function hasRunData() { return ST.trail.length > 0 || Object.keys(ST.notes).length > 0; }
  /* every run, finished or in progress; nothing is ever dropped */
  function allRuns() { return ST.runs.concat(hasRunData() ? [curRun()] : []); }
  function sarahRuns() {
    return (ST.sarahRuns || []).concat(Object.keys(ST.sarahNotes || {}).length ? [{ run: ST.sarahRunId, notes: ST.sarahNotes }] : []);
  }

  /* Archive the finished run (its notes are kept in ST.runs), then clear the run's own state. */
  function archiveRun() {
    if (hasRunData()) ST.runs.push(curRun());
    var keep = { code: ST.code, followup: ST.followup, sarahNotes: ST.sarahNotes, sarahRuns: ST.sarahRuns, sarahRunId: ST.sarahRunId, sarahEvents: ST.sarahEvents,
      runs: ST.runs, runId: ST.runId, target: ST.target, done: ST.done, manual: ST.manual, scnOpen: ST.scnOpen, sarahOQ: ST.sarahOQ };
    ST = Object.assign(runFields(), keep);
  }

  /* Safety copy before anything is wiped (kept in this browser; see README). */
  function backup() {
    if (ST && (ST.runs.length || hasRunData())) EP.store.set('echo.backup.' + Date.now(), { savedAt: new Date().toISOString(), data: exportAll() });
  }

  function restart() {
    EP.scene.clear();
    backup();
    var code = ST.code;
    ST = fresh(code); save(); pushState(); view();
  }

  function exportAll() {
    var done = doneMap();
    var runs = allRuns().map(function (r) {
      var c = EP.log.check(r);
      return Object.assign({}, r, { episode: EP.log.episode(r), checks: c, checksSummary: EP.log.checkSummary(c) });
    });
    return EP.wt.exportData({ code: ST.code, language: EP.lang, scenariosDone: Object.keys(done), scenarioRuns: allRuns().length },
      { runs: runs, followup: ST.followup },
      { runs: sarahRuns(), events: ST.sarahEvents },
      { sarahOpenQuestions: ST.sarahOQ });
  }
  EP.exportAll = function () {
    var raw = EP.store.get(KEY, null);
    if (!raw) return null;
    var keep = ST; ST = raw;
    ST.runs = ST.runs || []; ST.trail = ST.trail || []; ST.done = ST.done || {}; ST.manual = ST.manual || {}; ST.log = ST.log || [];
    var d = exportAll(); ST = keep || raw;
    return d;
  };

  /* ---------- scenario panel ---------- */
  function doneMap() {
    var m = {}, id;
    for (id in ST.done) m[id] = 'auto';
        for (id in ST.manual) if (ST.manual[id] && !m[id]) m[id] = 'manual';
    return m;
  }
  function scnPanel() {
    var m = doneMap(), all = EP.scenarios.LIST.filter(function (x) { return x.group === 'cleber'; }), n = Object.keys(m).length, tgt = EP.scenarios.byId(ST.target);
    var busy = isRunning();
    var open = ST.scnOpen === undefined ? window.innerWidth >= 1250 : ST.scnOpen;
    function group(g, title) {
      return '<h3>' + title + '</h3><ul class="scn-list">' + all.filter(function (x) { return x.group === g; }).map(function (x) {
        var st = m[x.id];
        return '<li class="' + (st ? 'done ' : '') + (x.id === ST.target ? 'target' : '') + '">' +
          '<button class="scn-box' + (st === 'manual' ? ' manual' : '') + '" data-action="scn-check" data-id="' + x.id + '" role="checkbox" aria-checked="' + (!!st) + '"' + (st === 'auto' || busy ? ' disabled' : '') +
          ' aria-label="' + EP.esc(x.title) + (st === 'auto' ? ' (done)' : '') + '" title="' + (st === 'auto' ? 'Done (detected)' : 'Tick if you have done this') + '">' + (st ? '✓' : '') + '</button>' +
          '<button class="scn-item" data-action="scn-pick" data-id="' + x.id + '"' + (busy ? ' disabled' : '') + '><b>' + EP.esc(x.title) + '</b></button></li>';
      }).join('') + '</ul>';
    }
    return '<aside class="scn' + (busy ? ' busy' : '') + '"><details class="scn-d"' + (open ? ' open' : '') + '><summary><b>Scenarios</b> <span class="scn-count">' + n + ' of ' + all.length + ' done</span></summary>' +
      '<p class="hint">' + (busy ? '🔒 You are in a scenario. The others unlock when it ends.' : 'Pick a scenario, then start. It is ticked automatically when your run matches it.') + '</p>' +
      (tgt ? '<div class="scn-now"><b>Now: ' + EP.esc(tgt.title) + '</b><p>' + EP.esc(tgt.how) + '</p></div>' : '<div class="scn-now"><b>Free path</b><p>No scenario chosen. Pick one below, or walk any path you like.</p></div>') +
      group('cleber', 'Scenarios for Cleber') +
      '</details></aside>';
  }
  /* true while a scenario is being walked (between Start and the end-of-scenario screen) */
  function isRunning() { return ['reminder', 'kitchen', 'result', 'closure', 'after'].indexOf(ST.screen) >= 0; }

  function refreshScn() {
    var a = document.querySelector('.scn');
    if (a) a.outerHTML = scnPanel();
  }
  function nextTarget() {
    var m = doneMap();
    var n = EP.scenarios.LIST.filter(function (x) { return x.group === 'cleber' && !m[x.id]; })[0];
    return n ? n.id : null;
  }

  function runEndHtml() {
    var m = doneMap(), total = EP.scenarios.LIST.filter(function (x) { return x.group === 'cleber'; }).length, left = total - Object.keys(m).length;
    var got = ST.matched.map(function (id) { return EP.scenarios.byId(id).title; });
    var tgt = EP.scenarios.byId(ST.target);
    var line = got.length ? 'This run matched: <b>' + EP.esc(got.join('; ')) + '</b>.' : 'This path is not one of the listed scenarios, but your answers are saved.';
    if (tgt && ST.matched.indexOf(tgt.id) < 0) line += ' You aimed for “' + EP.esc(tgt.title) + '”; it is not ticked yet.';
    return '<div class="stage-wrap solo"><h1>Scenario ' + ST.runId + ' complete</h1>' +
      '<p class="lead">' + line + '</p>' +
      '<p>Result: ' + EP.esc(outcomeText(ST)) + '. Your answers and notes for this scenario are saved.</p>' +
      '<p>' + (left ? left + ' scenario' + (left === 1 ? '' : 's') + ' not done yet.' : 'All scenarios are done.') + '</p>' +
      '<h2>Do you want to do another scenario or end?</h2>' +
      '<div class="choices row"><button class="btn primary big" data-action="another">Do another scenario</button>' +
      '<button class="btn big" data-action="end-session">End and answer the last questions</button></div>' +
      '<p class="hint">You can also download or print your notes from the ☰ menu at any time.</p></div>';
  }

  /* ---------- modals / menu ---------- */
  function modal(html) {
    var m = document.getElementById('modal-root');
    if (m) m.innerHTML = html;
  }
  /* The event log of the current scenario, the facilitator's meal-state events (EM-03) and the M-04 conformance check. */
  function logHtml() {
    var esc = EP.esc, running = isRunning(), hasKitchen = ST.log.some(function (e) { return e.type === 'kitchen_entry'; });
    var away = ST.plateAway != null;
    var ctrl = away
      ? '<label class="inline">The plate returns after <select id="plate-min">' + [15, 30, 45, 60, 90, 120].map(function (m) { return '<option value="' + m + '">' + m + ' min</option>'; }).join('') + '</select></label> ' +
        '<button class="btn" data-action="log-plate-return">Plate returns</button> <button class="btn" data-action="log-plate-never">Plate never returns</button>'
      : '<button class="btn" data-action="log-plate-leave"' + (running && hasKitchen ? '' : ' disabled') + '>Plate leaves the table</button>';
    var sensor = '<button class="btn" data-action="log-sensor"' + (running && !ST.sensorOff ? '' : ' disabled') + '>Kitchen sensor reported offline</button>';
    var checks = EP.log.check({ log: ST.log, finished: ST.finished }), sm = EP.log.checkSummary(checks);
    var rows = ST.log.length ? ST.log.map(function (e) {
      return '<tr class="t-' + e.type + '"><td class="tm">' + esc(e.time) + '</td><td class="tp">' + esc(EP.log.LABEL[e.type] || e.type) + '</td><td>' + esc(e.text) + '</td></tr>';
    }).join('') : '<tr><td colspan="3" class="hint">Nothing logged yet. The log fills in as the scenario runs.</td></tr>';
    return '<div class="modal-back"><div class="modal wide logmodal" role="dialog" aria-modal="true">' +
      '<div class="modal-head"><h2>Event log: scenario ' + ST.runId + '</h2><button class="btn ghost" data-action="close-modal">' + esc(EP.t('ui_close')) + '</button></div>' +
      '<p class="hint">The prototype writes this log from its own scripted logic. The facilitator chooses the meal-state events below; nothing is sensed.</p>' +
      '<h3>Facilitator events</h3><div class="row logctrl">' + ctrl + ' ' + sensor + '</div>' +
      (running && !hasKitchen && !away ? '<p class="hint">“Plate leaves the table” is available once Cleber has gone to the kitchen. A sensor outage or plate-away time then shows in Sarah’s visit summary.</p>' : '') +
      '<h3>Log</h3><div class="tablewrap"><table class="logtable"><thead><tr><th>Time</th><th>Event</th><th>What was logged</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<h3>Conformance check</h3><p class="hint">' + sm.pass + ' rules pass, ' + sm.fail + ' fail, ' + sm.na + ' not applicable. A scenario passes only if no rule fails.</p>' +
      '<ul class="checks">' + checks.map(function (c) {
        return '<li class="chk ' + c.status + '"><span class="chk-s">' + (c.status === 'pass' ? 'Pass' : (c.status === 'fail' ? 'Fail' : 'n/a')) + '</span><span>' + esc(c.rule) + (c.detail ? ' <em>' + esc(c.detail) + '</em>' : '') + '</span></li>';
      }).join('') + '</ul></div></div>';
  }

  /* Success and failure stories, suggestions and other problems: written by the hosts, not the evaluator. */
  function hostNotesHtml() {
    var id = ST.screen === 'closure' || ST.screen === 'after' ? 'CLOSE' : (ST.card && isRunning() ? ST.card : ST.visited[ST.visited.length - 1]);
    var body;
    if (!id) body = '<p class="hint">Host notes belong to a step. Start a scenario first, then open this during or after a step.</p>';
    else { var m = EP.wt.meta(id); body = '<p class="hint">Scenario ' + ST.runId + ' · ' + EP.esc(m.step) + ': ' + EP.esc(m.title) + '</p>' + EP.wt.hostFieldsHtml(ST.notes, id); }
    return '<div class="modal-back"><div class="modal wide" role="dialog" aria-modal="true">' +
      '<div class="modal-head"><h2>Host notes</h2><button class="btn ghost" data-action="close-modal">' + EP.esc(EP.t('ui_close')) + '</button></div>' +
      '<p class="hint">For the hosts: success stories, failure stories, design suggestions and any problem outside the sequence. The evaluator does not need to fill these in.</p>' + body + '</div></div>';
  }

  function menuHtml() {
    return '<div class="modal-back"><div class="modal" role="dialog" aria-modal="true">' +
      '<div class="modal-head"><h2>' + EP.esc(EP.t('ui_menu')) + '</h2><button class="btn ghost" data-action="close-modal">' + EP.esc(EP.t('ui_close')) + '</button></div>' +
      '<div class="menu-list"><button class="btn" data-action="open-session">' + EP.esc(EP.t('ui_session')) + '</button>' +
      '<button class="btn" data-action="print">' + EP.esc(EP.t('ui_export')) + ' (print)</button>' +
      '<button class="btn" data-action="download">' + EP.esc(EP.t('ui_export')) + ' (.json)</button>' +
      '<button class="btn danger" data-action="confirm-restart">' + EP.esc(EP.t('ui_restart')) + '</button></div></div></div>';
  }
  function sessionHtml() {
    return '<div class="modal-back"><div class="modal wide" role="dialog" aria-modal="true">' +
      '<div class="modal-head"><h2>' + EP.esc(EP.t('ui_session')) + '</h2><button class="btn ghost" data-action="close-modal">' + EP.esc(EP.t('ui_close')) + '</button></div>' +
      sessionCard() + '</div></div>';
  }

  /* remember whether the scenario panel was opened or collapsed */
  function onToggle(ev) {
    var d = ev.target;
    if (ST && d && d.classList && d.classList.contains('scn-d') && ST.scnOpen !== d.open) { ST.scnOpen = d.open; save(); }
  }

  /* ---------- public ---------- */
  EP.cleber = {
    mount: function (container) {
      el = container;
      ST = EP.store.get(KEY, null) || fresh();
      ST.visited = ST.visited || []; ST.spoken = ST.spoken || {};
      ST.runs = ST.runs || []; ST.runId = ST.runId || 1; ST.trail = ST.trail || []; ST.matched = ST.matched || [];
      ST.done = ST.done || {}; ST.manual = ST.manual || {}; ST.sarahRuns = ST.sarahRuns || [];
      if (ST.target === undefined) ST.target = 'C1';
      if (ST.screen === 'review') ST.screen = 'followup';   // saved by an older version
      save();
      openSync();
      document.addEventListener('toggle', onToggle, true);
      view();
    },
    unmount: function () { EP.scene.clear(); EP.sync.close(); document.removeEventListener('toggle', onToggle, true); },
    rerender: function () { view(); },
    handle: function (action, target) {
      if (action === 'start') { actions.start(); return true; }
      if (action === 'open-menu') { modal(menuHtml()); return true; }
      if (action === 'open-session') { modal(sessionHtml()); return true; }
      if (action === 'close-modal') { modal(''); return true; }
      if (action === 'confirm-restart') { modal(''); if (window.confirm('Delete ALL notes (' + allRuns().length + ' scenario' + (allRuns().length === 1 ? '' : 's') + ') and start over?\n\nDownload them first from the menu if you need them. (A safety copy stays in this browser.)')) { restart(); EP.cleber.rerender(); } return true; }
      if (actions[action]) {
        if (['next', 'later_eats', 'later_no'].indexOf(action) >= 0 && ST.screen !== 'reminder' && ST.screen !== 'kitchen' && !EP.wt.answered(ST.notes[cardId()])) return true;
        actions[action](target);
        return true;
      }
      return false;
    }
  };
})();
