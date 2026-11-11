// =============================================================
// Dur Be Patlama! - şekil çizimleri (bombada ve yönergede aynı çizim kullanılır)
// =============================================================

const Cizim = (() => {
  // Kablo bölümündeki şekiller. Adları sadece kodda; oyuncular kendi kelimeleriyle tarif eder.
  function sekil(g, ad, x, y, r, renk = '#111') {
    g.save();
    g.translate(x, y);
    g.fillStyle = renk; g.strokeStyle = renk; g.lineWidth = r * 0.22; g.lineJoin = 'round'; g.lineCap = 'round';
    g.beginPath();
    if (ad === 'yildiz') {
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, k = i % 2 ? r * 0.45 : r; g.lineTo(Math.cos(a) * k, Math.sin(a) * k); }
      g.closePath(); g.fill();
    } else if (ad === 'hilal') {
      g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
      g.globalCompositeOperation = 'destination-out';
      g.beginPath(); g.arc(r * 0.45, -r * 0.15, r * 0.85, 0, Math.PI * 2); g.fill();
      g.globalCompositeOperation = 'source-over';
    } else if (ad === 'kalp') {
      g.moveTo(0, r * 0.9);
      g.bezierCurveTo(-r * 1.3, -r * 0.1, -r * 0.6, -r * 1.1, 0, -r * 0.35);
      g.bezierCurveTo(r * 0.6, -r * 1.1, r * 1.3, -r * 0.1, 0, r * 0.9);
      g.fill();
    } else if (ad === 'ucgen') {
      g.moveTo(0, -r); g.lineTo(r * 0.95, r * 0.75); g.lineTo(-r * 0.95, r * 0.75); g.closePath(); g.stroke();
      g.beginPath(); g.arc(0, r * 0.2, r * 0.18, 0, Math.PI * 2); g.fill();
    } else if (ad === 'arti') {
      const k = r * 0.32;
      g.rect(-k, -r, k * 2, r * 2); g.rect(-r, -k, r * 2, k * 2); g.fill();
    } else if (ad === 'elmas') {
      g.moveTo(0, -r); g.lineTo(r * 0.7, 0); g.lineTo(0, r); g.lineTo(-r * 0.7, 0); g.closePath(); g.fill();
      g.strokeStyle = '#fff'; g.lineWidth = r * 0.08; g.beginPath(); g.moveTo(-r * 0.7, 0); g.lineTo(r * 0.7, 0); g.stroke();
    } else if (ad === 'halka') {
      g.arc(0, 0, r * 0.85, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.arc(0, 0, r * 0.35, 0, Math.PI * 2); g.stroke();
    } else if (ad === 'simsek') {
      g.moveTo(r * 0.25, -r); g.lineTo(-r * 0.55, r * 0.1); g.lineTo(-r * 0.05, r * 0.1); g.lineTo(-r * 0.3, r); g.lineTo(r * 0.6, -r * 0.2); g.lineTo(r * 0.08, -r * 0.2); g.closePath(); g.fill();
    }
    g.restore();
  }
  const resimler = {};
  function sekilResim(ad) {
    if (resimler[ad]) return resimler[ad];
    const c = document.createElement('canvas'); c.width = c.height = 96;
    sekil(c.getContext('2d'), ad, 48, 48, 36, '#2a2118');
    return (resimler[ad] = c.toDataURL());
  }
  // Labirent haritası (yönergede): y0..y1 satırları çizilir. isaretOnly: sadece işaretleri göster (duvarsız).
  function labirentResim(lab, y0, y1, isaret, sadeceIsaret = false) {
    const N = 6, H = 34, KX = 26, KY = 24;
    const satir = y1 - y0 + 1;
    const c = document.createElement('canvas');
    c.width = KX + N * H + 8; c.height = KY + satir * H + 8;
    const g = c.getContext('2d');
    g.fillStyle = '#f3ead2'; g.fillRect(0, 0, c.width, c.height);
    g.font = '900 16px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#6a1a0a';
    for (let x = 0; x < N; x++) g.fillText('ABCDEF'[x], KX + x * H + H / 2, KY / 2);
    for (let y = y0; y <= y1; y++) g.fillText(String(y + 1), KX / 2, KY + (y - y0) * H + H / 2);
    // noktalar
    g.fillStyle = 'rgba(42,33,24,0.35)';
    for (let y = y0; y <= y1; y++) for (let x = 0; x < N; x++) { g.beginPath(); g.arc(KX + x * H + H / 2, KY + (y - y0) * H + H / 2, 2.5, 0, Math.PI * 2); g.fill(); }
    (isaret || []).forEach(([x, y]) => {
      if (y < y0 || y > y1) return;
      g.strokeStyle = '#1f9c45'; g.lineWidth = 3.5; g.beginPath(); g.arc(KX + x * H + H / 2, KY + (y - y0) * H + H / 2, 11, 0, Math.PI * 2); g.stroke();
    });
    g.strokeStyle = '#2a2118'; g.lineWidth = 3.5; g.lineCap = 'round';
    g.strokeRect(KX, KY, N * H, satir * H);
    if (!sadeceIsaret) {
      g.beginPath();
      for (let y = y0; y <= y1; y++) for (let x = 0; x < N; x++) {
        const px = KX + x * H, py = KY + (y - y0) * H;
        if (x < N - 1 && lab.sag[y][x]) { g.moveTo(px + H, py); g.lineTo(px + H, py + H); }
        if (y < N - 1 && lab.alt[y][x]) { g.moveTo(px, py + H); g.lineTo(px + H, py + H); }
      }
      g.stroke();
    }
    return c.toDataURL();
  }

  // Takımyıldız: 5 yıldız, kesik çizgilerle bağlı, biri daha büyük. Bombada ve yönergede aynı çizim.
  function yildizCiz(g, desen, x, y, w, h, renk = '#ffe9a0') {
    const P = desen.yild.map(([a, b]) => [x + a * w, y + b * h]);
    g.save();
    g.strokeStyle = 'rgba(170,195,255,0.6)'; g.lineWidth = Math.max(1.5, w * 0.012); g.setLineDash([w * 0.03, w * 0.022]);
    desen.cizgi.forEach(([i, j]) => { g.beginPath(); g.moveTo(P[i][0], P[i][1]); g.lineTo(P[j][0], P[j][1]); g.stroke(); });
    g.setLineDash([]);
    P.forEach(([px, py], i) => {
      const r = w * (i === desen.buyuk ? 0.05 : 0.03);
      g.fillStyle = renk; g.shadowColor = renk; g.shadowBlur = r * 1.6;
      g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.fill();
    });
    g.restore();
  }
  function yildizResim(desen) {
    const c = document.createElement('canvas'); c.width = c.height = 200;
    const g = c.getContext('2d'); g.fillStyle = '#0b1026'; g.fillRect(0, 0, 200, 200);
    yildizCiz(g, desen, 10, 10, 180, 180, '#ffe9a0');
    return c.toDataURL();
  }

  return { sekil, sekilResim, labirentResim, yildizCiz, yildizResim };
})();
