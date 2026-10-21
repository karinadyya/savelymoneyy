# Akses otomatis setelah bayar QRIS

**Penting:** QRIS statis (gambar `qris.jpeg` milikmu) tidak bisa memberi tahu website bahwa seseorang sudah bayar. Deteksi otomatis butuh *payment gateway* yang membuat QRIS dinamis per pesanan, plus server kecil. Kode di sini memakai Midtrans (sandbox gratis untuk uji coba).

## Mode saat ini: DEMO
`MODE_DEMO = true` di `script.js`. Alurnya lengkap (bayar -> link akses -> fitur terbuka), tapi pembayaran disimulasikan lewat tombol "Simulasi: anggap sudah bayar". Aman untuk presentasi tugas.

## Mengaktifkan pembayaran sungguhan
1. Daftar di Midtrans, ambil **Server Key** (sandbox dulu). Produksi butuh verifikasi usaha.
2. Upload folder ini ke GitHub, import ke Vercel (gratis). Folder `api/` otomatis jadi server.
3. Di Vercel > Settings > Environment Variables isi:
   - `MIDTRANS_SERVER_KEY` = server key
   - `TOKEN_SECRET` = teks acak panjang buatanmu
   - `MIDTRANS_PROD` = `1` (hanya saat produksi)
4. Ubah `MODE_DEMO = false` di `script.js`, deploy ulang.
5. Uji dengan Midtrans Simulator (QRIS) di dashboard sandbox.

## Alur
Checkout -> server buat QRIS dinamis -> halaman cek status tiap 4 detik -> begitu lunas, server mengeluarkan token bertanda tangan -> fitur terbuka + link `?akses=TOKEN` yang bisa dipakai di perangkat lain.

## Batasan
Situs ini statis, jadi status Premium disimpan di browser. Token tidak bisa dipalsukan tanpa `TOKEN_SECRET`, tetapi orang yang paham DevTools masih bisa mengubah data lokal. Untuk proteksi penuh, fitur berbayar harus dijalankan di server.
