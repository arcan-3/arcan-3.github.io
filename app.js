/* -------------------------------------------------------------
   Ankit Ghosh — home page behaviour.
   Ported from the Claude Design component to plain JS: no React,
   no Babel, no CDN. Everything below runs as-is in the browser.
   ------------------------------------------------------------- */

(function () {
  'use strict';

  var ACCENT = '#1FB6C4';
  var DIM    = '#5B6773';
  var TEAL   = '#0E7C86';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var heroC    = document.getElementById('hero-canvas');
  var stageC   = document.getElementById('stage-canvas');
  var doseC    = document.getElementById('dose-canvas');
  var threadEl = document.getElementById('thread');
  var counter  = document.getElementById('thread-counter');
  var mediumEl = document.getElementById('thread-medium');
  var snrInput = document.getElementById('snr');
  var snrOut   = snrInput ? snrInput.parentNode.querySelector('output') : null;

  var panels = [].slice.call(document.querySelectorAll('[data-stage-panel]'));
  var ticks  = [].slice.call(document.querySelectorAll('[data-stage-tick]'));

  var MEDIA = ['Water column', 'Underwater acoustic link', 'Passive acoustics',
               'Photons', 'Vibration, infrared', 'RF channel', 'Plant floor'];
  var KIND  = ['multipath', 'chirp', 'clicks', 'photons', 'vibro', 'csi', 'multi'];

  var snr = 14, stageIndex = -1, noiseOffset = 0, sig = null, power = 0;

  /* ---------- deterministic gaussian noise ---------- */
  function makeNoise(n, seed) {
    var s = seed >>> 0;
    function rnd() { s = (s * 1664525 + 1013904223) >>> 0; return (s >>> 8) / 16777216; }
    var out = new Float64Array(n);
    for (var i = 0; i < n; i += 2) {
      var u = Math.max(rnd(), 1e-12), v = rnd(), r = Math.sqrt(-2 * Math.log(u));
      out[i] = r * Math.cos(2 * Math.PI * v);
      if (i + 1 < n) out[i + 1] = r * Math.sin(2 * Math.PI * v);
    }
    return out;
  }
  var noise = makeNoise(8192, 12345);

  /* ---------- Savitzky-Golay quadratic smoother ---------- */
  function sgCoeffs(m) {
    var S0 = 0, S2 = 0, S4 = 0, i;
    for (i = -m; i <= m; i++) { S0 += 1; S2 += i * i; S4 += i * i * i * i; }
    var det = S2 * S2 - S0 * S4, x0 = -S4 / det, x2 = S2 / det;
    var c = new Float64Array(2 * m + 1);
    for (i = -m; i <= m; i++) c[i + m] = x0 + x2 * i * i;
    return { m: m, c: c };
  }
  var sg = sgCoeffs(15);

  function filter(x) {
    var m = sg.m, c = sg.c, n = x.length, y = new Float64Array(n);
    for (var k = 0; k < n; k++) {
      var acc = 0;
      for (var i = -m; i <= m; i++) {
        var j = k + i;
        if (j < 0) j = -j;
        if (j > n - 1) j = 2 * (n - 1) - j;
        acc += c[i + m] * x[j];
      }
      y[k] = acc;
    }
    return y;
  }

  function buildSignal() {
    var n = heroC ? Math.max(320, Math.min(1400, Math.round(heroC.clientWidth))) : 900;
    var s = new Float64Array(n), p = 0;
    for (var k = 0; k < n; k++) {
      var t = k / (n - 1);
      var env = Math.exp(-Math.pow(t - 0.52, 2) / (2 * 0.24 * 0.24));
      var phase = 2 * Math.PI * (2.6 * t + 4.2 * t * t);
      s[k] = 0.78 * env * Math.sin(phase) + 0.26 * Math.sin(2 * Math.PI * 1.15 * t + 0.6);
      p += s[k] * s[k];
    }
    sig = s; power = p / n;
  }

  /* ---------- canvas helpers ---------- */
  function ctxFor(canvas) {
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    }
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h };
  }

  function grid(ctx, w, h, rows) {
    ctx.save();
    ctx.strokeStyle = 'rgba(151,163,176,0.09)';
    ctx.lineWidth = 1;
    for (var r = 0; r <= rows; r++) {
      var y = Math.round((h * r) / rows) + 0.5;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    for (var i = 1; i < 8; i++) {
      var x = Math.round((w * i) / 8) + 0.5;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    ctx.restore();
  }

  function poly(ctx, arr, w, h, amp, color, lw, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.strokeStyle = color; ctx.lineWidth = lw;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath();
    var n = arr.length;
    for (var k = 0; k < n; k++) {
      var x = (k / (n - 1)) * w, y = h / 2 - arr[k] * amp;
      if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  /* ---------- hero: measured vs recovered ---------- */
  function drawHero() {
    if (!heroC || !sig) return;
    var g = ctxFor(heroC);
    if (g.w < 2) return;
    if (sig.length !== Math.max(320, Math.min(1400, Math.round(g.w)))) buildSignal();
    var n = sig.length;
    var sigma = Math.sqrt(power / Math.pow(10, snr / 10));
    var noisy = new Float64Array(n);
    for (var k = 0; k < n; k++) noisy[k] = sig[k] + sigma * noise[(k + noiseOffset) % noise.length];
    var rec = filter(noisy);
    grid(g.ctx, g.w, g.h, 4);
    var amp = g.h * 0.30;
    poly(g.ctx, noisy, g.w, g.h, amp, DIM, 1, 0.9);
    poly(g.ctx, rec, g.w, g.h, amp, ACCENT, 2, 1);
  }

  /* ---------- dose / quality curves ---------- */
  function drawDose() {
    if (!doseC) return;
    var g = ctxFor(doseC), w = g.w, h = g.h, ctx = g.ctx, pad = 22;
    if (w < 2) return;
    var iw = w - pad * 2, ih = h - pad * 2;
    ctx.save();
    ctx.strokeStyle = 'rgba(151,163,176,0.18)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, h - pad); ctx.lineTo(w - pad, h - pad); ctx.stroke();
    function curve(fn, color, lw, dash) {
      ctx.setLineDash(dash || []);
      ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath();
      for (var i = 0; i <= 100; i++) {
        var t = i / 100, x = pad + t * iw, y = h - pad - fn(t) * ih;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.setLineDash([]);
    }
    curve(function (t) { return 0.92 * (1 - Math.exp(-3.1 * t)); }, ACCENT, 2);
    curve(function (t) { return 0.92 * Math.exp(-2.6 * t); }, '#97A3B0', 1.5, [4, 4]);
    ctx.fillStyle = 'rgba(14,124,134,0.16)';
    ctx.fillRect(pad + iw * 0.30, pad, iw * 0.22, ih);
    ctx.restore();
  }

  /* ---------- thread stage figure ---------- */
  function drawStage() {
    if (!stageC) return;
    var g = ctxFor(stageC), ctx = g.ctx, w = g.w, h = g.h;
    if (w < 2) return;
    var kind = KIND[Math.max(0, stageIndex)];
    grid(ctx, w, h, 4);
    var amp = h * 0.30, N = Math.max(300, Math.round(w));
    var arr = new Float64Array(N), k, t, i;

    if (kind === 'multipath') {
      for (k = 0; k < N; k++) {
        t = k / (N - 1); var v = 0;
        for (var p = 0; p < 3; p++) {
          var d = t - 0.12 - p * 0.17;
          if (d > 0) v += Math.pow(0.5, p) * Math.exp(-Math.pow(d - 0.06, 2) / 0.0016) * Math.sin(2 * Math.PI * 14 * d);
        }
        arr[k] = v;
      }
      poly(ctx, arr, w, h, amp, ACCENT, 1.6, 1);

    } else if (kind === 'chirp') {
      for (k = 0; k < N; k++) { t = k / (N - 1); arr[k] = Math.sin(2 * Math.PI * (1.5 * t + 11 * t * t)); }
      poly(ctx, arr, w, h, amp * 0.9, ACCENT, 1.4, 1);

    } else if (kind === 'clicks') {
      for (k = 0; k < N; k++) arr[k] = 0.12 * noise[k % noise.length];
      poly(ctx, arr, w, h, amp, DIM, 1, 0.9);
      ctx.save(); ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.6;
      [0.14, 0.29, 0.35, 0.52, 0.68, 0.72, 0.88].forEach(function (tt) {
        var x = Math.round(tt * w) + 0.5, len = h * (0.16 + 0.2 * ((tt * 7) % 1));
        ctx.beginPath(); ctx.moveTo(x, h / 2 - len); ctx.lineTo(x, h / 2 + len); ctx.stroke();
      });
      ctx.restore();

    } else if (kind === 'photons') {
      ctx.save();
      var cols = 26, rows = 11;
      for (i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          var nx = (i + 0.5) / cols, ny = (j + 0.5) / rows;
          var dd = Math.hypot(nx - 0.5, ny - 0.5);
          var dose = Math.max(0, 1 - dd * 2.1) * (0.35 + 0.65 * Math.abs(noise[(i * rows + j) % noise.length]));
          if (dose < 0.05) continue;
          ctx.globalAlpha = Math.min(1, dose);
          ctx.fillStyle = dose > 0.45 ? ACCENT : DIM;
          ctx.beginPath(); ctx.arc(nx * w, ny * h, 1 + dose * 2.4, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.restore();

    } else if (kind === 'vibro') {
      for (k = 0; k < N; k++) {
        t = k / (N - 1);
        var burst = Math.exp(-Math.pow((t % 0.34) - 0.06, 2) / 0.0022);
        arr[k] = (0.22 + burst) * noise[(k * 3) % noise.length] * 0.5;
      }
      poly(ctx, arr, w, h, amp, ACCENT, 1, 0.95);

    } else if (kind === 'csi') {
      ctx.save();
      var bars = 44, bw = w / bars;
      for (i = 0; i < bars; i++) {
        t = i / (bars - 1);
        var mag = 0.25 + 0.7 * Math.abs(Math.sin(2 * Math.PI * (1.4 * t + 0.2)) * (1 - 0.5 * t)) + 0.08 * noise[i % 512];
        var bh = Math.max(2, mag * h * 0.62);
        ctx.fillStyle = i % 4 === 0 ? ACCENT : 'rgba(151,163,176,0.35)';
        ctx.fillRect(i * bw + bw * 0.25, h / 2 - bh / 2, Math.max(1.5, bw * 0.5), bh);
      }
      ctx.restore();

    } else {
      for (var ch = 0; ch < 3; ch++) {
        var line = new Float64Array(N);
        for (k = 0; k < N; k++) {
          t = k / (N - 1);
          line[k] = Math.sin(2 * Math.PI * (2 + ch * 1.7) * t + ch) * (0.5 - 0.12 * ch)
                  + 0.14 * noise[(k + ch * 977) % noise.length];
        }
        ctx.save(); ctx.translate(0, (ch - 1) * h * 0.26);
        poly(ctx, line, w, h, amp * 0.55, ch === 1 ? ACCENT : DIM, ch === 1 ? 1.6 : 1, ch === 1 ? 1 : 0.7);
        ctx.restore();
      }
    }
  }

  /* ---------- scroll-driven thread ---------- */
  function updateThread() {
    if (!threadEl) return;
    var rect = threadEl.getBoundingClientRect();
    var span = rect.height - window.innerHeight;
    var prog = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0;
    var n = panels.length || 1;
    var idx = Math.min(n - 1, Math.max(0, Math.floor(prog * n * 0.999)));
    if (idx === stageIndex) return;
    stageIndex = idx;

    panels.forEach(function (el, i) {
      el.style.transition = 'opacity 520ms ease, transform 620ms cubic-bezier(0.22,0.61,0.36,1)';
      el.style.opacity = i === idx ? '1' : '0';
      el.style.transform = i === idx ? 'none' : 'translateY(' + (i < idx ? -14 : 14) + 'px)';
      el.style.pointerEvents = i === idx ? 'auto' : 'none';
    });
    ticks.forEach(function (t, i) {
      t.style.transition = 'background 400ms ease';
      t.style.background = i <= idx ? TEAL : '#2A333D';
    });
    if (counter) counter.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
    if (mediumEl) mediumEl.textContent = MEDIA[idx] || '';
    drawStage();
  }

  /* ---------- reveals ---------- */
  var revealNodes = [].slice.call(document.querySelectorAll('[data-reveal]'));

  function setupReveals() {
    if (reduced) return;
    var vh = document.documentElement.clientHeight || window.innerHeight;
    revealNodes.forEach(function (n, i) {
      if (n.getBoundingClientRect().top < vh * 0.92) return;
      n.style.opacity = '0';
      n.style.transform = 'translateY(14px)';
      var delay = (i % 4) * 70;
      n.style.transition = 'opacity 900ms cubic-bezier(0.22,0.61,0.36,1) ' + delay + 'ms, ' +
                           'transform 900ms cubic-bezier(0.22,0.61,0.36,1) ' + delay + 'ms';
    });
  }

  function updateReveals() {
    if (reduced) return;
    var vh = document.documentElement.clientHeight || window.innerHeight;
    revealNodes.forEach(function (n) {
      if (n.style.opacity === '') return;
      var r = n.getBoundingClientRect();
      if (r.top < vh * 0.88 && r.bottom > 0) { n.style.opacity = '1'; n.style.transform = 'none'; }
    });
  }

  /* ---------- wiring ---------- */
  if (snrInput) {
    snrInput.addEventListener('input', function (e) {
      snr = parseFloat(e.target.value);
      if (snrOut) snrOut.textContent = (snr > 0 ? '+' : '') + snr.toFixed(1) + ' dB';
      drawHero();
    });
  }

  var pending = false;
  window.addEventListener('scroll', function () {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; updateThread(); updateReveals(); });
  }, { passive: true });

  window.addEventListener('resize', function () {
    buildSignal(); drawHero(); drawStage(); drawDose();
  });

  buildSignal();
  setupReveals();
  updateReveals();
  updateThread();
  drawHero();
  drawDose();

  // Ambient noise drift on the hero. Skipped when reduced motion is requested.
  if (!reduced) {
    (function loop() {
      noiseOffset = (noiseOffset + 1) % 8192;
      drawHero();
      requestAnimationFrame(loop);
    })();
  }
})();
