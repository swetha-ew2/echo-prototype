/* The kitchen scene with Echo, the team's robot from the interim presentation (img/echo.png).
   Echo cannot move its head in the picture, so "attention" is shown softly: the chest lights and a
   halo brighten, then the whole robot leans a few degrees and floats very slightly. A setting turns
   all movement off (light only). Speech is played from pre-rendered audio (audio/<lang>/<key>.mp3),
   with the browser's own voice only as a fallback. */
(function () {
  var timers = [];
  var audio = null;
  var root = null;

  function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }

  // chest lights of the artwork, in the 150x240 box the picture is drawn in
  var LIGHTS = [[49.7, 151.9, 15], [69.4, 150.6, 8.5], [67.8, 159.5, 8.5]];

  function echoGroup() {
    return '<g class="echo" transform="translate(325 108)"><g class="echo-body">' +
      '<ellipse class="echo-shadow" cx="75" cy="241" rx="58" ry="8"/>' +
      '<g class="echo-float">' +
      '<ellipse class="echo-halo" cx="75" cy="120" rx="110" ry="130" fill="url(#halo)"/>' +
      '<image class="echo-img" href="img/echo.png?v=3" x="0" y="0" width="150" height="240"/>' +
      LIGHTS.map(function (l) { return '<circle class="led" cx="' + l[0] + '" cy="' + l[1] + '" r="' + l[2] + '" fill="url(#led)"/>'; }).join('') +
      '</g></g></g>';
  }

  EP.scene = {
    html: function () {
      return '' +
        '<svg id="scene" class="scene" viewBox="0 0 800 440" role="img" aria-label="Kitchen with Echo, a small friendly robot standing on the table" data-mode="rest" data-lean="0" data-plate="cold" data-motion="' + EP.settings.motion + '">' +
        '<defs>' +
        '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sky1)"/><stop offset="1" stop-color="var(--sky2)"/></linearGradient>' +
        '<radialGradient id="led" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffffff"/><stop offset=".4" stop-color="#9cc4ff" stop-opacity=".8"/><stop offset="1" stop-color="#6aa0ff" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#9cc4ff" stop-opacity=".5"/><stop offset="1" stop-color="#9cc4ff" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="pool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#bcd5ff" stop-opacity=".5"/><stop offset="1" stop-color="#bcd5ff" stop-opacity="0"/></radialGradient>' +
        '</defs>' +
        '<rect class="wall" width="800" height="440"/>' +
        '<g class="window"><rect x="196" y="58" width="116" height="124" rx="8" fill="url(#sky)"/>' +
        '<g class="stars"><circle cx="214" cy="80" r="2"/><circle cx="262" cy="74" r="1.6"/><circle cx="296" cy="104" r="2"/><circle cx="240" cy="150" r="1.5"/></g>' +
        '<circle class="moon" cx="228" cy="104" r="11"/>' +
        '<rect x="196" y="58" width="116" height="124" rx="8" fill="none" class="frame"/><line x1="254" y1="58" x2="254" y2="182" class="frame"/><line x1="196" y1="120" x2="312" y2="120" class="frame"/></g>' +
        '<g class="fridge"><rect x="40" y="70" width="130" height="276" rx="10"/><line x1="40" y1="168" x2="170" y2="168" class="fl"/><rect x="148" y="92" width="6" height="52" rx="3" class="fh"/><rect x="148" y="188" width="6" height="70" rx="3" class="fh"/></g>' +
        '<ellipse class="pool" cx="400" cy="335" rx="240" ry="110" fill="url(#pool)"/>' +
        '<rect class="table" x="0" y="340" width="800" height="100"/><rect class="table-edge" x="0" y="340" width="800" height="7"/>' +
        '<g class="plate" transform="translate(620 348)"><ellipse class="plate-base" rx="62" ry="13"/><ellipse class="food" cx="0" cy="-3" rx="36" ry="7"/>' +
        '<g class="steam"><path d="M-14 -12 q-8 -14 0 -26 q8 -12 0 -24"/><path d="M6 -12 q-8 -14 0 -26 q8 -12 0 -24"/><path d="M24 -12 q-8 -14 0 -26 q8 -12 0 -24"/></g></g>' +
        echoGroup() +
        '</svg>';
    },

    mount: function () { root = document.getElementById('scene'); },

    set: function (o) {
      root = document.getElementById('scene');
      if (!root) return;
      if (o.mode) root.setAttribute('data-mode', o.mode);
      if (o.lean !== undefined) root.setAttribute('data-lean', (o.lean && EP.settings.motion === 'lean') ? '1' : '0');
      if (o.plate) root.setAttribute('data-plate', o.plate);
      root.setAttribute('data-motion', EP.settings.motion);
    },

    clear: function () {
      timers.forEach(clearTimeout); timers = [];
      if (audio) { try { audio.pause(); } catch (e) { /* ignore */ } audio = null; }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    },

    /* Echo notices Cleber: the lights brighten, a small lean precedes speech, then the line is spoken. */
    say: function (key, opts) {
      opts = opts || {};
      var text = EP.t(key);
      var cap = document.getElementById('caption');
      EP.scene.clear();
      if (cap) { cap.textContent = ''; cap.classList.remove('show'); }
      EP.scene.set({ mode: 'awake', lean: opts.lean !== false });
      var lead = opts.instant ? 300 : 2000;
      later(function () {
        EP.scene.set({ mode: 'speak' });
        if (cap && EP.settings.captions) { cap.textContent = text; cap.classList.add('show'); }
        var done = false;
        function finish() {
          if (done) return; done = true;
          EP.scene.set({ mode: opts.after || 'awake' });
          if (opts.rest) later(function () { EP.scene.set({ mode: 'rest', lean: false }); }, 1200);
          if (opts.onEnd) opts.onEnd();
        }
        var ms = 1400 + text.length * 70;
        var fell = false;
        function fallbackVoice() {
          if (fell) return; fell = true;
          if (window.speechSynthesis && window.SpeechSynthesisUtterance) {
            try {
              var u = new SpeechSynthesisUtterance(text);
              u.lang = EP.SPEECH_LANG[EP.lang] || 'en-US';
              u.rate = 0.85; u.pitch = 1; u.volume = 0.7;
              u.onend = function () { later(finish, 500); };
              u.onerror = function () { later(finish, ms); };
              window.speechSynthesis.speak(u);
              later(finish, ms + 6000);
              return;
            } catch (e) { /* fall through */ }
          }
          later(finish, ms);
        }
        if (!EP.settings.voice) { later(finish, ms); return; }
        try {
          audio = new Audio('audio/' + EP.lang + '/' + key + '.mp3?v=6');
          audio.volume = 0.85;   // the same level on every reminder: no rising pressure
          audio.onended = function () { later(finish, 500); };
          audio.onerror = function () { audio = null; fallbackVoice(); };
          var pr = audio.play();
          if (pr && pr.catch) pr.catch(function () { audio = null; fallbackVoice(); });
          later(finish, 20000);   // safety net
        } catch (e) { fallbackVoice(); }
      }, lead);
    }
  };
})();
