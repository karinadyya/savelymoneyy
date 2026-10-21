// Vercel serverless function: QRIS dinamis (Midtrans) + token akses bertanda tangan.
// Tanpa database: kode paket ada di akhir order_id, status dicek langsung ke Midtrans.
const crypto = require("crypto");

const BASE = process.env.MIDTRANS_PROD === "1" ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";
const AUTH = "Basic " + Buffer.from((process.env.MIDTRANS_SERVER_KEY || "") + ":").toString("base64");
const HARGA = { B: 15000, T: 150000, S: 25000 }; // harga dipegang server, bukan dari browser

const sign = (p) => crypto.createHmac("sha256", process.env.TOKEN_SECRET).update(p).digest("base64url");
const parse = (kode) => { const m = /^B(\d{1,2})T(\d{1,2})S(\d{1,2})$/.exec(kode || ""); return m && { B: +m[1], T: +m[2], S: +m[3] }; };
const total = (k) => k.B * HARGA.B + k.T * HARGA.T + k.S * HARGA.S;
const mt = async (path, opt = {}) => (await fetch(BASE + path, { ...opt,
  headers: { Authorization: AUTH, Accept: "application/json", "Content-Type": "application/json" } })).json();

module.exports = async (req, res) => {
  try {
    if (req.method === "POST") {
      const k = parse(req.body.kode);
      if (!k || total(k) <= 0) return res.status(400).json({ pesan: "Pesanan tidak valid" });
      const orderId = `${String(req.body.id).replace(/[^\w-]/g, "").slice(0, 22)}-${Math.random().toString(36).slice(2, 6)}-${req.body.kode}`;
      const r = await mt("/v2/charge", { method: "POST", body: JSON.stringify({
        payment_type: "qris", qris: { acquirer: "gopay" },
        transaction_details: { order_id: orderId, gross_amount: total(k) } }) });
      const qr = (r.actions || []).find((a) => a.name === "generate-qr-code");
      if (!qr) return res.status(502).json({ pesan: r.status_message || "Gagal membuat QRIS" });
      return res.json({ id: orderId, qrUrl: qr.url });
    }

    const { aksi, id, token } = req.query;
    if (aksi === "status") {
      const k = parse(String(id).split("-").pop());
      if (!k) return res.status(400).json({ pesan: "ID tidak valid" });
      const r = await mt(`/v2/${encodeURIComponent(id)}/status`);
      if (["expire", "cancel", "deny"].includes(r.transaction_status)) return res.json({ kadaluarsa: true });
      if (r.transaction_status !== "settlement" || Number(r.gross_amount) !== total(k)) return res.json({ lunas: false });
      const hari = k.B * 30 + k.T * 365;
      const bayarAt = Date.parse(r.settlement_time.replace(" ", "T") + "+07:00"); // waktu Midtrans = WIB
      const payload = hari ? { plan: k.T ? "tahunan" : "bulanan", sampai: bayarAt + hari * 86400000 } : { plan: null };
      const p = Buffer.from(JSON.stringify(payload)).toString("base64url");
      return res.json({ lunas: true, token: `${p}.${sign(p)}` });
    }
    if (aksi === "verifikasi") {
      const [p, sig] = String(token).split(".");
      const ok = sig && sig.length === sign(p).length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(sign(p)));
      return ok ? res.json({ akses: JSON.parse(Buffer.from(p, "base64url").toString()) }) : res.status(401).json({ pesan: "Token tidak valid" });
    }
    res.status(400).json({ pesan: "Aksi tidak dikenal" });
  } catch (e) { res.status(500).json({ pesan: "Kesalahan server" }); }
};
