/* -------------------------------------------------------------
   Hero figure: one underlying signal, drawn twice.
   Grey  = what the sensor measured, at the SNR you choose.
   Teal  = what a simple recovery gets back out of it.

   The recovery here is a Savitzky-Golay-style smoother (quadratic
   fit over a sliding window). It is deliberately trivial — the
   point of the figure is the problem, not the method.
   ------------------------------------------------------------- */

(function () {
  const svg = document.getElementById('scope');
  if (!svg) return;

  const noisyPath = document.getElementById('trace-noisy');
  const cleanPath = document.getElementById('trace-clean');
  const slider    = document.getElementById('snr');
  const readout   = document.getElementById('snr-readout');

  const W = 1000, H = 260, MID = H / 2, N = 700;

  // Deterministic noise so the figure is stable across redraws.
  let seed = 20140901;
  function rand() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  }
  function gauss() {
    let u = 0, v = 0;
    while (u === 0) u = rand();
    while (v === 0) v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  // The underlying thing we are trying to see: two tones plus a transient.
  const truth = new Array(N);
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const tone = 34 * Math.sin(2 * Math.PI * 3 * t) + 16 * Math.sin(2 * Math.PI * 7.5 * t + 1.1);
    const burst = 52 * Math.exp(-Math.pow((t - 0.62) / 0.035, 2)) * Math.sin(2 * Math.PI * 26 * t);
    truth[i] = tone + burst;
  }

  // Fixed noise field, scaled at draw time by the chosen SNR.
  const noise = new Array(N);
  for (let i = 0; i < N; i++) noise[i] = gauss();

  // Quadratic sliding-window fit, evaluated at the window centre.
  function smooth(y, half) {
    const out = new Array(y.length);
    for (let i = 0; i < y.length; i++) {
      let n = 0, sx = 0, sx2 = 0, sx3 = 0, sx4 = 0, sy = 0, sxy = 0, sx2y = 0;
      for (let k = -half; k <= half; k++) {
        const j = i + k;
        if (j < 0 || j >= y.length) continue;
        const x = k, x2 = x * x;
        n++; sx += x; sx2 += x2; sx3 += x2 * x; sx4 += x2 * x2;
        sy += y[j]; sxy += x * y[j]; sx2y += x2 * y[j];
      }
      // Solve the 3x3 normal equations; we only need the constant term.
      const a = [[n, sx, sx2], [sx, sx2, sx3], [sx2, sx3, sx4]];
      const b = [sy, sxy, sx2y];
      const d = det3(a);
      out[i] = d === 0 ? y[i] : det3([[b[0], a[0][1], a[0][2]], [b[1], a[1][1], a[1][2]], [b[2], a[2][1], a[2][2]]]) / d;
    }
    return out;
  }

  function det3(m) {
    return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
         - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
         + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  }

  function toPath(y) {
    let d = '';
    for (let i = 0; i < y.length; i++) {
      const x = (i / (y.length - 1)) * W;
      const py = Math.max(4, Math.min(H - 4, MID - y[i]));
      d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + py.toFixed(1);
    }
    return d;
  }

  function draw() {
    const snrDb = Number(slider.value);
    // Signal power of the underlying trace, then the noise gain that hits target SNR.
    let p = 0;
    for (let i = 0; i < N; i++) p += truth[i] * truth[i];
    const sigRms = Math.sqrt(p / N);
    const noiseRms = sigRms / Math.pow(10, snrDb / 20);

    const measured = new Array(N);
    for (let i = 0; i < N; i++) measured[i] = truth[i] + noise[i] * noiseRms;

    // Widen the smoothing window as the measurement gets worse.
    const half = Math.round(4 + Math.max(0, (14 - snrDb)) * 1.6);
    const recovered = smooth(measured, half);

    noisyPath.setAttribute('d', toPath(measured));
    cleanPath.setAttribute('d', toPath(recovered));
    readout.textContent = snrDb.toFixed(0) + ' dB';
  }

  slider.addEventListener('input', draw);
  draw();
})();
