/* Cognitive walkthrough form (EM-04, ER-01): Yes/No questions specific to each step, with a justification,
   plus the open follow-up questions at the end. */
(function () {
  /* The walkthrough questions are specific to the step. Each set is shown only where it applies, so an evaluator
     answers the questions that fit what Echo just did (Yes/No, required, with a short reason). */
  var SETS = {
    init: { title: 'Initial reminder', qs: [
      ['in1', 'Does the reminder encourage Cleber to consider lunch without sounding demanding?'],
      ['in2', 'Would Cleber notice and understand the reminder in the described situation?'],
      ['in3', 'Is the next action clear while leaving him free to choose?']] },
    postpone: { title: 'Postponement', qs: [
      ['pp1', 'Does Echo accept the postponement without making it feel like a mistake?'],
      ['pp2', 'Is it clear what happens next?'],
      ['pp3', 'Does Cleber retain a meaningful sense of choice?']] },
    kitchen: { title: 'Entering the kitchen', qs: [
      ['ki1', 'Does Echo’s quiet behaviour let Cleber continue independently?'],
      ['ki2', 'Can Cleber eat without being required to say “I’m done”?']] },
    repeat: { title: 'Repeated reminder', qs: [
      ['rp1', 'Is it clear that the reminder concerns the same planned meal?'],
      ['rp2', 'Does the reminder still feel like an invitation rather than pressure?'],
      ['rp3', 'Is its purpose understandable?']] },
    final: { title: 'Third reminder', qs: [
      ['fi1', 'Is this reminder as gentle as the earlier ones, with no louder or more pressing wording?'],
      ['fi2', 'Does Cleber still have a meaningful choice about responding?']] },
    end_ok: { title: 'Ending: eating is confirmed', qs: [
      ['en1', 'Is it clear that the interaction has ended and reminders will stop?']] },
    end_open: { title: 'Ending: eating is not confirmed', qs: [
      ['en2', 'Is it clear that the sequence has ended for now?']] },
    // Sarah's path (UC01 steps 6 and 7); worded for the persona in HP-01
    alert: { title: 'Unresolved-meal alert', qs: [
      ['sa1', 'Does the alert tell Sarah which meal is unresolved and why (refusal, no response or not confirmed)?'],
      ['sa2', 'Is it clear what she can do next (call, visit or wait), while she stays free to choose?'],
      ['sa3', 'Does it read as a situation worth an alert, not as an alarm for a delayed meal?']] },
    resolved: { title: '“Resolved” update', qs: [
      ['sr1', 'Is it clear that the meal is now resolved and that she needs to do nothing more?'],
      ['sr2', 'Does the update stay calm: information, not another alarm?']] }
  };
  var LEGACY = [['a', 'Will the user try to achieve the right effect?'], ['b', 'Will the user notice that the correct action is available?'],
    ['c', 'Will the user associate the correct action with the effect they are trying to achieve?'], ['d', 'If the correct action is performed, will the user see that progress is being made?']];

  var FOLLOWUP = [
    ['q1', 'Was there a moment when a reminder felt like too much, or pushy? Which one?'],
    ['q2', 'Did it feel possible to say no or to postpone, and was it clear how?'],
    ['q3', 'Would you want Echo to stay quiet at any point? When?'],
    ['q4', 'Were you able to recognise how the reminders and the escalation to Sarah help build a healthy eating habit and support Cleber’s meals? Why or why not?'],
    ['q5', 'Which moments worked well for Cleber, and what made them work?'],
    ['q6', 'Where could it go wrong for Cleber in real life, for example if he is asleep, confused or irritated? What would happen?'],
    ['q7', 'What would you change about what Echo says, when it speaks, or what happens next?'],
    ['q8', 'Is there anything that would matter to Cleber that these scenarios did not cover?']
  ];

  /* Persona cards for the evaluator. */
  EP.personas = {
    cleber: function (open) {
      return '<details class="persona"' + (open ? ' open' : '') + '><summary><b>Your persona: Cleber</b></summary>' +
        '<ul>' +
        '<li><b>Lives alone</b> in an apartment. Sarah, his caregiver, comes every two to three days and leaves prepared meals ready.</li>' +
        '<li><b>Meals:</b> three planned meals a day, 30 minutes to an hour each. He gets up, walks to the kitchen, heats the meal in the microwave and eats.</li>' +
        '<li><b>Today:</b> it is 12:30, his planned lunch. The meal is ready and he has not been near the kitchen.</li>' +
        '<li><b>How meals go wrong today, without Echo:</b> he uses an alarm and notes to remember. He is in another room than them 2 to 3 times a week, and falls asleep and does not hear the alarm 2 to 3 times a week. Sometimes he also just does not feel hungry, does not like the food or does not feel like eating.</li>' +
        '<li><b>Values:</b> security and independence matter most to him; his health matters too. He should not feel controlled or watched.</li>' +
        '<li><b>People:</b> Gilbert is his grandson and lives in another city, Sarah is his caregiver, and Hanz is his doctor.'+
        '</li></ul>' +
        '<p class="hint"><b>You decide</b> what Cleber does at each reminder. Choose what you think he would do, not what is easiest to test.</p></details>';
    },
    sarah: function (open) {
      return '<details class="persona"' + (open ? ' open' : '') + '><summary><b>Your persona: Sarah</b></summary>' +
        '<ul>' +
        '<li><b>Role:</b> Cleber’s caregiver. She receives the alerts and summaries and decides how to follow up. Cleber, not Sarah, hears the meal reminders.</li>' +
        '<li><b>Availability:</b> mobile and can travel to his home, but she also cares for other clients. She is not on standby and cannot always respond at once.</li>' +
        '<li><b>History:</b> on more than one visit she found meals partly eaten or untouched. She wants to know what happens between visits, not to find out only when it has become a pattern.</li>' +
        '<li><b>She wants</b> alerts only for genuinely concerning situations, not for every delayed meal. Non-urgent patterns can wait for a visit or a summary.</li>' +
        '<li><b>She worries</b> about making Cleber feel watched, which could damage trust. She wants him to be more autonomous and less dependent on her services.</li>' +
        '<li><b>Skills:</b> she can interpret system information and decide between a call, a visit or attention at her next stop.</li></ul></details>';
    }
  };

  EP.wt = {
    SETS: SETS,
    FOLLOWUP: FOLLOWUP,
    ctx: null,   // { notes, followup, save() } of the view that is currently on screen

    /* Metadata for each card of the walkthrough. */
    meta: function (id) {
      var m = /^R(\d)(b?)$/.exec(id);
      if (m) {
        var n = parseInt(m[1], 10), again = !!m[2];
        var step = n === 1 ? 'Step 2' : (n === 2 ? 'Step 4' : 'Step 5');
        var effect = n === 1
          ? 'Cleber notices Echo’s spoken prompt and is able to respond the way he wants: go to the kitchen, say “not now”, or not respond.'
          : 'Cleber notices the follow-up and can still respond the way he wants. It is not louder or more pressing than before.';
        return {
          step: step,
          title: 'Reminder ' + n + ' of 3' + (again ? ' (restarted after “not now”)' : ''),
          persona: 'Cleber',
          effect: effect
        };
      }
      if (id === 'CLOSE') return {
        step: 'Step 7', title: 'Echo stops prompting and rests', persona: 'Cleber',
        effect: 'Cleber understands that Echo has finished for this meal and is not going to keep prompting him.'
      };
      if (id === 'S6') return {
        step: 'Step 6', title: 'Unresolved-meal alert', persona: 'Sarah',
        effect: 'Sarah understands what happened with Cleber’s lunch and can decide whether to call him, visit, or wait.'
      };
      if (id === 'S7') return {
        step: 'Step 7', title: '“Resolved” update', persona: 'Sarah',
        effect: 'Sarah knows the situation is resolved and that no further action is needed.'
      };
      return { step: '', title: id, persona: '', effect: '' };
    },

    ensure: function (notes, id) {
      if (!notes[id]) {
        var m = EP.wt.meta(id);
        notes[id] = { id: id, step: m.step, title: m.title, persona: m.persona, q: {}, sets: [], order: [], lite: {}, diff: {}, after: '' };
      }
      return notes[id];
    },

    /* The questions of an entry, in the order its sets were shown (entries from older sessions use the four baseline questions). */
    questionsOf: function (entry) {
      if (!entry) return [];
      if ((!entry.sets || !entry.sets.length) && !(entry.order && entry.order.length)) return LEGACY;
      if (!entry.sets) return [];
      var out = [];
      entry.sets.forEach(function (id) { if (SETS[id]) out = out.concat(SETS[id].qs); });
      return out;
    },

    /* Every question that applies to the step so far has a Yes or No. */
    answered: function (entry) {
      var qs = EP.wt.questionsOf(entry);
      return !!entry && qs.every(function (q) { return entry.q[q[0]] && entry.q[q[0]].ans; });
    },

    countYes: function (entry) {
      var qs = EP.wt.questionsOf(entry);
      return { yes: qs.filter(function (q) { return entry.q[q[0]] && entry.q[q[0]].ans === 'yes'; }).length, total: qs.length };
    },

    /* options.set: the question set that applies on this screen (it is added to the step and stays for the step).
       options.after: label for the optional "what happened next" note. */
    formHtml: function (notes, id, options) {
      options = options || {};
      var e = EP.wt.ensure(notes, id), m = EP.wt.meta(id), esc = EP.esc;
      /* A step's questions are asked in full the first time that step appears in the session. Later times (another
         reminder, another scenario) only ask "Was anything different this time?". */
      e.order = e.order || e.sets.slice(); e.lite = e.lite || {}; e.diff = e.diff || {};
      var st = options.set;
      if (st && SETS[st] && e.order.indexOf(st) < 0) {
        var seen = EP.wt.ctx && EP.wt.ctx.seen;
        e.order.push(st);
        if (seen && seen[st]) e.lite[st] = true; else { e.sets.push(st); if (seen) seen[st] = true; }
      }
      var current = st || e.order[e.order.length - 1];
      var shown = e.order.filter(function (sid) {
        return sid === current || (!e.lite[sid] && SETS[sid] && SETS[sid].qs.some(function (q) { return !(e.q[q[0]] && e.q[q[0]].ans); }));
      }).sort(function (x, y) { return (x === current) - (y === current); });
      var multi = shown.length > 1, anyFull = shown.some(function (sid) { return !e.lite[sid]; });
      var h = '<section class="wt" data-card="' + id + '">' +
        '<div class="wt-head"><span class="chip alt">Persona: ' + esc(m.persona) + '</span></div>' +
        '<h2>' + esc(m.title) + '</h2>' +
        '<p class="effect"><b>Intended effect:</b> ' + esc(m.effect) + '</p>' +
        (anyFull ? '<p class="hint">Answer as ' + esc(m.persona) + '. Every Yes/No question here is <b>required</b> <span class="req" aria-hidden="true">*</span>; add a short reason after each tap.</p>' : '<p class="hint">Answer as ' + esc(m.persona) + '. You answered this step’s questions earlier in the session, so only note what was different.</p>');
      var groups = shown.length ? shown.map(function (sid) { return { sid: sid, lite: !!e.lite[sid], title: SETS[sid] && SETS[sid].title, qs: SETS[sid] ? SETS[sid].qs : [] }; }) : [{ title: '', qs: LEGACY }];
      groups.forEach(function (g) {
        if (multi && g.title) h += '<h3 class="qset">' + esc(g.title) + '</h3>';
        else if (g.title) h += '<p class="qset-one">' + esc(g.title) + '</p>';
        if (g.lite) {
          h += '<label class="field"><span>Was anything different this time?</span><textarea rows="2" placeholder="Optional. Leave it empty if nothing was different." data-card="' + id + '" data-path="diff.' + g.sid + '">' + esc(e.diff[g.sid] || '') + '</textarea></label>';
          return;
        }
        h += '<ol class="qs">';
        g.qs.forEach(function (q) {
          var k = q[0], a = e.q[k] || {};
          h += '<li class="' + (a.ans ? 'answered' : '') + '"><div class="qrow"><p class="q">' + esc(q[1]) + ' <span class="req" aria-hidden="true">*</span></p>' +
            '<div class="yn" role="radiogroup" aria-required="true" aria-label="' + esc(q[1]) + ' (required)">' +
            '<label class="yn-opt"><input type="radio" name="' + id + '-' + k + '" value="yes" data-card="' + id + '" data-path="q.' + k + '.ans" required' + (a.ans === 'yes' ? ' checked' : '') + '><span>Yes</span></label>' +
            '<label class="yn-opt"><input type="radio" name="' + id + '-' + k + '" value="no" data-card="' + id + '" data-path="q.' + k + '.ans" required' + (a.ans === 'no' ? ' checked' : '') + '><span>No</span></label></div></div>' +
            '<textarea rows="2" placeholder="' + (a.ans === 'no' ? 'What would go wrong?' : 'Why? A short reason is enough.') + '" aria-label="Justification: ' + esc(q[1]) + '" data-card="' + id + '" data-path="q.' + k + '.why">' + esc(a.why || '') + '</textarea></li>';
        });
        h += '</ol>';
      });
      if (options.after) {
        h += '<label class="field"><span>' + esc(options.after) + '</span><textarea rows="2" data-card="' + id + '" data-path="after">' + esc(e.after) + '</textarea></label>';
      }
      h += '</section>';
      return h;
    },

    followupHtml: function (followup) {
      var esc = EP.esc;
      var h = '<ol class="fu-list">';
      FOLLOWUP.forEach(function (q, n) {
        var f = followup[q[0]] || {};
        h += '<li><label for="fu-' + q[0] + '"><span class="fu-n">' + (n + 1) + '</span>' + esc(q[1]) + '</label>' +
          '<textarea id="fu-' + q[0] + '" rows="4" placeholder="Type your answer here" data-fu="' + q[0] + '" data-path="text">' + esc(f.text || '') + '</textarea></li>';
      });
      return h + '</ol>';
    },

    /* One delegated listener keeps notes in sync and saves immediately. */
    init: function () {
      function handle(el) {
        var ctx = EP.wt.ctx;
        if (!ctx) return false;
        var path = el.getAttribute('data-path');
        if (!path) return false;
        var card = el.getAttribute('data-card'), fu = el.getAttribute('data-fu');
        var obj, val = el.value;
        if (fu) {
          obj = ctx.followup[fu] = ctx.followup[fu] || {};
        } else if (card) {
          obj = EP.wt.ensure(ctx.notes, card);
        } else return false;
        var parts = path.split('.');
        for (var i = 0; i < parts.length - 1; i++) { obj[parts[i]] = obj[parts[i]] || {}; obj = obj[parts[i]]; }
        obj[parts[parts.length - 1]] = val;
        ctx.save();
        if (ctx.onChange) ctx.onChange(card);
        return true;
      }
      document.addEventListener('input', function (ev) {
        var t = ev.target;
        if (t.matches('textarea[data-oq]')) { if (EP.wt.ctx && EP.wt.ctx.setOpen) EP.wt.ctx.setOpen(t.getAttribute('data-oq'), t.getAttribute('data-item'), t.value, t.getAttribute('data-run')); return; }
        if (t.matches('textarea[data-path]')) handle(t);
      });
      document.addEventListener('change', function (ev) {
        var t = ev.target;
        if (!t.matches('input[type=radio][data-path]')) return;
        handle(t);
        var li = t.closest('li');
        if (li) {
          li.classList.add('answered');
          var ta = li.querySelector('textarea');
          if (ta && !ta.value) ta.placeholder = t.value === 'no' ? 'What would go wrong?' : 'Why? A short reason is enough.';
        }
      });
    },

    /* Plain data for download / printing. */
    exportData: function (meta, cleber, sarah, extra) {
      return Object.assign({ exportedAt: new Date().toISOString(), prototype: 'Echo meal check-in prototype (AT-01, build B1 web version v1)', session: meta, cleberPath: cleber, sarahPath: sarah }, extra || {});
    },

    download: function (data, name) {
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    },

    printHtml: function (data) {
      var esc = EP.esc;
      function cards(path, who) {
        var runs = (path && path.runs) || [];
        if (!runs.length) return '<p class="hint">No notes recorded.</p>';
        return runs.map(function (r) {
          var ids = Object.keys(r.notes || {});
          var sc = (r.scenarios || []).map(function (id) { return (EP.scenarios.byId(id) || {}).title; }).filter(Boolean).join('; ');
          var head = '<h3 class="run-h">Scenario run ' + esc(r.run != null ? r.run : (r.runId != null ? r.runId : '?')) + (sc ? ': ' + esc(sc) : '') + '</h3>' +
            (r.outcome ? '<p class="hint">Result: ' + esc(r.outcome) + '</p>' : '');
          var extra = '';
          if (r.log && r.log.length) {
            extra += '<details class="pn-log"><summary>Event log (' + r.log.length + ' entries)</summary><table class="logtable"><tbody>' + r.log.map(function (e) {
              return '<tr><td class="tm">' + esc(e.time) + '</td><td class="tp">' + esc((EP.log.LABEL || {})[e.type] || e.type) + '</td><td>' + esc(e.text) + '</td></tr>';
            }).join('') + '</tbody></table></details>';
          }
          if (r.checks && r.checks.length) {
            var cs = r.checksSummary || {};
            extra += '<p class="hint"><b>Conformance check:</b> ' + esc(cs.pass) + ' pass, ' + esc(cs.fail) + ' fail, ' + esc(cs.na) + ' n/a. ' + (cs.fail ? 'Scenario FAILS.' : 'Scenario passes.') + '</p>' +
              (cs.fail ? '<ul>' + r.checks.filter(function (c) { return c.status === 'fail'; }).map(function (c) { return '<li>' + esc(c.rule) + ': ' + esc(c.detail) + '</li>'; }).join('') + '</ul>' : '');
          }
          head += extra;
          if (!ids.length) return head + '<p class="hint">No notes recorded.</p>';
          return head + ids.map(function (id) {
            var e = r.notes[id], h = '<article class="pn"><h3>' + esc(e.step) + ': ' + esc(e.title) + '</h3><table>';
            EP.wt.questionsOf(e).forEach(function (q) {
              var a = (e.q && e.q[q[0]]) || {};
              h += '<tr><td class="k">' + esc(q[1]) + '</td><td class="v"><b>' + esc((a.ans || '–').toUpperCase()) + '</b> ' + esc(a.why || '') + '</td></tr>';
            });
            Object.keys(e.diff || {}).forEach(function (sid) {
              if (e.diff[sid]) h += '<tr><td class="k">' + esc((SETS[sid] || {}).title || sid) + ': was anything different this time?</td><td class="v">' + esc(e.diff[sid]) + '</td></tr>';
            });
            [['After the action', e.after], ['Success story', e.success], ['Failure story', e.failure], ['Design suggestion', e.suggestion], ['Other problem', e.other]].forEach(function (x) {
              if (x[1]) h += '<tr><td class="k">' + x[0] + '</td><td class="v">' + esc(x[1]) + '</td></tr>';
            });
            return h + '</table></article>';
          }).join('');
        }).join('');
      }
      var fu = '';
      if (data.cleberPath && data.cleberPath.followup) {
        fu = '<h2>Follow-up questions</h2><table>' + FOLLOWUP.map(function (q) {
          var f = data.cleberPath.followup[q[0]] || {};
          return '<tr><td class="k">' + esc(q[1]) + '</td><td class="v">' + esc(f.text || '–') + '</td></tr>';
        }).join('') + '</table>';
      }
      var qn = '';
      var oq = data.sarahOpenQuestions;
      if (oq) {
        function qa(items, vals) {
          return '<table>' + items.map(function (it) { return '<tr><td class="k">' + esc(it[1]) + '</td><td class="v">' + esc((vals || {})[it[0]] || '–') + '</td></tr>'; }).join('') + '</table>';
        }
        qn = '<h2>Sarah: open questions</h2>';
        Object.keys(oq.A || {}).forEach(function (r) {
          var av = oq.A[r], items = EP.oq.A.filter(function (it) { return !av.diff || av[it[0]]; });
          qn += '<h3 class="run-h">After the alert, scenario ' + esc(r) + '</h3>' + (av.truth ? '<p class="hint">Actual reason: ' + esc(av.truth) + '</p>' : '') + qa(items, av) +
            (av.diff !== undefined ? '<table><tr><td class="k">Was anything different this time?</td><td class="v">' + esc(av.diff || '–') + '</td></tr></table>' : '');
        });
        qn += '<h3 class="run-h">After the visit summary</h3>' + qa(EP.oq.B, oq.B) + '<h3 class="run-h">At the end</h3>' + qa(EP.oq.C, oq.C);
      }
      return '<h1>Walkthrough notes: Echo prototype</h1><p class="hint">Session ' + esc(data.session && data.session.code) + ' · exported ' + esc(data.exportedAt) + '</p>' +
        '<h2>Path A: Cleber</h2>' + cards(data.cleberPath) + fu +
        '<h2>Path B: Sarah</h2>' + cards(data.sarahPath) + qn;
    }
  };
})();
