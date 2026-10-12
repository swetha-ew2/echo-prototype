/* The scenarios an evaluator should walk, and how a finished run is matched to them.
   The prototype has 295 distinct paths for Cleber (3 reminders; per reminder: eat, go to the kitchen and
   leave, do nothing, or "not now"; the first "not now" restarts the sequence). Most only differ in detail,
   so they are grouped here into the ones that behave differently for Cleber or for Sarah.
   A run's trail is a list of { n: reminder number, a: 'done' | 'silent' | 'leave' | 'nothing' | 'notnow' }. */
(function () {
  function ate(e) { return !!e && (e.a === 'done' || e.a === 'silent'); }
  function firstNotNow(t) { for (var i = 0; i < t.length; i++) if (t[i].a === 'notnow') return i; return -1; }
  function last(t) { return t[t.length - 1]; }

  var LIST = [
    { id: 'C1', group: 'cleber', title: 'Eats at once and says “I’m done”',
      how: 'Reminder 1: Go to the kitchen, then “Eat the meal and say I’m done”.',
      test: function (r) { return r.trail.length === 1 && r.trail[0].a === 'done'; } },
    { id: 'C2', group: 'cleber', title: 'Eats at once and says nothing',
      how: 'Reminder 1: Go to the kitchen, then “Eat the meal and say nothing”. Echo has to notice by itself.',
      test: function (r) { return r.trail.length === 1 && r.trail[0].a === 'silent'; } },
    { id: 'C3', group: 'cleber', title: 'Misses reminder 1, eats after reminder 2',
      how: 'Reminder 1: Do nothing. Reminder 2: Go to the kitchen and eat.',
      test: function (r) { var t = r.trail; return t.length === 2 && t[0].a === 'nothing' && ate(t[1]); } },
    { id: 'C4', group: 'cleber', title: 'Misses reminders 1 and 2, eats after reminder 3',
      how: 'Reminders 1 and 2: Do nothing. Reminder 3: Go to the kitchen and eat.',
      test: function (r) { var t = r.trail; return t.length === 3 && t[0].a === 'nothing' && t[1].a === 'nothing' && ate(t[2]); } },
    { id: 'C5', group: 'cleber', title: 'Never responds',
      how: 'Do nothing at all three reminders. Sarah’s alert says Cleber did not respond.',
      test: function (r) { var t = r.trail; return r.escalated && t.length === 3 && t.every(function (e) { return e.a === 'nothing'; }); } },
    { id: 'C6', group: 'cleber', title: 'Goes to the kitchen but never eats',
      how: 'At each reminder: Go to the kitchen, then “Leave the kitchen without eating”. Sarah’s alert says eating is unconfirmed.',
      test: function (r) { return r.escalated && r.outcome === 'kitchen' && firstNotNow(r.trail) < 0; } },
    { id: 'C7', group: 'cleber', title: '“Not now”, then eats at the next reminder',
      how: 'Reminder 1: Say “Not now”. Echo starts again from reminder 1: Go to the kitchen and eat.',
      test: function (r) { var t = r.trail; return t.length === 2 && t[0].a === 'notnow' && ate(t[1]); } },
    { id: 'C8', group: 'cleber', title: '“Not now”, misses a reminder, then eats',
      how: 'Reminder 1: Say “Not now”. After the restart, Do nothing once, then Go to the kitchen and eat.',
      test: function (r) {
        var t = r.trail;
        return t.length >= 3 && t[0].a === 'notnow' && ate(last(t)) && t.slice(1).every(function (e) { return e.a !== 'notnow'; });
      } },
    { id: 'C9', group: 'cleber', title: '“Not now”, then never responds',
      how: 'Reminder 1: Say “Not now”. After the restart, Do nothing at all three reminders.',
      test: function (r) { return r.escalated && firstNotNow(r.trail) >= 0 && r.outcome === 'none'; } },
    { id: 'C10', group: 'cleber', title: 'Says “not now” twice',
      how: 'Reminder 1: Say “Not now”. After the restart, say “Not now” again (and at the later reminders). Sarah’s alert says Cleber did not want to eat.',
      test: function (r) { return r.escalated && firstNotNow(r.trail) >= 0 && r.outcome === 'notnow'; } },
    { id: 'C11', group: 'cleber', title: 'Misses reminder 1, “not now” at reminder 2, then eats',
      how: 'Reminder 1: Do nothing. Reminder 2: Say “Not now”. Echo starts again from reminder 1: Go to the kitchen and eat.',
      test: function (r) { var i = firstNotNow(r.trail); return i >= 1 && ate(last(r.trail)); } },
    { id: 'C12', group: 'cleber', title: '“Not now”, then goes to the kitchen but does not eat',
      how: 'Reminder 1: Say “Not now”. After the restart, at each reminder Go to the kitchen and Leave without eating.',
      test: function (r) { return r.escalated && firstNotNow(r.trail) >= 0 && r.outcome === 'kitchen'; } },

    { id: 'S1', group: 'sarah', title: 'Sarah calls Cleber',
      how: 'After a run that ends unresolved, on Sarah’s phone press “Call Cleber”.' },
    { id: 'S2', group: 'sarah', title: 'Sarah says she will visit',
      how: 'After a run that ends unresolved, on Sarah’s phone press “I’ll visit”.' },
    { id: 'S3', group: 'sarah', title: 'Sarah does not respond',
      how: 'On Sarah’s phone, open Simulation controls and skip ahead twice: the message repeats, then Gilbert is notified.' },
    { id: 'S4', group: 'sarah', title: 'Cleber eats later: “resolved” update',
      how: 'After a run that ends unresolved, choose “Later, Cleber eats his lunch”. Sarah’s phone shows the update.' }
  ];

  /* Which Cleber scenarios a finished run matches. */
  function match(run) {
    return LIST.filter(function (s) { return s.test && s.test(run); }).map(function (s) { return s.id; });
  }

  /* Sarah scenarios that were seen, from the events her phone reported and the runs that were resolved. */
  function sarahSeen(events, resolved) {
    var kinds = {};
    (events || []).forEach(function (e) { kinds[e.kind] = true; });
    return { S1: !!kinds.call, S2: !!kinds.visit, S3: !!kinds['gilbert-notified'], S4: !!resolved };
  }

  EP.scenarios = { LIST: LIST, match: match, sarahSeen: sarahSeen, byId: function (id) { return LIST.filter(function (s) { return s.id === id; })[0]; } };
})();
