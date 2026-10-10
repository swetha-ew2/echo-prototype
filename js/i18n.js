/* Echo prototype: translations for everything Cleber hears/sees and Sarah reads,
   plus the settings and navigation UI. The walkthrough form itself (questions,
   notes) stays in English because the hosts read the notes.
   NOTE: the DE and PT texts are quick translations and should be checked by a native speaker. */
window.EP = window.EP || {};

EP.LANGS = { en: 'English', de: 'Deutsch', pt: 'Português' };
EP.SPEECH_LANG = { en: 'en-US', de: 'de-DE', pt: 'pt-BR' };

EP.I18N = {
  en: {
    // Echo's spoken lines (placeholder wording; r1 and r2 follow DS-01)
    r1: 'Cleber, have you had lunch yet? Come warm up your plate when you are ready.',
    r2: 'Cleber, your lunch is in the fridge whenever you would like it.',
    r3: 'Cleber, one last reminder: your lunch is ready for you.',
    ack1: "That's alright, Cleber. I'll check in again a little later.",
    ack2: "That's alright, Cleber. Thank you for telling me.",
    done: 'Thank you, Cleber. Enjoy the rest of your day.',
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
    r2: 'Cleber, dein Mittagessen steht im Kühlschrank, wann immer du möchtest.',
    r3: 'Cleber, eine letzte Erinnerung: Dein Mittagessen steht für dich bereit.',
    ack1: 'Das ist in Ordnung, Cleber. Ich melde mich später noch einmal.',
    ack2: 'Das ist in Ordnung, Cleber. Danke, dass du es mir sagst.',
    done: 'Danke, Cleber. Noch einen schönen Tag.',
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
  },

  pt: {
    r1: 'Cleber, você já almoçou? Venha esquentar o seu prato quando quiser.',
    r2: 'Cleber, o seu almoço está na geladeira, quando você quiser.',
    r3: 'Cleber, um último lembrete: o seu almoço está pronto para você.',
    ack1: 'Tudo bem, Cleber. Eu volto a falar com você daqui a pouco.',
    ack2: 'Tudo bem, Cleber. Agradeço por me avisar.',
    done: 'Muito bem, Cleber. Tenha um ótimo resto de dia.',
    a_kitchen: 'Ir para a cozinha',
    a_notnow: 'Dizer “Agora não”',
    a_nothing: 'Não fazer nada (dormindo ou sem ouvir)',
    a_eat_done: 'Comer e dizer “Terminei”',
    a_eat_silent: 'Comer e não dizer nada',
    a_leave: 'Sair da cozinha sem comer',
    a_later_eats: 'Mais tarde, Cleber come o almoço',
    a_later_no: 'Nada mais acontece',
    wait_n: '{n} minutos depois…',
    wait_restart: 'Echo espera. {n} minutos depois, Echo recomeça pelo primeiro lembrete.',
    kitchen_quiet: 'Cleber está na cozinha. Echo fica em silêncio.',
    meal_finished: 'A refeição terminou (Echo percebe isso).',
    echo_rests: 'Echo para e volta ao repouso.',
    next: 'Continuar',
    replay: 'Ouvir de novo',
    voice_level: 'Volume da voz do Echo',
    voice_same: 'inalterado',
    reminder_of: 'Lembrete {n} de 3',
    sim_time: 'Hora simulada',
    s_waiting: 'Sem notificações',
    s_waiting_sub: 'O Echo não tem nada para avisar agora.',
    s_title: 'Refeição pendente: almoço',
    s_repeat_tag: 'Repetido',
    s_planned: 'Previsto para {t}. Não foi confirmado que ele comeu.',
    s_out_none: 'O que aconteceu: Cleber não respondeu aos lembretes.',
    s_out_notnow: 'O que aconteceu: Cleber disse que não queria comer agora.',
    s_out_kitchen: 'O que aconteceu: Cleber foi à cozinha, mas o Echo não conseguiu confirmar que ele comeu.',
    s_reminders: 'O Echo lembrou {n} vezes ({times}) e agora parou.',
    s_postponed: 'Ele pediu para adiar uma vez; depois disso os lembretes recomeçaram.',
    s_call: 'Ligar para o Cleber',
    s_visit: 'Vou visitá-lo',
    s_noted_call: 'Ligando para o Cleber… Resposta registrada.',
    s_noted_visit: 'Visita registrada. Resposta registrada.',
    s_resolved_title: 'Resolvido: almoço',
    s_resolved_body: 'Cleber já comeu o almoço ({t}). Nenhuma ação é necessária.',
    s_now: 'agora',
    s_app: 'Echo',
    ui_settings: 'Configurações',
    ui_close: 'Fechar',
    ui_language: 'Idioma',
    ui_textsize: 'Tamanho do texto',
    ui_contrast: 'Alto contraste',
    ui_night: 'Modo noturno',
    ui_night_hint: 'Tema escuro, ambiente e LEDs mais fracos. Não faz parte do protótipo especificado (veja o README).',
    ui_motion: 'Movimento do Echo',
    ui_motion_lean: 'Leve inclinação + luz',
    ui_motion_light: 'Só luz',
    ui_voice: 'Falar em voz alta',
    ui_captions: 'Mostrar legendas',
    ui_on: 'Ligado',
    ui_off: 'Desligado',
    ui_menu: 'Menu',
    ui_session: 'Sessão e código QR',
    ui_export: 'Exportar notas',
    ui_restart: 'Reiniciar o percurso'
  }
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
