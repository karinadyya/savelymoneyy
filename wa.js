// Webhook Fonnte (pesan masuk). Pesanan dari web dikenali lewat "No. Pesanan: SM-..."
// lalu bot membalas dengan QRIS dinamis di chat yang sama.
const { SITE, KODE_PAKET, total, mt, kirimWA } = require("./_lib");

module.exports = async (req, res) => {
  try {
    const { sender, message = "" } = req.body || {};
    const no = /No\. Pesanan:\s*(SM-[\w-]+)/.exec(message);
    if (!sender || !no) return res.json({ abaikan: true });

    const k = { B: 0, T: 0, S: 0 };
    for (const m of message.matchAll(/^- (.+?) x(\d+)/gm)) {
      const c = KODE_PAKET[m[1].trim()];
      if (c) k[c] = Math.min(k[c] + Number(m[2]), 99);
    }
    const t = total(k);
    if (t <= 0) {
      await kirimWA(sender, `Halo! Paket Dasar gratis, langsung pakai di ${SITE} 💙`);
      return res.json({ ok: true });
    }

    const phone = String(sender).replace(/\D/g, "");
    const orderId = `${no[1]}-${Math.random().toString(36).slice(2, 6)}-${phone}-B${k.B}T${k.T}S${k.S}`;
    const r = await mt("/v2/charge", { method: "POST", body: JSON.stringify({
      payment_type: "qris", qris: { acquirer: "gopay" },
      transaction_details: { order_id: orderId, gross_amount: t } }) });
    const qr = (r.actions || []).find((a) => a.name === "generate-qr-code");
    if (!qr) {
      await kirimWA(sender, "Maaf, QRIS belum bisa dibuat. Tim kami akan membantumu secara manual ya 🙏");
      return res.json({ ok: false });
    }

    await kirimWA(sender,
      `Terima kasih! Pesanan ${no[1]} diterima ✅\n\nTotal bayar: Rp ${t.toLocaleString("id-ID")}\n` +
      `Scan QRIS di bawah ini lewat e-wallet atau m-banking (berlaku 15 menit).\n\n` +
      `Setelah bayar, kamu otomatis dapat link untuk kembali ke web dan fitur Premium langsung terbuka. Tidak perlu kirim bukti 💙`,
      qr.url);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ pesan: "Kesalahan server" }); }
};
