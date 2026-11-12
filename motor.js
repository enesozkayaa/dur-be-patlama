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
  const DUGME_YAZI = ['BAS', 'TUT', 'DUR', 'PATLA', 'İPTAL', 'BEKLE', 'EVET', 'HAYIR', 'SEKİZ'];
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
  const TURLER = ['kablo', 'dugme', 'tus', 'cark', 'labirent', 'kelime', 'demet', 'salter', 'kadran', 'fener',
    'numara', 'sigorta', 'telsiz', 'vana', 'yildiz', 'saat', 'piyano', 'zar', 'isik', 'sifre'];
  const TUR_AD = { kablo: 'Kablolar', dugme: 'Büyük Düğme', tus: 'Tuş Takımı', cark: 'Şifre Çarkı', labirent: 'Labirent', kelime: 'Renkli Kelimeler', demet: 'Kablo Demeti', salter: 'Şalterler', kadran: 'Kadran', fener: 'Yanıp Sönen Fener',
    numara: 'Sayısal Kilit', sigorta: 'Sigorta Kutusu', telsiz: 'Telsiz', vana: 'Basınç Vanaları', yildiz: 'Takımyıldızlar', saat: 'Çalar Saat', piyano: 'Piyano', zar: 'Zarlar', isik: 'Işık Dizisi', sifre: 'Şifreli Mesaj' };
  const TUR_IKON = { kablo: '🔌', dugme: '🔴', tus: '🔣', cark: '🔐', labirent: '🌀', kelime: '🎨', demet: '🧶', salter: '🎚️', kadran: '🧭', fener: '💡',
    numara: '🔢', sigorta: '🔋', telsiz: '📻', vana: '⏲️', yildiz: '✨', saat: '⏰', piyano: '🎹', zar: '🎲', isik: '🚦', sifre: '📜' };
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
  const KARISIK = ['TAMAM', 'YEŞİL', 'KIRMIZI', 'MAVİ', 'SARI', 'MOR', 'BEYAZ', 'BOŞ', 'HİÇ', 'RENK', 'BASMA', 'BU', 'EVET', 'HAYIR', 'BAS', 'SEKİZ'];
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
  // =============================================================
  // Yeni bölümler (11-20)
  // =============================================================

  // Sayısal kilit: ekranda (rakam gibi görünen) bir kelime, renkli panel, yanan kırmızı ışık sayısı.
  // Adım 1: kelime → sütun. Adım 2: panel rengi + sütun → 3 haneli sayı. Adım 3: ışık sayısı → işlem. Sonra tuşla + GİR.
  const NUM_KELIME = ['EVET', 'HAYIR', 'SEKİZ', 'BAS', 'TAMAM', 'DOKUZ', 'SIFIR', 'ÜÇ'];
  const NUM_SUTUN = ['A', 'B', 'C', 'D'];
  const NUM_PANEL = ['kirmizi', 'mavi', 'yesil', 'sari'];
  const NUM_ISLEM = {
    ayni: 'Sayıyı <b>olduğu gibi</b> tuşla.',
    ters: 'Sayıyı <b>tersten</b> tuşla (472 → 274).',
    artir: 'Her rakamı <b>1 artır</b>, 9 olan 0 olur (472 → 583).',
    azalt: 'Her rakamı <b>1 azalt</b>, 0 olan 9 olur (402 → 391).',
  };
  function numaraYap(rnd) {
    const sutunTablo = Object.fromEntries(NUM_KELIME.map(w => [w, sec(rnd, NUM_SUTUN)]));
    const sayiTablo = Object.fromEntries(NUM_PANEL.map(r => [r, Object.fromEntries(NUM_SUTUN.map(s => [s, String(100 + Math.floor(rnd() * 900))]))]));
    const islemTablo = Object.fromEntries([1, 2, 3, 4].map(n => [n, sec(rnd, Object.keys(NUM_ISLEM))]));
    const kelime = sec(rnd, NUM_KELIME), panel = sec(rnd, NUM_PANEL), led = 1 + Math.floor(rnd() * 4);
    const sayi = sayiTablo[panel][sutunTablo[kelime]], islem = islemTablo[led];
    let cevap = sayi;
    if (islem === 'ters') cevap = [...sayi].reverse().join('');
    if (islem === 'artir') cevap = [...sayi].map(c => (+c + 1) % 10).join('');
    if (islem === 'azalt') cevap = [...sayi].map(c => (+c + 9) % 10).join('');
    return { tur: 'numara', gorunum: { kelime, panel, led }, tablolar: [sutunTablo, sayiTablo, islemTablo], cevap };
  }

  // Sigorta kutusu: 6 numaralı sigorta, kutunun çerçevesi renkli. Bir tanesi çekilecek.
  // Adım 1: çerçeve rengi → bakılacak sigorta. Adım 2: onun numarası → harf. Adım 3: harf → hangi sigorta çekilir.
  const SIGORTA_KUTU = ['kirmizi', 'mavi', 'yesil', 'sari', 'beyaz'];
  const SIGORTA_ARALIK = [[10, 24], [25, 39], [40, 54], [55, 69], [70, 84], [85, 99]];
  const SIGORTA_HARF = ['K', 'L', 'M', 'N', 'P', 'R'];
  const SIGORTA_KURAL = {
    enBuyuk: 'Numarası <b>en büyük</b> olan sigortayı çek.',
    enKucuk: 'Numarası <b>en küçük</b> olan sigortayı çek.',
    tekBuyuk: 'Numarası <b>tek</b> olanlardan <b>en büyüğünü</b> çek (hiç tek yoksa en büyüğü).',
    ciftKucuk: 'Numarası <b>çift</b> olanlardan <b>en küçüğünü</b> çek (hiç çift yoksa en küçüğü).',
    bakilan: '1. adımda <b>bakılan sigortanın kendisini</b> çek.',
    sagKomsu: '1. adımda bakılan sigortanın <b>sağındakini</b> çek (en sağdaysa en soldakini).',
  };
  function sigortaYap(rnd) {
    const bakTablo = Object.fromEntries(SIGORTA_KUTU.map(r => [r, 1 + Math.floor(rnd() * 6)]));
    const harfTablo = SIGORTA_ARALIK.map(() => sec(rnd, SIGORTA_HARF));
    const kuralTablo = Object.fromEntries(SIGORTA_HARF.map(h => [h, sec(rnd, Object.keys(SIGORTA_KURAL))]));
    const kutu = sec(rnd, SIGORTA_KUTU);
    const numaralar = karistir(rnd, aralik(10, 99)).slice(0, 6);
    const bak = bakTablo[kutu] - 1, no = numaralar[bak];
    const harf = harfTablo[SIGORTA_ARALIK.findIndex(([a, z]) => no >= a && no <= z)];
    const kural = kuralTablo[harf];
    const yer = v => numaralar.indexOf(v);
    const tek = numaralar.filter(n => n % 2), cift = numaralar.filter(n => n % 2 === 0);
    let cevap;
    if (kural === 'enBuyuk') cevap = yer(Math.max(...numaralar));
    else if (kural === 'enKucuk') cevap = yer(Math.min(...numaralar));
    else if (kural === 'tekBuyuk') cevap = yer(Math.max(...(tek.length ? tek : numaralar)));
    else if (kural === 'ciftKucuk') cevap = yer(Math.min(...(cift.length ? cift : numaralar)));
    else if (kural === 'bakilan') cevap = bak;
    else cevap = (bak + 1) % 6;
    return { tur: 'sigorta', gorunum: { kutu, numaralar }, tablolar: [bakTablo, harfTablo, kuralTablo], cevap };
  }

  // Telsiz: ışık ve ses 3 sinyal verir (kısa/uzun), durur, tekrar eder. Altında 4 frekans düğmesi.
  // Adım 1: desen → kod kelimesi. Adım 2: kelime → kanal. Adım 3: kanal → frekans.
  const TELSIZ_DESEN = ['KKK', 'KKU', 'KUK', 'KUU', 'UKK', 'UKU', 'UUK', 'UUU'];
  const TELSIZ_KELIME = ['ALFA', 'KARTAL', 'POYRAZ', 'ŞAHİN', 'MERCAN', 'YILDIZ', 'TUNA', 'ORKİDE'];
  function telsizYap(rnd) {
    const kel = karistir(rnd, TELSIZ_KELIME);
    const kelimeTablo = Object.fromEntries(TELSIZ_DESEN.map((d, i) => [d, kel[i]]));
    const kanallar = karistir(rnd, aralik(1, 8));
    const kanalTablo = Object.fromEntries(TELSIZ_KELIME.map((w, i) => [w, kanallar[i]]));
    const frekanslar = karistir(rnd, aralik(310, 399)).slice(0, 8).map(n => (n / 100).toFixed(2));
    const frekansTablo = Object.fromEntries(aralik(1, 8).map((k, i) => [k, frekanslar[i]]));
    const desen = sec(rnd, TELSIZ_DESEN);
    const dogru = frekansTablo[kanalTablo[kelimeTablo[desen]]];
    const dugmeler = karistir(rnd, [dogru, ...karistir(rnd, frekanslar.filter(f => f !== dogru)).slice(0, 3)]);
    return { tur: 'telsiz', gorunum: { desen, dugmeler }, tablolar: [kelimeTablo, kanalTablo, frekansTablo], cevap: dugmeler.indexOf(dogru) };
  }

  // Basınç vanaları: bir gösterge (ibre), 3 renkli vana, etiket harfi, küçük ekranda sayı.
  // Adım 1: ibrenin aralığı → hangi renkteki vana. Adım 2: renk + etiket → kaç tur. Adım 3: ekran sayısı → yön.
  const VANA_RENK = ['kirmizi', 'mavi', 'yesil', 'sari'];
  const VANA_ARALIK = [[0, 19], [20, 39], [40, 59], [60, 79], [80, 100]];
  const VANA_ETIKET = ['A', 'B', 'C', 'D'];
  function vanaYap(rnd) {
    const renkTablo = VANA_ARALIK.map(() => sec(rnd, VANA_RENK));
    const turTablo = Object.fromEntries(VANA_RENK.map(r => [r, Object.fromEntries(VANA_ETIKET.map(e => [e, 1 + Math.floor(rnd() * 5)]))]));
    const yonTablo = Object.fromEntries(aralik(1, 9).map(n => [n, rnd() < 0.5 ? 'saat' : 'ters']));
    for (;;) {
      const vanalar = karistir(rnd, VANA_RENK).slice(0, 3);
      const ibre = 3 + Math.floor(rnd() * 95);
      if ([20, 40, 60, 80].some(s => Math.abs(ibre - s) <= 3)) continue;   // sınırda olmasın
      const hedefRenk = renkTablo[VANA_ARALIK.findIndex(([a, z]) => ibre >= a && ibre <= z)];
      const k = vanalar.indexOf(hedefRenk);
      if (k < 0) continue;
      const etiket = sec(rnd, VANA_ETIKET), ekran = 1 + Math.floor(rnd() * 9);
      const cevap = [0, 0, 0];
      cevap[k] = turTablo[hedefRenk][etiket] * (yonTablo[ekran] === 'saat' ? 1 : -1);
      return { tur: 'vana', gorunum: { vanalar, ibre, etiket, ekran }, tablolar: [renkTablo, turTablo, yonTablo], cevap };
    }
  }

  // Takımyıldızlar: ekranda bir takımyıldız çizimi (yıldızlar renkli). Altında 4 Yunan harfli düğme.
  // Adım 1: çizim → takımyıldızın adı. Adım 2: ad + yıldız rengi → sayı. Adım 3: sayı → Yunan harfi.
  const YILDIZ_AD = ['Kepçe', 'Akrep', 'Yay', 'Balina', 'Kuğu', 'Ejder', 'Terazi', 'Tilki'];
  const YILDIZ_RENK = ['sari', 'beyaz', 'mavi', 'kirmizi'];
  const YUNAN = ['Γ', 'Δ', 'Θ', 'Λ', 'Ξ', 'Π', 'Σ', 'Φ', 'Ψ', 'Ω'];
  function takimUret(rnd) {
    const yild = [];
    while (yild.length < 5) {
      const p = [0.1 + rnd() * 0.8, 0.1 + rnd() * 0.8];
      if (yild.every(q => Math.hypot(p[0] - q[0], p[1] - q[1]) > 0.24)) yild.push(p);
    }
    const cizgi = [[0, 1], [1, 2], [2, 3], [3, 4]];
    if (rnd() < 0.5) cizgi.push([4, Math.floor(rnd() * 3)]);
    return { yild, cizgi, buyuk: Math.floor(rnd() * 5) };
  }
  function yildizYap(rnd) {
    const desenler = YILDIZ_AD.map(() => takimUret(rnd));
    const sayiTablo = Object.fromEntries(YILDIZ_AD.map(a => [a, Object.fromEntries(YILDIZ_RENK.map(r => [r, 1 + Math.floor(rnd() * 9)]))]));
    const harfler = karistir(rnd, YUNAN);
    const harfTablo = Object.fromEntries(aralik(1, 9).map((n, i) => [n, harfler[i]]));
    const no = Math.floor(rnd() * YILDIZ_AD.length), renk = sec(rnd, YILDIZ_RENK);
    const dogru = harfTablo[sayiTablo[YILDIZ_AD[no]][renk]];
    const dugmeler = karistir(rnd, [dogru, ...karistir(rnd, YUNAN.filter(h => h !== dogru)).slice(0, 3)]);
    return { tur: 'yildiz', gorunum: { desen: desenler[no], renk, dugmeler }, tablolar: [desenler, sayiTablo, harfTablo], cevap: dugmeler.indexOf(dogru) };
  }

  // Çalar saat: akrep ve yelkovan bir saati gösterir. ÇAL düğmesine doğru anda basılmalı.
  // Adım 1: akrebin gösterdiği saat → renk. Adım 2: renk + yelkovanın çeyreği → harf. Adım 3: harf → saniye toplamı.
  const SAAT_HARF = ['A', 'B', 'C', 'D', 'E', 'F'];
  const CEYREK_AD = ['00-14. dakika', '15-29. dakika', '30-44. dakika', '45-59. dakika'];
  function saatYap(rnd) {
    const renkTablo = Object.fromEntries(aralik(1, 12).map(h => [h, sec(rnd, KABLO_RENK)]));
    const harfTablo = Object.fromEntries(KABLO_RENK.map(r => [r, [0, 1, 2, 3].map(() => sec(rnd, SAAT_HARF))]));
    const toplamTablo = Object.fromEntries(SAAT_HARF.map(h => [h, 1 + Math.floor(rnd() * 12)]));
    const akrep = 1 + Math.floor(rnd() * 12), dakika = Math.floor(rnd() * 12) * 5;
    const cevap = toplamTablo[harfTablo[renkTablo[akrep]][Math.floor(dakika / 15)]];
    return { tur: 'saat', gorunum: { akrep, dakika }, tablolar: [renkTablo, harfTablo, toplamTablo], cevap };
  }

  // Piyano: 5 renkli tuş, üstte nota kağıdında bir işaret. 4 notalık melodi çalınacak.
  // Adım 1: işaret → şarkı. Adım 2: şarkı → notalar. Adım 3: nota → tuş rengi.
  const NOTALAR = ['Do', 'Re', 'Mi', 'Fa', 'Sol'];
  const NOTA_ISARET = ['♩', '♪', '♫', '♬', '♭', '♯'];
  const SARKI = ['Ninni', 'Marş', 'Vals', 'Tango', 'Polka', 'Zeybek'];
  const PIYANO_RENK = ['kirmizi', 'mavi', 'sari', 'yesil', 'beyaz'];
  function piyanoYap(rnd) {
    const s = karistir(rnd, SARKI);
    const sarkiTablo = Object.fromEntries(NOTA_ISARET.map((n, i) => [n, s[i]]));
    const melodiTablo = Object.fromEntries(SARKI.map(a => [a, Array.from({ length: 4 }, () => sec(rnd, NOTALAR))]));
    const r = karistir(rnd, PIYANO_RENK);
    const renkTablo = Object.fromEntries(NOTALAR.map((n, i) => [n, r[i]]));
    const isaret = sec(rnd, NOTA_ISARET);
    const tuslar = karistir(rnd, PIYANO_RENK);
    const cevap = melodiTablo[sarkiTablo[isaret]].map(n => tuslar.indexOf(renkTablo[n]));
    return { tur: 'piyano', gorunum: { isaret, tuslar }, tablolar: [sarkiTablo, melodiTablo, renkTablo], cevap };
  }

  // Zarlar: 3 renkli zar, altında kafa karıştırıcı kelimeli 4 düğme.
  // Adım 1: zarların toplamı → bakılacak zarın rengi. Adım 2: renk + o zarın sayısı → kelime. Adım 3: kelime → basılacak düğmenin yazısı.
  const ZAR_RENK = ['kirmizi', 'mavi', 'yesil', 'beyaz'];
  const ZAR_ARALIK = [[3, 6], [7, 9], [10, 11], [12, 14], [15, 18]];
  const ZAR_KELIME = ['TEK', 'ÇİFT', 'AT', 'ATMA', 'YÜKSEK', 'ALÇAK'];
  function zarYap(rnd) {
    const renkTablo = ZAR_ARALIK.map(() => sec(rnd, ZAR_RENK));
    const kelimeTablo = Object.fromEntries(ZAR_RENK.map(r => [r, Object.fromEntries(aralik(1, 6).map(v => [v, sec(rnd, ZAR_KELIME)]))]));
    const hedefTablo = Object.fromEntries(ZAR_KELIME.map(w => [w, sec(rnd, ZAR_KELIME)]));
    for (;;) {
      const renkler = karistir(rnd, ZAR_RENK).slice(0, 3), degerler = renkler.map(() => 1 + Math.floor(rnd() * 6));
      const top = degerler.reduce((a, b) => a + b, 0);
      const hr = renkTablo[ZAR_ARALIK.findIndex(([a, z]) => top >= a && top <= z)];
      const k = renkler.indexOf(hr);
      if (k < 0) continue;
      const hedef = hedefTablo[kelimeTablo[hr][degerler[k]]];
      const dugmeler = karistir(rnd, [hedef, ...karistir(rnd, ZAR_KELIME.filter(w => w !== hedef)).slice(0, 3)]);
      return { tur: 'zar', gorunum: { renkler, degerler, dugmeler }, tablolar: [renkTablo, kelimeTablo, hedefTablo], cevap: dugmeler.indexOf(hedef) };
    }
  }

  // Işık dizisi: 4 renkli ped sırayla yanar (4 ışık), durur, tekrar eder. Köşede etiket numarası.
  // Adım 1: etiket → tablo. Adım 2: tablo + yanan renk → basılacak renk. Adım 3: ilk yanan renk → düz mü ters mi.
  const ISIK_RENK = ['kirmizi', 'mavi', 'yesil', 'sari'];
  const ISIK_TABLO_AD = ['X', 'Y', 'Z'];
  function isikYap(rnd) {
    const tabloSec = Object.fromEntries([1, 2, 3, 4].map(n => [n, sec(rnd, ISIK_TABLO_AD)]));
    const cevirTablo = Object.fromEntries(ISIK_TABLO_AD.map(t => { const p = karistir(rnd, ISIK_RENK); return [t, Object.fromEntries(ISIK_RENK.map((r, i) => [r, p[i]]))]; }));
    const yonTablo = Object.fromEntries(ISIK_RENK.map(r => [r, rnd() < 0.5 ? 'duz' : 'ters']));
    if (new Set(Object.values(yonTablo)).size === 1) yonTablo[ISIK_RENK[0]] = yonTablo[ISIK_RENK[0]] === 'duz' ? 'ters' : 'duz';
    const etiket = 1 + Math.floor(rnd() * 4);
    let dizi;
    do { dizi = Array.from({ length: 4 }, () => sec(rnd, ISIK_RENK)); } while (dizi.some((r, i) => i && dizi[i - 1] === r));
    const yerler = karistir(rnd, ISIK_RENK);   // pedlerin renkleri: sol üst, sağ üst, sol alt, sağ alt
    let basilacak = dizi.map(r => cevirTablo[tabloSec[etiket]][r]);
    if (yonTablo[dizi[0]] === 'ters') basilacak = basilacak.reverse();
    return { tur: 'isik', gorunum: { etiket, dizi, yerler }, tablolar: [tabloSec, cevirTablo, yonTablo], cevap: basilacak.map(r => yerler.indexOf(r)) };
  }

  // Şifreli mesaj: ekranda harfleri kaydırılmış bir kelime (yazı renkli), altında 4 renkli düğme.
  // Adım 1: yazının rengi → kaydırma sayısı. Adım 2: kelimeyi çöz → sayı. Adım 3: sayı → düğme rengi.
  const SIFRE_RENK = ['kirmizi', 'mavi', 'yesil', 'sari'];
  function sifreYap(rnd) {
    const kaydirTablo = Object.fromEntries(SIFRE_RENK.map(r => [r, 1 + Math.floor(rnd() * 6)]));
    const kelimeler = karistir(rnd, KELIMELER.filter(w => [...w].every(h => ALFABE.includes(h)))).slice(0, 10);
    const sayiTablo = Object.fromEntries(kelimeler.map(w => [w, 1 + Math.floor(rnd() * 9)]));
    const renkTablo = Object.fromEntries(aralik(1, 9).map(n => [n, sec(rnd, KABLO_RENK)]));
    const renk = sec(rnd, SIFRE_RENK), kelime = sec(rnd, kelimeler), k = kaydirTablo[renk];
    const sifreli = [...kelime].map(h => ALFABE[(ALFABE.indexOf(h) + k) % ALFABE.length]).join('');
    const hedef = renkTablo[sayiTablo[kelime]];
    const dugmeler = karistir(rnd, [hedef, ...karistir(rnd, KABLO_RENK.filter(r => r !== hedef)).slice(0, 3)]);
    return { tur: 'sifre', gorunum: { sifreli, renk, dugmeler }, tablolar: [kaydirTablo, sayiTablo, renkTablo], cevap: dugmeler.indexOf(hedef), ara: { kelime } };
  }

  const URETICI = { kablo: kabloYap, dugme: dugmeYap, tus: tusYap, cark: carkYap, labirent: labirentYap, kelime: kelimeYap, demet: demetYap, salter: salterYap, kadran: kadranYap, fener: fenerYap,
    numara: numaraYap, sigorta: sigortaYap, telsiz: telsizYap, vana: vanaYap, yildiz: yildizYap, saat: saatYap, piyano: piyanoYap, zar: zarYap, isik: isikYap, sifre: sifreYap };

  // ---------- Dağıtım: hangi adım hangi yönlendiricide ----------
  // G yönlendirici (zincirde 1..G). G=1: hepsi onda. G=2: 1. ve 3. adım bir kişide, 2. adım öbüründe (peş peşe adımlar aynı kişide olmaz). G=3: her adım ayrı kişide.
  function dagit(rnd, bolumSayisi, G) {
    const d = [];
    for (let b = 0; b < bolumSayisi; b++) {
      if (G <= 1) d.push([0, 0, 0]);
      else if (G === 2) { const a = rnd() < 0.5 ? 0 : 1; d.push([a, 1 - a, a]); }   // atlayarak: 1. ve 3. adım bir kişide, 2. adım öbüründe
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
    // Türler: 20 türün içinden rastgele, hiçbiri tekrar etmez
    const turlar = karistir(rnd, TURLER);
    const bolumler = turlar.slice(0, bolumSayisi).map((tur, i) => { const b = URETICI[tur](rnd); return { no: i + 1, ...b, cozuldu: false, ilerleme: b.tur === 'labirent' ? [...b.ilk] : [] }; });
    const G = Math.max(1, oyuncuSayisi - 1);
    const seri = `${sec(rnd, 'KLMNRSTZ'.split(''))}${1 + Math.floor(rnd() * 9)}${sec(rnd, 'ABDEHPY'.split(''))}-${100 + Math.floor(rnd() * 900)}`;
    const seriRakamlar = seri.replace(/\D/g, '');   // 4 rakam: ilk, 2., 3., son
    // Her yönlendiricinin çantası kilitli. 4 haneli kodun hanelerinin yeri her çantada karışık:
    // bir yanda 2 hane, öbür yanda 1 hane yazar; kalan hane bombanın seri numarasındaki rastgele bir rakamdır (ilk/2./3./son)
    // (çantanın altında hangi hane olduğu yazar → bombacıya sorulmalı). Çantaların düzeni ve kodu birbirinden farklı.
    const goruldu = new Set();
    const cantalar = Array.from({ length: G }, () => {
      for (let deneme = 0; ; deneme++) {
        const yer = karistir(rnd, [0, 1, 2, 3]);
        const cift = yer.slice(0, 2).sort((a, b) => a - b), tek = yer[2], seriYer = yer[3];
        const rakam = [0, 1, 2, 3].map(() => String(Math.floor(rnd() * 10)));
        const seriHane = Math.floor(rnd() * seriRakamlar.length);
        rakam[seriYer] = seriRakamlar[seriHane];
        const kod = rakam.join('');
        const anahtar = yer.slice(0, 3).join('') + seriYer + seriHane;
        if (deneme < 50 && (goruldu.has(anahtar) || goruldu.has(kod))) continue;
        goruldu.add(anahtar); goruldu.add(kod);
        const ciftParca = { yer: cift, rakam: cift.map(i => rakam[i]).join('') };
        const tekParca = { yer: [tek], rakam: rakam[tek] };
        const ciftSolda = rnd() < 0.5;
        return { sol: ciftSolda ? ciftParca : tekParca, sag: ciftSolda ? tekParca : ciftParca, seriYer, seriHane, kod };
      }
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
    } else if (['sigorta', 'telsiz', 'yildiz', 'zar', 'sifre'].includes(b.tur) && e.ad === 'tus') {
      if (!(e.tus >= 0 && e.tus < (b.tur === 'sigorta' ? 6 : 4))) return { tip: 'yok' };
      dogru = e.tus === b.cevap;
    } else if ((b.tur === 'piyano' || b.tur === 'isik') && e.ad === 'tus') {
      if (!(e.tus >= 0 && e.tus < (b.tur === 'piyano' ? 5 : 4))) return { tip: 'yok' };
      if (e.tus === b.cevap[b.ilerleme.length]) {
        b.ilerleme.push(e.tus);
        if (b.ilerleme.length < b.cevap.length) return { tip: 'ilerle', bolum: e.bolum, ilerleme: [...b.ilerleme] };
        dogru = true;
      } else dogru = false;
    } else if (b.tur === 'numara' && e.ad === 'gir') {
      dogru = String(e.deger) === b.cevap;
    } else if (b.tur === 'vana' && e.ad === 'bosalt') {
      const t = Array.isArray(e.turlar) ? e.turlar.map(x => x | 0) : [];
      dogru = t.join() === b.cevap.join();
    } else if (b.tur === 'saat' && e.ad === 'cal') {
      const saat = String(e.saat || '');
      const ss = saat.slice(-2);
      dogru = Math.abs(sayacSn(saat) - kalanSn) <= 2.5 && (+ss[0] + +ss[1]) === b.cevap;
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
    if (b.tur === 'tus' || b.tur === 'piyano' || b.tur === 'isik') b.ilerleme = [];   // yanlış tuş: baştan
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
    NUM_KELIME, NUM_SUTUN, NUM_PANEL, NUM_ISLEM, SIGORTA_KUTU, SIGORTA_ARALIK, SIGORTA_HARF, SIGORTA_KURAL, TELSIZ_DESEN, TELSIZ_KELIME,
    VANA_RENK, VANA_ARALIK, VANA_ETIKET, YILDIZ_AD, YILDIZ_RENK, YUNAN, SAAT_HARF, CEYREK_AD, NOTALAR, NOTA_ISARET, SARKI, PIYANO_RENK,
    ZAR_RENK, ZAR_ARALIK, ZAR_KELIME, ISIK_RENK, ISIK_TABLO_AD, SIFRE_RENK, ALFABE,
    LAB_N, SUTUN_AD, KELIME_RENK, RENK_KELIME, KARISIK, KONUM, gecilir,
    RENKLER, KABLO_RENK, SEKILLER, HARFLER, DUGME_RENK, DUGME_YAZI, SERIT_RENK, ISARETLER, TUS_ISIK, SIRALAMA, CARK_LAMBA, TURLER, TUR_AD, TUR_IKON,
    tohumlu, yeni, sayfalar, hamle, sureBitti, sayacYazi, sayacSn,
  };
})();

if (typeof module !== 'undefined') module.exports = Motor;
