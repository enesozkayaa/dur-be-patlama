// =============================================================
// Dur Be Patlama! - 3D oda: masa, bomba (bombacı için), kilitli çanta (yönlendiriciler için)
// Bombacı: bölüme dokununca yakınlaşır, sonra kablo keser / düğmeye basar / tuşlara basar / çarkı çevirir.
// Yönlendirici: masanın ortasındaki çantayı sürükleyerek her yöne çevirir; yanlarında kilit kodu yazar.
// =============================================================

const Sahne = (() => {
  const R = Motor.RENKLER;
  let renderer, scene, camera, saatSaat = null;
  let mod = null;                  // 'bomba' | 'canta' | null
  const kam = { poz: new THREE.Vector3(0, 5, 5), bak: new THREE.Vector3(0, 1, 0), hPoz: new THREE.Vector3(0, 5, 5), hBak: new THREE.Vector3(0, 1, 0), salla: 0, sigdir: 1 };
  const _uz = new THREE.Vector3();
  let kok = null;                  // bu oyunun nesneleri
  let tiklanabilir = [];
  let animler = [];
  let sonZaman = 0;

  function kur(canvas) {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x120a06);
    scene.fog = new THREE.Fog(0x120a06, 9, 22);
    camera = new THREE.PerspectiveCamera(45, 1, 0.05, 60);
    odaKur();
    boyutla();
    window.addEventListener('resize', boyutla);
    girdiKur(canvas);
    requestAnimationFrame(dongu);
  }

  function boyutla() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // ---------- Doku yardımcıları ----------
  function doku(w, h, ciz) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    ciz(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.userData = { c };
    return t;
  }
  const yazi = (g, metin, x, y, boy, renk = '#fff', font = 'Nunito', kalin = 900) => {
    g.fillStyle = renk; g.font = `${kalin} ${boy}px ${font}, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(metin, x, y);
  };
  const duzlem = (w, h, tex, opts = {}) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7, transparent: !!opts.saydam, ...opts.mal }));
    m.rotation.x = -Math.PI / 2;
    return m;
  };

  // ---------- Oda ----------
  function odaKur() {
    scene.add(new THREE.HemisphereLight(0xffe2c0, 0x2a1810, 0.55));
    const lamba = new THREE.SpotLight(0xffd29a, 60, 14, 0.62, 0.45, 1.6);
    lamba.position.set(0.6, 6.2, 1.2);
    lamba.target.position.set(0, 1, 0);
    lamba.castShadow = true;
    lamba.shadow.mapSize.set(1024, 1024);
    scene.add(lamba, lamba.target);
    const dolgu = new THREE.PointLight(0xff7a40, 6, 12, 1.8);
    dolgu.position.set(-4, 3, -3);
    scene.add(dolgu);
    // Tavandan sarkan lamba
    const kablo = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 3, 6), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    kablo.position.set(0.6, 8.0, 1.2);
    const abajur = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.45, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0x2a3a2a, side: THREE.DoubleSide, metalness: 0.5, roughness: 0.4 }));
    abajur.position.set(0.6, 6.45, 1.2);
    const ampul = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), new THREE.MeshBasicMaterial({ color: 0xfff0c0 }));
    ampul.position.set(0.6, 6.25, 1.2);
    scene.add(kablo, abajur, ampul);
    // Zemin (tahta)
    const zeminDoku = doku(512, 512, (g, w, h) => {
      g.fillStyle = '#3a2416'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 8; i++) {
        g.fillStyle = i % 2 ? '#43291a' : '#352114'; g.fillRect(0, i * 64, w, 62);
        for (let k = 0; k < 30; k++) { g.strokeStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.08})`; g.beginPath(); const y = i * 64 + Math.random() * 62; g.moveTo(0, y); g.bezierCurveTo(w / 3, y + 4, w * 2 / 3, y - 4, w, y + Math.random() * 3); g.stroke(); }
      }
    });
    zeminDoku.wrapS = zeminDoku.wrapT = THREE.RepeatWrapping; zeminDoku.repeat.set(4, 4);
    const zemin = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ map: zeminDoku, roughness: 0.85 }));
    zemin.rotation.x = -Math.PI / 2; zemin.receiveShadow = true;
    scene.add(zemin);
    // Duvarlar
    const duvarMal = new THREE.MeshStandardMaterial({ color: 0x3b2a20, roughness: 0.95 });
    const arka = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), duvarMal); arka.position.set(0, 5, -6); scene.add(arka);
    const sol = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), duvarMal); sol.rotation.y = Math.PI / 2; sol.position.set(-8, 5, 0); scene.add(sol);
    const sag = sol.clone(); sag.rotation.y = -Math.PI / 2; sag.position.x = 8; scene.add(sag);
    // Duvarda uyarı levhası ve saat
    const levha = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.1), new THREE.MeshStandardMaterial({ map: doku(512, 236, (g, w, h) => {
      g.fillStyle = '#f2c21a'; g.fillRect(0, 0, w, h);
      for (let i = -4; i < 16; i++) { g.fillStyle = '#111'; g.beginPath(); g.moveTo(i * 40, 0); g.lineTo(i * 40 + 20, 0); g.lineTo(i * 40 - 20, 40); g.lineTo(i * 40 - 40, 40); g.fill(); }
      g.fillStyle = '#111'; g.fillRect(0, h - 40, w, 40);
      yazi(g, 'DİKKAT! PATLAYICI', w / 2, h / 2 + 2, 52, '#111', 'Black Ops One', 400);
    }), roughness: 0.6 }));
    levha.position.set(-1.6, 3.6, -5.95);
    scene.add(levha);
    // Masa
    const masaMal = new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 0.6 });
    const ust = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.18, 4.2), masaMal);
    ust.position.y = 1.0; ust.castShadow = ust.receiveShadow = true;
    scene.add(ust);
    [[-2.9, -1.8], [2.9, -1.8], [-2.9, 1.8], [2.9, 1.8]].forEach(([x, z]) => {
      const ayak = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1, 0.18), masaMal);
      ayak.position.set(x, 0.5, z); ayak.castShadow = true; scene.add(ayak);
    });
    // Masada dağınık eşyalar: kahve kupası, tornavida
    const kupa = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.36, 18), new THREE.MeshStandardMaterial({ color: 0xd9d2c4, roughness: 0.4 }));
    kupa.position.set(2.5, 1.27, -1.3); kupa.castShadow = true; scene.add(kupa);
    const kahve = new THREE.Mesh(new THREE.CircleGeometry(0.15, 18), new THREE.MeshStandardMaterial({ color: 0x2a1408 }));
    kahve.rotation.x = -Math.PI / 2; kahve.position.set(2.5, 1.43, -1.3); scene.add(kahve);
    const sap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 10), new THREE.MeshStandardMaterial({ color: 0xd43a1a }));
    sap.rotation.z = Math.PI / 2; sap.rotation.y = 0.5; sap.position.set(-2.4, 1.15, 1.3); scene.add(sap);
    const uc = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.55, 6), new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.9 }));
    uc.rotation.z = Math.PI / 2; uc.rotation.y = 0.5; uc.position.set(-2.88, 1.15, 1.56); scene.add(uc);
  }
  const MASA_Y = 1.09;

  let kokDis = null;   // sahneye eklenen en dış grup (bombada dönen grubu da taşır)
  function temizle() {
    if (kokDis) scene.remove(kokDis);
    kokDis = null;
    kok = null; tiklanabilir = []; animler = []; mod = null; saatSaat = null; yakin = null; basili = null;
    bomba = null; canta = null;
  }

  // =============================================================
  // BOMBA
  // =============================================================
  let bomba = null, yakin = null, basili = null;
  let olayFn = () => {}, saatYaziFn = () => '00:00';
  const SLOT = [[-1.15, -0.55], [0, -0.55], [1.15, -0.55], [-1.15, 0.6], [0, 0.6], [1.15, 0.6]];
  const UST_Y = MASA_Y + 0.8;

  function bombaKur(d, { olay, saatYazi }) {
    temizle();
    mod = 'bomba';
    olayFn = olay; saatYaziFn = saatYazi;
    // Bomba önlü arkalı: üst yüzde 6, alt yüzde 6 yuva. "Çevir" ile yatay eksende 180° döner.
    kokDis = new THREE.Group(); scene.add(kokDis);
    const donen = new THREE.Group(); donen.position.set(0, MASA_Y + 0.4, 0); kokDis.add(donen);
    kok = new THREE.Group(); kok.position.y = -(MASA_Y + 0.4); donen.add(kok);
    const govdeMal = new THREE.MeshStandardMaterial({ color: 0x2c3036, metalness: 0.6, roughness: 0.45 });
    const govde = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.8, 2.6), govdeMal);
    govde.position.y = MASA_Y + 0.4; govde.castShadow = govde.receiveShadow = true;
    kok.add(govde);
    govde.userData.tik = null; tiklanabilir.push(govde);   // arkadaki bölümlere dokunulmasın diye engel
    // Köşe kayışları ve dinamit çubukları (süs)
    [-1.95, 1.95].forEach(x => {
      for (let i = 0; i < 3; i++) {
        const dinamit = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 2.2, 14), new THREE.MeshStandardMaterial({ color: 0xc8341e, roughness: 0.7 }));
        dinamit.rotation.x = Math.PI / 2; dinamit.position.set(x + Math.sign(x) * 0.02, MASA_Y + 0.15 + i * 0.25, 0); dinamit.castShadow = true;
        kok.add(dinamit);
      }
      const kayis = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.82, 0.12), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
      kayis.position.set(x, MASA_Y + 0.4, 0.6); kok.add(kayis);
      const kayis2 = kayis.clone(); kayis2.position.z = -0.6; kok.add(kayis2);
    });
    // Ön ve arka yüz: sayaç, hata ışıkları, seri numarası (arka yüz ters takılı: bomba çevrilince düz okunur)
    const on = new THREE.Group(); on.position.set(0, MASA_Y + 0.4, 1.301); kok.add(on);
    const arka = new THREE.Group(); arka.position.set(0, MASA_Y + 0.4, -1.301); arka.rotation.x = Math.PI; kok.add(arka);
    const sayacDoku = doku(512, 160, () => {});
    const sayacMal = new THREE.MeshBasicMaterial({ map: sayacDoku });
    const sayac = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.47), sayacMal);
    sayac.position.set(-0.2, 0.05, 0.005); on.add(sayac);
    const sayac2 = sayac.clone(); arka.add(sayac2);
    const seriDoku = doku(512, 128, (g, w, h) => {
      g.fillStyle = '#e9e2cf'; g.fillRect(0, 0, w, h); g.strokeStyle = '#222'; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12);
      yazi(g, 'SERİ NO', 80, h / 2, 30, '#444', 'Nunito', 900);
      yazi(g, d.seri, 320, h / 2 + 2, 62, '#111', 'Special Elite', 400);
    });
    const seri = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.25), new THREE.MeshStandardMaterial({ map: seriDoku, roughness: 0.8 }));
    seri.position.set(1.15, -0.18, 0.005); on.add(seri);
    arka.add(seri.clone());
    const hataIsik = [];
    for (let i = 0; i < Math.max(1, d.ayar.hata); i++) {
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), new THREE.MeshStandardMaterial({ color: 0x3a1010, emissive: 0x000000 }));
      l.position.set(0.85 + i * 0.22, 0.17, 0.03); on.add(l); hataIsik.push(l);
      arka.add(l.clone());   // aynı malzemeyi paylaşır: ikisi birlikte yanar
    }
    // Kablo demeti (süs) sayaçtan dinamitlere
    const egri = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.95, MASA_Y + 0.45, 1.31), new THREE.Vector3(-1.4, MASA_Y + 0.7, 1.45), new THREE.Vector3(-1.85, MASA_Y + 0.55, 1.2)]);
    kok.add(new THREE.Mesh(new THREE.TubeGeometry(egri, 20, 0.025, 6), new THREE.MeshStandardMaterial({ color: 0xe23434 })));

    const moduller = d.bolumler.map((b, i) => modulYap(b, i, SLOT[i % 6], i >= 6));
    // Kullanılmayan yuvalar: uyarı şeritli kapak
    for (let i = d.bolumler.length; i < 12; i++) kapakYap(SLOT[i % 6], i >= 6);
    bomba = { d, sayacDoku, hataIsik, moduller, sonSaat: '', donen, yuz: 0 };
    bakisGenel(true);
  }

  // Yuva konumu: üst yüz ya da (alt=true) alt yüz. Alt yüz ters takılır; bomba çevrilince aynı düzen görünür.
  function yuvaGrubu([x, z], alt) {
    const g = new THREE.Group();
    if (alt) { g.position.set(x, MASA_Y, -z); g.rotation.x = Math.PI; }
    else g.position.set(x, UST_Y, z);
    kok.add(g);
    return g;
  }
  let kapakDokusu = null;
  function kapakYap(yer, alt) {
    const g = yuvaGrubu(yer, alt);
    kapakDokusu ??= doku(256, 256, (c, w, h) => {
      c.fillStyle = '#3a3f46'; c.fillRect(0, 0, w, h);
      c.save(); c.beginPath(); c.rect(14, 14, w - 28, 42); c.rect(14, h - 56, w - 28, 42); c.clip();
      for (let i = -10; i < 30; i++) { c.fillStyle = i % 2 ? '#f2c21a' : '#1a1a1a'; c.beginPath(); c.moveTo(i * 22, 0); c.lineTo(i * 22 + 22, 0); c.lineTo(i * 22 - 40, h); c.lineTo(i * 22 - 62, h); c.fill(); }
      c.restore();
      yazi(c, 'KAPALI', w / 2, h / 2 + 4, 46, 'rgba(240,230,210,0.75)', 'Black Ops One', 400);
      c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 4; c.strokeRect(6, 6, w - 12, h - 12);
    });
    const plaka = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.07, 1.06), [
      new THREE.MeshStandardMaterial({ color: 0x3a3f46, metalness: 0.6 }), new THREE.MeshStandardMaterial({ color: 0x3a3f46, metalness: 0.6 }),
      new THREE.MeshStandardMaterial({ map: kapakDokusu, metalness: 0.4, roughness: 0.5 }), new THREE.MeshStandardMaterial({ color: 0x3a3f46 }),
      new THREE.MeshStandardMaterial({ color: 0x3a3f46 }), new THREE.MeshStandardMaterial({ color: 0x3a3f46 }),
    ]);
    plaka.position.y = 0.035; plaka.receiveShadow = true; g.add(plaka);
    [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]].forEach(([vx, vz]) => {
      const v = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 8), new THREE.MeshStandardMaterial({ color: 0xbfc4ca, metalness: 0.9, roughness: 0.2 }));
      v.position.set(vx, 0.08, vz); g.add(v);
    });
  }

  // Bombayı çevir (alt yüzdeki bölümler için)
  function cevir() {
    if (!bomba || bomba.donuyor) return;
    bomba.yuz = 1 - bomba.yuz;
    const bas = bomba.donen.rotation.x, hedef = bomba.yuz * Math.PI;
    let t = 0;
    bakisGenel(false);
    bomba.donuyor = true;
    animler.push(dt => {
      t = Math.min(1, t + dt * 1.6);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      bomba.donen.rotation.x = bas + (hedef - bas) * e;
      bomba.donen.position.y = MASA_Y + 0.4 + Math.sin(t * Math.PI) * 0.9;
      if (t >= 1) bomba.donuyor = false;
      return t < 1;
    });
  }

  function bakisGenel(ani) {
    yakin = null;
    kam.hPoz.set(0, MASA_Y + 4.4, 4.0);
    kam.hBak.set(0, MASA_Y + 0.4, 0.25);
    kam.sigdir = 1.15;
    if (ani) { kam.poz.copy(kam.hPoz); kam.bak.copy(kam.hBak); }
    olayFn({ tip: 'yakin', bolum: null });
  }
  const _wp = new THREE.Vector3();
  function bolumeYaklas(i) {
    const m = bomba.moduller[i];
    yakin = i;
    m.g.getWorldPosition(_wp);
    kam.hPoz.set(_wp.x, _wp.y + 1.75, _wp.z + 1.05);
    kam.hBak.set(_wp.x, _wp.y, _wp.z + 0.05);
    kam.sigdir = 0.8;
    olayFn({ tip: 'yakin', bolum: i });
  }

  // Bölüm plakası
  function modulYap(b, i, [x, z], alt) {
    const g = yuvaGrubu([x, z], alt);
    const plaka = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.06, 1.06), new THREE.MeshStandardMaterial({ color: 0x4a5058, metalness: 0.55, roughness: 0.4 }));
    plaka.position.y = 0.03; plaka.receiveShadow = true; g.add(plaka);
    plaka.userData.tik = { bolum: i, ad: 'sec' };
    tiklanabilir.push(plaka);
    // vidalar
    [[-0.47, -0.47], [0.47, -0.47], [-0.47, 0.47], [0.47, 0.47]].forEach(([vx, vz]) => {
      const v = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 8), new THREE.MeshStandardMaterial({ color: 0xbfc4ca, metalness: 0.9, roughness: 0.2 }));
      v.position.set(vx, 0.07, vz); g.add(v);
    });
    // Bölüm numarası
    const noDoku = doku(128, 128, (c, w, h) => { c.fillStyle = '#f2c21a'; c.beginPath(); c.arc(64, 64, 60, 0, Math.PI * 2); c.fill(); yazi(c, String(b.no), 64, 70, 84, '#111'); });
    const no = duzlem(0.17, 0.17, noDoku, { saydam: true }); no.position.set(-0.38, 0.065, -0.38); g.add(no);
    // Durum ışığı
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), new THREE.MeshStandardMaterial({ color: 0x551111, emissive: 0xff2020, emissiveIntensity: 0.4 }));
    led.position.set(0.42, 0.08, -0.42); g.add(led);
    const m = { g, b, led, x, z, ozel: {} };
    const ekle = (mesh, tik) => { mesh.userData.tik = { bolum: i, ...tik }; tiklanabilir.push(mesh); return mesh; };
    const G = b.gorunum;

    if (b.tur === 'kablo') {
      const sek = duzlem(0.22, 0.22, doku(128, 128, (c) => { c.fillStyle = '#e9e2cf'; c.fillRect(0, 0, 128, 128); Cizim.sekil(c, G.sekil, 64, 64, 48, '#111'); }));
      sek.position.set(-0.12, 0.065, -0.38); g.add(sek);
      const n = G.kablolar.length, kablolar = [];
      for (let k = 0; k < n; k++) {
        const kx = -0.34 + (0.68 * k) / (n - 1);
        // terminaller
        [-0.18, 0.4].forEach(tz => { const t = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.07), new THREE.MeshStandardMaterial({ color: 0xd9b25a, metalness: 0.8, roughness: 0.3 })); t.position.set(kx, 0.085, tz); g.add(t); });
        const yol = new THREE.CatmullRomCurve3([new THREE.Vector3(kx, 0.1, -0.18), new THREE.Vector3(kx + 0.03, 0.2, 0.0), new THREE.Vector3(kx - 0.03, 0.2, 0.22), new THREE.Vector3(kx, 0.1, 0.4)]);
        const mal = new THREE.MeshStandardMaterial({ color: R[G.kablolar[k]].hex, roughness: 0.45 });
        const tel = ekle(new THREE.Mesh(new THREE.TubeGeometry(yol, 24, 0.028, 8), mal), { ad: 'kes', kablo: k });
        tel.castShadow = true; g.add(tel);
        // Dokunması kolay olsun diye kalın, görünmez bir tutamak
        const tut = ekle(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.56), new THREE.MeshBasicMaterial({ visible: false })), { ad: 'kes', kablo: k });
        tut.position.set(kx, 0.17, 0.11); g.add(tut);
        // kesik parçalar (kesilince görünür)
        const p1 = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([yol.points[0], new THREE.Vector3(kx + 0.04, 0.2, -0.02)]), 6, 0.028, 8), mal);
        const p2 = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(kx - 0.05, 0.17, 0.2), yol.points[3]]), 6, 0.028, 8), mal);
        p1.visible = p2.visible = false; g.add(p1, p2);
        const etiket = duzlem(0.1, 0.1, doku(64, 64, (c) => yazi(c, String(k + 1), 32, 34, 50, '#f6ead8')), { saydam: true });
        etiket.position.set(kx, 0.066, 0.47); g.add(etiket);
        kablolar.push({ tel, tut, p1, p2 });
      }
      m.ozel.kablolar = kablolar;
    } else if (b.tur === 'dugme') {
      const dDoku = doku(256, 256, (c) => {
        c.fillStyle = R[G.renk].hex; c.fillRect(0, 0, 256, 256);
        const koyu = G.renk === 'beyaz' || G.renk === 'sari';
        yazi(c, G.yazi, 128, 132, G.yazi.length > 4 ? 58 : 74, koyu ? '#111' : '#fff', 'Black Ops One', 400);
      });
      const yuva = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.36, 0.06, 32), new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.5 }));
      yuva.position.set(-0.08, 0.09, 0.08); g.add(yuva);
      const dugme = ekle(new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.12, 32), [
        new THREE.MeshStandardMaterial({ color: R[G.renk].hex, roughness: 0.35 }),
        new THREE.MeshStandardMaterial({ map: dDoku, roughness: 0.35 }),
        new THREE.MeshStandardMaterial({ color: R[G.renk].hex }),
      ]), { ad: 'bas' });
      dugme.position.set(-0.08, 0.17, 0.08); dugme.rotation.y = -Math.PI / 2; dugme.castShadow = true;
      g.add(dugme);
      const serit = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.78), new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0x000000 }));
      serit.position.set(0.39, 0.09, 0.07); g.add(serit);
      m.ozel = { dugme, serit };
    } else if (b.tur === 'tus') {
      const isik = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.08), new THREE.MeshStandardMaterial({ color: R[G.isik].hex, emissive: R[G.isik].hex, emissiveIntensity: 0.9 }));
      isik.position.set(0.08, 0.08, -0.4); g.add(isik);
      const tuslar = G.tuslar.map((s, k) => {
        const tx = k % 2 ? 0.2 : -0.2, tz = k < 2 ? -0.08 : 0.3;
        const tDoku = doku(128, 128, (c) => { c.fillStyle = '#efe6cf'; c.fillRect(0, 0, 128, 128); yazi(c, s, 64, 70, 84, '#1a1a1a', 'Noto Sans', 700); });
        const tus = ekle(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.3), [
          new THREE.MeshStandardMaterial({ color: 0xd8cfb8 }), new THREE.MeshStandardMaterial({ color: 0xd8cfb8 }),
          new THREE.MeshStandardMaterial({ map: tDoku }), new THREE.MeshStandardMaterial({ color: 0xd8cfb8 }),
          new THREE.MeshStandardMaterial({ color: 0xd8cfb8 }), new THREE.MeshStandardMaterial({ color: 0xd8cfb8 }),
        ]), { ad: 'tus', tus: k });
        tus.position.set(tx, 0.1, tz); tus.castShadow = true; g.add(tus);
        const l = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), new THREE.MeshStandardMaterial({ color: 0x113311, emissive: 0x000000 }));
        l.position.set(tx, 0.08, tz - 0.19); g.add(l);
        return { tus, l };
      });
      m.ozel = { tuslar };
    } else if (b.tur === 'cark') {
      const lamba = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), new THREE.MeshStandardMaterial({ color: R[G.lamba].hex, emissive: R[G.lamba].hex, emissiveIntensity: 1 }));
      lamba.position.set(-0.12, 0.1, -0.38); g.add(lamba);
      const ekran = duzlem(0.2, 0.14, doku(128, 90, (c) => { c.fillStyle = '#081a08'; c.fillRect(0, 0, 128, 90); yazi(c, String(G.ekran), 64, 48, 70, '#5cff7a', 'Black Ops One', 400); }));
      ekran.position.set(0.17, 0.065, -0.38); g.add(ekran);
      const secim = [...G.baslangic];
      const harfler = G.carklar.map((c, k) => {
        const cx = -0.33 + k * 0.22;
        const hDoku = doku(128, 160, () => {});
        const pencere = duzlem(0.17, 0.21, hDoku); pencere.position.set(cx, 0.066, 0.05); g.add(pencere);
        const yukari = ekle(new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.08, 3), new THREE.MeshStandardMaterial({ color: 0xe0e0e0 })), { ad: 'cevir', sutun: k, yon: -1 });
        yukari.rotation.x = -Math.PI / 2; yukari.position.set(cx, 0.09, -0.15); g.add(yukari);
        const asagi = ekle(new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.08, 3), new THREE.MeshStandardMaterial({ color: 0xe0e0e0 })), { ad: 'cevir', sutun: k, yon: 1 });
        asagi.rotation.x = Math.PI / 2; asagi.position.set(cx, 0.09, 0.25); g.add(asagi);
        return { hDoku };
      });
      const gonder = ekle(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.12), [
        new THREE.MeshStandardMaterial({ color: 0x2a6a2a }), new THREE.MeshStandardMaterial({ color: 0x2a6a2a }),
        new THREE.MeshStandardMaterial({ map: doku(256, 64, (c) => { c.fillStyle = '#2bb34a'; c.fillRect(0, 0, 256, 64); yazi(c, 'GÖNDER', 128, 34, 40, '#fff'); }) }),
        new THREE.MeshStandardMaterial({ color: 0x2a6a2a }), new THREE.MeshStandardMaterial({ color: 0x2a6a2a }), new THREE.MeshStandardMaterial({ color: 0x2a6a2a }),
      ]), { ad: 'gonder' });
      gonder.position.set(0, 0.09, 0.41); g.add(gonder);
      m.ozel = { secim, harfler };
      carkCiz(m);
    } else if (b.tur === 'labirent') {
      const lDoku = doku(256, 256, () => {});
      const ekran = duzlem(0.62, 0.62, lDoku); ekran.position.set(0, 0.066, 0.03); g.add(ekran);
      const ok = (yon, x, z, ry) => {
        // Ok yere yatık, gösterdiği yöne bakar (yukari = ekranın yukarısı)
        const yonGrup = new THREE.Group(); yonGrup.position.set(x, 0.09, z); yonGrup.rotation.y = ry; g.add(yonGrup);
        const o = ekle(new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.11, 3), new THREE.MeshStandardMaterial({ color: 0xe0e0e0, emissive: 0x333333 })), { ad: 'yuru', yon });
        o.rotation.x = -Math.PI / 2; yonGrup.add(o);
        const tut = ekle(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.16), new THREE.MeshBasicMaterial({ visible: false })), { ad: 'yuru', yon });
        tut.position.set(x, 0.1, z); g.add(tut);
      };
      ok('yukari', 0, -0.36, 0); ok('asagi', 0, 0.43, Math.PI); ok('sol', -0.43, 0.03, Math.PI / 2); ok('sag', 0.43, 0.03, -Math.PI / 2);
      m.ozel = { lDoku, yer: [...b.ilerleme] };
      labirentCiz(m);
    } else if (b.tur === 'kelime') {
      const eDoku = doku(320, 112, (c) => {
        c.fillStyle = '#0a0a12'; c.fillRect(0, 0, 320, 112);
        yazi(c, G.ekran.kelime, 160, 60, G.ekran.kelime.length > 6 ? 54 : 66, R[G.ekran.renk].hex, 'Black Ops One', 400);
      });
      const ekran = duzlem(0.66, 0.23, eDoku); ekran.position.set(0.04, 0.066, -0.3); g.add(ekran);
      const kutu = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.03, 0.28), new THREE.MeshStandardMaterial({ color: 0x111111 }));
      kutu.position.set(0.04, 0.05, -0.3); g.add(kutu);
      const tuslar = G.dugmeler.map((dg, k) => {
        const tx = k % 2 ? 0.2 : -0.2, tz = k < 2 ? 0.02 : 0.3;
        const tDoku = doku(256, 128, (c) => { c.fillStyle = '#26262e'; c.fillRect(0, 0, 256, 128); yazi(c, dg.kelime, 128, 68, dg.kelime.length > 6 ? 44 : 56, R[dg.renk].hex, 'Black Ops One', 400); });
        const gri = new THREE.MeshStandardMaterial({ color: 0x3a3a44 });
        const tus = ekle(new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.07, 0.22), [gri, gri, new THREE.MeshStandardMaterial({ map: tDoku }), gri, gri, gri]), { ad: 'tus', tus: k });
        tus.position.set(tx, 0.1, tz); tus.castShadow = true; g.add(tus);
        return { tus };
      });
      m.ozel = { tuslar };
    } else if (b.tur === 'salter') {
      const et = duzlem(0.16, 0.16, doku(96, 96, (c) => { c.fillStyle = '#e9e2cf'; c.fillRect(0, 0, 96, 96); c.strokeStyle = '#222'; c.lineWidth = 5; c.strokeRect(4, 4, 88, 88); yazi(c, G.harf, 48, 52, 64, '#111', 'Special Elite', 400); }));
      et.position.set(-0.14, 0.066, -0.38); g.add(et);
      const ekran = duzlem(0.2, 0.14, doku(128, 90, (c) => { c.fillStyle = '#081a08'; c.fillRect(0, 0, 128, 90); yazi(c, String(G.ekran), 64, 48, 70, '#5cff7a', 'Black Ops One', 400); }));
      ekran.position.set(0.17, 0.066, -0.38); g.add(ekran);
      const durum = [...G.baslangic];
      const kollar = G.renkler.map((rk, k) => {
        const sx = -0.36 + k * 0.18;
        const taban = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.22), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
        taban.position.set(sx, 0.085, 0.06); g.add(taban);
        const kol = new THREE.Group(); kol.position.set(sx, 0.1, 0.06); g.add(kol);
        const cubuk = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.2, 8), new THREE.MeshStandardMaterial({ color: 0xcfcfcf, metalness: 0.9, roughness: 0.2 }));
        cubuk.position.y = 0.1; kol.add(cubuk);
        const bas = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), new THREE.MeshStandardMaterial({ color: R[rk].hex, roughness: 0.4 }));
        bas.position.y = 0.21; kol.add(bas);
        const tut = ekle(new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.26, 0.3), new THREE.MeshBasicMaterial({ visible: false })), { ad: 'salter', sira: k });
        tut.position.set(sx, 0.18, 0.06); g.add(tut);
        const yon = duzlem(0.08, 0.08, doku(64, 64, (c) => yazi(c, String(k + 1), 32, 34, 44, '#f6ead8')), { saydam: true });
        yon.position.set(sx, 0.066, 0.25); g.add(yon);
        return kol;
      });
      const onay = ekle(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.12), [
        new THREE.MeshStandardMaterial({ color: 0x2a6a2a }), new THREE.MeshStandardMaterial({ color: 0x2a6a2a }),
        new THREE.MeshStandardMaterial({ map: doku(256, 64, (c) => { c.fillStyle = '#2bb34a'; c.fillRect(0, 0, 256, 64); yazi(c, 'ONAY', 128, 34, 40, '#fff'); }) }),
        new THREE.MeshStandardMaterial({ color: 0x2a6a2a }), new THREE.MeshStandardMaterial({ color: 0x2a6a2a }), new THREE.MeshStandardMaterial({ color: 0x2a6a2a }),
      ]), { ad: 'onay' });
      onay.position.set(0, 0.09, 0.41); g.add(onay);
      m.ozel = { durum, kollar };
      salterCiz(m);
    } else if (b.tur === 'kadran') {
      const ekran = duzlem(0.56, 0.16, doku(320, 92, (c) => { c.fillStyle = '#081a08'; c.fillRect(0, 0, 320, 92); yazi(c, G.kelime, 160, 50, 56, '#5cff7a', 'Black Ops One', 400); }));
      ekran.position.set(0.04, 0.066, -0.34); g.add(ekran);
      const yuz = duzlem(0.5, 0.5, doku(256, 256, (c) => {
        c.fillStyle = '#e9e2cf'; c.beginPath(); c.arc(128, 128, 124, 0, Math.PI * 2); c.fill();
        for (let k = 0; k < 8; k++) { const a = -Math.PI / 2 + k * Math.PI / 4; yazi(c, String(k + 1), 128 + Math.cos(a) * 98, 128 + Math.sin(a) * 98, 34, '#1a1a1a'); c.strokeStyle = '#1a1a1a'; c.lineWidth = 4; c.beginPath(); c.moveTo(128 + Math.cos(a) * 66, 128 + Math.sin(a) * 66); c.lineTo(128 + Math.cos(a) * 76, 128 + Math.sin(a) * 76); c.stroke(); }
      }), { saydam: true });
      yuz.position.set(0, 0.066, 0.07); g.add(yuz);
      const cerceve = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.025, 8, 40), new THREE.MeshStandardMaterial({ color: R[G.cerceve].hex, emissive: R[G.cerceve].hex, emissiveIntensity: 0.35 }));
      cerceve.rotation.x = Math.PI / 2; cerceve.position.set(0, 0.075, 0.07); g.add(cerceve);
      const dugme = new THREE.Group(); dugme.position.set(0, 0.08, 0.07); g.add(dugme);
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.06, 20), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.5 }));
      top.position.y = 0.03; dugme.add(top);
      const ibre = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.15), new THREE.MeshStandardMaterial({ color: 0xff3a2a, emissive: 0xff2010, emissiveIntensity: 0.5 }));
      ibre.position.set(0, 0.07, -0.08); dugme.add(ibre);
      const ok = (yon, x) => {
        const o = ekle(new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.1, 3), new THREE.MeshStandardMaterial({ color: 0xe0e0e0, emissive: 0x333333 })), { ad: 'kadranCevir', yon });
        o.rotation.set(0, 0, yon > 0 ? -Math.PI / 2 : Math.PI / 2); o.position.set(x, 0.09, 0.07); g.add(o);
        const tut = ekle(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.2), new THREE.MeshBasicMaterial({ visible: false })), { ad: 'kadranCevir', yon });
        tut.position.set(x, 0.1, 0.07); g.add(tut);
      };
      ok(-1, -0.4); ok(1, 0.4);
      const kilitle = ekle(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.12), [
        new THREE.MeshStandardMaterial({ color: 0x6a2a2a }), new THREE.MeshStandardMaterial({ color: 0x6a2a2a }),
        new THREE.MeshStandardMaterial({ map: doku(256, 64, (c) => { c.fillStyle = '#c8341e'; c.fillRect(0, 0, 256, 64); yazi(c, 'KİLİTLE', 128, 34, 40, '#fff'); }) }),
        new THREE.MeshStandardMaterial({ color: 0x6a2a2a }), new THREE.MeshStandardMaterial({ color: 0x6a2a2a }), new THREE.MeshStandardMaterial({ color: 0x6a2a2a }),
      ]), { ad: 'kilitle' });
      kilitle.position.set(0, 0.09, 0.43); g.add(kilitle);
      m.ozel = { konum: G.baslangic, dugme };
      dugme.rotation.y = -(G.baslangic - 1) * Math.PI / 4;
    } else if (b.tur === 'fener') {
      const kafes = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.19, 0.06, 20), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.6 }));
      kafes.position.set(0, 0.09, -0.12); g.add(kafes);
      const camMal = new THREE.MeshStandardMaterial({ color: R[G.cam].hex, emissive: R[G.cam].hex, emissiveIntensity: 0.05, transparent: true, opacity: 0.85, roughness: 0.2 });
      const cam = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), camMal);
      cam.position.set(0, 0.12, -0.12); g.add(cam);
      for (let k = 0; k < 4; k++) { const tel = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.006, 4, 24, Math.PI), new THREE.MeshStandardMaterial({ color: 0x222222 })); tel.position.set(0, 0.12, -0.12); tel.rotation.y = k * Math.PI / 4; g.add(tel); }
      const isik = new THREE.PointLight(R[G.cam].hex, 0, 1.2, 2); isik.position.set(0, 0.3, -0.12); g.add(isik);
      const tuslar = ['A', 'B', 'C', 'D'].map((h, k) => {
        const tx = -0.33 + k * 0.22;
        const gri = new THREE.MeshStandardMaterial({ color: 0x3a3a44 });
        const tus = ekle(new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.07, 0.17), [gri, gri, new THREE.MeshStandardMaterial({ map: doku(96, 96, (c) => { c.fillStyle = '#d8cfb8'; c.fillRect(0, 0, 96, 96); yazi(c, h, 48, 52, 62, '#1a1a1a', 'Black Ops One', 400); }) }), gri, gri, gri]), { ad: 'tus', tus: k });
        tus.position.set(tx, 0.1, 0.3); tus.castShadow = true; g.add(tus);
        return { tus };
      });
      // Yanıp sönme: yanma kez (0.35 sn yanık, 0.35 sn sönük), sonra 1.6 sn ara
      const dongu = G.yanma * 0.7 + 1.6;
      let t = 0;
      m.ozel = { tuslar };
      animler.push(dt => {
        if (!kokDis) return false;
        t = (t + dt) % dongu;
        const yanik = t < G.yanma * 0.7 && (t % 0.7) < 0.35;
        camMal.emissiveIntensity = yanik ? 2.2 : 0.05; isik.intensity = yanik ? 3 : 0;
        return true;
      });
    } else if (b.tur === 'demet') {
      const et = duzlem(0.3, 0.13, doku(192, 84, (c) => { c.fillStyle = '#e9e2cf'; c.fillRect(0, 0, 192, 84); c.strokeStyle = '#222'; c.lineWidth = 5; c.strokeRect(4, 4, 184, 76); yazi(c, `ETİKET ${G.etiket}`, 96, 44, 38, '#111', 'Special Elite', 400); }));
      et.position.set(-0.06, 0.066, -0.39); g.add(et);
      const n = G.kablolar.length, kablolar = [];
      for (let k = 0; k < n; k++) {
        const kx = -0.38 + (0.76 * k) / (n - 1);
        [-0.24, 0.38].forEach(tz => { const t = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), new THREE.MeshStandardMaterial({ color: 0xbfbfbf, metalness: 0.8, roughness: 0.3 })); t.position.set(kx, 0.085, tz); g.add(t); });
        const yol = new THREE.CatmullRomCurve3([new THREE.Vector3(kx, 0.1, -0.24), new THREE.Vector3(kx - 0.03, 0.18, -0.05), new THREE.Vector3(kx + 0.03, 0.18, 0.18), new THREE.Vector3(kx, 0.1, 0.38)]);
        const mal = new THREE.MeshStandardMaterial({ color: R[G.kablolar[k]].hex, roughness: 0.45 });
        const tel = ekle(new THREE.Mesh(new THREE.TubeGeometry(yol, 24, 0.022, 8), mal), { ad: 'kes', kablo: k });
        tel.castShadow = true; g.add(tel);
        const tut = ekle(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.56), new THREE.MeshBasicMaterial({ visible: false })), { ad: 'kes', kablo: k });
        tut.position.set(kx, 0.17, 0.07); g.add(tut);
        const p1 = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([yol.points[0], new THREE.Vector3(kx - 0.02, 0.18, -0.07)]), 6, 0.022, 8), mal);
        const p2 = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(kx + 0.04, 0.16, 0.16), yol.points[3]]), 6, 0.022, 8), mal);
        p1.visible = p2.visible = false; g.add(p1, p2);
        const etiket = duzlem(0.08, 0.08, doku(64, 64, (c) => yazi(c, String(k + 1), 32, 34, 48, '#f6ead8')), { saydam: true });
        etiket.position.set(kx, 0.066, 0.46); g.add(etiket);
        kablolar.push({ tel, tut, p1, p2 });
      }
      m.ozel.kablolar = kablolar;
    }
    return m;
  }

  function salterCiz(m) {
    m.ozel.kollar.forEach((kol, k) => { kol.rotation.x = m.ozel.durum[k] ? -0.55 : 0.55; });
  }

  // Labirent ekranı: noktalar, yeşil halkalar, beyaz nokta (bombacı), kırmızı üçgen (hedef). Duvarlar görünmez!
  function labirentCiz(m) {
    const G = m.b.gorunum, c = m.ozel.lDoku.userData.c, x = c.getContext('2d');
    const K = 30, H = 36;
    x.fillStyle = '#071407'; x.fillRect(0, 0, 256, 256);
    x.font = '900 18px Nunito, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#5cff7a';
    for (let i = 0; i < 6; i++) { x.fillText('ABCDEF'[i], K + i * H + H / 2, 15); x.fillText(String(i + 1), 14, K + i * H + H / 2); }
    for (let yy = 0; yy < 6; yy++) for (let xx = 0; xx < 6; xx++) { x.fillStyle = 'rgba(92,255,122,0.35)'; x.beginPath(); x.arc(K + xx * H + H / 2, K + yy * H + H / 2, 3, 0, Math.PI * 2); x.fill(); }
    G.isaret.forEach(([ix, iy]) => { x.strokeStyle = '#3ddc6a'; x.lineWidth = 4; x.beginPath(); x.arc(K + ix * H + H / 2, K + iy * H + H / 2, 13, 0, Math.PI * 2); x.stroke(); });
    const [hx, hy] = G.hedef; const cx = K + hx * H + H / 2, cy = K + hy * H + H / 2;
    x.fillStyle = '#ff3a2a'; x.beginPath(); x.moveTo(cx, cy - 11); x.lineTo(cx + 11, cy + 9); x.lineTo(cx - 11, cy + 9); x.closePath(); x.fill();
    const [px, py] = m.ozel.yer;
    x.fillStyle = '#ffffff'; x.shadowColor = '#fff'; x.shadowBlur = 10; x.beginPath(); x.arc(K + px * H + H / 2, K + py * H + H / 2, 9, 0, Math.PI * 2); x.fill(); x.shadowBlur = 0;
    m.ozel.lDoku.needsUpdate = true;
  }

  function carkCiz(m) {
    const G = m.b.gorunum;
    m.ozel.harfler.forEach((h, k) => {
      const c = h.hDoku.userData.c, x = c.getContext('2d');
      x.fillStyle = '#efe6cf'; x.fillRect(0, 0, 128, 160);
      x.fillStyle = 'rgba(0,0,0,0.15)'; x.fillRect(0, 0, 128, 26); x.fillRect(0, 134, 128, 26);
      const harf = G.carklar[k][((m.ozel.secim[k] % 5) + 5) % 5];
      yazi(x, harf, 64, 84, 92, '#1a1a1a', 'Nunito', 900);
      h.hDoku.needsUpdate = true;
    });
  }

  // Oda sahibinden gelen sonuçlar
  function bolumDurumu(i, r) {
    if (!bomba) return;
    const m = bomba.moduller[i];
    if (r.cozuldu || r.tip === 'dogru') { m.led.material.color.set(0x115511); m.led.material.emissive.set(0x30ff60); m.led.material.emissiveIntensity = 1.2; }
    if ((m.b.tur === 'kablo' || m.b.tur === 'demet') && Array.isArray(r.ilerleme)) r.ilerleme.forEach(k => kabloKes(m, k));
    if (m.b.tur === 'labirent' && Array.isArray(r.ilerleme) && r.ilerleme.length === 2) { m.ozel.yer = [...r.ilerleme]; labirentCiz(m); }
    if (m.b.tur === 'tus') m.ozel.tuslar.forEach((t, k) => { const yandi = (r.ilerleme || []).includes(k) || r.tip === 'dogru'; t.l.material.emissive.set(yandi ? 0x30ff60 : 0x000000); });
    if (r.tip === 'hata') { m.led.material.emissiveIntensity = 3; setTimeout(() => { if (!m.b.cozuldu) m.led.material.emissiveIntensity = 0.4; }, 600); kam.salla = 0.25; }
  }
  function kabloKes(m, k) {
    const kb = m.ozel.kablolar[k];
    if (!kb || !kb.tel.visible) return;
    kb.tel.visible = false; kb.tut.visible = false; kb.p1.visible = kb.p2.visible = true;
    tiklanabilir = tiklanabilir.filter(x => x !== kb.tel && x !== kb.tut);
  }
  function hatalariCiz(n) {
    if (!bomba) return;
    bomba.hataIsik.forEach((l, i) => { const dolu = i < n; l.material.color.set(dolu ? 0xff2020 : 0x3a1010); l.material.emissive.set(dolu ? 0xff2020 : 0x000000); l.material.emissiveIntensity = dolu ? 1.5 : 0; });
  }
  function sayacCiz(metin, hedef = bomba) {
    if (!hedef || hedef.sonSaat === metin) return;
    hedef.sonSaat = metin;
    const c = hedef.sayacDoku.userData.c, g = c.getContext('2d');
    g.fillStyle = '#080202'; g.fillRect(0, 0, 512, 160);
    g.font = '400 128px "Black Ops One", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = 'rgba(255,40,20,0.12)'; g.fillText('88:88', 256, 86);
    g.fillStyle = '#ff2a1a'; g.shadowColor = '#ff2a1a'; g.shadowBlur = 18; g.fillText(metin, 256, 86); g.shadowBlur = 0;
    hedef.sayacDoku.needsUpdate = true;
  }

  // Patlama / çözüldü
  function patla() {
    if (!kok) return;
    const flas = new THREE.PointLight(0xffa040, 400, 30, 1.2); flas.position.set(0, MASA_Y + 1.5, 0); scene.add(flas);
    const top = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffb040, transparent: true, opacity: 0.95 }));
    top.position.set(0, MASA_Y + 0.6, 0); scene.add(top);
    const parcalar = [];
    for (let i = 0; i < 40; i++) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.08 + Math.random() * 0.15, 0.06, 0.1), new THREE.MeshStandardMaterial({ color: i % 3 ? 0x2c3036 : 0xc8341e }));
      p.position.set(0, MASA_Y + 0.6, 0);
      p.userData.v = new THREE.Vector3((Math.random() - 0.5) * 9, Math.random() * 7 + 2, (Math.random() - 0.5) * 9);
      scene.add(p); parcalar.push(p);
    }
    if (bomba) bomba.moduller.forEach(m => { m.g.visible = false; });
    kok.children.forEach(c => { c.visible = false; });
    kam.salla = 1.2;
    let t = 0;
    animler.push(dt => {
      t += dt;
      top.scale.setScalar(1 + t * 9); top.material.opacity = Math.max(0, 0.95 - t * 1.4);
      flas.intensity = Math.max(0, 400 - t * 500);
      parcalar.forEach(p => { p.userData.v.y -= 14 * dt; p.position.addScaledVector(p.userData.v, dt); p.rotation.x += dt * 6; if (p.position.y < 0.05) { p.position.y = 0.05; p.userData.v.set(0, 0, 0); } });
      if (t > 4) { scene.remove(top, flas); parcalar.forEach(p => scene.remove(p)); return false; }
      return true;
    });
  }
  function cozuldu() {
    if (bomba) bomba.moduller.forEach(m => { m.led.material.emissive.set(0x30ff60); m.led.material.emissiveIntensity = 1.4; });
  }

  // =============================================================
  // ÇANTA (yönlendirici) — masanın ortasında, her yöne döndürülebilir
  // =============================================================
  let canta = null;
  const BAS_Q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.35, -0.5, 0));
  const kupQ = new THREE.Quaternion(), hedefQ = new THREE.Quaternion(), _q = new THREE.Quaternion();
  const EKSEN_Y = new THREE.Vector3(0, 1, 0), EKSEN_X = new THREE.Vector3(1, 0, 0);

  function cantaKur(bilgi, { olay, saatYazi }) {
    // bilgi: { sol, sag, sira (zincirdeki no), ad }
    temizle();
    mod = 'canta';
    olayFn = olay; saatYaziFn = saatYazi;
    kok = new THREE.Group(); scene.add(kok); kokDis = kok;
    const W = 2.4, H = 0.75, D = 1.7;
    const tut = new THREE.Group();   // dönen kısım
    tut.position.set(0, MASA_Y + 1.35, 0);
    kok.add(tut);
    const deri = (renk = '#6b3e22', gw = 512, gh = 512) => doku(gw, gh, (g, w, h) => {
      g.fillStyle = renk; g.fillRect(0, 0, w, h);
      for (let i = 0; i < (w * h) / 90; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
      g.strokeStyle = 'rgba(255,220,170,0.35)'; g.setLineDash([10, 8]); g.lineWidth = 4; g.strokeRect(18, 18, w - 36, h - 36);
    });
    const yuzDoku = (ciz, renk, gw, gh) => { const t = deri(renk, gw, gh); const c = t.userData.c, g = c.getContext('2d'); g.setLineDash([]); ciz(g, c.width, c.height); t.needsUpdate = true; return t; };
    const kodYazisi = (baslik, kod) => (g, w, h) => {
      // Yan yüz 1.7 × 0.47 boyutunda: doku 1024 × 284 (oran korunur)
      g.fillStyle = '#e9dcbc'; g.fillRect(w * 0.2, h * 0.14, w * 0.6, h * 0.72);
      g.strokeStyle = '#3a2410'; g.lineWidth = 8; g.strokeRect(w * 0.2, h * 0.14, w * 0.6, h * 0.72);
      yazi(g, baslik, w / 2, h * 0.3, 40, '#5a2a10', 'Nunito', 900);
      yazi(g, kod, w / 2, h * 0.62, 130, '#1a0f08', 'Special Elite', 400);
    };
    // Yüzler: +x sağ, -x sol, +y üst, -y alt, +z ön, -z arka
    const malzeme = [
      new THREE.MeshStandardMaterial({ map: yuzDoku(kodYazisi('KOD · 3. RAKAM', bilgi.sag), undefined, 1024, 284), roughness: 0.75 }),
      new THREE.MeshStandardMaterial({ map: yuzDoku(kodYazisi('KOD · 1-2. RAKAM', bilgi.sol), undefined, 1024, 284), roughness: 0.75 }),
      new THREE.MeshStandardMaterial({ map: yuzDoku((g, w, h) => {
        g.save(); g.translate(w / 2, h / 2); g.rotate(-0.25);
        g.strokeStyle = 'rgba(200,30,20,0.85)'; g.lineWidth = 10; g.strokeRect(-190, -60, 380, 120);
        yazi(g, 'GİZLİ', 0, 4, 96, 'rgba(200,30,20,0.85)', 'Black Ops One', 400); g.restore();
        yazi(g, `${bilgi.sira}. HALKA`, w / 2, h * 0.85, 40, 'rgba(255,230,190,0.8)', 'Special Elite', 400);
      }), roughness: 0.75 }),
      new THREE.MeshStandardMaterial({ map: yuzDoku((g, w, h) => {
        g.fillStyle = '#e9dcbc'; g.fillRect(w * 0.06, h * 0.2, w * 0.88, h * 0.6);
        yazi(g, 'KOD · 4. RAKAM', w / 2, h * 0.32, 40, '#5a2a10', 'Nunito', 900);
        yazi(g, 'Bombanın SERİ NO', w / 2, h * 0.5, 44, '#1a0f08', 'Special Elite', 400);
        yazi(g, 'son rakamı', w / 2, h * 0.64, 44, '#1a0f08', 'Special Elite', 400);
      }, '#4a2a16'), roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ map: deri(), roughness: 0.75 }),
      new THREE.MeshStandardMaterial({ map: yuzDoku((g, w, h) => {
        // arka: eski çıkartmalar
        const cikartma = (x, y, r, renk, metin) => { g.save(); g.translate(x, y); g.rotate(r); g.fillStyle = renk; g.fillRect(-110, -45, 220, 90); yazi(g, metin, 0, 2, 36, '#111', 'Special Elite', 400); g.restore(); };
        cikartma(150, 170, -0.2, '#f2c21a', 'KIRILIR!');
        cikartma(350, 330, 0.15, '#9fd0ff', 'BU TARAF ÜST');
        cikartma(170, 380, 0.3, '#ffb0a0', 'ANKARA ✈');
      }), roughness: 0.75 }),
    ];
    // Gövde (alt kutu) ve kapak (üst kutu, menteşe arkada)
    const govde = new THREE.Mesh(new THREE.BoxGeometry(W, H * 0.62, D), [malzeme[0], malzeme[1], new THREE.MeshStandardMaterial({ color: 0x2a160b }), malzeme[3], malzeme[4], malzeme[5]]);
    govde.position.y = -H * 0.19; govde.castShadow = true;
    tut.add(govde);
    // İç: kağıtlar (kapak açılınca görünür)
    const kagit = new THREE.Mesh(new THREE.BoxGeometry(W * 0.86, 0.12, D * 0.8), new THREE.MeshStandardMaterial({ color: 0xf3ead2 }));
    kagit.position.y = H * 0.07; tut.add(kagit);
    const mentese = new THREE.Group(); mentese.position.set(0, H * 0.12, -D / 2); tut.add(mentese);
    const kapak = new THREE.Mesh(new THREE.BoxGeometry(W, H * 0.38, D), [new THREE.MeshStandardMaterial({ map: deri('#6b3e22', 512, 160), roughness: 0.75 }), new THREE.MeshStandardMaterial({ map: deri('#6b3e22', 512, 160), roughness: 0.75 }), malzeme[2], new THREE.MeshStandardMaterial({ color: 0x3a2010 }), malzeme[4].clone(), malzeme[5].clone()]);
    kapak.position.set(0, H * 0.19, D / 2); kapak.castShadow = true;
    mentese.add(kapak);
    // Sap
    const sap = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.06, 10, 24, Math.PI), new THREE.MeshStandardMaterial({ color: 0x1a0f08, roughness: 0.5 }));
    sap.position.set(0, H * 0.2, D / 2 + 0.05); sap.rotation.x = Math.PI / 2; sap.rotation.z = Math.PI; sap.scale.set(1, 1, 0.6);
    kapak.add(sap); sap.position.set(-0.35, H * 0.19 + 0.04, D / 2 - 0.06); sap.rotation.set(-Math.PI / 2, 0, 0); sap.scale.set(1, 1, 1);   // kapağın üstünde, ön kenarda yatık
    // Ön yüzde şifreli kilit ve kilit dilleri
    const kilitDoku = doku(256, 96, (g, w, h) => {
      g.fillStyle = '#c9a24a'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#111'; for (let i = 0; i < 4; i++) g.fillRect(28 + i * 52, 22, 40, 52);
      for (let i = 0; i < 4; i++) yazi(g, '?', 48 + i * 52, 50, 40, '#f2c21a', 'Black Ops One', 400);
    });
    const kilit = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.22, 0.06), [
      new THREE.MeshStandardMaterial({ color: 0xc9a24a, metalness: 0.8, roughness: 0.3 }), new THREE.MeshStandardMaterial({ color: 0xc9a24a, metalness: 0.8, roughness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0xc9a24a, metalness: 0.8 }), new THREE.MeshStandardMaterial({ color: 0xc9a24a, metalness: 0.8 }),
      new THREE.MeshStandardMaterial({ map: kilitDoku, metalness: 0.5, roughness: 0.35 }), new THREE.MeshStandardMaterial({ color: 0xc9a24a }),
    ]);
    kilit.position.set(0, 0.0, D / 2 + 0.03); tut.add(kilit);
    [-0.85, 0.85].forEach(x => {
      const dil = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 0.06), new THREE.MeshStandardMaterial({ color: 0xc9a24a, metalness: 0.8, roughness: 0.3 }));
      dil.position.set(x, 0.0, D / 2 + 0.03); tut.add(dil);
    });
    // köşe metalleri
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => [-1, 1].forEach(sy => {
      const k = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.16), new THREE.MeshStandardMaterial({ color: 0xb08a3a, metalness: 0.8, roughness: 0.35 }));
      k.position.set(sx * (W / 2 - 0.06), sy === 1 ? H * 0.32 : -H * 0.46, sz * (D / 2 - 0.06)); tut.add(k);
    }));
    // Kapağın üstünde bombanın imha sayacı (herkes süreyi görsün)
    const sayacDoku = doku(512, 160, () => {});
    const sayacKutu = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.08, 0.38), new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.5 }));
    sayacKutu.position.set(0.45, H * 0.19 + 0.04, -0.42); kapak.add(sayacKutu);
    const sayacYuz = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 0.3), new THREE.MeshBasicMaterial({ map: sayacDoku }));
    sayacYuz.rotation.x = -Math.PI / 2; sayacYuz.position.set(0.45, H * 0.19 + 0.081, -0.42); kapak.add(sayacYuz);
    const sayacKablo = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.98, H * 0.19 + 0.04, -0.42), new THREE.Vector3(1.15, H * 0.19 + 0.06, -0.5), new THREE.Vector3(1.22, H * 0.05, -0.6)]), 12, 0.02, 6), new THREE.MeshStandardMaterial({ color: 0xe23434 }));
    kapak.add(sayacKablo);
    canta = { tut, mentese, acik: false, acilma: 0, sayacDoku, sonSaat: '' };
    kupQ.copy(BAS_Q); hedefQ.copy(BAS_Q);
    tut.quaternion.copy(kupQ);
    kam.hPoz.set(0, MASA_Y + 2.7, 5.6);
    kam.hBak.set(0, MASA_Y + 0.75, 0);
    kam.sigdir = 0.72;
    kam.poz.copy(kam.hPoz); kam.bak.copy(kam.hBak);
  }
  function cantaAc() {
    if (!canta || canta.acik) return;
    canta.acik = true;
    hedefQ.copy(BAS_Q);
  }

  // =============================================================
  // Girdi: dokunma / fare
  // =============================================================
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let suruk = null;
  function vurulan(e) {
    ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const h = ray.intersectObjects(tiklanabilir, false)[0];
    return h ? h.object.userData.tik : null;
  }
  function girdiKur(canvas) {
    canvas.addEventListener('pointerdown', e => {
      Ses.ac();
      if (mod === 'canta') { suruk = { x: e.clientX, y: e.clientY, id: e.pointerId }; canvas.setPointerCapture(e.pointerId); return; }
      if (mod !== 'bomba' || !bomba) return;
      const t = vurulan(e);
      if (!t) return;
      if (yakin === null || t.bolum !== yakin) { if (t.bolum !== undefined && !bomba.donuyor) bolumeYaklas(t.bolum); return; }
      const m = bomba.moduller[t.bolum];
      if (m.b.cozuldu || bomba.d.bitti) return;
      if (t.ad === 'kes') { kabloKes(m, t.kablo); Ses.kes(); olayFn({ tip: 'hamle', e: { bolum: t.bolum, ad: 'kes', kablo: t.kablo } }); }
      else if (t.ad === 'tus') { Ses.tus(); const tus = m.ozel.tuslar[t.tus].tus; tus.position.y = 0.07; setTimeout(() => { tus.position.y = 0.1; }, 140); olayFn({ tip: 'hamle', e: { bolum: t.bolum, ad: 'tus', tus: t.tus } }); }
      else if (t.ad === 'salter') { Ses.tak(); m.ozel.durum[t.sira] = 1 - m.ozel.durum[t.sira]; salterCiz(m); }
      else if (t.ad === 'onay') { Ses.tus(); olayFn({ tip: 'hamle', e: { bolum: t.bolum, ad: 'onay', durum: [...m.ozel.durum] } }); }
      else if (t.ad === 'kadranCevir') { Ses.tak(); m.ozel.konum = ((m.ozel.konum - 1 + t.yon + 8) % 8) + 1; m.ozel.dugme.rotation.y = -(m.ozel.konum - 1) * Math.PI / 4; }
      else if (t.ad === 'kilitle') { Ses.tus(); olayFn({ tip: 'hamle', e: { bolum: t.bolum, ad: 'kilitle', konum: m.ozel.konum } }); }
      else if (t.ad === 'yuru') { Ses.tak(); olayFn({ tip: 'hamle', e: { bolum: t.bolum, ad: 'yuru', yon: t.yon } }); }
      else if (t.ad === 'cevir') { Ses.tak(); m.ozel.secim[t.sutun] += t.yon; carkCiz(m); }
      else if (t.ad === 'gonder') { Ses.tus(); olayFn({ tip: 'hamle', e: { bolum: t.bolum, ad: 'gonder', secim: m.ozel.secim.map(s => ((s % 5) + 5) % 5) } }); }
      else if (t.ad === 'bas') {
        Ses.tus();
        basili = { bolum: t.bolum, t0: performance.now(), m, id: e.pointerId };
        m.ozel.dugme.position.y = 0.13;
        canvas.setPointerCapture(e.pointerId);
      }
    });
    const birak = e => {
      if (suruk && e.pointerId === suruk.id) suruk = null;
      if (basili && e.pointerId === basili.id) {
        const sure = (performance.now() - basili.t0) / 1000;
        const m = basili.m;
        m.ozel.dugme.position.y = 0.17;
        m.ozel.serit.material.emissive.set(0x000000); m.ozel.serit.material.color.set(0x222222);
        olayFn({ tip: 'hamle', e: { bolum: basili.bolum, ad: 'birak', sure, saat: saatYaziFn() } });
        basili = null;
      }
    };
    canvas.addEventListener('pointerup', birak);
    canvas.addEventListener('pointercancel', birak);
    canvas.addEventListener('pointermove', e => {
      if (!suruk || e.pointerId !== suruk.id) return;
      const dx = e.clientX - suruk.x, dy = e.clientY - suruk.y;
      suruk.x = e.clientX; suruk.y = e.clientY;
      _q.setFromAxisAngle(EKSEN_Y, dx * 0.012); hedefQ.premultiply(_q);
      _q.setFromAxisAngle(EKSEN_X, dy * 0.012); hedefQ.premultiply(_q);
    });
  }

  // =============================================================
  // Döngü
  // =============================================================
  function dongu(zaman) {
    requestAnimationFrame(dongu);
    kare(zaman);
  }
  function kare(zaman = performance.now()) {
    const dt = Math.min(0.05, (zaman - (sonZaman || zaman)) / 1000);
    sonZaman = zaman;
    // Kamera yumuşak geçiş + sarsıntı
    kam.poz.lerp(kam.hPoz, Math.min(1, dt * 6));
    kam.bak.lerp(kam.hBak, Math.min(1, dt * 6));
    // Dar (dik telefon) ekranda her şey sığsın diye kamerayı geri çek
    const uzat = Math.max(1, kam.sigdir / camera.aspect);
    camera.position.copy(kam.bak).add(_uz.copy(kam.poz).sub(kam.bak).multiplyScalar(uzat));
    if (kam.salla > 0) { kam.salla = Math.max(0, kam.salla - dt); const s = kam.salla * 0.25; camera.position.x += (Math.random() - 0.5) * s; camera.position.y += (Math.random() - 0.5) * s; }
    camera.lookAt(kam.bak);
    if (mod === 'bomba' && bomba) {
      sayacCiz(saatYaziFn());
      if (basili) {
        const m = basili.m, sure = (performance.now() - basili.t0) / 1000;
        if (sure > 0.5) { const r = R[m.b.gorunum.serit].hex; m.ozel.serit.material.color.set(r); m.ozel.serit.material.emissive.set(r); m.ozel.serit.material.emissiveIntensity = 0.9 + Math.sin(zaman / 120) * 0.2; }
      }
    }
    if (mod === 'canta' && canta) {
      sayacCiz(saatYaziFn(), canta);
      kupQ.slerp(hedefQ, Math.min(1, dt * 12));
      canta.tut.quaternion.copy(kupQ);
      if (canta.acik && canta.acilma < 1) { canta.acilma = Math.min(1, canta.acilma + dt * 1.2); canta.mentese.rotation.x = -canta.acilma * 1.75; }
    }
    animler = animler.filter(f => f(dt) !== false);
    renderer.render(scene, camera);
  }

  return {
    kare, kur, temizle, bombaKur, cantaKur, cantaAc, cevir, bakisGenel: () => bakisGenel(false),
    bolumDurumu, hatalariCiz, patla, cozuldu,
    get yakin() { return yakin; },
  };
})();
