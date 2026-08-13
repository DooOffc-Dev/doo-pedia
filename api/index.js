const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
const crypto = require('crypto');

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// DATABASE - MEMORY
// ==========================================
let dbData = {
    users: [],
    sessions: [],
    orders: []
};

function readDB() { return dbData; }
function writeDB(data) { dbData = data; }

// ==========================================
// RUMAHOTP V2 API CONFIG
// ==========================================
const RUMAHOTP_API_KEY = 'rk-dev-NS4dTv7DnJNjjKGiOnMjOFjls69upghT';
const RUMAHOTP_BASE = 'https://www.rumahotp.io/api';

async function rumahotpRequest(endpoint, method = 'GET', data = null) {
    try {
        const url = `${RUMAHOTP_BASE}${endpoint}`;
        const options = {
            method: method,
            url: url,
            headers: {
                'x-apikey': RUMAHOTP_API_KEY,
                'Accept': 'application/json'
            }
        };
        if (data && (method === 'POST' || method === 'PUT')) {
            options.data = data;
            options.headers['Content-Type'] = 'application/json';
        }
        const response = await axios(options);
        return response.data;
    } catch (error) {
        console.error('RumahOTP Error:', error.response?.data || error.message);
        throw error;
    }
}

// ==========================================
// AUTH HELPERS
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
// RUMAHOTP V2 API ENDPOINTS
// ==========================================

// 1. SERVICES
app.get('/api/services', async (req, res) => {
    try {
        const data = await rumahotpRequest('/v2/services');
        res.json({ success: true, data });
    } catch (error) {
        res.json({
            success: true,
            data: [
                { service_code: 13, service_name: 'WhatsApp', service_img: 'https://assets.cindigital.id/apps/wa.png' },
                { service_code: 5, service_name: 'Telegram', service_img: 'https://assets.cindigital.id/apps/tg.png' },
                { service_code: 59, service_name: 'DANA', service_img: 'https://assets.cindigital.id/apps/fr.png' }
            ]
        });
    }
});

// 2. COUNTRIES
app.get('/api/countries', async (req, res) => {
    try {
        const data = await rumahotpRequest('/v2/countries');
        res.json({ success: true, data });
    } catch (error) {
        res.json({
            success: true,
            data: [
                { code: 'ID', name: 'Indonesia' },
                { code: 'US', name: 'United States' },
                { code: 'UK', name: 'United Kingdom' }
            ]
        });
    }
});

// 3. BALANCE
app.get('/api/balance', async (req, res) => {
    try {
        const data = await rumahotpRequest('/v2/user/balance');
        res.json({ success: true, data });
    } catch (error) {
        res.json({ success: true, data: { balance: 0 } });
    }
});

// 4. OPERATORS
app.get('/api/operators', async (req, res) => {
    try {
        const { country, provider_id } = req.query;
        let endpoint = '/v2/operators';
        if (country && provider_id) {
            endpoint += `?country=${country}&provider_id=${provider_id}`;
        }
        const data = await rumahotpRequest(endpoint);
        res.json({ success: true, data });
    } catch (error) {
        res.json({
            success: true,
            data: [
                { id: 1, name: 'Telkomsel' },
                { id: 2, name: 'XL Axiata' }
            ]
        });
    }
});

// 5. ORDER
app.post('/api/order', async (req, res) => {
    try {
        const { number_id, provider_id, operator_id } = req.body;
        if (!number_id || !provider_id || !operator_id) {
            return res.status(400).json({ success: false, error: 'number_id, provider_id, operator_id wajib diisi' });
        }
        const data = await rumahotpRequest(`/v2/orders?number_id=${number_id}&provider_id=${provider_id}&operator_id=${operator_id}`, 'GET');
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 6. CHECK ORDER
app.get('/api/check/:order_id', async (req, res) => {
    try {
        const { order_id } = req.params;
        const data = await rumahotpRequest(`/v1/orders/get_status?order_id=${order_id}`, 'GET');
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 7. SET STATUS
app.post('/api/set-status', async (req, res) => {
    try {
        const { order_id, status } = req.body;
        if (!order_id || !status) {
            return res.status(400).json({ success: false, error: 'order_id dan status wajib diisi' });
        }
        const data = await rumahotpRequest(`/v1/orders/set_status?order_id=${order_id}&status=${status}`, 'GET');
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 8. DEPOSIT CREATE QRIS - V2
app.post('/api/deposit', async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount < 500) {
            return res.status(400).json({ success: false, error: 'Minimal deposit Rp 500' });
        }
        const data = await rumahotpRequest(`/v2/deposit/create?amount=${amount}&payment_id=qris`, 'GET');
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 9. DEPOSIT STATUS
app.get('/api/deposit/status/:deposit_id', async (req, res) => {
    try {
        const { deposit_id } = req.params;
        const data = await rumahotpRequest(`/v2/deposit/get_status?deposit_id=${deposit_id}`, 'GET');
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 10. DEPOSIT CANCEL
app.post('/api/deposit/cancel/:deposit_id', async (req, res) => {
    try {
        const { deposit_id } = req.params;
        const data = await rumahotpRequest(`/v1/deposit/cancel?deposit_id=${deposit_id}`, 'GET');
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 11. API DOCS DOOPEDIA
app.get('/api/docs', (req, res) => {
    res.json({
        success: true,
        name: 'DooPedia Docs API',
        api_key_format: 'DP-xxxxxxxxxx',
        endpoints: {
            services: {
                method: 'GET',
                url: 'https://doo-pedia.vercel.app/api/services',
                description: 'Daftar semua layanan yang tersedia'
            },
            balance: {
                method: 'GET',
                url: 'https://doo-pedia.vercel.app/api/balance',
                description: 'Cek saldo akun'
            },
            countries: {
                method: 'GET',
                url: 'https://doo-pedia.vercel.app/api/countries',
                description: 'Daftar negara yang tersedia'
            },
            operators: {
                method: 'GET',
                url: 'https://doo-pedia.vercel.app/api/operators',
                description: 'Daftar operator per negara'
            },
            order: {
                method: 'POST',
                url: 'https://doo-pedia.vercel.app/api/order',
                description: 'Order nomor virtual',
                body: {
                    number_id: 'NUMBER_ID',
                    provider_id: 'PROVIDER_ID',
                    operator_id: 'OPERATOR_ID'
                }
            },
            check: {
                method: 'GET',
                url: 'https://doo-pedia.vercel.app/api/check/:order_id',
                description: 'Cek status order'
            },
            deposit: {
                method: 'POST',
                url: 'https://doo-pedia.vercel.app/api/deposit',
                description: 'Buat deposit QRIS',
                body: { amount: 'NOMINAL' }
            },
            deposit_status: {
                method: 'GET',
                url: 'https://doo-pedia.vercel.app/api/deposit/status/:deposit_id',
                description: 'Cek status deposit'
            }
        },
        example: {
            code: `
const options = {
    method: 'GET',
    url: 'https://doo-pedia.vercel.app/api/services',
    headers: {
        'Authorization': 'Bearer DP-xxxxxxxxxx'
    }
};
const response = await axios(options);`
        }
    });
});

// 12. TEST
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'DooPedia API is running!',
        version: '3.0.0'
    });
});

// ==========================================
// ERROR HANDLING
// ==========================================
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
});

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
});

module.exports = app;
