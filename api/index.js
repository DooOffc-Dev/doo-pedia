require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// DATABASE
// ==========================================
const DB_PATH = path.join(__dirname, '../database.json');

if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ 
        users: [],
        sessions: [],
        transactions: [],
        suggestions: []
    }, null, 2));
}

function readDB() {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ==========================================
// EMAIL CONFIG
// ==========================================
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    auth: {
        user: process.env.EMAIL_USER || 'csdoopedia@gmail.com',
        pass: process.env.EMAIL_PASS
    },
    tls: { rejectUnauthorized: false },
    pool: true,
    maxConnections: 5,
    maxMessages: 100
});

transporter.verify((error) => {
    if (error) console.log('❌ Email error:', error.message);
    else console.log('✅ Email ready!');
});

// ==========================================
// API CONFIG
// ==========================================
const API_BASE = process.env.API_BASE_URL || 'https://www.rumahotp.io/api';
const API_KEY = process.env.API_KEY;

// ==========================================
// HELPERS
// ==========================================
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// ==========================================
// SEND OTP EMAIL
// ==========================================
async function sendOTPEmail(email, otp, name = 'User') {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verifikasi DooPedia</title>
        <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #f5f5f7; padding: 20px; }
            .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #1a1a2e, #2d1b69); padding: 40px 30px 30px; text-align: center; border-bottom: 4px solid #7c3aed; }
            .header .logo { font-size: 28px; font-weight: 900; color: #ffffff; }
            .header .logo span { color: #a855f7; }
            .header .subtitle { color: rgba(255,255,255,0.7); font-size: 14px; margin-top: 6px; }
            .body { padding: 40px 35px; background: #ffffff; }
            .greeting { font-size: 20px; font-weight: 700; color: #1a1a2e; margin-bottom: 12px; }
            .greeting span { color: #7c3aed; }
            .message { color: #4a4a5a; line-height: 1.8; font-size: 15px; margin-bottom: 25px; }
            .otp-box { background: #f8f6ff; border: 2px dashed #e8e0f8; border-radius: 16px; padding: 30px 20px; text-align: center; margin: 25px 0; }
            .otp-label { font-size: 13px; color: #7c3aed; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; }
            .otp-code { font-size: 44px; font-weight: 900; letter-spacing: 12px; color: #1a1a2e; font-family: 'Courier New', monospace; padding: 8px 0; }
            .otp-code span { display: inline-block; background: #f0ebff; padding: 4px 10px; border-radius: 8px; }
            .otp-info { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin: 20px 0 10px; }
            .otp-info-item { background: #f8f6ff; border-radius: 10px; padding: 12px 8px; text-align: center; }
            .otp-info-item .icon { font-size: 18px; display: block; margin-bottom: 4px; }
            .otp-info-item .text { font-size: 11px; color: #4a4a5a; line-height: 1.4; }
            .otp-info-item .highlight { color: #7c3aed; font-weight: 600; }
            .divider { border: none; height: 1px; background: linear-gradient(to right, transparent, #e8e0f8, transparent); margin: 25px 0; }
            .note { text-align: center; color: #8888aa; font-size: 12px; line-height: 1.6; margin-top: 10px; }
            .note strong { color: #7c3aed; font-weight: 600; }
            .footer { padding: 20px 35px 25px; background: #fafafa; text-align: center; border-top: 1px solid #f0f0f0; }
            .footer .brand { font-size: 14px; font-weight: 700; color: #1a1a2e; }
            .footer .brand span { color: #7c3aed; }
            .footer p { color: #9999aa; font-size: 11px; margin-top: 6px; }
            @media (max-width: 480px) { .body { padding: 25px 20px; } .otp-code { font-size: 32px; letter-spacing: 8px; } .otp-info { grid-template-columns: 1fr; } }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">✦ Doo<span>Pedia</span></div>
                <div class="subtitle">Verifikasi Email Pendaftaran</div>
            </div>
            <div class="body">
                <div class="greeting">Halo, <span>${name}</span> 👋</div>
                <div class="message">Gunakan kode OTP berikut untuk menyelesaikan pendaftaran akun Anda di <strong>DooPedia</strong>.</div>
                <div class="otp-box">
                    <div class="otp-label">✦ KODE VERIFIKASI</div>
                    <div class="otp-code">${otp.split('').map(d => `<span>${d}</span>`).join('')}</div>
                </div>
                <div class="otp-info">
                    <div class="otp-info-item"><span class="icon">⏱️</span><div class="text">Berlaku <span class="highlight">5 menit</span></div></div>
                    <div class="otp-info-item"><span class="icon">🔒</span><div class="text">Jangan bagikan ke <span class="highlight">siapapun</span></div></div>
                    <div class="otp-info-item"><span class="icon">⚠️</span><div class="text">Jika tidak mendaftar, <span class="highlight">abaikan</span></div></div>
                </div>
                <hr class="divider">
                <div class="note">Email otomatis dari <strong>DooPedia Nokos</strong> — jangan balas email ini</div>
            </div>
            <div class="footer">
                <div class="brand">✦ Doo<span>Pedia</span></div>
                <p>© 2026 DooPedia — Solusi OTP Instan</p>
                <p style="font-size:10px; color:#bbbbcc; margin-top:4px;">Powered by Xskydoo_yea © DooOffc</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: process.env.EMAIL_FROM || `"DooPedia Nokos" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Kode Verifikasi DooPedia',
        html: htmlContent
    };

    await transporter.sendMail(mailOptions);
}

// ==========================================
// AUTH ROUTES
// ==========================================
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, name } = req.body;
        if (!email) return res.status(400).json({ success: false, error: 'Email wajib diisi' });

        const db = readDB();
        if (db.users.some(u => u.email === email && !u.isTemp)) {
            return res.status(400).json({ success: false, error: 'Email sudah terdaftar' });
        }

        const otp = generateOTP();
        const expiresAt = Date.now() + 5 * 60 * 1000;

        db.users = db.users.filter(u => u.email !== email || !u.isTemp);
        db.users.push({ email, name: name || email.split('@')[0], otp, otpExpires: expiresAt, isTemp: true });
        writeDB(db);

        await sendOTPEmail(email, otp, name || email.split('@')[0]);

        res.json({ success: true, message: 'Kode OTP telah dikirim ke email Anda', email, expiresIn: '5 menit' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, error: 'Gagal mengirim OTP' });
    }
});

app.post('/api/auth/verify', async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        if (!email || !otp || !password) {
            return res.status(400).json({ success: false, error: 'Semua field wajib diisi' });
        }

        const db = readDB();
        const tempUser = db.users.find(u => u.email === email && u.isTemp === true);
        if (!tempUser) return res.status(400).json({ success: false, error: 'Email tidak terdaftar' });
        if (tempUser.otp !== otp) return res.status(400).json({ success: false, error: 'Kode OTP salah' });
        if (Date.now() > tempUser.otpExpires) {
            db.users = db.users.filter(u => u.email !== email);
            writeDB(db);
            return res.status(400).json({ success: false, error: 'Kode OTP sudah kadaluarsa' });
        }

        const newUser = {
            id: 'user_' + Date.now(),
            email,
            name: tempUser.name,
            password: hashPassword(password),
            balance: 0,
            isVerified: true,
            createdAt: Date.now(),
            isTemp: false
        };

        db.users = db.users.filter(u => u.email !== email);
        db.users.push(newUser);
        writeDB(db);

        const sessionToken = crypto.randomBytes(32).toString('hex');
        db.sessions = db.sessions || [];
        db.sessions.push({ token: sessionToken, userId: newUser.id, email: newUser.email, createdAt: Date.now(), expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
        writeDB(db);

        res.json({ success: true, message: 'Registrasi berhasil!', token: sessionToken, user: { id: newUser.id, email: newUser.email, name: newUser.name, balance: newUser.balance } });
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ success: false, error: 'Verifikasi gagal' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, error: 'Email dan password wajib diisi' });

        const db = readDB();
        const user = db.users.find(u => u.email === email && !u.isTemp);
        if (!user || user.password !== hashPassword(password)) {
            return res.status(400).json({ success: false, error: 'Email atau password salah' });
        }

        const sessionToken = crypto.randomBytes(32).toString('hex');
        db.sessions = db.sessions || [];
        db.sessions.push({ token: sessionToken, userId: user.id, email: user.email, createdAt: Date.now(), expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
        writeDB(db);

        res.json({ success: true, message: 'Login berhasil!', token: sessionToken, user: { id: user.id, email: user.email, name: user.name, balance: user.balance || 0 } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Login gagal' });
    }
});

app.post('/api/auth/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(400).json({ success: false, error: 'Token tidak ditemukan' });

        const db = readDB();
        db.sessions = (db.sessions || []).filter(s => s.token !== token);
        writeDB(db);

        res.json({ success: true, message: 'Logout berhasil' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Logout gagal' });
    }
});

app.get('/api/auth/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const db = readDB();
        const session = (db.sessions || []).find(s => s.token === token);
        if (!session) return res.status(401).json({ success: false, error: 'Session expired' });

        const user = db.users.find(u => u.id === session.userId);
        if (!user) return res.status(404).json({ success: false, error: 'User tidak ditemukan' });

        res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, balance: user.balance || 0 } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Gagal mengambil data user' });
    }
});

// ==========================================
// BALANCE
// ==========================================
app.get('/api/balance', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });

        const db = readDB();
        const session = (db.sessions || []).find(s => s.token === token);
        if (!session) return res.status(401).json({ success: false, error: 'Session expired' });

        try {
            const response = await axios.get(`${API_BASE}/balance`, {
                headers: { 'Authorization': `Bearer ${API_KEY}` }
            });
            const user = db.users.find(u => u.id === session.userId);
            if (user) {
                user.balance = response.data.balance || 0;
                writeDB(db);
            }
            res.json({ success: true, balance: response.data.balance || 0, currency: response.data.currency || 'IDR' });
        } catch (apiError) {
            const user = db.users.find(u => u.id === session.userId);
            res.json({ success: true, balance: user?.balance || 0, currency: 'IDR' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Gagal mengambil saldo' });
    }
});

// ==========================================
// SERVICES
// ==========================================
app.get('/api/services', async (req, res) => {
    try {
        const response = await axios.get(`${API_BASE}/services`, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        res.json(response.data);
    } catch (error) {
        res.json({
            services: [
                { id: 1, name: 'WhatsApp', country: 'Indonesia', price: 2000 },
                { id: 2, name: 'Telegram', country: 'Indonesia', price: 1500 },
                { id: 3, name: 'Instagram', country: 'Indonesia', price: 3000 },
                { id: 4, name: 'Gmail', country: 'US', price: 5000 },
                { id: 5, name: 'Twitter', country: 'US', price: 3500 },
                { id: 6, name: 'TikTok', country: 'Indonesia', price: 4000 },
                { id: 7, name: 'Facebook', country: 'US', price: 2500 },
                { id: 8, name: 'Discord', country: 'US', price: 4500 },
                { id: 9, name: 'LINE', country: 'Japan', price: 3000 },
                { id: 10, name: 'Signal', country: 'US', price: 5500 },
                { id: 11, name: 'Microsoft', country: 'US', price: 6000 },
                { id: 12, name: 'Apple', country: 'US', price: 7000 },
                { id: 13, name: 'Call of Duty', country: 'Global', price: 5000 },
                { id: 14, name: 'Point Blank', country: 'Global', price: 4000 },
                { id: 15, name: 'Clash of Clans', country: 'Global', price: 4500 },
                { id: 16, name: 'Mobile Legends', country: 'Global', price: 5000 },
                { id: 17, name: 'Free Fire', country: 'Global', price: 3000 },
                { id: 18, name: 'PUBG Mobile', country: 'Global', price: 4000 },
                { id: 19, name: 'Valorant', country: 'Global', price: 6000 },
                { id: 20, name: 'Genshin Impact', country: 'Global', price: 7000 },
                { id: 21, name: 'Indosat', country: 'Indonesia', price: 2500 },
                { id: 22, name: 'XL Axiata', country: 'Indonesia', price: 2500 },
                { id: 23, name: 'Telkomsel', country: 'Indonesia', price: 3000 },
                { id: 24, name: 'Smartfren', country: 'Indonesia', price: 2000 },
                { id: 25, name: 'Gojek', country: 'Indonesia', price: 3000 },
                { id: 26, name: 'Grab', country: 'Indonesia', price: 3000 },
                { id: 27, name: 'OVO', country: 'Indonesia', price: 2500 },
                { id: 28, name: 'DANA', country: 'Indonesia', price: 2500 },
                { id: 29, name: 'Shopee', country: 'Indonesia', price: 3000 },
                { id: 30, name: 'Tokopedia', country: 'Indonesia', price: 3000 }
            ]
        });
    }
});

// ==========================================
// AUTO ORDER
// ==========================================
app.post('/api/order-auto', async (req, res) => {
    try {
        const { service_id, country = 'ID' } = req.body;
        const response = await axios.post(`${API_BASE}/order`, {
            service_id,
            country
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        res.json({ success: true, ...response.data });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Gagal order' });
    }
});

app.get('/api/check-otp/:order_id', async (req, res) => {
    try {
        const { order_id } = req.params;
        const response = await axios.get(`${API_BASE}/status/${order_id}`, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        res.json({ success: true, ...response.data });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Gagal cek OTP' });
    }
});

// ==========================================
// CONTACT & SUGGEST
// ==========================================
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, error: 'Semua field wajib diisi' });
        }

        const htmlContent = `
        <!DOCTYPE html>
        <html><head><meta charset="UTF-8"><title>Pesan Kontak - DooPedia</title>
        <style>body{font-family:Arial,sans-serif;background:#f5f5f7;padding:20px}.container{max-width:560px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden}.header{background:linear-gradient(135deg,#1a1a2e,#2d1b69);padding:30px;text-align:center}.header h1{color:#fff;font-size:24px}.header h1 span{color:#a855f7}.body{padding:30px}.field{background:#f8f8fa;border-radius:12px;padding:14px 16px;margin-bottom:12px}.field .label{font-size:11px;font-weight:600;color:#8888aa;text-transform:uppercase}.field .value{font-size:15px;color:#1a1a2e;margin-top:4px}.footer{background:#f8f8fa;padding:16px 30px;text-align:center;color:#8888aa;font-size:11px}.footer .brand{font-weight:700;color:#1a1a2e}.footer .brand span{color:#7c3aed}</style>
        </head><body>
        <div class="container">
            <div class="header"><h1>✦ Doo<span>Pedia</span></h1><p style="color:rgba(255,255,255,0.7)">📩 Pesan Kontak Baru</p></div>
            <div class="body">
                <div class="field"><div class="label">👤 Nama</div><div class="value"><strong>${name}</strong></div></div>
                <div class="field"><div class="label">📧 Email</div><div class="value">${email}</div></div>
                <div class="field"><div class="label">💬 Pesan</div><div class="value">${message}</div></div>
                <div class="field"><div class="label">📅 Dikirim Pada</div><div class="value">${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</div></div>
            </div>
            <div class="footer"><p><span class="brand">✦ Doo<span>Pedia</span></span> — Solusi OTP Instan</p></div>
        </div></body></html>`;

        await transporter.sendMail({
            from: process.env.EMAIL_FROM || `"DooPedia Nokos" <${process.env.EMAIL_USER}>`,
            to: 'csdoopedia@gmail.com',
            subject: `📩 Pesan Kontak dari ${name}`,
            html: htmlContent,
            replyTo: email
        });

        res.json({ success: true, message: 'Pesan terkirim!' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Gagal mengirim pesan' });
    }
});

app.post('/api/suggest', async (req, res) => {
    try {
        const { name, category, desc, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ success: false, error: 'Nama produk dan email wajib diisi' });
        }

        const htmlContent = `
        <!DOCTYPE html>
        <html><head><meta charset="UTF-8"><title>Saran Produk - DooPedia</title>
        <style>body{font-family:Arial,sans-serif;background:#f5f5f7;padding:20px}.container{max-width:560px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden}.header{background:linear-gradient(135deg,#1a1a2e,#2d1b69);padding:30px;text-align:center}.header h1{color:#fff;font-size:24px}.header h1 span{color:#a855f7}.body{padding:30px}.field{background:#f8f8fa;border-radius:12px;padding:14px 16px;margin-bottom:12px}.field .label{font-size:11px;font-weight:600;color:#8888aa;text-transform:uppercase}.field .value{font-size:15px;color:#1a1a2e;margin-top:4px}.footer{background:#f8f8fa;padding:16px 30px;text-align:center;color:#8888aa;font-size:11px}</style>
        </head><body>
        <div class="container">
            <div class="header"><h1>✦ Doo<span>Pedia</span></h1><p style="color:rgba(255,255,255,0.7)">💡 Saran Produk Baru</p></div>
            <div class="body">
                <div class="field"><div class="label">📌 Nama Produk</div><div class="value"><strong>${name}</strong></div></div>
                <div class="field"><div class="label">📂 Kategori</div><div class="value">${category || 'Lainnya'}</div></div>
                ${desc ? `<div class="field"><div class="label">📝 Deskripsi</div><div class="value">${desc}</div></div>` : ''}
                <div class="field"><div class="label">📧 Dari Email</div><div class="value">${email}</div></div>
                <div class="field"><div class="label">📅 Dikirim Pada</div><div class="value">${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</div></div>
            </div>
            <div class="footer"><p>✦ DooPedia — Solusi OTP Instan</p></div>
        </div></body></html>`;

        await transporter.sendMail({
            from: process.env.EMAIL_FROM || `"DooPedia Nokos" <${process.env.EMAIL_USER}>`,
            to: 'csdoopedia@gmail.com',
            subject: `💡 Saran Produk Baru: ${name}`,
            html: htmlContent,
            replyTo: email
        });

        const db = readDB();
        db.suggestions = db.suggestions || [];
        db.suggestions.push({ id: 'sug_' + Date.now(), name, category, desc, email, createdAt: Date.now() });
        writeDB(db);

        res.json({ success: true, message: 'Saran berhasil dikirim!' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Gagal mengirim saran' });
    }
});

// ==========================================
// EXPORT
// ==========================================
module.exports = app;
