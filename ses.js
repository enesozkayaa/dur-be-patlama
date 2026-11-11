// =============================================================
// Dur Be Patlama! - ses efektleri (dosya yok, tarayıcı kendisi üretir)
// =============================================================

const Ses = (() => {
  let ctx = null, acik = true;
  try { acik = localStorage.getItem('dbp.ses') !== '0'; } catch (e) { }
  const al = () => {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
  function ton(frek, sure, tip = 'sine', ses = 0.15, gecikme = 0, kayma = 0) {
    const c = al(); if (!c || !acik) return;
    const t = c.currentTime + gecikme;
    const o = c.createOscillator(), g = c.createGain();
    o.type = tip; o.frequency.setValueAtTime(frek, t);
    if (kayma) o.frequency.exponentialRampToValueAtTime(Math.max(30, frek + kayma), t + sure);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(ses, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + sure + 0.02);
  }
  function gurultu(sure, ses = 0.5, filtre = 1200) {
    const c = al(); if (!c || !acik) return;
    const n = Math.floor(c.sampleRate * sure), buf = c.createBuffer(1, n, c.sampleRate), v = buf.getChannelData(0);
    for (let i = 0; i < n; i++) v[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = buf; f.type = 'lowpass'; f.frequency.value = filtre; g.gain.value = ses;
    s.connect(f).connect(g).connect(c.destination); s.start();
  }
  // Mekanik saat sesi: kısa, keskin bir "tık" (filtrelenmiş gürültü + metal tınısı). tak = biraz daha kalın.
  function mekanik(tak, siddet = 1) {
    const c = al(); if (!c || !acik) return;
    const t = c.currentTime;
    const n = Math.floor(c.sampleRate * 0.03), buf = c.createBuffer(1, n, c.sampleRate), v = buf.getChannelData(0);
    for (let i = 0; i < n; i++) v[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.0025));
    const s = c.createBufferSource(); s.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = tak ? 2200 : 3400; f.Q.value = 6;
    const g = c.createGain(); g.gain.value = 0.9 * siddet;
    s.connect(f).connect(g).connect(c.destination); s.start(t);
    // metal gövdenin kısa tınısı
    const o = c.createOscillator(), og = c.createGain();
    o.type = 'sine'; o.frequency.value = tak ? 1250 : 1850;
    og.gain.setValueAtTime(0.05 * siddet, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    o.connect(og).connect(c.destination); o.start(t); o.stop(t + 0.06);
  }
  function konus(metin) {
    try {
      if (!acik || !window.speechSynthesis) return;
      const u = new SpeechSynthesisUtterance(metin);
      u.lang = 'tr-TR'; u.rate = 1.05; u.pitch = 0.8; u.volume = 1;
      const trSes = speechSynthesis.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith('tr'));
      if (trSes) u.voice = trSes;
      speechSynthesis.speak(u);
    } catch (e) { /* konuşma yoksa sadece alarm çalar */ }
  }
  return {
    ac: al,
    acikMi: () => acik,
    ayarla: a => { acik = a; try { localStorage.setItem('dbp.ses', a ? '1' : '0'); } catch (e) { } if (!a && window.speechSynthesis) speechSynthesis.cancel(); },
    saat: (tak, siddet) => mekanik(tak, siddet),
    alarm: () => { for (let i = 0; i < 3; i++) { ton(988, 0.16, 'square', 0.12, i * 0.32); ton(740, 0.16, 'square', 0.12, i * 0.32 + 0.16); } },
    konus,
    tik: () => ton(1800, 0.03, 'square', 0.04),
    tak: () => ton(1100, 0.04, 'square', 0.05),
    bip: () => ton(880, 0.12, 'square', 0.08),
    tus: () => ton(600, 0.06, 'triangle', 0.12),
    kes: () => { gurultu(0.08, 0.4, 5000); ton(300, 0.08, 'sawtooth', 0.08, 0, -200); },
    dogru: () => { ton(660, 0.12, 'sine', 0.14); ton(990, 0.2, 'sine', 0.14, 0.1); },
    hata: () => { ton(140, 0.45, 'sawtooth', 0.2); ton(147, 0.45, 'sawtooth', 0.15); },
    kilitAcik: () => { ton(500, 0.07, 'square', 0.1); ton(750, 0.07, 'square', 0.1, 0.08); ton(1000, 0.15, 'square', 0.1, 0.16); },
    patlama: () => { gurultu(1.8, 1.2, 700); ton(70, 1.2, 'sine', 0.5, 0, -40); },
    basari: () => [523, 659, 784, 1047].forEach((f, i) => ton(f, 0.25, 'triangle', 0.15, i * 0.12)),
  };
})();
