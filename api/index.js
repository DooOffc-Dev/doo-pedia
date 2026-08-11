require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
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
// 5SIM API CONFIG
// ==========================================
const FIVESIM_API_KEY = process.env.FIVESIM_API_KEY;
const FIVESIM_BASE_URL = process.env.FIVESIM_BASE_URL || 'https://5sim.net/v1';

// ==========================================
// 5SIM API HELPER
// ==========================================
async function fivesimRequest(endpoint, method = 'GET', data = null) {
    try {
        const config = {
            method: method,
            url: `${FIVESIM_BASE_URL}${endpoint}`,
            headers: {
                'Authorization': `Bearer ${FIVESIM_API_KEY}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };
        if (data) {
            config.data = data;
        }
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error('5SIM API Error:', error.response?.data || error.message);
        throw error;
    }
}

// ==========================================
// 5SIM ENDPOINTS
// ==========================================

// 1. GET PROFILE (Cek Saldo)
app.get('/api/profile', async (req, res) => {
    try {
        const data = await fivesimRequest('/user/profile');
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. GET COUNTRIES
app.get('/api/countries', async (req, res) => {
    try {
        const data = await fivesimRequest('/guest/countries');
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. GET SERVICES (Daftar semua service) - INI YANG DIPAKE BUAT TAMPILAN WEB
app.get('/api/services', async (req, res) => {
    try {
        const data = await fivesimRequest('/guest/services');
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 4. GET PRICES (Harga per negara & service)
app.get('/api/prices', async (req, res) => {
    try {
        const { country, service } = req.query;
        let endpoint = '/guest/prices';
        if (country && service) {
            endpoint = `/guest/prices/${country}/${service}`;
        } else if (country) {
            endpoint = `/guest/prices/${country}`;
        }
        const data = await fivesimRequest(endpoint);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5. BUY NUMBER (Order nomor) - INI YANG DIPAKE BUAT ORDER
app.post('/api/order-auto', async (req, res) => {
    try {
        const { service_id, country = 'indonesia' } = req.body;
        // service_id = nama service (whatsapp, telegram, dll)
        const endpoint = `/user/buy/activation/${country}/any/${service_id}`;
        const data = await fivesimRequest(endpoint, 'GET');
        res.json({ 
            success: true, 
            phone_number: data.phone,
            order_id: data.id,
            status: data.status,
            ...data
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 6. CHECK ORDER STATUS (Cek OTP) - INI YANG DIPAKE BUAT CEK OTP
app.get('/api/check-otp/:order_id', async (req, res) => {
    try {
        const { order_id } = req.params;
        const data = await fivesimRequest(`/user/check/${order_id}`);
        
        // Format response biar sama kayak RumahOTP
        const response = {
            success: true,
            order_id: data.id,
            status: data.status,
            phone_number: data.phone,
            otp_code: data.code || data.sms?.code || null
        };
        res.json(response);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 7. CANCEL ORDER
app.post('/api/cancel-order/:order_id', async (req, res) => {
    try {
        const { order_id } = req.params;
        const data = await fivesimRequest(`/user/cancel/${order_id}`, 'GET');
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 8. FINISH ORDER (Selesai)
app.post('/api/finish-order/:order_id', async (req, res) => {
    try {
        const { order_id } = req.params;
        const data = await fivesimRequest(`/user/finish/${order_id}`, 'GET');
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 9. GET OPERATORS (Daftar operator per negara)
app.get('/api/operators/:country', async (req, res) => {
    try {
        const { country } = req.params;
        const data = await fivesimRequest(`/guest/operators/${country}`);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 10. GET BALANCE - ALIAS BUAT COMPATIBILITY
app.get('/api/balance', async (req, res) => {
    try {
        const data = await fivesimRequest('/user/profile');
        res.json({ 
            success: true, 
            balance: data.balance || 0,
            currency: 'USD'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==========================================
// TEST ENDPOINT
// ==========================================
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: '✅ API DooPedia with 5SIM is running!',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});

// ==========================================
// ERROR HANDLING
// ==========================================
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error', message: err.message });
});

app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found', path: req.path });
});

module.exports = app;
