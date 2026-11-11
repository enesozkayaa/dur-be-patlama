// =============================================================
// Dur Be Patlama! - kurallar (ekran yok, sadece hesap; tarayıcıda ve Node'da çalışır)
//
// Zincir: oyuncular sıraya dizilir (1 → 2 → 3 → 4). Sonuncu bombayı görür ve çözer, diğerleri
// "yönlendirici"dir: bombayı göremez, çantadaki yönerge sayfalarını görür.
// Her bölümün (modülün) çözümü 3 adımlık bir zincirdir. Örnek (kablolar):
//   Adım 1: sembol → harf   Adım 2: harf + kablo sayısı → renk   Adım 3: renk → hangi kablo
// Adımlar yönlendiricilere karışık dağıtılır (2 kişide hepsi tek kişide). Tablolar her oyunda
// tohumdan yeniden üretilir: herkes aynı tohumla aynı bombayı ve aynı yönergeyi kurar.
// =============================================================

const Motor = (() => {
  // ---------- Rastgele (tohumlu) ----------
  function tohumlu(t) {
    return () => { t |= 0; t = (t + 0x6D2B79F5) | 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
  }
  const sec = (rnd, dizi) => dizi[Math.floor(rnd() * dizi.length)];
  const karistir = (rnd, dizi) => { const d = [...dizi]; for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; } return d; };
  const aralik = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

  // ---------- Sabitler ----------
  const RENKLER = {
    kirmizi: { ad: 'Kırmızı', hex: '#e23434' }, mavi: { ad: 'Mavi', hex: '#2f6fe8' }, sari: { ad: 'Sarı', hex: '#f2c21a' },
    beyaz: { ad: 'Beyaz', hex: '#f1f1f1' }, siyah: { ad: 'Siyah', hex: '#262626' }, yesil: { ad: 'Yeşil', hex: '#2bb34a' },
    mor: { ad: 'Mor', hex: '#9b4dff' }, turuncu: { ad: 'Turuncu', hex: '#ff8a1e' },
  };
  const KABLO_RENK = ['kirmizi', 'mavi', 'sari', 'beyaz', 'siyah', 'yesil'];
  const SEKILLER = ['yildiz', 'hilal', 'kalp', 'ucgen', 'arti', 'elmas', 'halka', 'simsek'];   // kablo bölümündeki çizimler
  const HARFLER = ['A', 'B', 'C', 'D', 'E', 'F'];
  const DUGME_RENK = ['kirmizi', 'mavi', 'sari', 'beyaz'];
  const DUGME_YAZI = ['BAS', 'TUT', 'DUR', 'PATLA', 'İPTAL', 'BEKLE'];
  const SERIT_RENK = ['mavi', 'beyaz', 'sari', 'kirmizi', 'yesil'];
  // Tuş bölümündeki işaretler: tarif etmesi zor Kiril harfleri
  const ISARETLER = ['Ж', 'Ѯ', 'Ѱ', 'Ҩ', 'Ӭ', 'Ѭ', 'Ҧ', 'Ӂ', 'Ѣ', 'Ҕ', 'Ѧ', 'Ӄ'];
  const TUS_ISIK = ['yesil', 'mor', 'turuncu'];
  const SIRALAMA = {
    artan: 'Sayıları <b>küçükten büyüğe</b> doğru bas.',
    azalan: 'Sayıları <b>büyükten küçüğe</b> doğru bas.',
    tekCift: 'Önce <b>tek</b> sayıları küçükten büyüğe, sonra <b>çift</b> sayıları küçükten büyüğe bas.',
  };
  const KELIMELER = ['ELMA', 'KAPI', 'MASA', 'KEDİ', 'KAYA', 'KUZU', 'BOYA', 'CEZA', 'DOLU', 'DERE', 'FİLE', 'GECE', 'HALI', 'İNCİ', 'KASA', 'KUTU',
    'LALE', 'MAMA', 'NANE', 'OYUN', 'PERİ', 'SIRA', 'ŞAKA', 'TOKA', 'UZAY', 'VAZO', 'YAKA', 'ZEKA', 'ARKA', 'BALE', 'SOBA', 'TAVA'];
  const ALFABE = 'ABCÇDEFGHIİKLMNOÖPRSŞTUÜVYZ';
  const CARK_LAMBA = ['kirmizi', 'mavi', 'yesil', 'sari'];
  const TURLER = ['kablo', 'dugme', 'tus', 'cark', 'labirent', 'kelime', 'demet', 'salter', 'kadran', 'fener'];
  const TUR_AD = { kablo: 'Kablolar', dugme: 'Büyük Düğme', tus: 'Tuş Takımı', cark: 'Şifre Çarkı', labirent: 'Labirent', kelime: 'Renkli Kelimeler', demet: 'Kablo Demeti', salter: 'Şalterler', kadran: 'Kadran', fener: 'Yanıp Sönen Fener' };
  const TUR_IKON = { kablo: '🔌', dugme: '🔴', tus: '🔣', cark: '🔐', labirent: '🌀', kelime: '🎨', demet: '🧶', salter: '🎚️', kadran: '🧭', fener: '💡' };
  // Şalterler
  const PANEL_HARF = ['P', 'R', 'S', 'T', 'U', 'V'];
  const SALTER_DONUSUM = { ayni: 'Dizilimi <b>olduğu gibi</b> yap.', ters: 'Dizilimi <b>tersine çevir</b>: yukarılar aşağı, aşağılar yukarı.', ayna: 'Dizilimi <b>aynala</b>: soldan sağa değil, sağdan sola uygula.' };
  // Kadran
  const KADRAN_KELIME = ['NOVA', 'ARES', 'ZEFİR', 'KUTUP', 'ORKA', 'TAYFUN', 'LAV', 'BUZUL'];
  const KADRAN_CERCEVE = ['kirmizi', 'mavi', 'yesil', 'sari'];
  const KADRAN_HARF = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  // Fener
  const FENER_CAM = ['kirmizi', 'mavi', 'yesil', 'sari', 'beyaz'];
  // Labirent: 6×6, sütunlar A-F, satırlar 1-6
  const LAB_N = 6, SUTUN_AD = 'ABCDEF';
  // Renkli kelimeler
  const KELIME_RENK = ['kirmizi', 'mavi', 'yesil', 'sari', 'beyaz', 'mor'];
  const RENK_KELIME = r => RENKLER[r].ad.toLocaleUpperCase('tr');
  const KARISIK = ['TAMAM', 'YEŞİL', 'KIRMIZI', 'MAVİ', 'SARI', 'MOR', 'BEYAZ', 'BOŞ', 'HİÇ', 'RENK', 'BASMA', 'BU'];
  const KONUM = ['sol üst', 'sağ üst', 'sol alt', 'sağ alt'];

  // ---------- Bölüm üreticileri ----------
  // Her üretici: { tur, gorunum (bombada görünen), tablolar [adım1, adım2, adım3], cevap }
  function kabloYap(rnd) {
    const harfTablo = Object.fromEntries(SEKILLER.map(s => [s, sec(rnd, HARFLER)]));
    const renkTablo = Object.fromEntries(HARFLER.map(h => [h, Object.fromEntries(aralik(3, 6).map(n => [n, sec(rnd, KABLO_RENK)]))]));
    const kuralTablo = Object.fromEntries(KABLO_RENK.map(r => [r, { hangi: sec(rnd, ['ilk', 'son', 'ikinci']), yoksa: sec(rnd, [1, 2, 3]) }]));
    const sayi = 3 + Math.floor(rnd() * 4);
    const kablolar = Array.from({ length: sayi }, () => sec(rnd, KABLO_RENK));
    const sekil = sec(rnd, SEKILLER);
    const harf = harfTablo[sekil], renk = renkTablo[harf][sayi], kural = kuralTablo[renk];
    const yerler = kablolar.map((k, i) => (k === renk ? i : -1)).filter(i => i >= 0);
    let cevap;
    if (!yerler.length) cevap = kural.yoksa - 1;
    else if (kural.hangi === 'ilk') cevap = yerler[0];
    else if (kural.hangi === 'son') cevap = yerler[yerler.length - 1];
    else cevap = yerler[1] ?? yerler[0];
    return { tur: 'kablo', gorunum: { sekil, kablolar }, tablolar: [harfTablo, renkTablo, kuralTablo], cevap, ara: { harf, renk } };
  }

  function dugmeYap(rnd) {
    const sayiTablo = Object.fromEntries(DUGME_YAZI.map(y => [y, 1 + Math.floor(rnd() * 9)]));
    const eylemTablo = Object.fromEntries(DUGME_RENK.map(r => [r, Object.fromEntries(aralik(1, 9).map(n => [n, rnd() < 0.55 ? 'tut' : 'kisa']))]));
    const rakamTablo = Object.fromEntries(SERIT_RENK.map(r => [r, Math.floor(rnd() * 10)]));
    const renk = sec(rnd, DUGME_RENK), yazi = sec(rnd, DUGME_YAZI), serit = sec(rnd, SERIT_RENK);
    const sayi = sayiTablo[yazi], eylem = eylemTablo[renk][sayi];
    return { tur: 'dugme', gorunum: { renk, yazi, serit }, tablolar: [sayiTablo, eylemTablo, rakamTablo], cevap: { eylem, rakam: rakamTablo[serit] }, ara: { sayi } };
  }

  function tusYap(rnd) {
    const harfler = karistir(rnd, 'ABCDEFGHJKLM'.split(''));
    const harfTablo = Object.fromEntries(ISARETLER.map((s, i) => [s, harfler[i]]));
    const sayilar = karistir(rnd, aralik(1, 40)).slice(0, 12);
    const sayiTablo = Object.fromEntries(harfler.map((h, i) => [h, sayilar[i]]));
    const kuralTablo = Object.fromEntries(TUS_ISIK.map(r => [r, sec(rnd, Object.keys(SIRALAMA))]));
    // Her ışık rengi farklı kural olsun diye en az iki farklı kural
    if (new Set(Object.values(kuralTablo)).size === 1) kuralTablo[TUS_ISIK[0]] = kuralTablo[TUS_ISIK[0]] === 'artan' ? 'azalan' : 'artan';
    const tuslar = karistir(rnd, ISARETLER).slice(0, 4);
    const isik = sec(rnd, TUS_ISIK);
    const deger = s => sayiTablo[harfTablo[s]];
    const kural = kuralTablo[isik];
    let sira = [...tuslar].sort((a, b) => deger(a) - deger(b));
    if (kural === 'azalan') sira.reverse();
    if (kural === 'tekCift') sira = [...sira.filter(s => deger(s) % 2), ...sira.filter(s => deger(s) % 2 === 0)];
    return { tur: 'tus', gorunum: { tuslar, isik }, tablolar: [harfTablo, sayiTablo, kuralTablo], cevap: sira.map(s => tuslar.indexOf(s)) };
  }

  function carkYap(rnd) {
    const listeler = [];
    const k = karistir(rnd, KELIMELER);
    for (let i = 0; i < 4; i++) listeler.push(k.slice(i * 8, i * 8 + 8));
    // Lamba rengi → liste: her renge farklı liste
    const lambaTablo = {};
    const listeSira = karistir(rnd, [1, 2, 3, 4]);
    CARK_LAMBA.forEach((r, i) => { lambaTablo[r] = listeSira[i]; });
    const yonTablo = Object.fromEntries(aralik(1, 9).map(n => [n, rnd() < 0.5 ? 'duz' : 'ters']));
    const lamba = sec(rnd, CARK_LAMBA), ekran = 1 + Math.floor(rnd() * 9);
    const liste = listeler[lambaTablo[lamba] - 1], yon = yonTablo[ekran];
    const kelime = sec(rnd, liste);
    const hedef = yon === 'ters' ? [...kelime].reverse().join('') : kelime;
    const harfler = [...hedef];
    // Çarklar: her sütunda hedef harf + 4 başka harf; listedeki başka hiçbir kelime (aynı yönde) kurulamasın
    let carklar;
    for (let deneme = 0; deneme < 200; deneme++) {
      carklar = harfler.map(h => karistir(rnd, [h, ...karistir(rnd, [...ALFABE].filter(x => x !== h)).slice(0, 4)]));
      const kurulur = w => [...w].every((h, i) => carklar[i].includes(h));
      const baska = liste.filter(w => w !== kelime).map(w => (yon === 'ters' ? [...w].reverse().join('') : w));
      if (!baska.some(kurulur)) break;
    }
    const baslangic = carklar.map(() => Math.floor(rnd() * 5));
    return { tur: 'cark', gorunum: { lamba, ekran, carklar, baslangic }, tablolar: [lambaTablo, listeler, yonTablo], cevap: hedef, ara: { kelime, yon } };
  }
  // Labirent: 4 farklı labirent. Bombada iki yeşil işaret hangi labirent olduğunu belli eder.
  // Adım 1: işaretler → labirent no. Adım 2: haritaların ÜST yarısı (1-3. satır). Adım 3: ALT yarısı (4-6. satır).
  function labirentUret(rnd) {
    // sag[y][x]: (x,y) ile (x+1,y) arasında duvar var mı; alt[y][x]: (x,y) ile (x,y+1) arasında
    const sag = Array.from({ length: LAB_N }, () => Array(LAB_N).fill(true));
    const alt = Array.from({ length: LAB_N }, () => Array(LAB_N).fill(true));
    const gez = Array.from({ length: LAB_N }, () => Array(LAB_N).fill(false));
    const yigin = [[Math.floor(rnd() * LAB_N), Math.floor(rnd() * LAB_N)]];
    gez[yigin[0][1]][yigin[0][0]] = true;
    while (yigin.length) {
      const [x, y] = yigin[yigin.length - 1];
      const kom = karistir(rnd, [[1, 0], [-1, 0], [0, 1], [0, -1]]).map(([dx, dy]) => [x + dx, y + dy, dx, dy])
        .filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < LAB_N && ny < LAB_N && !gez[ny][nx]);
      if (!kom.length) { yigin.pop(); continue; }
      const [nx, ny, dx, dy] = kom[0];
      if (dx === 1) sag[y][x] = false;
      if (dx === -1) sag[y][nx] = false;
      if (dy === 1) alt[y][x] = false;
      if (dy === -1) alt[ny][x] = false;
      gez[ny][nx] = true;
      yigin.push([nx, ny]);
    }
    // Birkaç duvar daha kalksın (tek yol olmasın)
    for (let k = 0; k < 5; k++) { const x = Math.floor(rnd() * (LAB_N - 1)), y = Math.floor(rnd() * LAB_N); sag[y][x] = false; }
    return { sag, alt };
  }
  function gecilir(lab, x, y, dx, dy) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= LAB_N || ny >= LAB_N) return false;
    if (dx === 1) return !lab.sag[y][x];
    if (dx === -1) return !lab.sag[y][nx];
    if (dy === 1) return !lab.alt[y][x];
    return !lab.alt[ny][x];
  }
  function labirentYap(rnd) {
    const haritalar = [];
    const kullanilan = new Set();
    for (let i = 0; i < 4; i++) {
      const lab = labirentUret(rnd);
      let isaret;
      do { isaret = [[Math.floor(rnd() * 6), Math.floor(rnd() * 6)], [Math.floor(rnd() * 6), Math.floor(rnd() * 6)]]; }
      while ((isaret[0][0] === isaret[1][0] && isaret[0][1] === isaret[1][1]) || isaret.some(([x, y]) => kullanilan.has(x + ',' + y)));
      isaret.forEach(([x, y]) => kullanilan.add(x + ',' + y));
      haritalar.push({ ...lab, isaret });
    }
    const no = Math.floor(rnd() * 4), lab = haritalar[no];
    let bas, hedef;
    do { bas = [Math.floor(rnd() * 6), Math.floor(rnd() * 6)]; hedef = [Math.floor(rnd() * 6), Math.floor(rnd() * 6)]; }
    while (Math.abs(bas[0] - hedef[0]) + Math.abs(bas[1] - hedef[1]) < 5);
    return { tur: 'labirent', gorunum: { isaret: lab.isaret, bas, hedef }, tablolar: [haritalar.map(h => h.isaret), haritalar, haritalar], cevap: { no, hedef }, lab, ilk: bas };
  }

  // Renkli kelimeler: ekranda bir kelime bir renkte yazar, altında 4 düğme (her birinde renkli bir kelime).
  // Adım 1: ekrandaki YAZININ RENGİ → hangi düğmeye bakılacak. Adım 2: o düğmede YAZAN kelime → bir renk.
  // Adım 3: o renk → kural ("yazısı bu renkte olana bas" ya da "üstünde bu rengin adı yazana bas").
  function kelimeYap(rnd) {
    const konumTablo = Object.fromEntries(KELIME_RENK.map(r => [r, Math.floor(rnd() * 4)]));
    const renkTablo = Object.fromEntries(KARISIK.map(w => [w, sec(rnd, KELIME_RENK)]));
    const kuralTablo = Object.fromEntries(KELIME_RENK.map(r => [r, rnd() < 0.5 ? 'yaziRengi' : 'kelime']));
    for (let deneme = 0; deneme < 2000; deneme++) {
      const ekran = { kelime: sec(rnd, KARISIK), renk: sec(rnd, KELIME_RENK) };
      const dugmeler = Array.from({ length: 4 }, () => ({ kelime: sec(rnd, KARISIK), renk: sec(rnd, KELIME_RENK) }));
      const bak = konumTablo[ekran.renk];
      const hedefRenk = renkTablo[dugmeler[bak].kelime];
      const kural = kuralTablo[hedefRenk];
      const uyan = dugmeler.map((d, i) => ((kural === 'yaziRengi' ? d.renk === hedefRenk : d.kelime === RENK_KELIME(hedefRenk)) ? i : -1)).filter(i => i >= 0);
      if (uyan.length !== 1) continue;
      return { tur: 'kelime', gorunum: { ekran, dugmeler }, tablolar: [konumTablo, renkTablo, kuralTablo], cevap: uyan[0], ara: { bak, hedefRenk, kural } };
    }
    return kelimeYap(rnd);
  }

  // Kablo demeti: 5-8 kablo ve bir etiket numarası.
  // Adım 1: etiket → sayılacak renk. Adım 2: o renkteki kablo SAYISI → hedef renk. Adım 3: hedef renk → hepsini / sonuncuyu kes.
  function demetYap(rnd) {
    const sayRenkTablo = Object.fromEntries(aralik(1, 6).map(n => [n, sec(rnd, KABLO_RENK)]));
    const hedefTablo = Object.fromEntries(aralik(0, 4).map(n => [n, sec(rnd, KABLO_RENK)]));
    const kesTablo = Object.fromEntries(KABLO_RENK.map(r => [r, rnd() < 0.5 ? 'hepsi' : 'son']));
    for (let deneme = 0; deneme < 2000; deneme++) {
      const sayi = 5 + Math.floor(rnd() * 4);
      const kablolar = Array.from({ length: sayi }, () => sec(rnd, KABLO_RENK));
      const etiket = 1 + Math.floor(rnd() * 6);
      const sayilan = sayRenkTablo[etiket];
      const adet = Math.min(4, kablolar.filter(k => k === sayilan).length);
      const hedef = hedefTablo[adet];
      const yerler = kablolar.map((k, i) => (k === hedef ? i : -1)).filter(i => i >= 0);
      if (!yerler.length) continue;
      const kes = kesTablo[hedef] === 'hepsi' ? yerler : [yerler[yerler.length - 1]];
      return { tur: 'demet', gorunum: { kablolar, etiket }, tablolar: [sayRenkTablo, hedefTablo, kesTablo], cevap: kes, ara: { sayilan, adet, hedef } };
    }
    return demetYap(rnd);
  }
  // Şalterler: 5 şalter (renkli başlıklı), panelde bir harf ve küçük ekranda bir sayı.
  // Adım 1: panel harfi → kaçıncı şaltere bakılacak. Adım 2: o şalterin rengi → dizilim. Adım 3: ekran sayısı → dönüşüm.
  function salterYap(rnd) {
    const bakTablo = Object.fromEntries(PANEL_HARF.map(h => [h, 1 + Math.floor(rnd() * 5)]));
    const dizTablo = Object.fromEntries(KABLO_RENK.map(r => [r, Array.from({ length: 5 }, () => (rnd() < 0.5 ? 1 : 0))]));
    const donTablo = Object.fromEntries(aralik(1, 9).map(n => [n, sec(rnd, Object.keys(SALTER_DONUSUM))]));
    const harf = sec(rnd, PANEL_HARF), renkler = Array.from({ length: 5 }, () => sec(rnd, KABLO_RENK)), ekran = 1 + Math.floor(rnd() * 9);
    const diz = dizTablo[renkler[bakTablo[harf] - 1]], don = donTablo[ekran];
    let cevap = [...diz];
    if (don === 'ters') cevap = cevap.map(b => 1 - b);
    if (don === 'ayna') cevap = cevap.reverse();
    let baslangic;
    do { baslangic = Array.from({ length: 5 }, () => (rnd() < 0.5 ? 1 : 0)); } while (baslangic.join() === cevap.join());
    return { tur: 'salter', gorunum: { harf, renkler, ekran, baslangic }, tablolar: [bakTablo, dizTablo, donTablo], cevap };
  }

  // Kadran: ekranda bir kelime, kadranın çerçevesi renkli, düğme 8 konumlu.
  // Adım 1: kelime → sayı. Adım 2: çerçeve rengi + sayı → harf. Adım 3: harf → kadranın konumu.
  function kadranYap(rnd) {
    const sayiTablo = Object.fromEntries(KADRAN_KELIME.map(w => [w, 1 + Math.floor(rnd() * 8)]));
    const harfTablo = Object.fromEntries(KADRAN_CERCEVE.map(r => [r, Object.fromEntries(aralik(1, 8).map(n => [n, sec(rnd, KADRAN_HARF)]))]));
    const konumTablo = Object.fromEntries(KADRAN_HARF.map(h => [h, 1 + Math.floor(rnd() * 8)]));
    const kelime = sec(rnd, KADRAN_KELIME), cerceve = sec(rnd, KADRAN_CERCEVE);
    const cevap = konumTablo[harfTablo[cerceve][sayiTablo[kelime]]];
    let baslangic; do { baslangic = 1 + Math.floor(rnd() * 8); } while (baslangic === cevap);
    return { tur: 'kadran', gorunum: { kelime, cerceve, baslangic }, tablolar: [sayiTablo, harfTablo, konumTablo], cevap };
  }

  // Yanıp sönen fener: lamba belli sayıda yanıp söner, durur, tekrar eder. Altında A B C D düğmeleri.
  // Adım 1: yanıp sönme sayısı → renk. Adım 2: renk → sayı. Adım 3: sayı → düğme. (Camın rengi kafa karıştırmak için!)
  function fenerYap(rnd) {
    const renkTablo = Object.fromEntries(aralik(2, 7).map(n => [n, sec(rnd, KABLO_RENK)]));
    const sayilar = karistir(rnd, aralik(11, 99)).slice(0, KABLO_RENK.length);
    const sayiTablo = Object.fromEntries(KABLO_RENK.map((r, i) => [r, sayilar[i]]));
    const dugmeTablo = Object.fromEntries([...sayilar].sort((a, b) => a - b).map(n => [n, Math.floor(rnd() * 4)]));
    const yanma = 2 + Math.floor(rnd() * 6), cam = sec(rnd, FENER_CAM);
    const cevap = dugmeTablo[sayiTablo[renkTablo[yanma]]];
    return { tur: 'fener', gorunum: { yanma, cam }, tablolar: [renkTablo, sayiTablo, dugmeTablo], cevap };
  }
  const URETICI = { kablo: kabloYap, dugme: dugmeYap, tus: tusYap, cark: carkYap, labirent: labirentYap, kelime: kelimeYap, demet: demetYap, salter: salterYap, kadran: kadranYap, fener: fenerYap };

  // ---------- Dağıtım: hangi adım hangi yönlendiricide ----------
  // G yönlendirici (zincirde 1..G). G=1: hepsi onda. G=2: her bölüm iki kişiye bölünür. G=3: her adım ayrı kişide.
  function dagit(rnd, bolumSayisi, G) {
    const d = [];
    for (let b = 0; b < bolumSayisi; b++) {
      if (G <= 1) d.push([0, 0, 0]);
      else if (G === 2) { const a = rnd() < 0.5 ? 0 : 1; const tek = Math.floor(rnd() * 3); d.push([0, 1, 2].map(i => (i === tek ? 1 - a : a))); }
      else d.push(karistir(rnd, [0, 1, 2]));
    }
    // Herkesin elinde yeterli sayfa olsun (G=3'te zaten öyle)
    return d;
  }

  // ---------- Oyun ----------
  // ayar: { sure (sn), bolum, hata }  oyuncuSayisi: 2..4
  function yeni(tohum, ayar, oyuncuSayisi) {
    const rnd = tohumlu(tohum);
    // Bölüm sayısı açılışta seçilir (2-12). Bombanın üst yüzünde 6, alt yüzünde 6 yuva var.
    const bolumSayisi = Math.max(2, Math.min(12, ayar.bolum | 0 || 6));
    // Türler: önce hepsinden birer tane (karışık), sonra tekrar
    const turlar = [];
    while (turlar.length < bolumSayisi) turlar.push(...karistir(rnd, TURLER));
    const bolumler = turlar.slice(0, bolumSayisi).map((tur, i) => { const b = URETICI[tur](rnd); return { no: i + 1, ...b, cozuldu: false, ilerleme: b.tur === 'labirent' ? [...b.ilk] : [] }; });
    const G = Math.max(1, oyuncuSayisi - 1);
    const seri = `${sec(rnd, 'KLMNRSTZ'.split(''))}${1 + Math.floor(rnd() * 9)}${sec(rnd, 'ABDEHPY'.split(''))}-${10 + Math.floor(rnd() * 90)}`;
    // Her yönlendiricinin çantası kilitli: kodun 1-2. rakamı çantanın sol yanında, 3. rakamı sağ yanında,
    // 4. rakamı ise bombanın seri numarasının son rakamı (çantanın altında yazar → bombacıya sorulmalı)
    const cantalar = Array.from({ length: G }, () => {
      const sol = String(10 + Math.floor(rnd() * 90)), sag = String(Math.floor(rnd() * 10));
      return { sol, sag, kod: sol + sag + seri.slice(-1) };
    });
    return {
      tohum, ayar: { sure: ayar.sure, bolum: bolumSayisi, hata: ayar.hata }, seri, cantalar,
      bolumler, dagitim: dagit(rnd, bolumSayisi, G), G,
      hatalar: 0, bitti: false, sonuc: null,
    };
  }

  // Bir yönlendiricinin (0..G-1) çantasındaki sayfalar: [{ bolum, adim }]
  function sayfalar(d, kim) {
    const s = [];
    d.bolumler.forEach((b, i) => d.dagitim[i].forEach((k, adim) => { if (k === kim) s.push({ bolum: i, adim }); }));
    return s;
  }

  // ---------- Hamleler (kuralları oda sahibi işletir) ----------
  // e: { bolum, ad: 'kes'|'bas'|'birak'|'tus'|'gonder', ... }  kalanSn: oda sahibinin sayacı
  // Dönüş: { tip: 'dogru'|'hata'|'ilerle'|'yok', cozuldu?, bitti?, sonuc? }
  function hamle(d, e, kalanSn) {
    if (d.bitti) return { tip: 'yok' };
    const b = d.bolumler[e.bolum];
    if (!b || b.cozuldu) return { tip: 'yok' };
    let dogru = null;
    if (b.tur === 'kablo' && e.ad === 'kes') {
      if (b.ilerleme.includes(e.kablo) || !(e.kablo >= 0 && e.kablo < b.gorunum.kablolar.length)) return { tip: 'yok' };
      b.ilerleme.push(e.kablo);
      dogru = e.kablo === b.cevap;
    } else if (b.tur === 'dugme' && e.ad === 'birak') {
      // e.sure: basılı tutma süresi (sn), e.saat: bırakırken sayaçta görünen yazı (ör. "02:41")
      const uzun = (+e.sure || 0) >= 0.7;
      if (b.cevap.eylem === 'kisa') dogru = !uzun;
      else {
        const saat = String(e.saat || '');
        const gercek = sayacYazi(kalanSn);
        // Gönderilen saat, oda sahibinin saatine yakın olmalı (ağ gecikmesi payı)
        const yakin = Math.abs(sayacSn(saat) - kalanSn) <= 2.5;
        dogru = uzun && yakin && saat.includes(String(b.cevap.rakam));
        void gercek;
      }
    } else if (b.tur === 'tus' && e.ad === 'tus') {
      if (b.ilerleme.includes(e.tus) || !(e.tus >= 0 && e.tus < 4)) return { tip: 'yok' };
      const beklenen = b.cevap[b.ilerleme.length];
      if (e.tus === beklenen) {
        b.ilerleme.push(e.tus);
        if (b.ilerleme.length < 4) return { tip: 'ilerle', bolum: e.bolum, ilerleme: [...b.ilerleme] };
        dogru = true;
      } else dogru = false;
    } else if (b.tur === 'cark' && e.ad === 'gonder') {
      const sec2 = Array.isArray(e.secim) ? e.secim : [];
      const yazi = b.gorunum.carklar.map((c, i) => c[((sec2[i] | 0) % 5 + 5) % 5]).join('');
      dogru = yazi === b.cevap;
    } else if (b.tur === 'labirent' && e.ad === 'yuru') {
      const yon = { yukari: [0, -1], asagi: [0, 1], sol: [-1, 0], sag: [1, 0] }[e.yon];
      if (!yon) return { tip: 'yok' };
      const [x, y] = b.ilerleme;
      if (gecilir(b.lab, x, y, yon[0], yon[1])) {
        b.ilerleme = [x + yon[0], y + yon[1]];
        if (b.ilerleme[0] !== b.cevap.hedef[0] || b.ilerleme[1] !== b.cevap.hedef[1]) return { tip: 'ilerle', bolum: e.bolum, ilerleme: [...b.ilerleme] };
        dogru = true;
      } else dogru = false;   // duvara çarptı: yerinde kalır
    } else if (b.tur === 'salter' && e.ad === 'onay') {
      const durum = Array.isArray(e.durum) ? e.durum.map(x => (x ? 1 : 0)) : [];
      dogru = durum.join() === b.cevap.join();
    } else if (b.tur === 'kadran' && e.ad === 'kilitle') {
      dogru = (e.konum | 0) === b.cevap;
    } else if (b.tur === 'fener' && e.ad === 'tus') {
      if (!(e.tus >= 0 && e.tus < 4)) return { tip: 'yok' };
      dogru = e.tus === b.cevap;
    } else if (b.tur === 'kelime' && e.ad === 'tus') {
      if (!(e.tus >= 0 && e.tus < 4)) return { tip: 'yok' };
      dogru = e.tus === b.cevap;
    } else if (b.tur === 'demet' && e.ad === 'kes') {
      if (b.ilerleme.includes(e.kablo) || !(e.kablo >= 0 && e.kablo < b.gorunum.kablolar.length)) return { tip: 'yok' };
      b.ilerleme.push(e.kablo);
      if (b.cevap.includes(e.kablo)) {
        if (!b.cevap.every(k => b.ilerleme.includes(k))) return { tip: 'ilerle', bolum: e.bolum, ilerleme: [...b.ilerleme] };
        dogru = true;
      } else dogru = false;
    } else return { tip: 'yok' };

    if (dogru) {
      b.cozuldu = true;
      const hepsi = d.bolumler.every(x => x.cozuldu);
      if (hepsi) { d.bitti = true; d.sonuc = 'cozuldu'; }
      return { tip: 'dogru', bolum: e.bolum, bitti: d.bitti, sonuc: d.sonuc, ilerleme: [...b.ilerleme] };
    }
    d.hatalar++;
    if (b.tur === 'tus') b.ilerleme = [];   // yanlış tuş: baştan
    if (d.hatalar > d.ayar.hata) { d.bitti = true; d.sonuc = 'patladi'; }
    return { tip: 'hata', bolum: e.bolum, hatalar: d.hatalar, bitti: d.bitti, sonuc: d.sonuc, ilerleme: [...b.ilerleme] };
  }

  function sureBitti(d) {
    if (d.bitti) return null;
    d.bitti = true; d.sonuc = 'patladi';
    return { tip: 'sure', bitti: true, sonuc: 'patladi' };
  }

  const sayacYazi = sn => { const s = Math.max(0, Math.ceil(sn)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  const sayacSn = y => { const m = /^(\d+):(\d\d)$/.exec(y); return m ? +m[1] * 60 + +m[2] : -999; };

  return {
    PANEL_HARF, SALTER_DONUSUM, KADRAN_KELIME, KADRAN_CERCEVE, KADRAN_HARF, FENER_CAM,
    LAB_N, SUTUN_AD, KELIME_RENK, RENK_KELIME, KARISIK, KONUM, gecilir,
    RENKLER, KABLO_RENK, SEKILLER, HARFLER, DUGME_RENK, DUGME_YAZI, SERIT_RENK, ISARETLER, TUS_ISIK, SIRALAMA, CARK_LAMBA, TURLER, TUR_AD, TUR_IKON,
    tohumlu, yeni, sayfalar, hamle, sureBitti, sayacYazi, sayacSn,
  };
})();

if (typeof module !== 'undefined') module.exports = Motor;
