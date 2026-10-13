/* Echo prototype: translations for everything Cleber hears/sees and Sarah reads,
   plus the settings and navigation UI. The walkthrough form itself (questions,
   notes) stays in English because the hosts read the notes.
   NOTE: the DE and PT texts are quick translations and should be checked by a native speaker. */
window.EP = window.EP || {};

EP.LANGS = { en: 'English', de: 'Deutsch' };
EP.SPEECH_LANG = { en: 'en-GB', de: 'de-DE' };

EP.I18N = {
  en: {
    // Echo's spoken lines (placeholder wording; r1 and r2 follow DS-01)
    r1: 'Cleber, have you had lunch yet? Come warm up your plate when you are ready.',
    r1_2: 'Hello Cleber, it is lunchtime whenever you feel ready. Your plate is waiting to be warmed up.',
    r1_3: 'Cleber, how about some lunch? You can warm up your plate whenever it suits you.',
    r1_4: 'Hi Cleber, I just wanted to check in: have you had your lunch? Your plate is ready to warm up.',
    r2: 'Cleber, your lunch is in the fridge whenever you would like it.',
    r2_2: 'Cleber, just a gentle note: your lunch is in the fridge, ready when you are.',
    r2_3: 'Hello again, Cleber. Your lunch is waiting in the fridge for whenever you would like it.',
    r2_4: 'Cleber, there is no rush, but your lunch is in the fridge if you feel like eating.',
    r3: 'Cleber, your lunch is ready for you. There is no hurry.',
    r3_2: 'Cleber, just so you know, your lunch is ready whenever you are.',
    r3_3: 'Hello Cleber. Your lunch is ready and waiting, if you feel like some.',
    r3_4: 'Cleber, your lunch is here for you, whenever it suits you.',
    ack1: "That's alright, Cleber. I'll check in again a little later.",
    ack1_2: "No problem, Cleber. I'll come back to you a little later.",
    ack1_3: "Of course, Cleber. I'll check in again in a while.",
    ack1_4: "That's fine, Cleber. I'll remind you again later.",
    ack2: "That's alright, Cleber. Thank you for telling me.",
    ack2_2: 'Understood, Cleber. Thank you for letting me know.',
    ack2_3: 'No problem, Cleber. I appreciate you telling me.',
    ack2_4: 'Okay, Cleber. Thanks for letting me know.',
    done: 'Thank you, Cleber. Enjoy the rest of your day.',
    done_2: 'Wonderful, Cleber. I hope you enjoyed your lunch.',
    done_3: 'Thank you for letting me know, Cleber. Have a lovely afternoon.',
    done_4: 'Great, Cleber. Take care, and enjoy the rest of your day.',
    // Cleber's possible actions
    a_kitchen: 'Go to the kitchen',
    a_notnow: 'Say “Not now”',
    a_nothing: 'Do nothing (asleep, or not listening)',
    a_eat_done: 'Eat the meal and say “I’m done”',
    a_eat_silent: 'Eat the meal and say nothing',
    a_leave: 'Leave the kitchen without eating',
    a_later_eats: 'Later, Cleber eats his lunch',
    a_later_no: 'Nothing more happens',
    // Stage texts
    wait_n: '{n} minutes later…',
    wait_restart: 'Echo waits. {n} minutes later, Echo starts again from the first reminder.',
    kitchen_quiet: 'Cleber is in the kitchen. Echo stays quiet.',
    meal_finished: 'The meal is finished (Echo notices this).',
    echo_rests: 'Echo stops and returns to rest.',
    next: 'Continue',
    replay: 'Hear again',
    voice_level: 'Echo’s voice level',
    voice_same: 'unchanged',
    reminder_of: 'Reminder {n} of 3',
    sim_time: 'Simulated time',
    // Sarah's phone
    s_waiting: 'No notifications',
    s_waiting_sub: 'Echo has nothing to tell you right now.',
    s_title: 'Unresolved meal: lunch',
    s_repeat_tag: 'Repeated',
    s_planned: 'Planned for {t}. Eating has not been confirmed.',
    s_out_none: 'What happened: Cleber did not respond to the reminders.',
    s_out_notnow: 'What happened: Cleber said he did not want to eat right now.',
    s_out_kitchen: 'What happened: Cleber went to the kitchen, but Echo could not confirm that he ate.',
    s_reminders: 'Echo reminded him {n} times ({times}) and has now stopped.',
    s_postponed: 'He asked to postpone once; the reminders started again afterwards.',
    s_call: 'Call Cleber',
    s_visit: 'I’ll visit',
    s_noted_call: 'Calling Cleber… Response noted.',
    s_noted_visit: 'Visit noted. Response noted.',
    s_resolved_title: 'Resolved: lunch',
    s_resolved_body: 'Cleber has now eaten his lunch ({t}). No further action is needed.',
    s_now: 'now',
    s_app: 'Echo',
    // UI
    ui_settings: 'Settings',
    ui_close: 'Close',
    ui_language: 'Language',
    ui_textsize: 'Text size',
    ui_contrast: 'High contrast',
    ui_night: 'Night mode',
    ui_night_hint: 'Dark theme and dimmer room and LEDs. Not part of the specified prototype (see README).',
    ui_motion: 'Echo movement',
    ui_motion_lean: 'Gentle lean + light',
    ui_motion_light: 'Light only',
    ui_voice: 'Speak aloud',
    ui_captions: 'Show captions',
    ui_on: 'On',
    ui_off: 'Off',
    ui_menu: 'Menu',
    ui_session: 'Session and QR code',
    ui_export: 'Export notes',
    ui_restart: 'Restart walkthrough'
  },

  de: {
    r1: 'Cleber, hast du schon zu Mittag gegessen? Wärm dir deinen Teller auf, wenn du so weit bist.',
    r1_2: 'Hallo Cleber, es ist Zeit fürs Mittagessen, wann immer du so weit bist. Dein Teller wartet darauf, aufgewärmt zu werden.',
    r1_3: 'Cleber, wie wäre es mit etwas zu essen? Du kannst deinen Teller aufwärmen, wann es dir passt.',
    r1_4: 'Hallo Cleber, ich wollte kurz nachfragen: Hast du schon zu Mittag gegessen? Dein Teller steht bereit.',
    r2: 'Cleber, dein Mittagessen steht im Kühlschrank, wann immer du möchtest.',
    r2_2: 'Cleber, nur ein sanfter Hinweis: Dein Mittagessen steht im Kühlschrank und wartet auf dich.',
    r2_3: 'Hallo noch einmal, Cleber. Dein Mittagessen ist im Kühlschrank, wann immer du möchtest.',
    r2_4: 'Cleber, es eilt nicht, aber dein Mittagessen steht im Kühlschrank, falls du Appetit hast.',
    r3: 'Cleber, dein Mittagessen steht für dich bereit. Es eilt nicht.',
    r3_2: 'Cleber, nur zur Info: Dein Mittagessen steht bereit, wann immer du möchtest.',
    r3_3: 'Hallo Cleber. Dein Mittagessen ist fertig und wartet, falls du Lust darauf hast.',
    r3_4: 'Cleber, dein Mittagessen ist für dich da, wann immer es dir passt.',
    ack1: 'Das ist in Ordnung, Cleber. Ich melde mich später noch einmal.',
    ack1_2: 'Kein Problem, Cleber. Ich komme etwas später noch einmal auf dich zurück.',
    ack1_3: 'Natürlich, Cleber. Ich schaue in einer Weile wieder nach dir.',
    ack1_4: 'Alles gut, Cleber. Ich erinnere dich später noch einmal.',
    ack2: 'Das ist in Ordnung, Cleber. Danke, dass du es mir sagst.',
    ack2_2: 'Verstanden, Cleber. Danke, dass du mir Bescheid sagst.',
    ack2_3: 'Kein Problem, Cleber. Ich schätze es, dass du es mir sagst.',
    ack2_4: 'Okay, Cleber. Danke für die Rückmeldung.',
    done: 'Danke, Cleber. Noch einen schönen Tag.',
    done_2: 'Wunderbar, Cleber. Ich hoffe, das Essen hat dir geschmeckt.',
    done_3: 'Danke, dass du Bescheid gibst, Cleber. Einen schönen Nachmittag.',
    done_4: 'Schön, Cleber. Pass auf dich auf und genieße den Rest des Tages.',
    a_kitchen: 'In die Küche gehen',
    a_notnow: '„Jetzt nicht“ sagen',
    a_nothing: 'Nichts tun (schläft oder hört nicht zu)',
    a_eat_done: 'Essen und „Ich bin fertig“ sagen',
    a_eat_silent: 'Essen und nichts sagen',
    a_leave: 'Die Küche verlassen, ohne zu essen',
    a_later_eats: 'Später isst Cleber sein Mittagessen',
    a_later_no: 'Es passiert nichts mehr',
    wait_n: '{n} Minuten später…',
    wait_restart: 'Echo wartet. {n} Minuten später beginnt Echo wieder bei der ersten Erinnerung.',
    kitchen_quiet: 'Cleber ist in der Küche. Echo bleibt still.',
    meal_finished: 'Die Mahlzeit ist beendet (Echo bemerkt das).',
    echo_rests: 'Echo hört auf und geht in den Ruhezustand.',
    next: 'Weiter',
    replay: 'Nochmal anhören',
    voice_level: 'Lautstärke von Echo',
    voice_same: 'unverändert',
    reminder_of: 'Erinnerung {n} von 3',
    sim_time: 'Simulierte Uhrzeit',
    s_waiting: 'Keine Benachrichtigungen',
    s_waiting_sub: 'Echo hat dir gerade nichts mitzuteilen.',
    s_title: 'Offene Mahlzeit: Mittagessen',
    s_repeat_tag: 'Wiederholt',
    s_planned: 'Geplant für {t}. Das Essen wurde nicht bestätigt.',
    s_out_none: 'Was passiert ist: Cleber hat nicht auf die Erinnerungen reagiert.',
    s_out_notnow: 'Was passiert ist: Cleber hat gesagt, dass er gerade nicht essen möchte.',
    s_out_kitchen: 'Was passiert ist: Cleber war in der Küche, aber Echo konnte nicht bestätigen, dass er gegessen hat.',
    s_reminders: 'Echo hat ihn {n}-mal erinnert ({times}) und hat jetzt aufgehört.',
    s_postponed: 'Er hat einmal um Aufschub gebeten; danach begannen die Erinnerungen von vorn.',
    s_call: 'Cleber anrufen',
    s_visit: 'Ich besuche ihn',
    s_noted_call: 'Cleber wird angerufen… Antwort vermerkt.',
    s_noted_visit: 'Besuch vermerkt. Antwort vermerkt.',
    s_resolved_title: 'Erledigt: Mittagessen',
    s_resolved_body: 'Cleber hat sein Mittagessen jetzt gegessen ({t}). Es ist nichts weiter nötig.',
    s_now: 'jetzt',
    s_app: 'Echo',
    ui_settings: 'Einstellungen',
    ui_close: 'Schließen',
    ui_language: 'Sprache',
    ui_textsize: 'Textgröße',
    ui_contrast: 'Hoher Kontrast',
    ui_night: 'Nachtmodus',
    ui_night_hint: 'Dunkles Design, dunklerer Raum und dunklere LEDs. Nicht Teil des spezifizierten Prototyps (siehe README).',
    ui_motion: 'Bewegung von Echo',
    ui_motion_lean: 'Sanftes Neigen + Licht',
    ui_motion_light: 'Nur Licht',
    ui_voice: 'Laut vorlesen',
    ui_captions: 'Untertitel anzeigen',
    ui_on: 'An',
    ui_off: 'Aus',
    ui_menu: 'Menü',
    ui_session: 'Sitzung und QR-Code',
    ui_export: 'Notizen exportieren',
    ui_restart: 'Durchgang neu starten'
  }
};

/* Echo says each line in 3-4 wordings (key, key_2, key_3, key_4) so a repeated line, e.g. the first
   reminder after a postponement, is not the same sentence again. */
EP.variants = function (key) {
  var dict = EP.I18N[EP.lang] || EP.I18N.en, out = [key];
  for (var i = 2; dict[key + '_' + i] !== undefined; i++) out.push(key + '_' + i);
  return out;
};

EP.lang = 'en';
EP.t = function (key, vars) {
  var dict = EP.I18N[EP.lang] || EP.I18N.en;
  var s = dict[key];
  if (s === undefined) s = EP.I18N.en[key];
  if (s === undefined) return key;
  if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] !== undefined ? vars[k] : m; });
  return s;
};

EP.esc = function (s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
};

EP.fmtTime = function (mins) {
  var h = Math.floor(mins / 60) % 24, m = mins % 60;
  return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
};

EP.store = {
  get: function (k, def) {
    try { var v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch (e) { return def; }
  },
  set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage may be blocked */ } },
  del: function (k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
};
