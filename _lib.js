const crypto = require("crypto");

const BASE = process.env.MIDTRANS_PROD === "1" ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";
const AUTH = "Basic " + Buffer.from((process.env.MIDTRANS_SERVER_KEY || "") + ":").toString("base64");
const HARGA = { B: 15000, T: 150000, S: 25000 }; // harga dipegang server
const KODE_PAKET = { "Paket Premium Bulanan": "B", "Paket Premium Tahunan": "T", "Setup & Konsultasi Anggaran": "S" };
const SITE = (process.env.SITE_URL || "").replace(/\/$/, ""); // contoh: https://savelymoney.vercel.app

const sign = (p) => crypto.createHmac("sha256", process.env.TOKEN_SECRET).update(p).digest("base64url");
const parse = (kode) => { const m = /^B(\d{1,2})T(\d{1,2})S(\d{1,2})$/.exec(kode || ""); return m && { B: +m[1], T: +m[2], S: +m[3] }; };
const total = (k) => k.B * HARGA.B + k.T * HARGA.T + k.S * HARGA.S;
const mt = async (path, opt = {}) => (await fetch(BASE + path, { ...opt,
  headers: { Authorization: AUTH, Accept: "application/json", "Content-Type": "application/json" } })).json();

// Token akses bertanda tangan: berisi paket & tanggal habis. Tidak perlu database.
function buatToken(k, bayarAt) {
  const hari = k.B * 30 + k.T * 365;
  const payload = hari ? { plan: k.T ? "tahunan" : "bulanan", sampai: bayarAt + hari * 86400000 } : { plan: null };
  const p = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return { token: `${p}.${sign(p)}`, payload };
}

// Kirim pesan WhatsApp lewat Fonnte (gambar butuh paket Fonnte yang mendukung media)
const kirimWA = (target, message, url) => fetch("https://api.fonnte.com/send", {
  method: "POST",
  headers: { Authorization: process.env.FONNTE_TOKEN, "Content-Type": "application/json" },
  body: JSON.stringify({ target, message, ...(url ? { url } : {}) })
}).then((r) => r.json());

module.exports = { crypto, SITE, KODE_PAKET, sign, parse, total, mt, buatToken, kirimWA };
