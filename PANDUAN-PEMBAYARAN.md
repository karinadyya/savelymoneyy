# QRIS otomatis di chat WhatsApp + fitur Premium terbuka sendiri

## Alur
1. Pemesan checkout di web, WhatsApp terbuka dengan format pesanan.
2. Pemesan menekan kirim. **Bot** (webhook `api/wa.js`) mengenali "No. Pesanan: SM-..." dan membalas di chat yang sama dengan **QRIS** sesuai total.
3. Pemesan membayar. Midtrans memberi tahu `api/midtrans.js`.
4. Bot mengirim pesan: "Pembayaran diterima, klik link untuk kembali ke web". Link `?akses=TOKEN` membuka web dan **Insight Premium terbuka otomatis**.

## Yang dibutuhkan (tidak bisa dari HTML saja)
Balasan otomatis di WhatsApp harus dikirim oleh bot, bukan oleh website. Dua layanan:
- **Fonnte** (gateway WhatsApp). Hubungkan nomor tujuan checkout, isi **Webhook** device dengan `https://DOMAINMU/api/wa`, nyalakan auto read. Mengirim gambar QRIS butuh paket Fonnte yang mendukung media. Catatan Fonnte: auto reply bawaan mati saat webhook dipakai.
- **Midtrans** (QRIS dinamis). Sandbox gratis; produksi butuh verifikasi usaha. Di dashboard, isi **Payment Notification URL** dengan `https://DOMAINMU/api/midtrans`.

## Deploy (Vercel, gratis)
1. Upload folder ke GitHub, import ke Vercel. Folder `api/` otomatis jadi server.
2. Environment Variables:
   - `MIDTRANS_SERVER_KEY`, `FONNTE_TOKEN`
   - `TOKEN_SECRET` = teks acak panjang buatanmu
   - `SITE_URL` = alamat webmu, contoh `https://savelymoney.vercel.app`
   - `MIDTRANS_PROD` = `1` (hanya produksi)
3. Di `script.js` ubah `MODE_DEMO = false`.
4. Uji dengan Midtrans Simulator (QRIS) di sandbox.

## Mode demo (presentasi tanpa server)
`MODE_DEMO = true`: ada tombol "Simulasi: anggap sudah bayar" di jendela QRIS untuk menunjukkan fitur terbuka. QRIS di WhatsApp tidak akan terkirim tanpa bot di atas.

## Batasan
Status Premium disimpan di browser. Token tidak bisa dipalsukan tanpa `TOKEN_SECRET`, tetapi orang yang paham DevTools masih bisa mengubah data lokal. Untuk proteksi penuh, fitur berbayar harus dijalankan di server. Pembeli harus mengirim pesan dengan format dari web (jangan diedit), karena bot membaca nomor pesanan dan daftar paketnya; harga selalu dihitung ulang di server.
