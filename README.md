# Sistem e-OPR PdPR — SMK(P) Jalan Ipoh

Laman web borang e-OPR berlogo sekolah yang menghasilkan PDF A4 potret pada peranti pengguna.

## Ciri
- 10 medan: Hari, Tarikh, Masa, Subjek, Kelas, Kehadiran, Tajuk PdPR, Link Google Meet, Link Kuiz, Muat Naik Gambar.
- Maksimum empat gambar JPG/PNG/WebP (5 MB setiap satu).
- Pratonton gambar dan PDF satu halaman A4 potret.
- Tiada pangkalan data, log masuk atau simpanan awan dalam versi ini.

## Cara terbitkan ke Vercel (GitHub)
1. Ekstrak fail ZIP ke komputer.
2. Buka GitHub, cipta repositori baharu (contoh `eopr-pdpr-smkpji`).
3. Muat naik **kandungan folder** `eopr-vercel` ke root repositori (pastikan `package.json`, `index.html`, `src.js`, `style.css`, `vercel.json`, dan folder `public` di root).
4. Log masuk https://vercel.com → **Add New → Project** → import repositori GitHub.
5. Framework Preset: **Vite** (dikesan secara automatik). Build Command `npm run build`, Output Directory `dist`.
6. Klik **Deploy**. Setelah siap, buka URL `*.vercel.app` yang diberikan oleh Vercel.

## Ujian di komputer (pilihan)
Perlu Node.js versi terkini yang serasi dengan Vite 6.
```
npm install
npm run dev
```
Buka alamat localhost yang dipaparkan.

## Perkara penting
- Laman web **tidak** menyimpan laporan dalam Google Sheets/Drive. PDF dijana terus di pelayar dan disimpan oleh guru melalui muat turun.
- Muat naik gambar di sini ialah pemilihan fail pada peranti, bukan penghantaran ke server.
- Link Google Meet dan Link Kuiz akan dipaparkan sebagai teks dalam PDF; pautan yang sangat panjang mungkin dipendekkan secara visual untuk mengekalkan satu halaman.
- jsPDF menggunakan fon terbina dalam; aksara khas tertentu mungkin tidak dipaparkan sempurna. Guna teks biasa untuk hasil terbaik.
- Untuk sistem sekolah dengan penyimpanan rekod automatik, perlu integrasi berasingan (contohnya Google Apps Script API) dan kawalan akses.
