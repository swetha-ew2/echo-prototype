/* Accessibility and display settings (per device, kept in localStorage). */
(function () {
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* ignore */ }

  var defaults = { lang: 'en', size: 1, contrast: false, night: false, motion: reduce ? 'light' : 'lean', voice: true, captions: true };
  EP.settings = Object.assign({}, defaults, EP.store.get('echo.settings', {}));

  EP.applySettings = function () {
    var s = EP.settings, d = document.documentElement;
    EP.lang = EP.LANGS[s.lang] ? s.lang : 'en';
    d.setAttribute('lang', EP.lang);
    d.setAttribute('data-night', s.night ? '1' : '0');
    d.setAttribute('data-contrast', s.contrast ? '1' : '0');
    d.setAttribute('data-size', String(s.size));
    EP.store.set('echo.settings', s);
  };

  EP.settingsPanel = function () {
    var s = EP.settings, t = EP.t;
    function seg(name, opts, cur) {
      return '<div class="seg" role="radiogroup">' + opts.map(function (o) {
        return '<button type="button" role="radio" aria-checked="' + (String(cur) === String(o[0])) + '" class="' + (String(cur) === String(o[0]) ? 'on' : '') +
          '" data-set="' + name + '" data-val="' + o[0] + '">' + EP.esc(o[1]) + '</button>';
      }).join('') + '</div>';
    }
    var onoff = [[1, t('ui_on')], [0, t('ui_off')]];
    return '<div class="modal-back">' +
      '<div class="modal" role="dialog" aria-modal="true" aria-label="' + EP.esc(t('ui_settings')) + '">' +
      '<div class="modal-head"><h2>' + EP.esc(t('ui_settings')) + '</h2><button class="btn ghost" data-action="close-settings">' + EP.esc(t('ui_close')) + '</button></div>' +
      '<div class="setting"><label>' + EP.esc(t('ui_language')) + '</label>' +
      seg('lang', Object.keys(EP.LANGS).map(function (k) { return [k, EP.LANGS[k]]; }), s.lang) + '</div>' +
      '<div class="setting"><label>' + EP.esc(t('ui_textsize')) + '</label>' + seg('size', [[0, 'A'], [1, 'A+'], [2, 'A++']], s.size) + '</div>' +
      '<div class="setting"><label>' + EP.esc(t('ui_contrast')) + '</label>' + seg('contrast', onoff, s.contrast ? 1 : 0) + '</div>' +
      '<div class="setting"><label>' + EP.esc(t('ui_night')) + '</label>' + seg('night', onoff, s.night ? 1 : 0) +
      '<p class="hint">' + EP.esc(t('ui_night_hint')) + '</p></div>' +
      '<div class="setting"><label>' + EP.esc(t('ui_motion')) + '</label>' +
      seg('motion', [['lean', t('ui_motion_lean')], ['light', t('ui_motion_light')]], s.motion) + '</div>' +
      '<div class="setting"><label>' + EP.esc(t('ui_voice')) + '</label>' + seg('voice', onoff, s.voice ? 1 : 0) + '</div>' +
      '<div class="setting"><label>' + EP.esc(t('ui_captions')) + '</label>' + seg('captions', onoff, s.captions ? 1 : 0) + '</div>' +
      '</div></div>';
  };

  EP.changeSetting = function (name, val) {
    var s = EP.settings;
    if (name === 'lang' || name === 'motion') s[name] = val;
    else if (name === 'size') s.size = parseInt(val, 10);
    else s[name] = (val === '1' || val === 1);
    EP.applySettings();
    if (name === 'voice' && !s.voice && window.speechSynthesis) window.speechSynthesis.cancel();
  };

  EP.applySettings();
})();
