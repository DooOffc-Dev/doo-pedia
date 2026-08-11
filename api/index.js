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

// 3. GET PRODUCTS (Services per country)
app.get('/api/products', async (req, res) => {
    try {
        const { country, operator } = req.query;
        let endpoint = '/guest/products';
        if (country && operator) {
            endpoint = `/guest/products/${country}/${operator}`;
        } else if (country) {
            endpoint = `/guest/products/${country}`;
        }
        const data = await fivesimRequest(endpoint);
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

// 5. BUY NUMBER (Order nomor)
app.post('/api/buy', async (req, res) => {
    try {
        const { country, operator, service } = req.body;
        if (!country || !service) {
            return res.status(400).json({ success: false, error: 'Country dan service wajib diisi' });
        }
        
        const endpoint = `/user/buy/activation/${country}/${operator || 'any'}/${service}`;
        const data = await fivesimRequest(endpoint, 'GET');
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 6. CHECK ORDER STATUS (Cek OTP)
app.get('/api/check/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await fivesimRequest(`/user/check/${id}`);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 7. CANCEL ORDER
app.post('/api/cancel/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await fivesimRequest(`/user/cancel/${id}`, 'GET');
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 8. FINISH ORDER (Selesai)
app.post('/api/finish/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await fivesimRequest(`/user/finish/${id}`, 'GET');
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 9. GET ALL SERVICES (Daftar semua service)
app.get('/api/services', async (req, res) => {
    try {
        const data = await fivesimRequest('/guest/services');
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 10. GET OPERATORS (Daftar operator per negara)
app.get('/api/operators/:country', async (req, res) => {
    try {
        const { country } = req.params;
        const data = await fivesimRequest(`/guest/operators/${country}`);
        res.json({ success: true, data });
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
