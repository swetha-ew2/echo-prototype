/* Shared session between Cleber's screen (host) and Sarah's phone (guest).
   GitHub Pages has no server, so this uses WebRTC through PeerJS (the free public PeerJS
   broker is only used to introduce the two devices; messages then go device to device).
   A BroadcastChannel runs in parallel so two tabs of the same browser also work offline.
   The host sends snapshots of Sarah's side; the guest sends back events and its notes. */
(function () {
  var PREFIX = 'echo-proto-';
  var ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

  var S = {
    role: null, code: null, peer: null, conns: [], conn: null, bc: null,
    onMsg: null, onStatus: null, retry: null, closed: true, bcSeen: false
  };

  function status(st, extra) { if (S.onStatus) S.onStatus(st, extra); }
  function deliver(msg) { if (msg && msg.type && S.onMsg) S.onMsg(msg); }

  function openBC() {
    try {
      S.bc = new BroadcastChannel('echo-' + S.code);
      S.bc.onmessage = function (e) {
        if (!S.bcSeen) { S.bcSeen = true; status(S.role === 'host' ? 'connected' : 'connected-local'); }
        deliver(e.data);
      };
    } catch (e) { S.bc = null; }
  }

  function hostPeer() {
    if (!window.Peer) { status('nopeer'); return; }
    var p = new Peer(PREFIX + S.code);
    S.peer = p;
    p.on('open', function () { status('ready'); });
    p.on('connection', function (conn) {
      conn.on('open', function () {
        S.conns.push(conn);
        status('connected');
      });
      conn.on('data', deliver);
      conn.on('close', function () {
        S.conns = S.conns.filter(function (c) { return c !== conn; });
        status(S.conns.length ? 'connected' : 'ready');
      });
    });
    p.on('disconnected', function () { if (!S.closed) try { p.reconnect(); } catch (e) { /* ignore */ } });
    p.on('error', function (err) {
      if (err && err.type === 'unavailable-id') { status('idtaken'); }
      else if (err && (err.type === 'network' || err.type === 'server-error' || err.type === 'socket-error')) { status('offline'); }
    });
  }

  function guestPeer() {
    if (!window.Peer) { status('nopeer'); return; }
    var p = new Peer();
    S.peer = p;
    function connect() {
      if (S.closed) return;
      status('connecting');
      var conn = p.connect(PREFIX + S.code, { reliable: true });
      S.conn = conn;
      conn.on('open', function () { status('connected'); conn.send({ type: 'hello' }); });
      conn.on('data', deliver);
      conn.on('close', function () { S.conn = null; status('lost'); S.retry = setTimeout(connect, 3000); });
      conn.on('error', function () { /* handled by close/retry */ });
    }
    p.on('open', connect);
    p.on('error', function (err) {
      if (err && err.type === 'peer-unavailable') { status('waiting-host'); S.retry = setTimeout(connect, 3000); }
      else status('offline');
    });
    p.on('disconnected', function () { if (!S.closed) try { p.reconnect(); } catch (e) { /* ignore */ } });
  }

  EP.sync = {
    newCode: function () {
      var c = '';
      for (var i = 0; i < 5; i++) c += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      return c;
    },
    open: function (role, code, onMsg, onStatus) {
      EP.sync.close();
      S.role = role; S.code = code; S.onMsg = onMsg; S.onStatus = onStatus; S.closed = false; S.bcSeen = false;
      openBC();
      if (role === 'host') hostPeer(); else guestPeer();
    },
    send: function (msg) {
      if (S.closed) return;
      try { if (S.bc) S.bc.postMessage(msg); } catch (e) { /* ignore */ }
      if (S.role === 'host') S.conns.forEach(function (c) { try { c.send(msg); } catch (e) { /* ignore */ } });
      else if (S.conn && S.conn.open) { try { S.conn.send(msg); } catch (e) { /* ignore */ } }
    },
    close: function () {
      S.closed = true;
      clearTimeout(S.retry);
      try { if (S.bc) S.bc.close(); } catch (e) { /* ignore */ }
      try { if (S.peer) S.peer.destroy(); } catch (e) { /* ignore */ }
      S.peer = null; S.conns = []; S.conn = null; S.bc = null;
    },
    guestCount: function () { return S.conns.length; }
  };
})();
