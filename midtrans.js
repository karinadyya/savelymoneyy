// Webhook notifikasi pembayaran Midtrans. Setelah lunas, bot mengirim link akses ke WhatsApp pembeli.
const { crypto, SITE, parse, total, buatToken, kirimWA } = require("./_lib");

module.exports = async (req, res) => {
  try {
    const b = req.body || {};
    const sig = crypto.createHash("sha512")
      .update(`${b.order_id}${b.status_code}${b.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`).digest("hex");
    if (sig !== b.signature_key) return res.status(403).json({ pesan: "Signature salah" });

    const parts = String(b.order_id).split("-");
    const k = parse(parts.pop());   // kode paket, contoh B1T0S0
    const phone = parts.pop();      // nomor WA pembeli
    if (!k || b.transaction_status !== "settlement" || Number(b.gross_amount) !== total(k)) return res.json({ ok: true });

    const bayarAt = b.settlement_time ? Date.parse(b.settlement_time.replace(" ", "T") + "+07:00") : Date.now(); // WIB
    const { token, payload } = buatToken(k, bayarAt);

    if (!payload.plan) {
      await kirimWA(phone, "Pembayaran diterima ✅ Terima kasih! Tim kami akan menghubungimu untuk sesi setup 💙");
    } else {
      const sampai = new Date(payload.sampai).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
      await kirimWA(phone,
        `Pembayaran diterima ✅\n\nKlik link ini untuk kembali ke web. Fitur Premium otomatis terbuka dan langsung bisa dipakai:\n` +
        `${SITE}/?akses=${token}\n\nAktif sampai ${sampai}. Simpan chat ini kalau mau buka lagi di perangkat lain 💙`);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ pesan: "Kesalahan server" }); }
};
