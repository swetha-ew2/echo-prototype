/* Cognitive walkthrough form (EM-04): four questions per step with justification,
   success/failure stories, design suggestions, plus the CL3 follow-up questions. */
(function () {
  var Q = [
    ['a', 'Will the user try to achieve the right effect?'],
    ['b', 'Will the user notice that the correct action is available?'],
    ['c', 'Will the user associate the correct action with the effect they are trying to achieve?'],
    ['d', 'If the correct action is performed, will the user see that progress is being made?']
  ];

  var FOLLOWUP = [
    ['q1', 'Was there a moment when a reminder felt like too much, or pushy? Which one?'],
    ['q2', 'Did it feel possible to say no or to postpone, and was it clear how?'],
    ['q3', 'Would you want Echo to stay quiet at any point? When?']
  ];

  EP.wt = {
    QUESTIONS: Q,
    FOLLOWUP: FOLLOWUP,
    ctx: null,   // { notes, followup, save() } of the view that is currently on screen

    /* Metadata for each card of the walkthrough. */
    meta: function (id) {
      var m = /^R(\d)(b?)$/.exec(id);
      if (m) {
        var n = parseInt(m[1], 10), again = !!m[2];
        var step = n === 1 ? 'UC01 step 2' : (n === 2 ? 'UC01 step 4' : 'UC01 step 5');
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
        step: 'UC01 step 7', title: 'Echo stops prompting and rests', persona: 'Cleber',
        effect: 'Cleber understands that Echo has finished for this meal and is not going to keep prompting him.'
      };
      if (id === 'S6') return {
        step: 'UC01 step 6', title: 'Unresolved-meal alert', persona: 'Sarah',
        effect: 'Sarah understands what happened with Cleber’s lunch and can decide whether to call him, visit, or wait.'
      };
      if (id === 'S7') return {
        step: 'UC01 step 7', title: '“Resolved” update', persona: 'Sarah',
        effect: 'Sarah knows the situation is resolved and that no further action is needed.'
      };
      return { step: '', title: id, persona: '', effect: '' };
    },

    ensure: function (notes, id) {
      if (!notes[id]) {
        var m = EP.wt.meta(id);
        notes[id] = { id: id, step: m.step, title: m.title, persona: m.persona, q: { a: {}, b: {}, c: {}, d: {} }, success: '', failure: '', suggestion: '', other: '', after: '' };
      }
      return notes[id];
    },

    answered: function (entry) {
      return !!entry && ['a', 'b', 'c', 'd'].every(function (k) { return entry.q[k] && entry.q[k].ans; });
    },

    /* options.after: label for the optional "what happened next" note (shown once the action was taken). */
    formHtml: function (notes, id, options) {
      options = options || {};
      var e = EP.wt.ensure(notes, id), m = EP.wt.meta(id), esc = EP.esc;
      var h = '<section class="wt" data-card="' + id + '">' +
        '<div class="wt-head"><span class="chip">' + esc(m.step) + '</span><span class="chip alt">Persona: ' + esc(m.persona) + '</span></div>' +
        '<h2>' + esc(m.title) + '</h2>' +
        '<p class="effect"><b>Intended effect:</b> ' + esc(m.effect) + '</p>' +
        '<p class="hint">Answer as ' + esc(m.persona) + '. One tap each; add a short reason.</p><ol class="qs">';
      Q.forEach(function (q) {
        var k = q[0], a = e.q[k] || {};
        h += '<li class="' + (a.ans ? 'answered' : '') + '"><div class="qrow"><p class="q"><b>' + k + '.</b> ' + esc(q[1]) + '</p>' +
          '<div class="yn" role="radiogroup" aria-label="Question ' + k + '">' +
          '<label class="yn-opt"><input type="radio" name="' + id + '-' + k + '" value="yes" data-card="' + id + '" data-path="q.' + k + '.ans"' + (a.ans === 'yes' ? ' checked' : '') + '><span>Yes</span></label>' +
          '<label class="yn-opt"><input type="radio" name="' + id + '-' + k + '" value="no" data-card="' + id + '" data-path="q.' + k + '.ans"' + (a.ans === 'no' ? ' checked' : '') + '><span>No</span></label></div></div>' +
          '<textarea rows="2" placeholder="' + (a.ans === 'no' ? 'What would go wrong?' : 'Why? A short reason is enough.') + '" aria-label="Justification for question ' + k + '" data-card="' + id + '" data-path="q.' + k + '.why">' + esc(a.why || '') + '</textarea></li>';
      });
      h += '</ol>';
      if (options.after) {
        h += '<label class="field"><span>' + esc(options.after) + '</span><textarea rows="2" data-card="' + id + '" data-path="after">' + esc(e.after) + '</textarea></label>';
      }
      h += '<details class="more"' + (e.success || e.failure || e.suggestion || e.other ? ' open' : '') + '><summary>Success story, failure story, suggestions</summary>' +
        '<label class="field"><span>Success story (why it works)</span><textarea rows="2" data-card="' + id + '" data-path="success">' + esc(e.success) + '</textarea></label>' +
        '<label class="field"><span>Failure story (why it might fail)</span><textarea rows="2" data-card="' + id + '" data-path="failure">' + esc(e.failure) + '</textarea></label>' +
        '<label class="field"><span>Design suggestion</span><textarea rows="2" data-card="' + id + '" data-path="suggestion">' + esc(e.suggestion) + '</textarea></label>' +
        '<label class="field"><span>Any problem outside the sequence</span><textarea rows="2" data-card="' + id + '" data-path="other">' + esc(e.other) + '</textarea></label>' +
        '</details></section>';
      return h;
    },

    followupHtml: function (followup) {
      var esc = EP.esc;
      var h = '<section class="wt"><div class="wt-head"><span class="chip">Claim UC01-F2-CL3</span></div><h2>Follow-up questions</h2>' +
        '<p class="hint">Reminders keep Cleber feeling in control. Think back over the whole walkthrough.</p><ol class="qs">';
      FOLLOWUP.forEach(function (q) {
        var f = followup[q[0]] || {};
        h += '<li><p class="q">' + esc(q[1]) + '</p>' +
          '<textarea rows="3" data-fu="' + q[0] + '" data-path="text" aria-label="' + esc(q[1]) + '">' + esc(f.text || '') + '</textarea></li>';
      });
      return h + '</ol></section>';
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
      document.addEventListener('input', function (ev) { if (ev.target.matches('textarea[data-path]')) handle(ev.target); });
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
    exportData: function (meta, cleber, sarah) {
      return { exportedAt: new Date().toISOString(), prototype: 'Echo meal check-in prototype (AT-01, build B1 web version v1)', session: meta, cleberPath: cleber, sarahPath: sarah };
    },

    download: function (data, name) {
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    },

    printHtml: function (data) {
      var esc = EP.esc;
      function cards(path) {
        if (!path || !path.notes) return '<p class="hint">No notes recorded.</p>';
        var ids = Object.keys(path.notes);
        if (!ids.length) return '<p class="hint">No notes recorded.</p>';
        return ids.map(function (id) {
          var e = path.notes[id], h = '<article class="pn"><h3>' + esc(e.step) + ': ' + esc(e.title) + '</h3><table>';
          Q.forEach(function (q) {
            var a = (e.q && e.q[q[0]]) || {};
            h += '<tr><td class="k">' + q[0] + '. ' + esc(q[1]) + '</td><td class="v"><b>' + esc((a.ans || '–').toUpperCase()) + '</b> ' + esc(a.why || '') + '</td></tr>';
          });
          [['After the action', e.after], ['Success story', e.success], ['Failure story', e.failure], ['Design suggestion', e.suggestion], ['Other problem', e.other]].forEach(function (r) {
            if (r[1]) h += '<tr><td class="k">' + r[0] + '</td><td class="v">' + esc(r[1]) + '</td></tr>';
          });
          return h + '</table></article>';
        }).join('');
      }
      var fu = '';
      if (data.cleberPath && data.cleberPath.followup) {
        fu = '<h2>Follow-up (UC01-F2-CL3)</h2><table>' + FOLLOWUP.map(function (q) {
          var f = data.cleberPath.followup[q[0]] || {};
          return '<tr><td class="k">' + esc(q[1]) + '</td><td class="v">' + esc(f.text || '–') + '</td></tr>';
        }).join('') + '</table>';
      }
      return '<h1>Walkthrough notes: Echo prototype</h1><p class="hint">Session ' + esc(data.session && data.session.code) + ' · exported ' + esc(data.exportedAt) + '</p>' +
        '<h2>Path A: Cleber</h2>' + cards(data.cleberPath) + fu +
        '<h2>Path B: Sarah</h2>' + cards(data.sarahPath);
    }
  };
})();
