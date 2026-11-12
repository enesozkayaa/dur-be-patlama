// =============================================================
// Dur Be Patlama! - yönerge sayfaları (çantadaki kağıtlar)
// Her bölümün 3 adımı ayrı sayfadır. Sayfa sadece o adımı anlatır; önceki adımın sonucunu
// başkasından öğrenmen, kendi sonucunu da sonraki adımı tutana iletmen gerekir.
// =============================================================

const Kilavuz = (() => {
  const R = Motor.RENKLER;
  const renk = r => `<span class="renk" style="background:${R[r].hex}"></span>${R[r].ad}`;
  const ADIM_AD = ['1. adım', '2. adım', '3. adım'];

  function sayfaHtml(d, bolumNo, adim) {
    const b = d.bolumler[bolumNo];
    const [t1, t2, t3] = b.tablolar;
    const bas = `<h3>${Motor.TUR_IKON[b.tur]} Bölüm ${b.no} · ${Motor.TUR_AD[b.tur]}</h3><span class="adim">${ADIM_AD[adim]} / 3</span>`;
    let ic = '';
    if (b.tur === 'kablo') {
      if (adim === 0) {
        ic = `<p>Bölümün köşesinde bir <b>şekil</b> çizili. Bombacıya şeklin neye benzediğini sor ve aşağıdan <b>harfi</b> bul.</p>
          <table><tr><th>Şekil</th><th>Harf</th><th>Şekil</th><th>Harf</th></tr>
          ${[0, 2, 4, 6].map(i => `<tr>${[i, i + 1].map(j => { const s = Motor.SEKILLER[j]; return `<td><img class="sekil" src="${Cizim.sekilResim(s)}" alt=""></td><td><b>${t1[s]}</b></td>`; }).join('')}</tr>`).join('')}
          </table><p class="not">Bulduğun harf <b>2. adıma</b> lazım.</p>`;
      } else if (adim === 1) {
        ic = `<p>1. adımdan gelen <b>harf</b> ve bölümdeki <b>kablo sayısı</b> ile <b>rengi</b> bul.</p>
          <div class="tabloKaydir"><table><tr><th>Harf</th>${[3, 4, 5, 6].map(n => `<th>${n} kablo</th>`).join('')}</tr>
          ${Motor.HARFLER.map(h => `<tr><th>${h}</th>${[3, 4, 5, 6].map(n => `<td class="sol">${renk(t2[h][n])}</td>`).join('')}</tr>`).join('')}
          </table></div><p class="not">Bulduğun renk <b>3. adıma</b> lazım. Kablo sayısını bombacıdan öğren.</p>`;
      } else {
        const hangi = { ilk: 'soldan <b>ilk</b>', son: 'soldan <b>son</b>', ikinci: 'soldan <b>ikinci</b> (yalnız bir tane varsa onu)' };
        ic = `<p>2. adımdan gelen <b>renge</b> göre hangi kablonun kesileceğini bul. Kablolar soldan sağa 1, 2, 3… diye numaralıdır.</p>
          <table><tr><th class="sol">Renk</th><th class="sol">Bu renkte kablo varsa</th><th>Hiç yoksa</th></tr>
          ${Motor.KABLO_RENK.map(r => `<tr><td class="sol">${renk(r)}</td><td class="sol">O renkteki ${hangi[t3[r].hangi]} kabloyu kes</td><td><b>${t3[r].yoksa}.</b> kabloyu kes</td></tr>`).join('')}
          </table><p class="not">Bunu bombacıya ulaştır: hangi kablo kesilecek?</p>`;
      }
    } else if (b.tur === 'dugme') {
      if (adim === 0) {
        ic = `<p>Büyük düğmenin üstünde bir <b>kelime</b> yazıyor. Kelimeye göre <b>sayıyı</b> bul.</p>
          <table><tr><th>Kelime</th><th>Sayı</th></tr>${Motor.DUGME_YAZI.map(y => `<tr><td>${y}</td><td><b>${t1[y]}</b></td></tr>`).join('')}</table>
          <p class="not">Bulduğun sayı <b>2. adıma</b> lazım.</p>`;
      } else if (adim === 1) {
        ic = `<p>1. adımdan gelen <b>sayı</b> ve düğmenin <b>rengi</b> ile ne yapılacağını bul.</p>
          <div class="tabloKaydir"><table><tr><th>Renk</th>${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<th>${n}</th>`).join('')}</tr>
          ${Motor.DUGME_RENK.map(r => `<tr><td class="sol">${renk(r)}</td>${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<td>${t2[r][n] === 'tut' ? '✊' : '👆'}</td>`).join('')}</tr>`).join('')}
          </table></div><p>👆 = <b>Kısa bas</b> ve hemen bırak. Bölüm biter.<br>✊ = <b>Basılı tut</b>, bırakma zamanını <b>3. adım</b> söyler.</p>`;
      } else {
        ic = `<p>Düğme basılı tutulunca yanındaki <b>şerit</b> bir renkte yanar. Şeridin rengine göre <b>bırakma rakamını</b> bul.</p>
          <table><tr><th class="sol">Şerit</th><th>Rakam</th></tr>${Motor.SERIT_RENK.map(r => `<tr><td class="sol">${renk(r)}</td><td><b>${t3[r]}</b></td></tr>`).join('')}</table>
          <p class="not">Bombacı, <b>sayaçta bu rakam herhangi bir yerde görünürken</b> düğmeyi bırakmalı (ör. rakam 4 ise 01:<b>4</b>7 olur).</p>`;
      }
    } else if (b.tur === 'tus') {
      if (adim === 0) {
        ic = `<p>Tuş takımında 4 tuş var, her birinde bir <b>işaret</b>. Her işaretin <b>harfini</b> bul.</p>
          <table><tr><th>İşaret</th><th>Harf</th><th>İşaret</th><th>Harf</th><th>İşaret</th><th>Harf</th></tr>
          ${[0, 3, 6, 9].map(i => `<tr>${[i, i + 1, i + 2].map(j => { const s = Motor.ISARETLER[j]; return `<td class="isaret">${s}</td><td><b>${t1[s]}</b></td>`; }).join('')}</tr>`).join('')}
          </table><p class="not">Harfler <b>2. adıma</b> lazım.</p>`;
      } else if (adim === 1) {
        ic = `<p>1. adımdan gelen <b>harflerin</b> sayılarını bul.</p>
          <table><tr><th>Harf</th><th>Sayı</th><th>Harf</th><th>Sayı</th><th>Harf</th><th>Sayı</th></tr>
          ${[0, 3, 6, 9].map(i => `<tr>${[i, i + 1, i + 2].map(j => { const h = 'ABCDEFGHJKLM'[j]; return `<td>${h}</td><td><b>${t2[h]}</b></td>`; }).join('')}</tr>`).join('')}
          </table><p class="not">Sayılar <b>3. adıma</b> lazım: hangi sırayla basılacağını o söyler.</p>`;
      } else {
        ic = `<p>Tuş takımının üstündeki <b>ışığın rengine</b> göre tuşlara basma sırasını bul.</p>
          <table><tr><th class="sol">Işık</th><th class="sol">Sıra</th></tr>${Motor.TUS_ISIK.map(r => `<tr><td class="sol">${renk(r)}</td><td class="sol">${Motor.SIRALAMA[t3[r]]}</td></tr>`).join('')}</table>
          <p class="not">Sayılar 2. adımda. Yanlış tuşta sıra baştan başlar.</p>`;
      }
    } else if (b.tur === 'cark') {
      if (adim === 0) {
        ic = `<p>Şifre çarkının üstünde bir <b>lamba</b> yanıyor. Lambanın rengine göre <b>kelime listesini</b> bul.</p>
          <table><tr><th class="sol">Lamba</th><th>Liste</th></tr>${Motor.CARK_LAMBA.map(r => `<tr><td class="sol">${renk(r)}</td><td><b>${t1[r]}. liste</b></td></tr>`).join('')}</table>
          <p class="not">Liste numarası <b>2. adıma</b> lazım.</p>`;
      } else if (adim === 1) {
        ic = `<p>Çarkta 4 harf sütunu var. Doğru listedeki kelimelerden <b>sadece biri</b> çarklarla yazılabilir.</p>
          <div class="liste">${t2.map((l, i) => `<div><b>${i + 1}. liste</b>${l.join(' · ')}</div>`).join('')}</div>
          <p class="not">Kelimeyi bulmak için bombacıya sütunlardaki harfleri sor. Kelimenin <b>düz mü ters mi</b> yazılacağını 3. adım söyler.</p>`;
      } else {
        ic = `<p>Çarkın yanındaki küçük <b>ekranda bir sayı</b> var. Sayıya göre kelimenin yönünü bul.</p>
          <table><tr><th>Sayı</th>${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<th>${n}</th>`).join('')}</tr>
          <tr><td>Yön</td>${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<td>${t3[n] === 'ters' ? '⬅ Ters' : 'Düz ➡'}</td>`).join('')}</tr></table>
          <p class="not">Ters: kelime sondan başa yazılır (KAPI → IPAK). Sonra <b>GÖNDER</b>'e basılır.</p>`;
      }
    }
    if (b.tur === 'labirent') {
      if (adim === 0) {
        ic = `<p>Labirentte iki tane <b>yeşil halka</b> var. Halkaların yerlerine göre <b>hangi labirent</b> olduğunu bul. (Sütunlar A-F, satırlar 1-6)</p>
          <div class="liste">${t1.map((is, i) => `<div><b>${i + 1}. labirent</b><img style="width:100%" src="${Cizim.labirentResim(null, 0, 5, is, true)}" alt=""></div>`).join('')}</div>
          <p class="not">Labirent numarası <b>2. ve 3. adıma</b> lazım.</p>`;
      } else {
        const ust = adim === 1;
        ic = `<p>Labirent haritalarının <b>${ust ? 'ÜST yarısı (1-3. satırlar)' : 'ALT yarısı (4-6. satırlar)'}</b>. Diğer yarısı <b>${ust ? '3' : '2'}. adımda</b> (belki başkasının çantasında)!
          Bombacının yerini (beyaz nokta) ve hedefi (kırmızı üçgen) öğren, onu <b>duvarlara çarptırmadan</b> yönlendir: yukarı, aşağı, sola, sağa.</p>
          <div class="liste genis">${t2.map((h, i) => `<div><b>${i + 1}. labirent</b><img style="width:100%" src="${Cizim.labirentResim(h, ust ? 0 : 3, ust ? 2 : 5, h.isaret)}" alt=""></div>`).join('')}</div>
          <p class="not">Kalın çizgiler duvardır. Duvara çarpmak <b>hata</b> sayılır. Kesikli çizgi haritanın kesildiği yerdir (duvar değil); <b style="color:#1f9c45">yeşil oklar</b> ${ust ? '3. satırdan 4. satıra inilebilecek' : '4. satırdan 3. satıra çıkılabilecek'} yerleri gösterir.</p>`;
      }
    } else if (b.tur === 'kelime') {
      if (adim === 0) {
        ic = `<p>Üstteki ekranda bir kelime yazıyor. Kelimeye değil, <b>YAZININ RENGİNE</b> bak! Rengine göre <b>hangi düğmeye</b> bakılacağını bul.</p>
          <table><tr><th class="sol">Ekrandaki yazının rengi</th><th>Bakılacak düğme</th></tr>${Motor.KELIME_RENK.map(r => `<tr><td class="sol">${renk(r)}</td><td><b>${Motor.KONUM[t1[r]]}</b></td></tr>`).join('')}</table>
          <p class="not">O düğmenin üstünde yazan kelime <b>2. adıma</b> lazım.</p>`;
      } else if (adim === 1) {
        ic = `<p>1. adımın söylediği düğmenin <b>üstünde YAZAN kelimeye</b> göre (rengine değil!) bir <b>renk</b> bul.</p>
          <table><tr><th>Kelime</th><th class="sol">Renk</th><th>Kelime</th><th class="sol">Renk</th></tr>
          ${Motor.KARISIK.filter((_, i) => i % 2 === 0).map((_, i) => `<tr>${[i * 2, i * 2 + 1].map(j => { const w = Motor.KARISIK[j]; return w ? `<td><b>${w}</b></td><td class="sol">${renk(t2[w])}</td>` : '<td></td><td></td>'; }).join('')}</tr>`).join('')}
          </table><p class="not">Bulduğun renk <b>3. adıma</b> lazım.</p>`;
      } else {
        ic = `<p>2. adımdan gelen <b>renge</b> göre hangi düğmeye basılacağını bul.</p>
          <table><tr><th class="sol">Renk</th><th class="sol">Basılacak düğme</th></tr>${Motor.KELIME_RENK.map(r => `<tr><td class="sol">${renk(r)}</td><td class="sol">${t3[r] === 'yaziRengi' ? `Yazısı <b>${R[r].ad.toLocaleLowerCase('tr')} renkte</b> olan düğme` : `Üstünde <b>"${Motor.RENK_KELIME(r)}"</b> yazan düğme`}</td></tr>`).join('')}</table>
          <p class="not">Dikkat: "renkte olan" yazının rengi demek, "yazan" ise kelimenin kendisi.</p>`;
      }
    } else if (b.tur === 'demet') {
      if (adim === 0) {
        ic = `<p>Kablo demetinin köşesinde bir <b>etiket numarası</b> var. Numaraya göre <b>sayılacak rengi</b> bul.</p>
          <table><tr><th>Etiket</th><th class="sol">Sayılacak renk</th></tr>${[1, 2, 3, 4, 5, 6].map(n => `<tr><td><b>${n}</b></td><td class="sol">${renk(t1[n])}</td></tr>`).join('')}</table>
          <p class="not">Bombacı bu renkteki kabloları <b>saysın</b>; sayı <b>2. adıma</b> lazım.</p>`;
      } else if (adim === 1) {
        ic = `<p>1. adımdaki renkten <b>kaç kablo</b> olduğuna göre <b>kesilecek rengi</b> bul.</p>
          <table><tr><th>Kablo sayısı</th><th class="sol">Kesilecek renk</th></tr>${[0, 1, 2, 3, 4].map(n => `<tr><td><b>${n === 4 ? '4 ve üstü' : n === 0 ? 'Hiç yok' : n}</b></td><td class="sol">${renk(t2[n])}</td></tr>`).join('')}</table>
          <p class="not">Kesilecek renk <b>3. adıma</b> lazım.</p>`;
      } else {
        ic = `<p>2. adımdan gelen <b>renge</b> göre nasıl kesileceğini bul.</p>
          <table><tr><th class="sol">Renk</th><th class="sol">Ne yapılacak</th></tr>${Motor.KABLO_RENK.map(r => `<tr><td class="sol">${renk(r)}</td><td class="sol">${t3[r] === 'hepsi' ? 'Bu renkteki <b>BÜTÜN</b> kabloları kes' : 'Bu renkteki <b>soldan SONUNCU</b> kabloyu kes'}</td></tr>`).join('')}</table>
          <p class="not">Başka kablo kesmek <b>hata</b> sayılır.</p>`;
      }
    } else if (b.tur === 'salter') {
      if (adim === 0) {
        ic = `<p>Şalter panelinin köşesinde bir <b>harf</b> var. Harfe göre <b>kaçıncı şaltere</b> bakılacağını bul (soldan sayılır).</p>
          <table><tr><th>Panel harfi</th><th>Bakılacak şalter</th></tr>${Motor.PANEL_HARF.map(h => `<tr><td><b>${h}</b></td><td>soldan <b>${t1[h]}.</b></td></tr>`).join('')}</table>
          <p class="not">O şalterin <b>başlık rengi</b> 2. adıma lazım.</p>`;
      } else if (adim === 1) {
        ic = `<p>1. adımın söylediği şalterin <b>rengine</b> göre 5 şalterin <b>dizilimini</b> bul (soldan sağa; ⬆ yukarı, ⬇ aşağı).</p>
          <table><tr><th class="sol">Renk</th><th>Dizilim</th></tr>${Motor.KABLO_RENK.map(r => `<tr><td class="sol">${renk(r)}</td><td style="letter-spacing:3px;font-size:18px">${t2[r].map(x => (x ? '⬆' : '⬇')).join('')}</td></tr>`).join('')}</table>
          <p class="not">Dizilimin nasıl uygulanacağını <b>3. adım</b> söyler.</p>`;
      } else {
        ic = `<p>Panelin küçük <b>ekranındaki sayıya</b> göre dizilimin nasıl uygulanacağını bul. Sonra <b>ONAY</b>'a basılır.</p>
          <table><tr><th>Sayı</th><th class="sol">Ne yapılacak</th></tr>${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<tr><td><b>${n}</b></td><td class="sol">${Motor.SALTER_DONUSUM[t3[n]]}</td></tr>`).join('')}</table>`;
      }
    } else if (b.tur === 'kadran') {
      if (adim === 0) {
        ic = `<p>Kadranın üstündeki ekranda bir <b>kelime</b> yazıyor. Kelimeye göre <b>sayıyı</b> bul.</p>
          <table><tr><th>Kelime</th><th>Sayı</th><th>Kelime</th><th>Sayı</th></tr>${[0, 2, 4, 6].map(i => `<tr>${[i, i + 1].map(j => { const w = Motor.KADRAN_KELIME[j]; return `<td>${w}</td><td><b>${t1[w]}</b></td>`; }).join('')}</tr>`).join('')}</table>
          <p class="not">Sayı <b>2. adıma</b> lazım.</p>`;
      } else if (adim === 1) {
        ic = `<p>Kadranın <b>çerçeve rengi</b> ve 1. adımdaki <b>sayı</b> ile <b>harfi</b> bul.</p>
          <div class="tabloKaydir"><table><tr><th>Çerçeve</th>${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<th>${n}</th>`).join('')}</tr>
          ${Motor.KADRAN_CERCEVE.map(r => `<tr><td class="sol">${renk(r)}</td>${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<td><b>${t2[r][n]}</b></td>`).join('')}</tr>`).join('')}</table></div>
          <p class="not">Harf <b>3. adıma</b> lazım.</p>`;
      } else {
        ic = `<p>2. adımdaki <b>harfe</b> göre kadranın hangi <b>konuma</b> çevrileceğini bul. Kadranın etrafında 1-8 yazar. Sonra <b>KİLİTLE</b>'ye basılır.</p>
          <table><tr><th>Harf</th>${Motor.KADRAN_HARF.map(h => `<th>${h}</th>`).join('')}</tr><tr><td>Konum</td>${Motor.KADRAN_HARF.map(h => `<td><b>${t3[h]}</b></td>`).join('')}</tr></table>`;
      }
    } else if (b.tur === 'fener') {
      if (adim === 0) {
        ic = `<p>Fener birkaç kez <b>yanıp söner</b>, durur, sonra tekrar eder. <b>Kaç kez</b> yandığına göre rengi bul. (Camın rengine aldanma!)</p>
          <table><tr><th>Yanma sayısı</th><th class="sol">Renk</th></tr>${[2, 3, 4, 5, 6, 7].map(n => `<tr><td><b>${n}</b></td><td class="sol">${renk(t1[n])}</td></tr>`).join('')}</table>
          <p class="not">Renk <b>2. adıma</b> lazım.</p>`;
      } else if (adim === 1) {
        ic = `<p>1. adımdan gelen <b>renge</b> göre <b>sayıyı</b> bul.</p>
          <table><tr><th class="sol">Renk</th><th>Sayı</th></tr>${Motor.KABLO_RENK.map(r => `<tr><td class="sol">${renk(r)}</td><td><b>${t2[r]}</b></td></tr>`).join('')}</table>
          <p class="not">Sayı <b>3. adıma</b> lazım.</p>`;
      } else {
        ic = `<p>2. adımdan gelen <b>sayıya</b> göre fenerin altındaki hangi düğmeye basılacağını bul.</p>
          <table><tr><th>Sayı</th><th>Düğme</th></tr>${Object.keys(t3).map(n => `<tr><td><b>${n}</b></td><td><b>${'ABCD'[t3[n]]}</b></td></tr>`).join('')}</table>`;
      }
    }
    if (b.tur === 'numara') {
      if (adim === 0) {
        ic = `<p>Tuş takımının üstündeki ekranda bir <b>kelime</b> yazıyor (rakam gibi görünse de kelimedir!). Kelimeye göre <b>sütunu</b> bul.</p>
          <table><tr><th>Kelime</th><th>Sütun</th><th>Kelime</th><th>Sütun</th></tr>${[0, 2, 4, 6].map(i => `<tr>${[i, i + 1].map(j => { const w = Motor.NUM_KELIME[j]; return `<td>${w}</td><td><b>${t1[w]}</b></td>`; }).join('')}</tr>`).join('')}</table>
          <p class="not">Sütun harfi <b>2. adıma</b> lazım.</p>`;
      } else if (adim === 1) {
        ic = `<p>Tuşların altındaki <b>panelin rengi</b> ve 1. adımdaki <b>sütun</b> ile <b>3 haneli sayıyı</b> bul.</p>
          <table><tr><th class="sol">Panel</th>${Motor.NUM_SUTUN.map(s => `<th>${s}</th>`).join('')}</tr>
          ${Motor.NUM_PANEL.map(r => `<tr><td class="sol">${renk(r)}</td>${Motor.NUM_SUTUN.map(s => `<td><b>${t2[r][s]}</b></td>`).join('')}</tr>`).join('')}</table>
          <p class="not">Sayı <b>3. adıma</b> lazım.</p>`;
      } else {
        ic = `<p>Ekranın yanında 4 küçük <b>kırmızı ışık</b> var. Kaç tanesi <b>yanıyor</b>? Sayıya göre sayıyla ne yapılacağını bul.</p>
          <table><tr><th>Yanan ışık</th><th class="sol">Ne yapılacak</th></tr>${[1, 2, 3, 4].map(n => `<tr><td><b>${n}</b></td><td class="sol">${Motor.NUM_ISLEM[t3[n]]}</td></tr>`).join('')}</table>
          <p class="not">Bombacı 3 rakamı tuşlayıp <b>GİR</b>'e basar. Yanlış tuşlarsa <b>SİL</b> ile siler.</p>`;
      }
    } else if (b.tur === 'sigorta') {
      if (adim === 0) {
        ic = `<p>Sigorta kutusunun <b>çerçeve rengine</b> göre soldan <b>kaçıncı sigortaya bakılacağını</b> bul.</p>
          <table><tr><th class="sol">Çerçeve</th><th>Bakılacak sigorta</th></tr>${Motor.SIGORTA_KUTU.map(r => `<tr><td class="sol">${renk(r)}</td><td>soldan <b>${t1[r]}.</b></td></tr>`).join('')}</table>
          <p class="not">O sigortanın üstündeki <b>numara</b> 2. adıma lazım.</p>`;
      } else if (adim === 1) {
        ic = `<p>1. adımın söylediği sigortanın <b>numarasına</b> göre <b>harfi</b> bul.</p>
          <table><tr><th>Numara</th><th>Harf</th></tr>${Motor.SIGORTA_ARALIK.map(([a, z], k) => `<tr><td>${a} – ${z}</td><td><b>${t2[k]}</b></td></tr>`).join('')}</table>
          <p class="not">Harf <b>3. adıma</b> lazım.</p>`;
      } else {
        ic = `<p>2. adımdan gelen <b>harfe</b> göre hangi sigortanın <b>çekileceğini</b> bul. Bombacı sigortaya dokununca çeker.</p>
          <table><tr><th>Harf</th><th class="sol">Ne yapılacak</th></tr>${Motor.SIGORTA_HARF.map(h => `<tr><td><b>${h}</b></td><td class="sol">${Motor.SIGORTA_KURAL[t3[h]]}</td></tr>`).join('')}</table>
          <p class="not">Bombacıya bütün numaraları sorman gerekebilir.</p>`;
      }
    } else if (b.tur === 'telsiz') {
      const desenYaz = d => [...d].map(x => (x === 'K' ? '•' : '▬')).join(' ');
      if (adim === 0) {
        ic = `<p>Telsizin ışığı (ve sesi) <b>3 sinyal</b> verir, durur, tekrar eder. Her sinyal <b>kısa (•)</b> ya da <b>uzun (▬)</b>. Desene göre <b>kod kelimesini</b> bul.</p>
          <table><tr><th>Desen</th><th>Kelime</th><th>Desen</th><th>Kelime</th></tr>${[0, 2, 4, 6].map(i => `<tr>${[i, i + 1].map(j => { const d = Motor.TELSIZ_DESEN[j]; return `<td style="letter-spacing:2px"><b>${desenYaz(d)}</b></td><td>${t1[d]}</td>`; }).join('')}</tr>`).join('')}</table>
          <p class="not">Kelime <b>2. adıma</b> lazım.</p>`;
      } else if (adim === 1) {
        ic = `<p>1. adımdan gelen <b>kod kelimesine</b> göre <b>kanalı</b> bul.</p>
          <table><tr><th>Kelime</th><th>Kanal</th><th>Kelime</th><th>Kanal</th></tr>${[0, 2, 4, 6].map(i => `<tr>${[i, i + 1].map(j => { const w = Motor.TELSIZ_KELIME[j]; return `<td>${w}</td><td><b>${t2[w]}</b></td>`; }).join('')}</tr>`).join('')}</table>
          <p class="not">Kanal <b>3. adıma</b> lazım.</p>`;
      } else {
        ic = `<p>2. adımdan gelen <b>kanala</b> göre <b>frekansı</b> bul. Bombacı telsizde bu frekansın yazdığı düğmeye basar.</p>
          <table><tr><th>Kanal</th>${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<th>${n}</th>`).join('')}</tr><tr><td>MHz</td>${[1, 2, 3, 4, 5, 6, 7, 8].map(n => `<td><b>${t3[n]}</b></td>`).join('')}</tr></table>`;
      }
    } else if (b.tur === 'vana') {
      if (adim === 0) {
        ic = `<p>Basınç göstergesinin <b>ibresi</b> 0 ile 100 arasında bir yeri gösteriyor. Aralığa göre <b>hangi renkteki vananın</b> çevrileceğini bul.</p>
          <table><tr><th>İbre</th><th class="sol">Vana</th></tr>${Motor.VANA_ARALIK.map(([a, z], k) => `<tr><td>${a} – ${z}</td><td class="sol">${renk(t1[k])}</td></tr>`).join('')}</table>
          <p class="not">Vananın rengi <b>2. adıma</b> lazım.</p>`;
      } else if (adim === 1) {
        ic = `<p>Vananın <b>rengi</b> ve paneldeki <b>etiket harfi</b> ile vananın <b>kaç tur</b> çevrileceğini bul.</p>
          <table><tr><th class="sol">Vana</th>${Motor.VANA_ETIKET.map(e => `<th>${e}</th>`).join('')}</tr>
          ${Motor.VANA_RENK.map(r => `<tr><td class="sol">${renk(r)}</td>${Motor.VANA_ETIKET.map(e => `<td><b>${t2[r][e]}</b></td>`).join('')}</tr>`).join('')}</table>
          <p class="not">Tur sayısı <b>3. adıma</b> lazım.</p>`;
      } else {
        ic = `<p>Paneldeki küçük <b>ekranın sayısına</b> göre vananın hangi <b>yöne</b> çevrileceğini bul.</p>
          <table><tr><th>Sayı</th>${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<th>${n}</th>`).join('')}</tr>
          <tr><td>Yön</td>${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<td>${t3[n] === 'saat' ? '↻' : '↺'}</td>`).join('')}</tr></table>
          <p>↻ = saat yönü, ↺ = saatin tersi. Her vananın iki yanında bu oklar var; her basış <b>1 tur</b> çevirir.</p>
          <p class="not">Diğer vanalar 0'da kalmalı. Sonra <b>BOŞALT</b>'a basılır.</p>`;
      }
    } else if (b.tur === 'yildiz') {
      if (adim === 0) {
        ic = `<p>Ekranda bir <b>takımyıldız</b> var. Bombacıya yıldızların nasıl dizildiğini tarif ettir ve <b>adını</b> bul. (Büyük yıldız, kesik çizgiler ipucudur.)</p>
          <div class="liste">${t1.map((ds, k) => `<div><b>${Motor.YILDIZ_AD[k]}</b><img style="width:100%;border-radius:4px" src="${Cizim.yildizResim(ds)}" alt=""></div>`).join('')}</div>
          <p class="not">Takımyıldızın adı <b>2. adıma</b> lazım.</p>`;
      } else if (adim === 1) {
        ic = `<p>Takımyıldızın <b>adı</b> ve yıldızların <b>rengi</b> ile <b>sayıyı</b> bul.</p>
          <div class="tabloKaydir"><table><tr><th>Ad</th>${Motor.YILDIZ_RENK.map(r => `<th class="sol">${renk(r)}</th>`).join('')}</tr>
          ${Motor.YILDIZ_AD.map(a => `<tr><td>${a}</td>${Motor.YILDIZ_RENK.map(r => `<td><b>${t2[a][r]}</b></td>`).join('')}</tr>`).join('')}</table></div>
          <p class="not">Sayı <b>3. adıma</b> lazım.</p>`;
      } else {
        ic = `<p>2. adımdan gelen <b>sayıya</b> göre <b>Yunan harfini</b> bul. Bombacı bu harfin yazdığı düğmeye basar.</p>
          <table><tr><th>Sayı</th><th>Harf</th><th>Sayı</th><th>Harf</th><th>Sayı</th><th>Harf</th></tr>${[1, 4, 7].map(i => `<tr>${[i, i + 1, i + 2].map(n => `<td><b>${n}</b></td><td class="isaret">${t3[n]}</td>`).join('')}</tr>`).join('')}</table>
          <p class="not">Bombacıya harfin şeklini tarif et: "üçgen gibi", "kapı gibi", "at nalı gibi"…</p>`;
      }
    } else if (b.tur === 'saat') {
      if (adim === 0) {
        ic = `<p>Çalar saatin <b>kısa ibresi (akrep)</b> hangi sayıyı gösteriyor? İki sayının arasındaysa <b>küçük olanı</b> al (12 ile 1 arasındaysa 12). Saate göre <b>rengi</b> bul.</p>
          <table><tr><th>Saat</th><th class="sol">Renk</th><th>Saat</th><th class="sol">Renk</th></tr>${[1, 3, 5, 7, 9, 11].map(h => `<tr>${[h, h + 1].map(x => `<td><b>${x}</b></td><td class="sol">${renk(t1[x])}</td>`).join('')}</tr>`).join('')}</table>
          <p class="not">Renk <b>2. adıma</b> lazım.</p>`;
      } else if (adim === 1) {
        ic = `<p>1. adımdaki <b>renk</b> ve <b>uzun ibrenin (yelkovan)</b> gösterdiği dakika ile <b>harfi</b> bul.</p>
          <div class="tabloKaydir"><table><tr><th class="sol">Renk</th>${Motor.CEYREK_AD.map(c => `<th>${c}</th>`).join('')}</tr>
          ${Motor.KABLO_RENK.map(r => `<tr><td class="sol">${renk(r)}</td>${t2[r].map(h => `<td><b>${h}</b></td>`).join('')}</tr>`).join('')}</table></div>
          <p class="not">Yelkovan 12'deyse 0. dakika, 3'teyse 15, 6'daysa 30, 9'daysa 45. dakikadır. Harf <b>3. adıma</b> lazım.</p>`;
      } else {
        ic = `<p>2. adımdan gelen <b>harfe</b> göre <b>sayıyı</b> bul. Bombacı, sayaçta <b>SANİYE kısmının iki rakamının toplamı</b> bu sayıyken <b>ÇAL</b>'a basmalı.</p>
          <table><tr><th>Harf</th>${Motor.SAAT_HARF.map(h => `<th>${h}</th>`).join('')}</tr><tr><td>Toplam</td>${Motor.SAAT_HARF.map(h => `<td><b>${t3[h]}</b></td>`).join('')}</tr></table>
          <p class="not">Örnek: sayaç 02:<b>35</b> ise 3 + 5 = <b>8</b>.</p>`;
      }
    } else if (b.tur === 'piyano') {
      if (adim === 0) {
        ic = `<p>Piyanonun üstündeki nota kağıdında bir <b>işaret</b> var. İşarete göre <b>şarkıyı</b> bul.</p>
          <table><tr><th>İşaret</th><th>Şarkı</th><th>İşaret</th><th>Şarkı</th></tr>${[0, 2, 4].map(i => `<tr>${[i, i + 1].map(j => { const n = Motor.NOTA_ISARET[j]; return `<td class="isaret">${n}</td><td><b>${t1[n]}</b></td>`; }).join('')}</tr>`).join('')}</table>
          <p class="not">Şarkı <b>2. adıma</b> lazım.</p>`;
      } else if (adim === 1) {
        ic = `<p>1. adımdaki <b>şarkının</b> 4 notasını bul. Notalar <b>bu sırayla</b> çalınacak.</p>
          <table><tr><th>Şarkı</th><th>1</th><th>2</th><th>3</th><th>4</th></tr>${Motor.SARKI.map(a => `<tr><td>${a}</td>${t2[a].map(n => `<td><b>${n}</b></td>`).join('')}</tr>`).join('')}</table>
          <p class="not">Notalar <b>3. adıma</b> lazım.</p>`;
      } else {
        ic = `<p>Her <b>notanın</b> piyanoda hangi <b>renkteki tuşa</b> denk geldiğini bul.</p>
          <table><tr><th>Nota</th><th class="sol">Tuş</th></tr>${Motor.NOTALAR.map(n => `<tr><td><b>${n}</b></td><td class="sol">${renk(t3[n])}</td></tr>`).join('')}</table>
          <p class="not">Bombacı 4 notayı sırayla çalar. Yanlış tuşta melodi <b>baştan</b> başlar.</p>`;
      }
    } else if (b.tur === 'zar') {
      if (adim === 0) {
        ic = `<p>Üç zarın üstündeki noktaların <b>TOPLAMINA</b> göre <b>hangi renkteki zara</b> bakılacağını bul.</p>
          <table><tr><th>Toplam</th><th class="sol">Zar</th></tr>${Motor.ZAR_ARALIK.map(([a, z], k) => `<tr><td>${a} – ${z}</td><td class="sol">${renk(t1[k])}</td></tr>`).join('')}</table>
          <p class="not">Zarın rengi <b>2. adıma</b> lazım.</p>`;
      } else if (adim === 1) {
        ic = `<p>1. adımdaki <b>zarın rengi</b> ve o zarın <b>nokta sayısı</b> ile bir <b>kelime</b> bul.</p>
          <div class="tabloKaydir"><table><tr><th class="sol">Zar</th>${[1, 2, 3, 4, 5, 6].map(n => `<th>${n}</th>`).join('')}</tr>
          ${Motor.ZAR_RENK.map(r => `<tr><td class="sol">${renk(r)}</td>${[1, 2, 3, 4, 5, 6].map(n => `<td><b>${t2[r][n]}</b></td>`).join('')}</tr>`).join('')}</table></div>
          <p class="not">Kelime <b>3. adıma</b> lazım.</p>`;
      } else {
        ic = `<p>2. adımdan gelen <b>kelimeye</b> göre bombacının <b>hangi yazılı düğmeye</b> basacağını bul.</p>
          <table><tr><th>Gelen kelime</th><th class="sol">Basılacak düğme</th></tr>${Motor.ZAR_KELIME.map(w => `<tr><td><b>${w}</b></td><td class="sol">Üstünde <b>"${t3[w]}"</b> yazan</td></tr>`).join('')}</table>
          <p class="not">Dikkat: kelimeler birbirine karışır (AT / ATMA)!</p>`;
      }
    } else if (b.tur === 'isik') {
      const R4 = Motor.ISIK_RENK;
      if (adim === 0) {
        ic = `<p>Işık panelinin köşesinde bir <b>etiket numarası</b> var. Numaraya göre <b>hangi tabloyu</b> kullanacağını bul.</p>
          <table><tr><th>Etiket</th><th>Tablo</th></tr>${[1, 2, 3, 4].map(n => `<tr><td><b>${n}</b></td><td><b>${t1[n]}</b></td></tr>`).join('')}</table>
          <p class="not">Tablo harfi <b>2. adıma</b> lazım.</p>`;
      } else if (adim === 1) {
        ic = `<p>Panelde 4 renkli ışık var. <b>4 ışık</b> sırayla yanar, kısa bir ara verilir, tekrar eder. Yanan her rengin yerine <b>basılacak rengi</b> 1. adımdaki tablodan bul.</p>
          <table><tr><th class="sol">Yanan</th>${Motor.ISIK_TABLO_AD.map(t => `<th class="sol">Tablo ${t}</th>`).join('')}</tr>
          ${R4.map(r => `<tr><td class="sol">${renk(r)}</td>${Motor.ISIK_TABLO_AD.map(t => `<td class="sol">${renk(t2[t][r])}</td>`).join('')}</tr>`).join('')}</table>
          <p class="not">Basılacak 4 renk <b>3. adıma</b> lazım.</p>`;
      } else {
        ic = `<p>Dizide <b>İLK yanan</b> ışığın rengine göre sırayı bul.</p>
          <table><tr><th class="sol">İlk yanan</th><th class="sol">Sıra</th></tr>${R4.map(r => `<tr><td class="sol">${renk(r)}</td><td class="sol">${t3[r] === 'duz' ? '<b>Düz</b>: aynı sırayla bas' : '<b>Ters</b>: sondan başa doğru bas'}</td></tr>`).join('')}</table>
          <p class="not">Yanlış ışığa basılırsa sıra <b>baştan</b> başlar.</p>`;
      }
    } else if (b.tur === 'sifre') {
      if (adim === 0) {
        ic = `<p>Ekranda harfleri kaydırılmış <b>şifreli bir yazı</b> var. Yazının <b>RENGİNE</b> göre <b>kaydırma sayısını</b> bul.</p>
          <table><tr><th class="sol">Yazının rengi</th><th>Kaydırma</th></tr>${Motor.SIFRE_RENK.map(r => `<tr><td class="sol">${renk(r)}</td><td><b>${t1[r]}</b></td></tr>`).join('')}</table>
          <p class="not">Kaydırma sayısı <b>2. adıma</b> lazım.</p>`;
      } else if (adim === 1) {
        ic = `<p>Şifreli yazının her harfini aşağıdaki alfabede <b>kaydırma sayısı kadar GERİ</b> say (A'dan geri gidince Z'ye döner). Çıkan kelimeyi listede bul.</p>
          <div class="tabloKaydir"><table><tr>${[...Motor.ALFABE].map(h => `<td><b>${h}</b></td>`).join('')}</tr></table></div>
          <p class="not">Bu alfabede Ğ ve J yok! Örnek: kaydırma 2 ise E → Ç olur.</p>
          <table><tr><th>Kelime</th><th>Sayı</th><th>Kelime</th><th>Sayı</th></tr>${Object.keys(t2).filter((_, i) => i % 2 === 0).map((_, i) => `<tr>${[i * 2, i * 2 + 1].map(j => { const w = Object.keys(t2)[j]; return w ? `<td>${w}</td><td><b>${t2[w]}</b></td>` : '<td></td><td></td>'; }).join('')}</tr>`).join('')}</table>
          <p class="not">Sayı <b>3. adıma</b> lazım.</p>`;
      } else {
        ic = `<p>2. adımdan gelen <b>sayıya</b> göre bombacının basacağı <b>düğmenin rengini</b> bul.</p>
          <table><tr><th>Sayı</th><th class="sol">Düğme</th><th>Sayı</th><th class="sol">Düğme</th></tr>${[1, 3, 5, 7, 9].map(n => `<tr>${[n, n + 1].map(x => (t3[x] ? `<td><b>${x}</b></td><td class="sol">${renk(t3[x])}</td>` : '<td></td><td></td>')).join('')}</tr>`).join('')}</table>`;
      }
    }
    return bas + ic;
  }

  return { sayfaHtml };
})();
