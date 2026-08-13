require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
const crypto = require('crypto');
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
// DATABASE - MEMORY (VERCEL FIX)
// ==========================================
let dbData = {
    users: [],
    sessions: [],
    orders: []
};

try {
    const DB_PATH = path.join(__dirname, '../database.json');
    if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf8');
        dbData = JSON.parse(raw);
        console.log('✅ Database loaded from file');
    }
} catch (e) {
    console.log('⚠️ Using in-memory database');
}

function readDB() { return dbData; }
function writeDB(data) {
    dbData = data;
    try {
        const DB_PATH = path.join(__dirname, '../database.json');
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (e) {}
}

// ==========================================
// HELPERS
// ==========================================
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

function generateAPIKey() {
    return `DP-${crypto.randomBytes(16).toString('hex')}`;
}

// ==========================================
// AUTH ROUTES
// ==========================================

// REGISTER
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({ success: false, error: 'Semua field wajib diisi' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, error: 'Password tidak sama' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, error: 'Password minimal 6 karakter' });
        }

        const db = readDB();

        if (db.users.some(u => u.email === email)) {
            return res.status(400).json({ success: false, error: 'Email sudah terdaftar' });
        }

        if (db.users.some(u => u.username === username)) {
            return res.status(400).json({ success: false, error: 'Username sudah dipakai' });
        }

        const apiKey = generateAPIKey();

        const newUser = {
            id: 'user_' + Date.now(),
            username: username,
            email: email,
            password: hashPassword(password),
            apiKey: apiKey,
            balance: 0,
            totalOrder: 0,
            totalDeposit: 0,
            createdAt: Date.now(),
            registeredAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        };

        db.users.push(newUser);
        writeDB(db);

        res.json({
            success: true,
            message: 'Registrasi berhasil!',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                apiKey: newUser.apiKey
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email dan password wajib diisi' });
        }

        const db = readDB();
        const user = db.users.find(u => u.email === email);

        if (!user) {
            return res.status(400).json({ success: false, error: 'Email tidak terdaftar' });
        }

        if (user.password !== hashPassword(password)) {
            return res.status(400).json({ success: false, error: 'Password salah' });
        }

        const token = generateToken();
        db.sessions = db.sessions.filter(s => s.userId !== user.id);
        db.sessions.push({
            token: token,
            userId: user.id,
            email: user.email,
            createdAt: Date.now(),
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
        });
        writeDB(db);

        res.json({
            success: true,
            message: 'Login berhasil!',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                apiKey: user.apiKey,
                balance: user.balance || 0,
                totalOrder: user.totalOrder || 0,
                totalDeposit: user.totalDeposit || 0,
                registeredAt: user.registeredAt
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// LOGOUT
app.post('/api/auth/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(400).json({ success: false, error: 'Token tidak ditemukan' });
        }

        const db = readDB();
        db.sessions = db.sessions.filter(s => s.token !== token);
        writeDB(db);

        res.json({ success: true, message: 'Logout berhasil!' });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// CHECK SESSION
app.get('/api/auth/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const db = readDB();
        const session = db.sessions.find(s => s.token === token);

        if (!session) {
            return res.status(401).json({ success: false, error: 'Session tidak valid' });
        }

        if (Date.now() > session.expiresAt) {
            db.sessions = db.sessions.filter(s => s.token !== token);
            writeDB(db);
            return res.status(401).json({ success: false, error: 'Session expired' });
        }

        const user = db.users.find(u => u.id === session.userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User tidak ditemukan' });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                apiKey: user.apiKey,
                balance: user.balance || 0,
                totalOrder: user.totalOrder || 0,
                totalDeposit: user.totalDeposit || 0,
                registeredAt: user.registeredAt
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// CHANGE API KEY
app.post('/api/auth/change-apikey', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const db = readDB();
        const session = db.sessions.find(s => s.token === token);
        if (!session) {
            return res.status(401).json({ success: false, error: 'Session tidak valid' });
        }

        const user = db.users.find(u => u.id === session.userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User tidak ditemukan' });
        }

        const newApiKey = generateAPIKey();
        user.apiKey = newApiKey;
        writeDB(db);

        res.json({
            success: true,
            message: 'API Key berhasil diubah!',
            apiKey: newApiKey
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==========================================
// RUANGOTP API
// ==========================================
const RUANGOTP_API_KEY = process.env.RUANGOTP_API_KEY || 'c0175829-7892-4fc8-9978-895099de7c76';
const RUANGOTP_SERVER1 = 'https://api.ruangotp.net/api/v1';
const RUANGOTP_SERVER2 = 'https://api.ruangotp.net/api/v2';

async function ruangotpRequest(endpoint, method = 'GET', data = null, server = 'v1') {
    try {
        const baseUrl = server === 'v2' ? RUANGOTP_SERVER2 : RUANGOTP_SERVER1;
        const url = `${baseUrl}${endpoint}`;
        const config = {
            method: method,
            url: url,
            headers: {
                'x-user-id': RUANGOTP_API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        if (data && (method === 'POST' || method === 'PUT')) {
            config.data = data;
        }
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error('❌ RuangOTP Error:', error.response?.data || error.message);
        throw error;
    }
}

// SERVER STATUS
app.get('/api/server-status', async (req, res) => {
    const status = {
        server1: { status: 'offline' },
        server2: { status: 'offline' }
    };
    try {
        await ruangotpRequest('/services/list', 'GET', null, 'v1');
        status.server1 = { status: 'online' };
    } catch (e) {}
    try {
        await ruangotpRequest('/services/list', 'GET', null, 'v2');
        status.server2 = { status: 'online' };
    } catch (e) {}
    res.json({ success: true, data: status });
});

// SERVICES
app.get('/api/v1/services', async (req, res) => {
    try {
        const data = await ruangotpRequest('/services/list', 'GET', null, 'v1');
        res.json({ success: true, server: 'Server 1', data });
    } catch (error) {
        res.json({
            success: true,
            server: 'Server 1 (Fallback)',
            data: { services: [] }
        });
    }
});

// ORDER
app.post('/api/v1/order', async (req, res) => {
    try {
        const { service_id, country = 'ID' } = req.body;
        if (!service_id) {
            return res.status(400).json({ success: false, error: 'service_id wajib diisi' });
        }
        const data = await ruangotpRequest('/order', 'POST', { service_id, country }, 'v1');
        res.json({ success: true, server: 'Server 1', data });
    } catch (error) {
        res.status(500).json({ success: false, server: 'Server 1', error: error.message });
    }
});

// CHECK OTP
app.get('/api/v1/check/:order_id', async (req, res) => {
    try {
        const { order_id } = req.params;
        const data = await ruangotpRequest(`/check/${order_id}`, 'GET', null, 'v1');
        res.json({ success: true, server: 'Server 1', data });
    } catch (error) {
        res.status(500).json({ success: false, server: 'Server 1', error: error.message });
    }
});

// CANCEL
app.post('/api/v1/cancel/:order_id', async (req, res) => {
    try {
        const { order_id } = req.params;
        const data = await ruangotpRequest(`/cancel/${order_id}`, 'POST', null, 'v1');
        res.json({ success: true, server: 'Server 1', data });
    } catch (error) {
        res.status(500).json({ success: false, server: 'Server 1', error: error.message });
    }
});

// TEST
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: '✅ DooPedia API is running!',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});

// ==========================================
// ERROR HANDLING
// ==========================================
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
});

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
});

module.exports = app;
