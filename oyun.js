// =============================================================
// Dur Be Patlama! - oyunun akışı (ekranlar, lobi, süre, hamleler, sonuç)
// =============================================================

(() => {
  const $ = id => document.getElementById(id);
  const guvenli = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const SECENEK = {
    sure: [[180, '3 dk'], [300, '5 dk'], [420, '7 dk'], [600, '10 dk'], [900, '15 dk'], [1200, '20 dk'], [1500, '25 dk']],
    bolum: [[4, '4'], [5, '5'], [6, '6'], [8, '8'], [10, '10'], [12, '12']],
    hata: [[0, 'Yok'], [1, '1'], [2, '2'], [3, '3']],
  };
  let ayar = { sure: 300, bolum: 6, hata: 2 };
  try { Object.assign(ayar, JSON.parse(localStorage.getItem('dbp.ayar')) || {}); } catch (e) { /* varsayılan */ }
  let oyun = null;

  Sahne.kur($('sahne'));
  try { $('adim').value = localStorage.getItem('dbp.ad') || ''; } catch (e) { /* */ }

  function goster(ekran) {
    ['giris', 'lobi', 'oyun', 'sonuc'].forEach(e => { $(e).hidden = e !== ekran && !(ekran === 'sonuc' && e === 'oyun'); });
  }
  let duyuruZaman = null;
  function duyuru(yazi, sinif = '', sure = 2600) {
    const d = $('duyuru');
    d.innerHTML = yazi; d.className = `duyuru ${sinif}`; d.hidden = false;
    clearTimeout(duyuruZaman);
    duyuruZaman = setTimeout(() => { d.hidden = true; }, sure);
  }
  const adAl = () => {
    const ad = $('adim').value.trim();
    if (!ad) { $('girisDurum').textContent = 'Önce adını yaz.'; $('adim').focus(); return null; }
    try { localStorage.setItem('dbp.ad', ad); } catch (e) { /* */ }
    return ad;
  };
  const adi = id => guvenli(Ag.oyuncular.find(o => o.id === id)?.ad ?? oyun?.adlar?.[id] ?? '?');

  // ---------- Giriş ----------
  $('odaKurBtn').onclick = () => { const ad = adAl(); if (!ad) return; Ses.ac(); $('girisDurum').textContent = '⏳ Oda açılıyor…'; Ag.odaAc(ad); };
  $('katilBtn').onclick = () => {
    const ad = adAl(); if (!ad) return;
    const kod = $('odaKoduGir').value.trim();
    if (kod.length !== 5) { $('girisDurum').textContent = 'Oda kodu 5 karakter.'; return; }
    Ses.ac(); $('girisDurum').textContent = '⏳ Odaya bağlanılıyor…'; Ag.katil(kod, ad);
  };
  $('odaKoduGir').addEventListener('keydown', e => { if (e.key === 'Enter') $('katilBtn').click(); });

  Ag.on('hata', yazi => { $('girisDurum').textContent = '❌ ' + yazi; $('lobiDurum').textContent = '❌ ' + yazi; if (!Ag.bagli) goster('giris'); });
  Ag.on('oda', ({ kod }) => { $('odaKodu').textContent = kod; $('girisDurum').textContent = ''; goster('lobi'); lobiCiz(); });
  Ag.on('evKoptu', () => {
    oyun = null; Sahne.temizle(); goster('giris');
    $('girisDurum').textContent = '❌ Oda sahibiyle bağlantı koptu.';
  });
  Ag.on('katildi', () => Ag.yayinla({ tip: 'ayar', ayar }));
  Ag.on('oyuncular', () => {
    if (!oyun) lobiCiz();
    else rolCiz();
  });
  Ag.on('koptu', o => {
    if (!oyun || oyun.bitti) return;
    duyuru(`📴 ${guvenli(o.ad)} oyundan düştü!`, 'kotu', 4000);
    // Bombacı düşerse oyun biter
    if (Ag.evMi && o.id === oyun.bombaci) Ag.yayinla({ tip: 'son', sonuc: 'patladi', neden: 'koptu' });
  });
  Ag.kabulKurali(() => !oyun || oyun.bitti);

  // Ses: oyunda sadece zincirdeki komşular, onun dışında herkes
  Ag.duyulacaklariBelirle(() => {
    const ben = Ag.benimId;
    if (!oyun || oyun.bitti) return new Set(Ag.oyuncular.map(o => o.id).filter(id => id !== ben));
    const i = oyun.sira.indexOf(ben);
    return new Set([oyun.sira[i - 1], oyun.sira[i + 1]].filter(Boolean));
  });

  // ---------- Lobi ----------
  function lobiCiz() {
    const liste = Ag.oyuncular, ev = Ag.evMi, ben = Ag.benimId;
    $('zincir').innerHTML = liste.map((o, i) => {
      const bombaci = i === liste.length - 1 && liste.length > 1;
      return `<li class="${o.id === ben ? 'ben' : ''} ${bombaci ? 'bombaci' : ''}">
        <span class="no">${i + 1}</span>
        <span class="ad">${guvenli(o.ad)}${o.id === ben ? ' (sen)' : ''}<br><span class="gorev">${liste.length < 2 ? 'Arkadaşların bekleniyor…' : bombaci ? '💣 Bombacı: bombayı çözer' : '🧭 Yönlendirici: çantadaki yönergeleri okur'}</span></span>
        <span class="mik" title="Mikrofon">${o.ses ? '🎙️' : '🔇'}</span>
        ${ev ? `<span class="oklar"><button data-yukari="${i}" ${i === 0 ? 'disabled' : ''}>▲</button><button data-asagi="${i}" ${i === liste.length - 1 ? 'disabled' : ''}>▼</button></span>` : ''}
      </li>`;
    }).join('');
    $('sahipAraclar').hidden = !ev;
    Object.entries(SECENEK).forEach(([k, sec]) => {
      const kutu = document.querySelector(`.secenek[data-ayar="${k}"]`);
      kutu.classList.toggle('kilitli', !ev);
      kutu.innerHTML = sec.map(([v, ad]) => `<button data-k="${k}" data-v="${v}" class="${ayar[k] === v ? 'secili' : ''}" ${ev ? '' : 'disabled'}>${ad}</button>`).join('');
    });
    $('baslatBtn').hidden = !ev;
    $('baslatBtn').disabled = liste.length < 2;
    const bana = Ag.sesAcik ? '' : '🎤 Mikrofonunu aç, yoksa kimseyi duyamazsın! ';
    $('lobiDurum').textContent = bana + (ev ? (liste.length < 2 ? 'En az 2 kişi gerekli.' : 'Hazır olunca Başlat’a bas.') : 'Oda sahibi başlatınca oyun açılır.');
    sesDugmeleri();
  }
  $('zincir').onclick = e => {
    const b = e.target.closest('button'); if (!b || !Ag.evMi) return;
    const ids = Ag.oyuncular.map(o => o.id);
    const i = +(b.dataset.yukari ?? b.dataset.asagi), j = b.dataset.yukari !== undefined ? i - 1 : i + 1;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    Ag.siraDegistir(ids);
  };
  $('karistirBtn').onclick = () => {
    const ids = Ag.oyuncular.map(o => o.id);
    for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
    Ag.siraDegistir(ids);
  };
  const kaydir = () => { const ids = Ag.oyuncular.map(o => o.id); ids.push(ids.shift()); Ag.siraDegistir(ids); };
  $('kaydirBtn').onclick = kaydir;
  $('ayarlar').onclick = e => {
    const b = e.target.closest('button[data-k]'); if (!b || !Ag.evMi) return;
    ayar[b.dataset.k] = +b.dataset.v;
    try { localStorage.setItem('dbp.ayar', JSON.stringify(ayar)); } catch (er) { /* */ }
    Ag.yayinla({ tip: 'ayar', ayar });
  };
  $('cikBtn').onclick = () => { Ag.kapat(); oyun = null; Sahne.temizle(); goster('giris'); };

  // Mikrofon
  async function sesDegistir() {
    Ses.ac();
    if (Ag.sesAcik) { Ag.sesKapat(); }
    else if (!(await Ag.sesAc())) { duyuru('🎤 Mikrofona izin verilmedi. Tarayıcı ayarlarından izin ver.', 'kotu', 4000); $('lobiDurum').textContent = '🎤 Mikrofona izin verilmedi.'; }
    sesDugmeleri();
    if (!oyun) lobiCiz();
  }
  function sesDugmeleri() {
    const a = Ag.sesAcik;
    $('lobiSesBtn').classList.toggle('acik', a); $('lobiSesBtn').textContent = a ? '🎙️ Mikrofon açık' : '🎤 Mikrofonu aç';
    $('oyunSesBtn').classList.toggle('acik', a); $('oyunSesBtn').textContent = a ? '🎙️' : '🎤';
  }
  $('lobiSesBtn').onclick = sesDegistir;
  $('oyunSesBtn').onclick = sesDegistir;
  // Bomba / oyun sesleri aç-kapat (sesli sohbet etkilenmez)
  const efektCiz = () => { const a = Ses.acikMi(); $('efektBtn').textContent = a ? '🔊' : '🔇'; $('efektBtn').style.opacity = a ? 1 : 0.6; };
  $('efektBtn').onclick = () => { Ses.ayarla(!Ses.acikMi()); efektCiz(); };
  efektCiz();

  // ---------- Başlat ----------
  $('baslatBtn').onclick = () => baslat();
  function baslat() {
    if (!Ag.evMi || Ag.oyuncular.length < 2) return;
    const sira = Ag.oyuncular.map(o => o.id);
    const adlar = Object.fromEntries(Ag.oyuncular.map(o => [o.id, o.ad]));
    Ag.yayinla({ tip: 'basla', tohum: Math.floor(Math.random() * 2 ** 31), ayar: { ...ayar }, sira, adlar });
  }

  // ---------- Mesajlar ----------
  Ag.on('mesaj', m => {
    if (m.tip === 'ayar') { ayar = { ...ayar, ...m.ayar }; if (!oyun) lobiCiz(); }
    else if (m.tip === 'basla') oyunKur(m);
    else if (m.tip === 'sonuc' && oyun) sonucIsle(m.r);
    else if (m.tip === 'saat' && oyun && !oyun.bitti && !Ag.evMi) {
      const yeni = performance.now() + m.kalan * 1000;
      if (Math.abs(yeni - oyun.bitis) > 400) oyun.bitis = yeni;
    } else if (m.tip === 'son' && oyun) bitir(m.sonuc, m.neden);
    else if (m.tip === 'lobi') { oyun = null; Sahne.temizle(); goster('lobi'); lobiCiz(); Ag.sesGuncelle(); }
  });
  Ag.on('evMesaj', (m, id) => {
    if (m.tip !== 'hamle' || !oyun || oyun.bitti || id !== oyun.bombaci) return;
    const r = Motor.hamle(oyun.d, m.e, kalanSn());
    if (r.tip === 'yok') return;
    Ag.yayinla({ tip: 'sonuc', r });
    if (r.bitti) Ag.yayinla({ tip: 'son', sonuc: r.sonuc });
  });

  // ---------- Oyun ----------
  const kalanSn = () => (!oyun ? 0 : oyun.bitti ? oyun.donmus : Math.max(0, (oyun.bitis - performance.now()) / 1000));
  const saatYazi = () => Motor.sayacYazi(kalanSn());

  function oyunKur(m) {
    const d = Motor.yeni(m.tohum, m.ayar, m.sira.length);
    const benimSira = m.sira.indexOf(Ag.benimId);
    if (benimSira < 0) return;
    oyun = {
      d, sira: m.sira, adlar: m.adlar, benimSira, bombaci: m.sira[m.sira.length - 1], benBombaci: benimSira === m.sira.length - 1,
      bitis: performance.now() + m.ayar.sure * 1000, bitti: false, donmus: 0, tikZaman: performance.now() + 1000, tak: false,
      uyarilar: new Set(), cantaAcik: false,
    };
    goster('oyun');
    $('sonuc').hidden = true;
    $('canta').hidden = true; $('kilit').hidden = true; $('yonergeBtn').hidden = true; $('cevirBtn').hidden = true; $('geriBtn').hidden = true;
    hatalarCiz(); ilerlemeCiz(); rolCiz();
    if (oyun.benBombaci) {
      Sahne.bombaKur(d, { olay: sahneOlayi, saatYazi });
      $('cevirBtn').hidden = d.bolumler.length <= 6;
      duyuru('💣 Bombacısın! Bir bölüme dokun, yakından bak. Ne gördüğünü yanındakine anlat.', '', 5000);
    } else {
      const c = d.cantalar[benimSira];
      Sahne.cantaKur({ sol: c.sol, sag: c.sag, seriYer: c.seriYer, sira: benimSira + 1 }, { olay: () => {}, saatYazi });
      kilitKur();
      duyuru('🧳 Çantan kilitli! Çantayı sürükleyip çevir, kodu bul. Bir rakamı bombada!', '', 5500);
    }
    Ag.sesGuncelle();
    sesDugmeleri();
  }

  function rolCiz() {
    if (!oyun) return;
    const i = oyun.benimSira, komsu = [oyun.sira[i - 1], oyun.sira[i + 1]].filter(Boolean);
    const duy = komsu.map(id => `<b>${adi(id)}</b> (${oyun.sira.indexOf(id) + 1}${id === oyun.bombaci ? ' 💣' : ''})`).join(' ve ');
    const sayfa = oyun.benBombaci ? '' : ` · Çantanda <b>${Motor.sayfalar(oyun.d, i).length}</b> sayfa`;
    $('rol').innerHTML = `${oyun.benBombaci ? '💣 <b>Bombacısın</b>' : `🧭 <b>${i + 1}. halka</b>`} · 🔊 Duyduğun: ${duy || '-'}${sayfa}`;
  }
  function hatalarCiz() {
    if (!oyun) return;
    const n = oyun.d.ayar.hata;
    $('hatalar').innerHTML = n ? Array.from({ length: n }, (_, k) => `<i class="${k < oyun.d.hatalar ? 'dolu' : ''}"></i>`).join('') : '<small style="color:#ff9a8a">Hata hakkı yok!</small>';
  }
  function ilerlemeCiz(flasIndex = -1) {
    if (!oyun) return;
    $('ilerleme').innerHTML = oyun.d.bolumler.map((b, k) => `<div class="seg ${b.cozuldu ? 'tamam' : ''} ${k === flasIndex ? 'flas' : ''}" title="${Motor.TUR_AD[b.tur]}"><span>${b.no}</span>${Motor.TUR_IKON[b.tur]}</div>`).join('');
    $('ilerleme').hidden = false;
  }

  // Bombacının sahnesinden gelenler
  function sahneOlayi(o) {
    if (!oyun) return;
    if (o.tip === 'yakin') $('geriBtn').hidden = o.bolum === null;
    if (o.tip === 'hamle' && !oyun.bitti) Ag.eveGonder({ tip: 'hamle', e: o.e });
  }
  $('geriBtn').onclick = () => Sahne.bakisGenel();
  $('cevirBtn').onclick = () => Sahne.cevir();

  // Oda sahibinin kararı herkese gelir
  function sonucIsle(r) {
    const d = oyun.d, b = d.bolumler[r.bolum];
    if (!Ag.evMi && b) {
      if (Array.isArray(r.ilerleme)) b.ilerleme = r.ilerleme;
      if (r.tip === 'dogru') b.cozuldu = true;
      if (typeof r.hatalar === 'number') d.hatalar = r.hatalar;
    }
    if (oyun.benBombaci) { Sahne.bolumDurumu(r.bolum, r); Sahne.hatalariCiz(d.hatalar); }
    if (r.tip === 'dogru') {
      Ses.dogru();
      duyuru(`✅ ${b.no}. bölüm çözüldü!`, 'iyi');
      ilerlemeCiz();
      if (oyun.benBombaci && !r.bitti) setTimeout(() => { if (oyun && !oyun.bitti) Sahne.bakisGenel(); }, 700);
    } else if (r.tip === 'hata') {
      Ses.hata();
      const n = d.ayar.hata;
      duyuru(`❌ HATA! ${b.no}. bölüm${n ? ` · ${Math.min(r.hatalar, n)}/${n}` : ''}`, 'kotu');
      ilerlemeCiz(r.bolum);
      hatalarCiz();
      document.body.classList.remove('kirmizi'); void document.body.offsetWidth; document.body.classList.add('kirmizi');
    } else if (r.tip === 'ilerle' && oyun.benBombaci) Ses.bip();
  }

  // ---------- Süre, tik-tak, uyarılar ----------
  let saatYayin = 0;
  setInterval(() => {
    if (!oyun) return;
    const k = kalanSn();
    $('saat').textContent = Motor.sayacYazi(k);
    $('saat').classList.toggle('son', !oyun.bitti && k <= 10);
    if (oyun.bitti) return;
    // Tik-tak: 30 sn'ye kadar saniyede bir, sonra yarım saniye, son 10 sn çeyrek saniye
    const simdi = performance.now();
    if (simdi >= oyun.tikZaman) {
      oyun.tak = !oyun.tak;
      Ses.saat(oyun.tak, k <= 10 ? 1.4 : k <= 30 ? 1.15 : 0.9);
      oyun.tikZaman = Math.max(simdi, oyun.tikZaman) + (k <= 10 ? 250 : k <= 30 ? 500 : 1000);
    }
    const uyar = (esik, soz, yazi) => {
      if (k > esik || oyun.uyarilar.has(esik) || oyun.d.ayar.sure <= esik) return;
      oyun.uyarilar.add(esik);
      Ses.alarm(); setTimeout(() => Ses.konus(soz), 900);
      duyuru(yazi, 'kotu', 3500);
    };
    uyar(60, 'Son bir dakika!', '⏰ SON 1 DAKİKA!');
    uyar(30, 'Son otuz saniye!', '⏰ SON 30 SANİYE! Hızlanın!');
    uyar(10, 'On saniye!', '🔥 SON 10 SANİYE!');
    if (Ag.evMi) {
      if (simdi - saatYayin > 2000) { saatYayin = simdi; Ag.yayinla({ tip: 'saat', kalan: k }); }
      if (k <= 0) { Motor.sureBitti(oyun.d); Ag.yayinla({ tip: 'son', sonuc: 'patladi', neden: 'sure' }); }
    }
  }, 50);

  // ---------- Kilitli çanta ----------
  function kilitKur() {
    const rakam = [0, 0, 0, 0];
    const k = $('kilit');
    k.className = 'kilit';
    k.innerHTML = `<div class="ipucu">🔒 Çantayı sürükleyip çevir: kodun parçaları <b>yanlarında</b> ve <b>altında</b> yazıyor.</div>
      <div class="rakamlar">${rakam.map((_, i) => `<div class="rakam"><button data-r="${i}" data-y="1">▲</button><span id="rk${i}">0</span><button data-r="${i}" data-y="-1">▼</button></div>`).join('')}</div>
      <button id="kilitAcBtn" class="ana">🔓 Aç</button>`;
    k.hidden = false;
    k.onclick = e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.id === 'kilitAcBtn') {
        if (rakam.join('') === oyun.d.cantalar[oyun.benimSira].kod) {
          Ses.kilitAcik(); Sahne.cantaAc(); k.hidden = true; oyun.cantaAcik = true;
          duyuru('🔓 Çanta açıldı!', 'iyi');
          setTimeout(() => { if (oyun && !oyun.bitti) cantaGoster(); }, 1300);
        } else {
          Ses.hata(); k.classList.remove('salla'); void k.offsetWidth; k.classList.add('salla');
        }
        return;
      }
      const i = +b.dataset.r;
      rakam[i] = (rakam[i] + +b.dataset.y + 10) % 10;
      $(`rk${i}`).textContent = rakam[i];
      Ses.tak();
    };
  }
  let seciliSayfa = 0;
  function cantaGoster() {
    const sayfalar = Motor.sayfalar(oyun.d, oyun.benimSira);
    seciliSayfa = Math.min(seciliSayfa, sayfalar.length - 1);
    $('sekmeler').innerHTML = sayfalar.map((s, i) => { const b = oyun.d.bolumler[s.bolum]; return `<button data-s="${i}" class="${i === seciliSayfa ? 'secili' : ''}">${Motor.TUR_IKON[b.tur]} ${b.no}. bölüm · ${s.adim + 1}. adım</button>`; }).join('');
    const s = sayfalar[seciliSayfa];
    $('sayfa').innerHTML = s ? Kilavuz.sayfaHtml(oyun.d, s.bolum, s.adim) : '<p>Çantan boş.</p>';
    $('sayfa').scrollTop = 0;
    $('canta').hidden = false; $('yonergeBtn').hidden = true;
  }
  $('sekmeler').onclick = e => { const b = e.target.closest('button[data-s]'); if (!b) return; seciliSayfa = +b.dataset.s; Ses.tak(); cantaGoster(); };
  $('cantaKapatBtn').onclick = () => { $('canta').hidden = true; $('yonergeBtn').hidden = false; };
  $('yonergeBtn').onclick = () => cantaGoster();

  // ---------- Bitiş ----------
  function bitir(sonuc, neden) {
    if (oyun.sonucGeldi) return;
    oyun.sonucGeldi = true;
    oyun.donmus = kalanSn();
    oyun.bitti = true;
    oyun.d.bitti = true; oyun.d.sonuc = sonuc;
    $('kilit').hidden = true; $('canta').hidden = true; $('yonergeBtn').hidden = true; $('cevirBtn').hidden = true; $('geriBtn').hidden = true;
    if (sonuc === 'patladi') {
      Ses.patlama(); Sahne.patla();
      document.body.classList.remove('patlama'); void document.body.offsetWidth; document.body.classList.add('patlama');
    } else { Ses.basari(); Sahne.cozuldu(); }
    Ag.sesGuncelle();   // oyun bitti: artık herkes herkesi duyar
    setTimeout(() => sonucGoster(sonuc, neden), sonuc === 'patladi' ? 2600 : 1600);
  }
  function sonucGoster(sonuc, neden) {
    if (!oyun) return;
    const d = oyun.d;
    $('sonucBaslik').textContent = sonuc === 'patladi' ? '💥 BUM!' : '🎉 Bomba çözüldü!';
    const cozulen = d.bolumler.filter(b => b.cozuldu).length;
    $('sonucYazi').innerHTML = sonuc === 'patladi'
      ? `${neden === 'sure' ? 'Süre bitti.' : neden === 'koptu' ? 'Bombacı oyundan düştü.' : 'Hata hakkı doldu.'} ${cozulen}/${d.bolumler.length} bölüm çözülmüştü.`
      : `Kalan süre <b>${Motor.sayacYazi(oyun.donmus)}</b> · ${d.hatalar} hata`;
    $('sonucListe').innerHTML = oyun.sira.map((id, i) => {
      if (id === oyun.bombaci) return `<div>💣 <b>${adi(id)}</b> bombacıydı.</div>`;
      const s = Motor.sayfalar(d, i).map(x => `${d.bolumler[x.bolum].no}.${x.adim + 1}`).join(', ');
      return `<div>🧭 <b>${i + 1}. ${adi(id)}</b> · çanta kodu ${d.cantalar[i].kod} · sayfalar: ${s}</div>`;
    }).join('');
    $('tekrarBtn').hidden = !Ag.evMi; $('lobiyeBtn').hidden = !Ag.evMi;
    if (!Ag.evMi) $('sonucListe').insertAdjacentHTML('beforeend', '<div>⏳ Oda sahibi yeni oyunu başlatacak…</div>');
    $('sonuc').hidden = false;
  }
  $('tekrarBtn').onclick = () => { if (!Ag.evMi) return; kaydir(); setTimeout(baslat, 150); };
  $('lobiyeBtn').onclick = () => { if (Ag.evMi) Ag.yayinla({ tip: 'lobi' }); };

  // Test için (tarayıcıda durumu görmek)
  window.__dbp = { get oyun() { return oyun; }, kalanSn };
})();
