# Dur Be Patlama! simgesini çizer: python araclar/ikon.py  (ikonlar/ klasörüne yazar)
import zlib, struct, math

def png(yol, n):
    k = n / 512
    def renk(x, y):
        X, Y = x / k, y / k
        c = (42, 20, 10)
        # bomba gövdesi
        if (X - 240) ** 2 + (Y - 300) ** 2 < 150 ** 2:
            c = (30, 33, 38)
            if (X - 190) ** 2 + (Y - 250) ** 2 < 45 ** 2:
                c = (58, 62, 70)
        # boyun
        if 300 <= X <= 370 and 130 <= Y <= 190:
            c = (58, 63, 70)
        # fitil (eğri yaklaşık)
        for t in [i / 40 for i in range(41)]:
            fx = (1 - t) ** 3 * 335 + 3 * (1 - t) ** 2 * t * 360 + 3 * (1 - t) * t * t * 420 + t ** 3 * 410
            fy = (1 - t) ** 3 * 130 + 3 * (1 - t) ** 2 * t * 70 + 3 * (1 - t) * t * t * 90 + t ** 3 * 50
            if (X - fx) ** 2 + (Y - fy) ** 2 < 7 ** 2:
                c = (201, 162, 74)
        # kıvılcım
        d = (X - 412) ** 2 + (Y - 46) ** 2
        if d < 24 ** 2: c = (255, 210, 59)
        if d < 12 ** 2: c = (255, 90, 42)
        # sayaç ekranı ve kırmızı çizgiler (00:07 yerine basit segmentler)
        if 140 <= X <= 340 and 280 <= Y <= 350:
            c = (8, 2, 2)
            for sx in (154, 194, 256, 296):  # 4 rakam, ":" 236-244 arasında ortada
                if sx <= X <= sx + 30 and (290 <= Y <= 296 or 334 <= Y <= 340 or (sx <= X <= sx + 6 and 290 <= Y <= 340) or (sx + 24 <= X <= sx + 30 and 290 <= Y <= 340)):
                    c = (255, 42, 26)
            if 236 <= X <= 244 and (300 <= Y <= 308 or 322 <= Y <= 330):
                c = (255, 42, 26)
        return c
    satirlar = b''
    for y in range(n):
        satir = bytearray([0])
        for x in range(n):
            satir += bytes(renk(x + 0.5, y + 0.5))
        satirlar += bytes(satir)
    def parca(tip, veri):
        return struct.pack('>I', len(veri)) + tip + veri + struct.pack('>I', zlib.crc32(tip + veri) & 0xffffffff)
    ihdr = struct.pack('>IIBBBBB', n, n, 8, 2, 0, 0, 0)
    open(yol, 'wb').write(b'\x89PNG\r\n\x1a\n' + parca(b'IHDR', ihdr) + parca(b'IDAT', zlib.compress(satirlar, 9)) + parca(b'IEND', b''))

png(r'C:\Users\Cowealthy\Desktop\DurBePatlama\ikonlar\ikon-192.png', 192)
png(r'C:\Users\Cowealthy\Desktop\DurBePatlama\ikonlar\ikon-512.png', 512)
print('ok')
