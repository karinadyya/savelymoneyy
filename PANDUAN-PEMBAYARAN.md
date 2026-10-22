# Alur pembayaran (tanpa server)

1. Pemesan checkout, WhatsApp terbuka dengan format pesanan.
2. Kembali ke web: jendela QRIS muncul, pemesan scan dan bayar sesuai total.
3. Pemesan menekan "Sudah bayar → Kirim bukti ke WhatsApp" dan mengirim screenshot.
4. Begitu pemesan kembali ke web, fitur Premium yang dibayar terbuka otomatis (tanpa kode aktivasi), dan ada link untuk membuka di perangkat lain.

## Batasan penting
Situs statis tidak bisa melihat isi WhatsApp atau mengecek uang masuk. Fitur terbuka saat pembeli kembali dari WhatsApp, **bukan** setelah pembayaran terverifikasi. Jadi orang bisa membuka Premium tanpa membayar. Cocok untuk demo tugas; cek mutasi/uang masuk tetap manual.

Kalau nanti dipakai jualan sungguhan, folder `_opsional-bot-otomatis/` berisi versi bot (Fonnte + Midtrans) yang memverifikasi pembayaran otomatis. Pindahkan ke `api/` untuk memakainya.
