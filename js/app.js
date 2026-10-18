/* Router, home page, notes page and global event handling. */
(function () {
  var root = document.getElementById('app');
  var modalRoot = document.getElementById('modal-root');
  var current = null;   // the mounted view (EP.cleber or EP.sarah)

  function parse() {
    var h = location.hash.replace(/^#/, '') || '/';
    var q = h.indexOf('?'), path = q >= 0 ? h.slice(0, q) : h, query = {};
    if (q >= 0) h.slice(q + 1).split('&').forEach(function (kv) { var p = kv.split('='); query[p[0]] = decodeURIComponent(p[1] || ''); });
    return { path: path, query: query };
  }

  function home() {
    var resume = EP.store.get('echo.cleber', null);
    root.innerHTML = '<header class="topbar"><div class="brand"><span class="logo" aria-hidden="true"></span><div><b>Echo</b><small>Meal check-in prototype · ' + EP.build + (EP.demo ? ' demo' : '') + '</small></div></div>' +
      '<div class="top-actions"><button class="icon-btn" data-action="open-settings" aria-label="' + EP.esc(EP.t('ui_settings')) + '">⚙</button></div></header>' +
      '<main class="brief"><h1>Echo meal check-in</h1><p class="lead">' + (EP.demo ? 'Demo of the meal check-in.' : 'Walkthrough prototype for a meal check-in.') + '</p>' +
      '' +
      '<div class="brief-grid">' +
      '<section class="card"><h2>Cleber’s screen (hosts)</h2>' +
      (resume ? '<p><button class="btn primary" data-action="home-resume">Resume session ' + EP.esc(resume.code) + '</button></p><p><button class="btn" data-action="home-new">New session</button></p>'
              : '<p><button class="btn primary" data-action="home-new">Start a session</button></p>') + '</section>' +
      '<section class="card"><h2>Sarah’s phone</h2>' +
      '<p class="linkline"><input id="join-code" maxlength="5" placeholder="Session code" autocapitalize="characters" aria-label="Session code"> <button class="btn primary" data-action="home-join">Join</button></p>' +
      '<p><button class="linkbtn" data-action="home-sarah-alone">Open without a session</button></p></section></div></main>';
  }

  function notesPage() {
    var data = EP.exportAll();
    if (!data) { root.innerHTML = '<main class="brief"><p>No notes yet.</p><p><a href="#/">Back</a></p></main>'; return; }
    root.innerHTML = '<div class="print-actions no-print"><a class="btn ghost" href="#/cleber">Back</a> <button class="btn primary" data-action="do-print">Print / save as PDF</button> <button class="btn" data-action="do-download">Download .json</button></div>' +
      '<main class="notes-page">' + EP.wt.printHtml(data) + '</main>';
    root.__data = data;
  }

  function route() {
    if (current && current.unmount) current.unmount();
    current = null; modalRoot.innerHTML = ''; EP.wt.ctx = null;
    var r = parse();
    window.scrollTo(0, 0);
    if (r.path === '/cleber') { document.title = 'Echo: Cleber’s walkthrough'; current = EP.cleber; EP.cleber.mount(root); }
    else if (r.path === '/sarah') { document.title = 'Echo: Sarah’s phone'; current = EP.sarah; EP.sarah.mount(root, (r.query.s || '').toUpperCase() || null); }
    else if (r.path === '/notes') { document.title = 'Echo: walkthrough notes'; notesPage(); }
    else { document.title = 'Echo meal check-in prototype'; home(); }
  }

  EP.router = { go: function (h) { if (location.hash === h) route(); else location.hash = h; } };

  document.addEventListener('click', function (ev) {
    if (ev.target.classList && ev.target.classList.contains('modal-back')) { modalRoot.innerHTML = ''; return; }   // click on the backdrop
    var setBtn = ev.target.closest('[data-set]');
    if (setBtn) {
      EP.changeSetting(setBtn.getAttribute('data-set'), setBtn.getAttribute('data-val'));
      modalRoot.innerHTML = EP.settingsPanel();
      if (current && current.rerender) current.rerender(); else if (parse().path === '/') home();
      return;
    }
    var t = ev.target.closest('[data-action]');
    if (!t) return;
    var a = t.getAttribute('data-action');
    if (a === 'open-settings') { modalRoot.innerHTML = EP.settingsPanel(); return; }
    if (a === 'close-settings') { modalRoot.innerHTML = ''; return; }
    if (a === 'home-new') {
      var old = EP.store.get('echo.cleber', null);
      var n = old ? (old.runs || []).length + (old.notes && Object.keys(old.notes).length ? 1 : 0) : 0;
      if (n && !window.confirm('Starting a new session deletes the notes of ' + n + ' scenario' + (n === 1 ? '' : 's') + ' in this browser. Download them first if you need them (Resume session, then the menu).\n\nStart a new session anyway?')) return;
      if (n) EP.store.set('echo.backup.' + Date.now(), { savedAt: new Date().toISOString(), data: old });   // safety copy
      EP.store.del('echo.cleber'); EP.router.go('#/cleber'); return;
    }
    if (a === 'home-resume') { EP.router.go('#/cleber'); return; }
    if (a === 'home-join') { var c = (document.getElementById('join-code').value || '').trim().toUpperCase(); if (c) EP.router.go('#/sarah?s=' + c); return; }
    if (a === 'home-sarah-alone') { EP.router.go('#/sarah'); return; }
    if (a === 'do-print') { window.print(); return; }
    if (a === 'do-download') { EP.wt.download(root.__data, 'echo-walkthrough.json'); return; }
    if (current && current.handle) current.handle(a, t);
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && modalRoot.innerHTML) modalRoot.innerHTML = '';
  });

  window.addEventListener('hashchange', route);
  EP.wt.init();
  route();
})();
