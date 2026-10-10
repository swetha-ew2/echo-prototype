/* The kitchen scene with Echo: a small, abstract owl-like object.
   Design choices to avoid an uncanny look: no pupils, no mouth or beak, no blinking,
   no eye tracking, soft amber LEDs, and only a very slow, small lean (or light only). */
(function () {
  var timers = [];
  var root = null;

  function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }

  function echoGroup() {
    return '' +
      '<g class="echo-body">' +
      '<ellipse cx="120" cy="246" rx="74" ry="9" class="echo-shadow"/>' +
      '<path class="echo-shell" d="M120 28 C172 28 198 80 198 142 C198 206 166 242 120 242 C74 242 42 206 42 142 C42 80 68 28 120 28Z"/>' +
      '<path class="echo-ear" d="M66 62 L72 30 L98 46" />' +
      '<path class="echo-ear" d="M174 62 L168 30 L142 46" />' +
      '<ellipse class="echo-belly" cx="120" cy="180" rx="40" ry="48"/>' +
      '<path class="echo-feather" d="M98 160 q10 10 20 0 M122 160 q10 10 20 0 M110 182 q10 10 20 0 M86 182 q10 10 20 0 M134 182 q10 10 20 0 M98 204 q10 10 20 0 M122 204 q10 10 20 0"/>' +
      '<ellipse class="echo-face" cx="120" cy="100" rx="66" ry="42"/>' +
      '<g class="eye" transform="translate(94 102)"><ellipse class="halo" rx="26" ry="22"/><ellipse class="core" rx="8.5" ry="8.5"/></g>' +
      '<g class="eye" transform="translate(146 102)"><ellipse class="halo" rx="26" ry="22"/><ellipse class="core" rx="8.5" ry="8.5"/></g>' +
      '<g class="echo-speaker"><circle cx="106" cy="226" r="2"/><circle cx="120" cy="226" r="2"/><circle cx="134" cy="226" r="2"/></g>' +
      '</g>';
  }

  EP.scene = {
    html: function () {
      return '' +
        '<svg id="scene" class="scene" viewBox="0 0 800 440" role="img" aria-label="Kitchen with Echo, a small owl-like tabletop robot" data-mode="rest" data-lean="0" data-plate="cold">' +
        '<defs>' +
        '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sky1)"/><stop offset="1" stop-color="var(--sky2)"/></linearGradient>' +
        '<radialGradient id="led" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff3d2"/><stop offset=".35" stop-color="#ffd08a"/><stop offset="1" stop-color="#ffb868" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="pool" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".55"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></radialGradient>' +
        '</defs>' +
        '<rect class="wall" width="800" height="440"/>' +
        '<g class="window"><rect x="560" y="46" width="180" height="170" rx="8" fill="url(#sky)"/>' +
        '<g class="stars"><circle cx="590" cy="80" r="2"/><circle cx="640" cy="68" r="1.6"/><circle cx="700" cy="100" r="2"/><circle cx="670" cy="150" r="1.5"/><circle cx="715" cy="64" r="1.5"/></g>' +
        '<circle class="moon" cx="606" cy="92" r="13"/>' +
        '<rect x="560" y="46" width="180" height="170" rx="8" fill="none" class="frame"/><line x1="650" y1="46" x2="650" y2="216" class="frame"/><line x1="560" y1="131" x2="740" y2="131" class="frame"/></g>' +
        '<g class="fridge"><rect x="44" y="70" width="130" height="276" rx="10"/><line x1="44" y1="168" x2="174" y2="168" class="fl"/><rect x="152" y="92" width="6" height="52" rx="3" class="fh"/><rect x="152" y="188" width="6" height="70" rx="3" class="fh"/></g>' +
        '<ellipse class="pool" cx="400" cy="330" rx="230" ry="120" fill="url(#pool)"/>' +
        '<rect class="table" x="0" y="340" width="800" height="100"/><rect class="table-edge" x="0" y="340" width="800" height="7"/>' +
        '<g class="plate" transform="translate(560 346)"><ellipse class="plate-base" rx="62" ry="13"/><ellipse class="food" cx="0" cy="-3" rx="36" ry="7"/>' +
        '<g class="steam"><path d="M-14 -12 q-8 -14 0 -26 q8 -12 0 -24"/><path d="M6 -12 q-8 -14 0 -26 q8 -12 0 -24"/><path d="M24 -12 q-8 -14 0 -26 q8 -12 0 -24"/></g></g>' +
        '<g class="echo" transform="translate(298 128) scale(0.85)">' + echoGroup() + '</g>' +
        '<g class="waves" transform="translate(500 196)"><path d="M0 -14 q14 14 0 28"/><path d="M16 -26 q26 26 0 52"/><path d="M32 -38 q38 38 0 76"/></g>' +
        '</svg>';
    },

    mount: function () { root = document.getElementById('scene'); },

    set: function (o) {
      root = document.getElementById('scene');
      if (!root) return;
      if (o.mode) root.setAttribute('data-mode', o.mode);
      if (o.lean !== undefined) root.setAttribute('data-lean', (o.lean && EP.settings.motion === 'lean') ? '1' : '0');
      if (o.plate) root.setAttribute('data-plate', o.plate);
    },

    clear: function () {
      timers.forEach(clearTimeout); timers = [];
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    },

    /* Echo notices Cleber: LEDs brighten, a soft lean precedes speech, then the line is spoken. */
    say: function (key, opts) {
      opts = opts || {};
      var text = EP.t(key);
      var cap = document.getElementById('caption');
      EP.scene.clear();
      if (cap) { cap.textContent = ''; cap.classList.remove('show'); }
      EP.scene.set({ mode: 'awake', lean: opts.lean !== false });
      var lead = opts.instant ? 300 : 2200;
      later(function () {
        EP.scene.set({ mode: 'speak' });
        if (cap && EP.settings.captions) { cap.textContent = '“' + text + '”'; cap.classList.add('show'); }
        var done = false;
        function finish() {
          if (done) return; done = true;
          EP.scene.set({ mode: opts.after || 'awake' });
          if (opts.rest) later(function () { EP.scene.set({ mode: 'rest', lean: false }); }, 1200);
          if (opts.onEnd) opts.onEnd();
        }
        var ms = 1400 + text.length * 62;
        if (EP.settings.voice && window.speechSynthesis && window.SpeechSynthesisUtterance) {
          try {
            var u = new SpeechSynthesisUtterance(text);
            u.lang = EP.SPEECH_LANG[EP.lang] || 'en-US';
            u.rate = 0.85; u.pitch = 0.9; u.volume = 0.7;   // fixed on every reminder: no rising pressure
            u.onend = function () { later(finish, 500); };
            u.onerror = function () { later(finish, ms); };
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(u);
            later(finish, ms + 6000);   // safety net if onend never fires
            return;
          } catch (e) { /* fall through to timer */ }
        }
        later(finish, ms);
      }, lead);
    }
  };
})();
