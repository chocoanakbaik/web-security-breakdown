# Cybersecurity Laboratory: Malvertising, Clickjacking & OAuth Mitigation

Laboratorium lokal untuk mempelajari risiko malvertising, clickjacking, penyimpanan token browser, dan mitigasi. Seluruh akun, token, serta event adalah sintetis. Ini bukan OAuth provider dan bukan alat pencurian kredensial.

## Struktur
- `situs-korban/index.html`: sesi login palsu disimpan ke localStorage/sessionStorage.
- `situs-korban/dashboard.html`: profil fiktif, token disamarkan.
- `jaringan-iklan-nakal/iklan-banner.html`: banner klik demo.
- `jaringan-iklan-nakal/payload-siluman.js`: delayed event fixture tanpa akses token atau network.
- `server-penyerang/server.js`: localhost event sink yang menolak field kredensial.
- `mitigasi-dan-pertahanan/`: halaman sandboxed dan contoh header Nginx.

## Jalankan di VS Code
1. Di GitHub pilih **Code → Download ZIP**, ekstrak, lalu buka folder di VS Code.
2. Klik kanan `situs-korban/index.html` → **Open with Live Server**.
3. Klik **Create fake session**. Token `DEMO-ONLY-...` hanyalah string acak; bukan JWT valid atau token provider.
4. Buka dashboard. Bandingkan dengan `mitigasi-dan-pertahanan/index-secured.html` melalui Live Server.

## Jalankan event sink
Node.js 18+ dan npm diperlukan:
```powershell
cd server-penyerang
npm install
npm start
```
Server bind hanya ke `127.0.0.1:4317`. Health check: `http://127.0.0.1:4317/health`. POST `/log-sink` menerima metadata event sintetis dan menolak `token`, `accessToken`, `authorization`, serta `cookie`. Log lokal bernama `lab_events.jsonl`; GET tidak mengembalikan log.

Contoh event aman:
```powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:4317/log-sink -ContentType 'application/json' -Body '{"type":"TRAINING_CLICK","marker":"SYNTHETIC_ONLY","note":"Learner clicked demo banner"}'
```

## Analisis teknis
**OAuth:** implementasi ini tidak menjalankan Implicit Grant sungguhan dan tidak menerbitkan JWT. Implicit Grant tidak disarankan untuk aplikasi baru; gunakan Authorization Code Flow dengan PKCE. JavaScript same-origin dapat membaca localStorage jika ada XSS, jadi hindari menyimpan bearer token di sana bila ada desain yang lebih aman.

**Malvertising/clickjacking:** iklan pihak ketiga dapat menyalahgunakan skrip, redirect, atau UI menipu. Clickjacking menipu pengguna agar mengklik elemen yang tidak mereka maksud, sering dengan frame overlay. Banner lab hanya mengirim event klik dummy. Payload fixture tidak membaca storage, mengambil token, menggunakan eval, atau mengirim data. Chrome tidak otomatis memblokir semua iklan berbahaya; kontrol situs, browser, origin, dan frame memengaruhi hasil. Obfuscation/User-Agent cloaking bukan jaminan lolos deteksi, dan lab ini tidak melakukan evasion.

**Mitigasi:** CSP membatasi sumber skrip; `object-src 'none'` memblokir plugin; `sandbox=""` menonaktifkan skrip iframe dan memberinya origin opaque. `frame-ancestors 'none'` mencegah situs dibenamkan dalam frame, tetapi hanya ditegakkan sebagai HTTP response header, bukan meta tag. Gunakan Nginx example sebagai titik awal dan validasi dengan `nginx -t`. Untuk OAuth produksi, terapkan Authorization Code + PKCE, redirect URI ketat, validasi state/nonce sesuai protokol, token berumur pendek, dan cookie HttpOnly/Secure/SameSite bila sesuai.

Tidak ada mitigasi yang dapat dijanjikan memblokir serangan 100% dalam semua konfigurasi. Pertahanan berlapis harus diuji.

## Batas keselamatan
Proyek tidak menyertakan payload pencurian token, obfuscation untuk menyamarkan pencurian, atau C2 untuk kredensial. Folder `server-penyerang` adalah sink event lokal yang menolak field kredensial. Gunakan hanya data sintetis.

## Troubleshooting
- Gunakan port yang ditampilkan Live Server.
- Verifikasi `node --version` dan `npm --version`.
- Jika port 4317 bentrok: PowerShell `$env:PORT=4318; npm start`.
- Jangan commit log yang memuat data dari luar lab.

Materi edukasi lokal. Tambahkan lisensi eksplisit jika mendistribusikan proyek.