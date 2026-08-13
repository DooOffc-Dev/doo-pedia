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
// DATABASE - PAKE MEMORY (VERCEL FIX)
// ==========================================
let dbData = {
    users: [],
    sessions: [],
    orders: []
};

function readDB() {
    return dbData;
}

function writeDB(data) {
    dbData = data;
}

// ==========================================
// RUANGOTP API CONFIG - API KEY LANGSUNG!
// ==========================================
const USER_ID = 'c0175829-7892-4fc8-9978-895099de7c76';
const API_BASE_V1 = 'https://api.ruangotp.net/api/v1';
const API_BASE_V2 = 'https://api.ruangotp.net/api/v2';

// ==========================================
// RUANGOTP REQUEST FUNCTION
// ==========================================
async function ruangotpRequest(endpoint, method = 'GET', data = null, useV2 = false) {
    try {
        const baseUrl = useV2 ? API_BASE_V2 : API_BASE_V1;
        const url = `${baseUrl}${endpoint}`;
        
        console.log(`🔄 [${useV2 ? 'V2' : 'V1'}] ${method} ${url}`);
        
        const config = {
            method: method,
            url: url,
            headers: {
                'x-user-id': USER_ID,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            config.data = data;
        }
        
        const response = await axios(config);
        console.log(`✅ [${useV2 ? 'V2' : 'V1'}] Success`);
        return response.data;
    } catch (error) {
        console.error(`❌ RuangOTP Error:`, error.response?.data || error.message);
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
// RUANGOTP API ENDPOINTS
// ==========================================

// 1. GET SERVICES LIST - V1
app.get('/api/v1/services', async (req, res) => {
    try {
        console.log('📡 Fetching services from RuangOTP V1...');
        const data = await ruangotpRequest('/services/list', 'GET', null, false);
        res.json({ success: true, server: 'Server 1 (RuangOTP V1)', data });
    } catch (error) {
        console.error('❌ V1 Error:', error.message);
        res.json({
            success: true,
            server: 'Server 1 (Fallback)',
            data: [
                { service_code: 1, service_name: 'WhatsApp', category: 'Social', status: true },
                { service_code: 2, service_name: 'Telegram', category: 'Social', status: true },
                { service_code: 3, service_name: 'Instagram', category: 'Social', status: true },
                { service_code: 4, service_name: 'Facebook', category: 'Social', status: true },
                { service_code: 5, service_name: 'Twitter/X', category: 'Social', status: true },
                { service_code: 6, service_name: 'TikTok', category: 'Social', status: true },
                { service_code: 7, service_name: 'Discord', category: 'Social', status: true },
                { service_code: 8, service_name: 'Gmail', category: 'Email', status: true },
                { service_code: 9, service_name: 'DANA', category: 'E-wallet', status: true },
                { service_code: 10, service_name: 'OVO', category: 'E-wallet', status: true },
                { service_code: 11, service_name: 'GoPay', category: 'E-wallet', status: true },
                { service_code: 12, service_name: 'ShopeePay', category: 'E-wallet', status: true },
                { service_code: 13, service_name: 'Shopee', category: 'E-commerce', status: true },
                { service_code: 14, service_name: 'Tokopedia', category: 'E-commerce', status: true },
                { service_code: 15, service_name: 'Grab', category: 'Transport', status: true },
                { service_code: 16, service_name: 'Gojek', category: 'Transport', status: true },
                { service_code: 17, service_name: 'LINE', category: 'Social', status: true },
                { service_code: 18, service_name: 'Signal', category: 'Social', status: true },
                { service_code: 19, service_name: 'Netflix', category: 'Streaming', status: true },
                { service_code: 20, service_name: 'Spotify', category: 'Music', status: true },
                { service_code: 21, service_name: 'YouTube', category: 'Streaming', status: true },
                { service_code: 22, service_name: 'Amazon', category: 'E-commerce', status: true },
                { service_code: 23, service_name: 'PayPal', category: 'Payment', status: true },
                { service_code: 24, service_name: 'Uber', category: 'Transport', status: true },
                { service_code: 25, service_name: 'ChatGPT', category: 'AI', status: true },
                { service_code: 26, service_name: 'Canva', category: 'Design', status: true },
                { service_code: 27, service_name: 'CapCut', category: 'Edit', status: true },
                { service_code: 28, service_name: 'Zoom', category: 'Conference', status: true },
                { service_code: 29, service_name: 'Microsoft', category: 'Office', status: true },
                { service_code: 30, service_name: 'Apple', category: 'Device', status: true }
            ]
        });
    }
});

// 2. GET SERVICES LIST - V2
app.get('/api/v2/services', async (req, res) => {
    try {
        console.log('📡 Fetching services from RuangOTP V2...');
        const data = await ruangotpRequest('/services/list', 'GET', null, true);
        res.json({ success: true, server: 'Server 2 (RuangOTP V2)', data });
    } catch (error) {
        console.error('❌ V2 Error:', error.message);
        res.json({
            success: true,
            server: 'Server 2 (Fallback)',
            data: [
                { service_code: 1, service_name: 'WhatsApp', category: 'Social', status: true },
                { service_code: 2, service_name: 'Telegram', category: 'Social', status: true },
                { service_code: 9, service_name: 'DANA', category: 'E-wallet', status: true },
                { service_code: 3, service_name: 'Instagram', category: 'Social', status: true },
                { service_code: 4, service_name: 'Facebook', category: 'Social', status: true },
                { service_code: 5, service_name: 'Twitter/X', category: 'Social', status: true },
                { service_code: 6, service_name: 'TikTok', category: 'Social', status: true },
                { service_code: 7, service_name: 'Discord', category: 'Social', status: true },
                { service_code: 10, service_name: 'OVO', category: 'E-wallet', status: true },
                { service_code: 13, service_name: 'Shopee', category: 'E-commerce', status: true },
                { service_code: 14, service_name: 'Tokopedia', category: 'E-commerce', status: true }
            ]
        });
    }
});

// 3. GET COUNTRIES LIST - V1
app.get('/api/v1/countries', async (req, res) => {
    try {
        const data = await ruangotpRequest('/countries/list', 'GET', null, false);
        res.json({ success: true, server: 'Server 1', data });
    } catch (error) {
        res.json({
            success: true,
            server: 'Server 1 (Fallback)',
            data: [
                { code: 'ID', name: 'Indonesia' },
                { code: 'US', name: 'United States' },
                { code: 'UK', name: 'United Kingdom' },
                { code: 'SG', name: 'Singapore' },
                { code: 'MY', name: 'Malaysia' },
                { code: 'JP', name: 'Japan' },
                { code: 'KR', name: 'Korea' },
                { code: 'CN', name: 'China' },
                { code: 'IN', name: 'India' },
                { code: 'BR', name: 'Brazil' },
                { code: 'AU', name: 'Australia' },
                { code: 'DE', name: 'Germany' },
                { code: 'FR', name: 'France' },
                { code: 'RU', name: 'Russia' },
                { code: 'CA', name: 'Canada' }
            ]
        });
    }
});

// 4. GET OPERATORS LIST - V1
app.get('/api/v1/operators', async (req, res) => {
    try {
        const data = await ruangotpRequest('/operators/list', 'GET', null, false);
        res.json({ success: true, server: 'Server 1', data });
    } catch (error) {
        res.json({
            success: true,
            server: 'Server 1 (Fallback)',
            data: [
                { code: 'TELKOMSEL', name: 'Telkomsel' },
                { code: 'XL', name: 'XL Axiata' },
                { code: 'INDOSAT', name: 'Indosat' },
                { code: 'SMARTFREN', name: 'Smartfren' },
                { code: 'TRI', name: 'Tri' },
                { code: 'BYU', name: 'By.U' }
            ]
        });
    }
});

// 5. ORDER - V1
app.post('/api/v1/order', async (req, res) => {
    try {
        const { service_code, country = 'ID' } = req.body;
        if (!service_code) {
            return res.status(400).json({ success: false, error: 'service_code wajib diisi' });
        }

        const data = await ruangotpRequest('/order', 'POST', {
            service_code: service_code,
            country: country
        }, false);

        res.json({ success: true, server: 'Server 1', data });
    } catch (error) {
        res.status(500).json({ success: false, server: 'Server 1', error: error.message });
    }
});

// 6. ORDER - V2
app.post('/api/v2/order', async (req, res) => {
    try {
        const { service_code, country = 'ID' } = req.body;
        if (!service_code) {
            return res.status(400).json({ success: false, error: 'service_code wajib diisi' });
        }

        const data = await ruangotpRequest('/order', 'POST', {
            service_code: service_code,
            country: country
        }, true);

        res.json({ success: true, server: 'Server 2', data });
    } catch (error) {
        res.status(500).json({ success: false, server: 'Server 2', error: error.message });
    }
});

// 7. CHECK ORDER - V1
app.get('/api/v1/check/:order_id', async (req, res) => {
    try {
        const { order_id } = req.params;
        const data = await ruangotpRequest(`/check/${order_id}`, 'GET', null, false);
        res.json({ success: true, server: 'Server 1', data });
    } catch (error) {
        res.status(500).json({ success: false, server: 'Server 1', error: error.message });
    }
});

// 8. CHECK ORDER - V2
app.get('/api/v2/check/:order_id', async (req, res) => {
    try {
        const { order_id } = req.params;
        const data = await ruangotpRequest(`/check/${order_id}`, 'GET', null, true);
        res.json({ success: true, server: 'Server 2', data });
    } catch (error) {
        res.status(500).json({ success: false, server: 'Server 2', error: error.message });
    }
});

// 9. CANCEL ORDER - V1
app.post('/api/v1/cancel/:order_id', async (req, res) => {
    try {
        const { order_id } = req.params;
        const data = await ruangotpRequest(`/cancel/${order_id}`, 'POST', null, false);
        res.json({ success: true, server: 'Server 1', data });
    } catch (error) {
        res.status(500).json({ success: false, server: 'Server 1', error: error.message });
    }
});

// 10. CANCEL ORDER - V2
app.post('/api/v2/cancel/:order_id', async (req, res) => {
    try {
        const { order_id } = req.params;
        const data = await ruangotpRequest(`/cancel/${order_id}`, 'POST', null, true);
        res.json({ success: true, server: 'Server 2', data });
    } catch (error) {
        res.status(500).json({ success: false, server: 'Server 2', error: error.message });
    }
});

// 11. BALANCE - V1
app.get('/api/v1/balance', async (req, res) => {
    try {
        const data = await ruangotpRequest('/balance', 'GET', null, false);
        res.json({ success: true, server: 'Server 1', data });
    } catch (error) {
        res.json({ success: true, server: 'Server 1 (Fallback)', data: { balance: 0, currency: 'IDR' } });
    }
});

// 12. BALANCE - V2
app.get('/api/v2/balance', async (req, res) => {
    try {
        const data = await ruangotpRequest('/balance', 'GET', null, true);
        res.json({ success: true, server: 'Server 2', data });
    } catch (error) {
        res.json({ success: true, server: 'Server 2 (Fallback)', data: { balance: 0, currency: 'IDR' } });
    }
});

// 13. SERVER STATUS
app.get('/api/server-status', async (req, res) => {
    const status = {
        server1: { status: 'offline' },
        server2: { status: 'offline' }
    };

    try {
        await ruangotpRequest('/services/list', 'GET', null, false);
        status.server1 = { status: 'online' };
    } catch (e) {}

    try {
        await ruangotpRequest('/services/list', 'GET', null, true);
        status.server2 = { status: 'online' };
    } catch (e) {}

    res.json({ success: true, data: status });
});

// 14. TEST
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
