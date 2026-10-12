/* Sarah's phone (Path B): UC01 steps 6 and 7. Follows Cleber's screen through the shared session;
   without a session it runs alone with a scenario picker. */
(function () {
  var KEY = 'echo.sarah';
  var SS = null, el = null;
  var connected = false, status = 'init', code = null, tab = 'phone';
  var snap = { phase: 'none' };
  var standalone = false;

  function fresh() { return { code: null, runId: null, runs: [], card: 'S7', notes: {}, responded: null, skips: 0, seenAlert: false, seenResolved: false, events: [] }; }
  function save() { EP.store.set(KEY, SS); }

  function sendEvent(kind) {
    var ev = { id: Date.now() + '-' + Math.random().toString(36).slice(2, 6), kind: kind, at: new Date().toISOString() };
    SS.events.push(ev); save();
    EP.sync.send({ type: 'sarahEvent', id: ev.id, kind: ev.kind, at: ev.at });
  }
  var notesTimer = null;
  function sendNotes() {
    clearTimeout(notesTimer);
    notesTimer = setTimeout(function () { EP.sync.send({ type: 'sarahNotes', notes: SS.notes, runs: SS.runs, runId: SS.runId }); }, 400);
  }

  function hasNotes(x) { return Object.keys((x && x.notes) || {}).length > 0; }
  /* Start a clean page for a new scenario; the notes of the previous one are kept in SS.runs, never dropped. */
  function newRun(runId) {
    var old = SS, runs = (old.runs || []).slice();
    if (hasNotes(old)) runs.push({ runId: old.runId, notes: old.notes });
    SS = fresh(); SS.code = code; SS.runs = runs; SS.runId = runId; SS.events = old.events || [];
    sendNotes();
  }

  function onMsg(msg) {
    if (msg.type !== 'state') return;
    if (JSON.stringify(msg) === JSON.stringify(snap)) return;
    var prevPhase = snap.phase;
    snap = msg;
    if (msg.runId && msg.runId !== SS.runId) newRun(msg.runId);   // Cleber moved on to another scenario
    else if (msg.phase === 'none' && prevPhase !== 'none' && hasNotes(SS)) newRun(SS.runId);   // Cleber's side restarted
    if (msg.phase === 'alert' && !SS.seenAlert) { SS.seenAlert = true; tab = 'phone'; }
    if (msg.phase === 'resolved' && !SS.seenResolved) { SS.seenResolved = true; }
    save(); view();
  }
  function onStatus(st) {
    status = st; connected = (st === 'connected' || st === 'connected-local');
    var c = document.getElementById('sync-chip'); if (c) c.outerHTML = chip();
    if (st === 'connected' || st === 'connected-local') EP.sync.send({ type: 'hello' });
  }
  function chip() {
    var cls = connected ? 'ok' : (status === 'offline' || status === 'nopeer' ? 'bad' : 'wait');
    var txt = connected ? 'Connected to session ' + code : (cls === 'bad' ? 'Offline' : 'Connecting to ' + code + '…');
    return '<span id="sync-chip" class="chip-btn ' + cls + '"><i></i>' + EP.esc(txt) + '</span>';
  }

  function header() {
    return '<header class="topbar"><div class="brand"><span class="logo" aria-hidden="true"></span><div><b>Echo</b><small>Sarah’s phone · UC01 steps 6–7</small></div></div>' +
      '<div class="top-actions">' + (standalone ? '<span class="chip-btn wait"><i></i>No session</span>' : chip()) +
      '<button class="icon-btn" data-action="open-settings" aria-label="' + EP.esc(EP.t('ui_settings')) + '">⚙</button></div></header>';
  }

  function t(k, v) { return EP.t(k, v); }

  function alertCard(repeat) {
    var out = snap.outcome === 'notnow' ? 's_out_notnow' : (snap.outcome === 'kitchen' ? 's_out_kitchen' : 's_out_none');
    var times = (snap.times || []);
    var h = '<article class="notif alert"><div class="n-head"><span class="n-app"><i class="n-icon"></i>' + EP.esc(t('s_app')) + '</span><span>' + EP.esc(repeat ? t('s_repeat_tag') : t('s_now')) + ' · ' + EP.esc(snap.alertAt || '') + '</span></div>' +
      '<h3>' + EP.esc(t('s_title')) + '</h3>' +
      '<p>' + EP.esc(t('s_planned', { t: snap.mealTime || '12:30' })) + '</p>' +
      '<p>' + EP.esc(t(out)) + '</p>' +
      '<p>' + EP.esc(t('s_reminders', { n: times.length, times: times.join(', ') })) + '</p>' +
      (snap.postponed ? '<p>' + EP.esc(t('s_postponed')) + '</p>' : '');
    if (!repeat) {
      if (SS.responded) h += '<p class="noted">' + EP.esc(t(SS.responded === 'call' ? 's_noted_call' : 's_noted_visit')) + '</p>';
      else h += '<div class="n-actions"><button class="btn primary" data-action="s-call">' + EP.esc(t('s_call')) + '</button><button class="btn" data-action="s-visit">' + EP.esc(t('s_visit')) + '</button></div>';
    } else if (!SS.responded) {
      h += '<div class="n-actions"><button class="btn primary" data-action="s-call">' + EP.esc(t('s_call')) + '</button><button class="btn" data-action="s-visit">' + EP.esc(t('s_visit')) + '</button></div>';
    }
    return h + '</article>';
  }

  function resolvedCard() {
    return '<article class="notif resolved"><div class="n-head"><span class="n-app"><i class="n-icon"></i>' + EP.esc(t('s_app')) + '</span><span>' + EP.esc(t('s_now')) + ' · ' + EP.esc(snap.resolvedAt || '') + '</span></div>' +
      '<h3>✔ ' + EP.esc(t('s_resolved_title')) + '</h3><p>' + EP.esc(t('s_resolved_body', { t: snap.resolvedAt || '' })) + '</p></article>';
  }

  function phone() {
    var clock = snap.resolvedAt && snap.phase === 'resolved' ? snap.resolvedAt : (snap.alertAt || '12:30');
    var list = '';
    if (snap.phase === 'resolved') list += resolvedCard();
    if (snap.phase === 'alert' || snap.phase === 'resolved') {
      if (SS.skips >= 1) list += alertCard(true);
      list += alertCard(false);
    }
    if (!list) list = '<div class="empty"><b>' + EP.esc(t('s_waiting')) + '</b><br>' + EP.esc(t('s_waiting_sub')) + '</div>';
    return '<div class="phone" aria-label="Sarah’s phone"><div class="phone-notch"></div><div class="phone-screen">' +
      '<div class="lock"><div class="lock-time">' + EP.esc(clock) + '</div><div class="lock-date">Wednesday</div></div>' +
      '<div class="notifs" aria-live="polite">' + list + '</div></div></div>' +
      (SS.skips >= 2 && snap.phase === 'alert' ? '<p class="behind"><b>Behind the scenes:</b> Sarah has not responded after the repeat, so Echo now notifies Gilbert (backup). His phone is not shown.</p>' : '') +
      sim();
  }

  function sim() {
    var h = '<details class="sim"><summary>Simulation controls</summary><div class="sim-body">';
    if (snap.phase === 'alert' && !SS.responded) {
      h += '<p class="hint">If Sarah does not respond, time passes and the message is repeated once, then Gilbert is notified.</p>' +
        '<button class="btn" data-action="s-skip">Sarah does not respond: skip ahead 15 min</button>';
    } else if (snap.phase === 'alert') {
      h += '<p class="hint">Sarah has responded.</p>';
    }
    if (standalone) {
      h += '<hr>' +
        '<label class="field"><span>Scenario outcome</span><select id="s-outcome"><option value="none">Cleber did not respond (non-response)</option><option value="notnow">Cleber said “not now” (refusal)</option><option value="kitchen">Went to the kitchen, eating not confirmed (uncertain)</option></select></label>' +
        '<div class="row"><button class="btn primary" data-action="s-send">Send unresolved-meal alert</button>' +
        '<button class="btn" data-action="s-resolve"' + (snap.phase === 'alert' ? '' : ' disabled') + '>Cleber eats later → “resolved”</button>' +
        '<button class="btn ghost" data-action="s-reset">Reset</button></div>';
    }
    return h + '</div></details>';
  }

  function panel() {
    var showAlert = snap.phase === 'alert' || snap.phase === 'resolved';
    if (!showAlert) return '<aside class="panel"><section class="wt"><h2>Walkthrough questions</h2><p class="hint">They appear when Sarah’s phone receives something. ' +
      (standalone ? 'Open the simulation controls below the phone to send the first alert.' : 'Wait for Cleber’s evaluator to reach the end of the reminders.') + '</p></section></aside>';
    var id = snap.phase === 'resolved' ? 'S7' : 'S6', h = '<aside class="panel">';
    if (snap.phase === 'resolved') {
      h += '<div class="tabs2"><button class="' + (SS.card !== 'S6' ? 'on' : '') + '" data-action="s-card" data-card="S7">Step 7: resolved</button><button class="' + (SS.card === 'S6' ? 'on' : '') + '" data-action="s-card" data-card="S6">Step 6: alert</button></div>';
      id = SS.card === 'S6' ? 'S6' : 'S7';
    }
    h += EP.wt.formHtml(SS.notes, id, id === 'S6' ? { after: 'After Sarah’s action (or after the repeat): was it clear what happens next?' } : {});
    return h + '</aside>';
  }

  function view() {
    EP.wt.ctx = { notes: SS.notes, followup: {}, save: function () { save(); sendNotes(); } };
    var hasForm = snap.phase === 'alert' || snap.phase === 'resolved';
    el.innerHTML = header() +
      ('<div class="tabs-m"><button class="' + (tab === 'phone' ? 'on' : '') + '" data-action="s-tab" data-tab="phone">Phone</button><button class="' + (tab === 'form' ? 'on' : '') + '" data-action="s-tab" data-tab="form">Questions' + (hasForm ? ' •' : '') + '</button></div>') +
      '<div class="layout sarah tab-' + tab + '"><div class="stage-wrap phone-wrap">' + phone() +
      '</div>' + panel() + '</div>' +
      '<p class="sim-note">Simulation: nothing is sent to a real phone.</p>';
  }

  function sendLocalSnapshot(outcome) {
    var now = 12 * 60 + 30;
    var times = [now, now + 10, now + 20].map(EP.fmtTime);
    snap = { type: 'state', ts: Date.now(), phase: 'alert', outcome: outcome, times: times, postponed: false, mealTime: '12:30', alertAt: EP.fmtTime(now + 30), resolvedAt: null };
  }

  var actions = {
    's-call': function () { SS.responded = 'call'; sendEvent('call'); save(); view(); },
    's-visit': function () { SS.responded = 'visit'; sendEvent('visit'); save(); view(); },
    's-skip': function () { SS.skips++; sendEvent(SS.skips === 1 ? 'repeat-after-no-response' : 'gilbert-notified'); save(); view(); },
    's-tab': function (t) { tab = t.getAttribute('data-tab'); view(); },
    's-card': function (t) { SS.card = t.getAttribute('data-card'); view(); },
    's-send': function () {
      var sel = document.getElementById('s-outcome');
      var runs = (SS.runs || []).concat(hasNotes(SS) ? [{ runId: SS.runId, notes: SS.notes }] : []);
      SS = Object.assign(fresh(), { runs: runs, runId: runs.length + 1, seenAlert: true, code: code });
      sendLocalSnapshot(sel ? sel.value : 'none'); save(); view();
    },
    's-resolve': function () {
      snap = Object.assign({}, snap, { phase: 'resolved', resolvedAt: EP.fmtTime(12 * 60 + 55) }); SS.seenResolved = true; save(); view();
    },
    's-reset': function () { var runs = (SS.runs || []).concat(hasNotes(SS) ? [{ runId: SS.runId, notes: SS.notes }] : []); SS = fresh(); SS.runs = runs; SS.code = code; snap = { phase: 'none' }; save(); view(); }
  };

  EP.sarah = {
    mount: function (container, sessionCode) {
      el = container; code = sessionCode || null; standalone = !code;
      SS = EP.store.get(KEY, null) || fresh();
      if (SS.code !== code) {   // a different session starts clean, but earlier notes are kept
        var old = SS; SS = fresh(); SS.code = code;
        SS.runs = (old.runs || []).concat(hasNotes(old) ? [{ runId: old.runId, notes: old.notes }] : []);
        save();
      }
      snap = { phase: 'none' }; connected = false; status = 'init'; tab = 'phone';
      if (!standalone) EP.sync.open('guest', code, onMsg, onStatus);
      view();
    },
    unmount: function () { EP.sync.close(); },
    rerender: function () { view(); },
    handle: function (action, target) {
      if (actions[action]) { actions[action](target); return true; }
      return false;
    },
    exportData: function () { return { runs: SS ? (SS.runs || []).concat(hasNotes(SS) ? [{ runId: SS.runId, notes: SS.notes }] : []) : [], events: SS ? SS.events : [] }; }
  };
})();
