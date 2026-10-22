// Memeriksa token dari link ?akses=TOKEN. Dipanggil oleh halaman web.
const { crypto, sign } = require("./_lib");

module.exports = (req, res) => {
  try {
    const [p, sig] = String(req.query.token || "").split(".");
    const ok = p && sig && sig.length === sign(p).length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(sign(p)));
    if (!ok) return res.status(401).json({ pesan: "Token tidak valid" });
    res.json({ akses: JSON.parse(Buffer.from(p, "base64url").toString()) });
  } catch (e) { res.status(400).json({ pesan: "Token rusak" }); }
};
