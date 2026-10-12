/* Event log, conformance check (M-04), visit summary (UC01 step 9, F4) and Sarah's open questions.
   The log is written by the prototype's own scripted logic while the evaluators and facilitator choose the events,
   as in EM-03 ("the facilitator supplies the meal-state events"): it verifies the scripted logic only, not real
   sensors, the camera or timing in a home. */
(function () {
  /* ---------- the log ---------- */
  var LABEL = {
    trigger: 'Trigger', reminder: 'Reminder', response: 'Response', postponement: 'Postponement', kitchen_entry: 'Kitchen entry',
    camera: 'Camera', eating: 'Eating state', reminder_withheld: 'Reminder withheld', escalation: 'Escalation', escalation_repeat: 'Escalation repeated',
    escalation_backup: 'Backup notified', sarah_response: 'Sarah responded', resolved: 'Resolved update', plate_left: 'Plate left', plate_returned: 'Plate returned',
    plate_not_returned: 'Plate not returned', sensor_offline: 'Sensor offline', closure: 'Closure'
  };

  function of(log, type) { return (log || []).filter(function (e) { return e.type === type; }); }
  function idx(log, type, from) { for (var i = from || 0; i < log.length; i++) if (log[i].type === type) return i; return -1; }

  function rule(id, text, status, detail) { return { id: id, rule: text, status: status, detail: detail || '' }; }

  /* M-04: pass only if every required event and transition occurs in the specified order. */
  function check(run) {
    var log = (run && run.log) || [], out = [], i;
    var rem = of(log, 'reminder');

    // 1 trigger, then reminder 1 on the speakers
    var ok1 = log.length > 1 && log[0].type === 'trigger' && log[1].type === 'reminder' && log[1].data.n === 1 && log[1].data.channel === 'speaker';
    out.push(rule('R1', 'The trigger is logged, then reminder 1 is issued on the speakers', log.length ? (ok1 ? 'pass' : 'fail') : 'na', ok1 ? '' : 'The log should start with the trigger and then reminder 1.'));

    // 2 at most three reminders per sequence, numbered in order
    var bySeq = {}, bad = '';
    rem.forEach(function (e) { (bySeq[e.data.seq] = bySeq[e.data.seq] || []).push(e.data.n); });
    Object.keys(bySeq).forEach(function (k) {
      var ns = bySeq[k];
      if (ns.length > 3) bad = 'Sequence ' + k + ' has ' + ns.length + ' reminders.';
      for (i = 0; i < ns.length; i++) if (ns[i] !== i + 1 && !bad) bad = 'Reminder numbers out of order: ' + ns.join(', ') + '.';
    });
    out.push(rule('R2', 'At most three reminders per sequence, in order', rem.length ? (bad ? 'fail' : 'pass') : 'na', bad || (rem.length + ' reminder' + (rem.length === 1 ? '' : 's') + ' in total.')));

    // 3 one postponement restarts, a second does not
    var pp = of(log, 'postponement'), resets = pp.filter(function (e) { return e.data.reset; }).length;
    var bad3 = resets > 1 ? 'The sequence was restarted more than once.' : (pp.length && !pp[0].data.reset ? 'The first postponement did not restart the sequence.' : '');
    out.push(rule('R3', 'One postponement restarts the sequence; a second does not', pp.length ? (bad3 ? 'fail' : 'pass') : 'na', bad3 || (pp.length + ' postponement' + (pp.length === 1 ? '' : 's') + ' logged.')));

    // 4 no reminder after eating is confirmed or after escalation
    var stop = -1;
    log.forEach(function (e, k) { if (stop < 0 && ((e.type === 'eating' && e.data.state === 'confirmed') || e.type === 'escalation')) stop = k; });
    var late = stop >= 0 && log.slice(stop + 1).some(function (e) { return e.type === 'reminder'; });
    out.push(rule('R4', 'No reminder after eating is confirmed or the meal is escalated', rem.length ? (late ? 'fail' : 'pass') : 'na', late ? 'A reminder follows the confirmation or escalation.' : ''));

    // 5 kitchen activity alone is never logged as eating
    var eatBad = of(log, 'eating').some(function (e) { return e.data.state === 'confirmed' && !e.data.source; });
    out.push(rule('R5', 'Kitchen activity alone is never logged as eating (confirmed only by Cleber saying he is done, or by the camera)', log.length ? (eatBad ? 'fail' : 'pass') : 'na', eatBad ? 'An eating confirmation has no source.' : ''));

    // 6 camera off until kitchen activity
    var cam = of(log, 'camera').filter(function (e) { return e.data.on; });
    var firstKitchen = idx(log, 'kitchen_entry'), badCam = cam.some(function (e) { return firstKitchen < 0 || log.indexOf(e) < firstKitchen; });
    out.push(rule('R6', 'The camera stays off until kitchen activity', log.length ? (badCam ? 'fail' : 'pass') : 'na', cam.length ? '' : 'No kitchen activity, so the camera stayed off.'));

    // 7 escalation after the final reminder, to Sarah, with the reason stated
    var esc = of(log, 'escalation');
    if (!esc.length) out.push(rule('R7', 'Escalation only after the third reminder, to Sarah, with the reason (refusal, non-response or uncertain)', 'na', 'No escalation in this run.'));
    else {
      var e0 = esc[0], k0 = log.indexOf(e0), lastN = 0;
      log.slice(0, k0).forEach(function (e) { if (e.type === 'reminder') lastN = e.data.n; });
      var okOutcome = ['refusal', 'non-response', 'uncertain'].indexOf(e0.data.outcome) >= 0;
      var ok7 = lastN === 3 && e0.data.to === 'Sarah' && okOutcome;
      out.push(rule('R7', 'Escalation only after the third reminder, to Sarah, with the reason (refusal, non-response or uncertain)', ok7 ? 'pass' : 'fail', ok7 ? 'Reason stated: ' + e0.data.outcome + '.' : 'Check the last reminder, the recipient and the stated reason.'));
    }

    // 8 Sarah silent: repeat once, then Gilbert
    var rep = of(log, 'escalation_repeat').length, back = of(log, 'escalation_backup');
    if (!rep && !back.length) out.push(rule('R8', 'If Sarah does not respond: the message is repeated once, then Gilbert is notified', 'na', 'Sarah responded or was not left waiting.'));
    else {
      var ok8 = rep === 1 && back.length <= 1 && (!back.length || idx(log, 'escalation_repeat') < log.indexOf(back[0]));
      out.push(rule('R8', 'If Sarah does not respond: the message is repeated once, then Gilbert is notified', ok8 ? 'pass' : 'fail', ok8 ? '' : 'Expected exactly one repeat before Gilbert is notified.'));
    }

    // 9 resolved update only after escalation and later eating
    var res = of(log, 'resolved');
    if (!res.length) out.push(rule('R9', 'A “resolved” update follows only escalation and later eating', 'na', 'No resolved update in this run.'));
    else {
      var kr = log.indexOf(res[0]), ke = log.reduce(function (a, e, k) { return a < 0 && e.type === 'escalation' ? k : a; }, -1);
      var eatAfter = log.slice(ke + 1, kr).some(function (e) { return e.type === 'eating' && e.data.state === 'confirmed'; });
      out.push(rule('R9', 'A “resolved” update follows only escalation and later eating', ke >= 0 && eatAfter ? 'pass' : 'fail', ke >= 0 && eatAfter ? '' : 'The update does not follow an escalation and later eating.'));
    }

    // 10 no reminder or alert while the plate is away; away time recorded
    var pl = idx(log, 'plate_left');
    if (pl < 0) {
      out.push(rule('R10', 'No reminder or alert while the plate is away', 'na', 'The plate did not leave the table.'));
      out.push(rule('R11', 'Plate-away time is logged; over one hour is flagged', 'na', ''));
    } else {
      var endAway = log.length, k;
      for (k = pl + 1; k < log.length; k++) if (log[k].type === 'plate_returned' || log[k].type === 'plate_not_returned') { endAway = k; break; }
      var during = log.slice(pl + 1, endAway).filter(function (e) { return e.type === 'reminder' || e.type === 'escalation'; });
      out.push(rule('R10', 'No reminder or alert while the plate is away', during.length ? 'fail' : 'pass', during.length ? 'A reminder or alert was sent while the plate was away.' : (of(log, 'reminder_withheld').length ? 'Echo withheld a reminder while the plate was away.' : '')));
      var back2 = of(log, 'plate_returned')[0], gone = of(log, 'plate_not_returned')[0];
      var ok11 = (back2 && typeof back2.data.away === 'number') || gone;
      out.push(rule('R11', 'Plate-away time is logged; over one hour is flagged', ok11 ? 'pass' : 'fail',
        back2 ? 'Away ' + back2.data.away + ' minutes' + (back2.data.away > 60 ? ' (flagged: over one hour).' : '.') : (gone ? 'Logged as not returned; no alert sent.' : 'The plate left and no return was logged.')));
    }

    // 12 sensor offline shows as missing data in Sarah's summary
    if (!of(log, 'sensor_offline').length) out.push(rule('R12', 'A sensor reported offline appears as missing data in the visit summary', 'na', 'No sensor outage in this run.'));
    else { var ep = episode(run); out.push(rule('R12', 'A sensor reported offline appears as missing data in the visit summary', ep.dataGap ? 'pass' : 'fail', ep.dataGap ? 'Shown as a data gap.' : 'Missing data is not shown.')); }

    // 13 closure
    var cl = of(log, 'closure').length > 0;
    out.push(rule('R13', 'The interaction is closed and Echo returns to rest', (!log.length || (run && run.finished === false)) ? 'na' : (cl ? 'pass' : 'fail'), cl ? '' : 'No closure entry.'));
    return out;
  }

  function summaryOfChecks(checks) {
    var p = checks.filter(function (c) { return c.status === 'pass'; }).length, f = checks.filter(function (c) { return c.status === 'fail'; }).length;
    return { pass: p, fail: f, na: checks.length - p - f, allPass: f === 0 && p > 0 };
  }

  /* ---------- one meal episode, as Sarah's visit summary shows it ---------- */
  function episode(r) {
    var log = (r && r.log) || [];
    var rem = of(log, 'reminder'), escs = of(log, 'escalation'), eaten = of(log, 'eating').filter(function (e) { return e.data.state === 'confirmed'; });
    var kitchen = of(log, 'kitchen_entry')[0], back = of(log, 'plate_returned')[0], gone = of(log, 'plate_not_returned')[0];
    var resolved = of(log, 'resolved').length > 0;
    var status = escs.length ? (resolved ? 'resolved' : 'unresolved') : (eaten.length ? 'eaten' : (gone ? 'plate-not-returned' : 'unknown'));
    var away = back ? back.data.away : null;
    return {
      run: r && r.run, status: status, outcome: escs.length ? escs[0].data.outcome : null,
      reminders: rem.length, times: rem.map(function (e) { return e.time; }),
      postponed: of(log, 'postponement').length > 0,
      delayMin: kitchen && rem.length ? kitchen.at - rem[0].at : null,
      awayMin: away, awayHigh: away != null && away > 60, awayNotReturned: !!gone,
      dataGap: of(log, 'sensor_offline').length > 0,
      meal: 'Lunch 12:30'
    };
  }

  function attention(ep) {
    if (ep.status === 'unresolved') return 1;
    if (ep.awayNotReturned) return 2;
    if (ep.awayHigh) return 3;
    if (ep.dataGap) return 4;
    return 9;
  }

  /* Sarah's visit summary: items needing attention first, missing data shown as a gap, never a clean day. */
  function summaryHtml(eps) {
    var esc = EP.esc;
    if (!eps || !eps.length) return '<p class="hint">No meal episodes yet. The summary fills in as Cleber’s scenarios finish.</p>';
    var list = eps.slice().sort(function (a, b) { return attention(a) - attention(b) || (a.run || 0) - (b.run || 0); });
    function line(ep) {
      var s = [];
      if (ep.status === 'eaten') s.push('Eaten' + (ep.reminders > 1 ? ' after ' + ep.reminders + ' reminders' : ' after the first reminder') + '.');
      else if (ep.status === 'resolved') s.push('Not eaten at first (' + ep.outcome + '); Cleber ate later, after you were told.');
      else if (ep.status === 'unresolved') s.push('Not eaten. Reason: ' + ep.outcome + '.');
      else if (ep.status === 'plate-not-returned') s.push('Eating unknown: the plate left and did not return.');
      else s.push('Eating status unknown.');
      s.push('Echo reminded ' + ep.reminders + (ep.reminders === 1 ? ' time' : ' times') + (ep.times.length ? ' (' + ep.times.join(', ') + ')' : '') + (ep.postponed ? '; Cleber postponed once.' : '.'));
      if (ep.delayMin != null) s.push(ep.delayMin === 0 ? 'Cleber went to the kitchen at the first reminder.' : 'First reminder to kitchen: ' + ep.delayMin + ' min.');
      if (ep.awayMin != null) s.push('Plate away from the table ' + ep.awayMin + ' min' + (ep.awayHigh ? ' (over one hour).' : '.'));
      if (ep.awayNotReturned) s.push('Plate not returned.');
      if (ep.dataGap) s.push('Missing data: a sensor was offline, so part of this meal is unknown (not “all fine”).');
      return s.join(' ');
    }
    var attn = list.filter(function (e) { return attention(e) < 9; }), rest = list.filter(function (e) { return attention(e) === 9; });
    function item(ep) {
      var tag = ep.status === 'unresolved' ? 'Needs attention' : (attention(ep) < 9 ? 'Check' : 'OK');
      return '<article class="vs-item ' + (attention(ep) < 9 ? 'attn' : '') + '"><div class="vs-h"><b>' + esc(ep.meal) + ' · episode ' + esc(ep.run) + '</b><span class="vs-tag">' + tag + '</span></div><p>' + esc(line(ep)) + '</p></article>';
    }
    return '<div class="vs">' + (attn.length ? '<h4>Needs attention first</h4>' + attn.map(item).join('') : '') +
      (rest.length ? '<h4>Other meals</h4>' + rest.map(item).join('') : '') + '</div>';
  }

  /* A small sample for Sarah's view when it runs alone, so the summary can still be read and rated. */
  function sample() {
    return [
      { run: 1, meal: 'Lunch 12:30', status: 'unresolved', outcome: 'refusal', reminders: 5, times: ['12:30', '12:40', '13:10', '13:20', '13:30'], postponed: true, delayMin: null, awayMin: null, awayHigh: false, awayNotReturned: false, dataGap: false },
      { run: 2, meal: 'Lunch 12:30', status: 'eaten', outcome: null, reminders: 2, times: ['12:30', '12:40'], postponed: false, delayMin: 14, awayMin: 95, awayHigh: true, awayNotReturned: false, dataGap: false },
      { run: 3, meal: 'Lunch 12:30', status: 'eaten', outcome: null, reminders: 1, times: ['12:30'], postponed: false, delayMin: 6, awayMin: null, awayHigh: false, awayNotReturned: false, dataGap: true },
      { run: 4, meal: 'Lunch 12:30', status: 'eaten', outcome: null, reminders: 1, times: ['12:30'], postponed: false, delayMin: 4, awayMin: null, awayHigh: false, awayNotReturned: false, dataGap: false }
    ];
  }

  /* ---------- Sarah's open questions (formative: no scores) ---------- */
  var OQ_A = [
    ['A1', 'What did the alert tell you? (which meal, how long, and why it was unresolved)'],
    ['A2', 'What would you do next, and why? (call, visit or wait)'],
    ['A3', 'Was anything unclear or missing in the alert?']
  ];
  var OQ_B = [
    ['B1', 'From the visit summary, which meals were eaten and which were not?'],
    ['B2', 'Was the reminder timing and postponement information understandable?'],
    ['B3', 'Did the plate-away times help you judge whether something was concerning?'],
    ['B4', 'Was missing data clearly shown, or could you read a gap as “all fine”?']
  ];

  function openHtml(group, items, vals, run) {
    var esc = EP.esc;
    return '<ol class="fu-list">' + items.map(function (it, n) {
      return '<li><label for="oq-' + group + (run || '') + it[0] + '"><span class="fu-n">' + (n + 1) + '</span>' + esc(it[1]) + '</label>' +
        '<textarea id="oq-' + group + (run || '') + it[0] + '" rows="3" placeholder="Type your answer here" data-oq="' + group + '" data-item="' + it[0] + '"' + (run ? ' data-run="' + esc(run) + '"' : '') + '>' + esc((vals || {})[it[0]] || '') + '</textarea></li>';
    }).join('') + '</ol>';
  }

  EP.log = { LABEL: LABEL, check: check, checkSummary: summaryOfChecks, episode: episode, summaryHtml: summaryHtml, sample: sample };
  EP.oq = { A: OQ_A, B: OQ_B, html: openHtml };
})();
