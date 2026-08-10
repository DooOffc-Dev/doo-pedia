// ==========================================
// STATE
// ==========================================
let currentUser = null;
let authToken = localStorage.getItem('doopedia_token');
let currentCategory = 'all';
let allServices = [];

// ==========================================
// 100+ PRODUCT IMAGES
// ==========================================
const productImages = {
    'WhatsApp': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/whatsapp.svg',
    'Telegram': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/telegram.svg',
    'Instagram': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg',
    'Gmail': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/gmail.svg',
    'Twitter': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/twitter.svg',
    'X': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/x.svg',
    'TikTok': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tiktok.svg',
    'Facebook': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg',
    'Discord': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/discord.svg',
    'LINE': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/line.svg',
    'Signal': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/signal.svg',
    'Microsoft': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/microsoft.svg',
    'Apple': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/apple.svg',
    'Google': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/google.svg',
    'YouTube': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg',
    'Netflix': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/netflix.svg',
    'Spotify': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/spotify.svg',
    'Amazon': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/amazon.svg',
    'Twitch': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/twitch.svg',
    'Reddit': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/reddit.svg',
    'Snapchat': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/snapchat.svg',
    'LinkedIn': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg',
    'WeChat': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/wechat.svg',
    'KakaoTalk': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/kakaotalk.svg',
    'Viber': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/viber.svg',
    'Skype': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/skype.svg',
    'Zoom': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/zoom.svg',
    'Slack': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/slack.svg',
    'Call of Duty': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/callofduty.svg',
    'Point Blank': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/pointblank.svg',
    'Clash of Clans': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/clashofclans.svg',
    'Clash Royale': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/clashroyale.svg',
    'Mobile Legends': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/mobilelegends.svg',
    'MLBB': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/mlbb.svg',
    'Free Fire': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/freefire.svg',
    'PUBG': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/pubg.svg',
    'PUBG Mobile': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/pubg.svg',
    'Valorant': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/valorant.svg',
    'Genshin Impact': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/genshinimpact.svg',
    'Ragnarok': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/ragnarok.svg',
    'Ragnarok M': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/ragnarokm.svg',
    'Ragnarok X': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/ragnarokx.svg',
    'Arena of Valor': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/arenaofvalor.svg',
    'League of Legends': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/leagueoflegends.svg',
    'Dota 2': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/dota2.svg',
    'CS:GO': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/csgo.svg',
    'Steam': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/steam.svg',
    'Epic Games': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/epicgames.svg',
    'Roblox': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/roblox.svg',
    'Minecraft': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/minecraft.svg',
    'Fortnite': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/fortnite.svg',
    'Apex Legends': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/apexlegends.svg',
    'PlayStation': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/playstation.svg',
    'Xbox': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/xbox.svg',
    'Nintendo Switch': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/nintendoswitch.svg',
    'Indosat': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/indosat.svg',
    'XL Axiata': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/xlaxiata.svg',
    'Telkomsel': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/telkomsel.svg',
    'Smartfren': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/smartfren.svg',
    'Tri': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tri.svg',
    'By.U': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/byu.svg',
    'Gojek': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/gojek.svg',
    'Grab': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/grab.svg',
    'OVO': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/ovo.svg',
    'DANA': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/dana.svg',
    'Shopee': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/shopee.svg',
    'Tokopedia': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tokopedia.svg',
    'Lazada': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/lazada.svg',
    'Blibli': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/blibli.svg',
    'Bukalapak': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/bukalapak.svg',
    'BRI': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/bri.svg',
    'BCA': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/bca.svg',
    'Mandiri': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/mandiri.svg',
    'BNI': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/bni.svg',
    'PayPal': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/paypal.svg',
    'Stripe': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/stripe.svg',
    'Coinbase': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/coinbase.svg',
    'Binance': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/binance.svg',
    'OKX': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/okx.svg'
};

const DEFAULT_IMAGE = 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/default.svg';

function getProductImage(name) {
    const key = Object.keys(productImages).find(k => k.toLowerCase() === name.toLowerCase());
    return key ? productImages[key] : DEFAULT_IMAGE;
}

// ==========================================
// CATEGORY MAP
// ==========================================
const categoryMap = {
    'Call of Duty': 'games', 'Point Blank': 'games', 'Clash of Clans': 'games',
    'Clash Royale': 'games', 'Mobile Legends': 'games', 'MLBB': 'games',
    'Free Fire': 'games', 'PUBG': 'games', 'PUBG Mobile': 'games',
    'Valorant': 'games', 'Genshin Impact': 'games', 'Ragnarok': 'games',
    'Ragnarok M': 'games', 'Ragnarok X': 'games', 'Arena of Valor': 'games',
    'League of Legends': 'games', 'Dota 2': 'games', 'CS:GO': 'games',
    'Steam': 'games', 'Epic Games': 'games', 'Roblox': 'games',
    'Minecraft': 'games', 'Fortnite': 'games', 'Apex Legends': 'games',
    'PlayStation': 'games', 'Xbox': 'games', 'Nintendo Switch': 'games',
    'Indosat': 'money', 'XL Axiata': 'money', 'Telkomsel': 'money',
    'Smartfren': 'money', 'Tri': 'money', 'By.U': 'money',
    'Gojek': 'money', 'Grab': 'money', 'OVO': 'money', 'DANA': 'money',
    'Shopee': 'money', 'Tokopedia': 'money', 'Lazada': 'money',
    'Blibli': 'money', 'Bukalapak': 'money', 'BRI': 'money',
    'BCA': 'money', 'Mandiri': 'money', 'BNI': 'money',
    'PayPal': 'money', 'Stripe': 'money', 'Coinbase': 'money',
    'Binance': 'money', 'OKX': 'money'
};

function getProductCategory(name) {
    return categoryMap[name] || 'utility';
}

// ==========================================
// LOADING
// ==========================================
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loading').classList.add('hide');
    }, 1000);
    checkSession();
    renderServices();
});

// ==========================================
// EXIT POPUP
// ==========================================
let exitTriggered = false;
document.addEventListener('mouseleave', (e) => {
    if (e.clientY < 0 && !exitTriggered && !document.getElementById('authModal').classList.contains('show')) {
        exitTriggered = true;
        document.getElementById('exitPopup').classList.add('show');
    }
});
function closeExitPopup() { document.getElementById('exitPopup').classList.remove('show'); }

// ==========================================
// NAVIGATION
// ==========================================
function navigateTo(page) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`.nav-item[onclick*="${page}"]`)?.classList.add('active');
    if (page === 'home') {
        document.querySelector('.main-content').style.display = 'block';
        document.getElementById('servicesGrid').style.display = 'grid';
        document.getElementById('emptyState').style.display = 'none';
    } else if (page === 'activity') {
        document.querySelector('.main-content').style.display = 'block';
        document.getElementById('servicesGrid').style.display = 'none';
        document.getElementById('emptyState').style.display = 'block';
        document.querySelector('#emptyState h3').textContent = '📋 Riwayat Aktivitas';
        document.querySelector('#emptyState p').textContent = 'Belum ada aktivitas. Mulai order sekarang!';
        document.querySelector('#emptyState .btn').style.display = 'none';
    }
}

function openProfile() {
    if (!currentUser) { openAuthModal(); return; }
    document.querySelector('.main-content').style.display = 'block';
    document.getElementById('servicesGrid').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
    document.querySelector('#emptyState h3').textContent = `👤 ${currentUser.name}`;
    document.querySelector('#emptyState p').innerHTML = `Email: ${currentUser.email}<br>Saldo: Rp ${currentUser.balance || 0}`;
    document.querySelector('#emptyState .btn').style.display = 'none';
}

// ==========================================
// CATEGORY FILTER
// ==========================================
function filterCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.category-btn').forEach(el => el.classList.remove('active'));
    document.querySelector(`.category-btn[data-category="${category}"]`)?.classList.add('active');
    renderServices();
}

// ==========================================
// FETCH SERVICES
// ==========================================
async function fetchServices() {
    try {
        const res = await fetch('/api/services');
        const data = await res.json();
        let services = data.services || data || [];
        if (!services.length) services = getAllProducts();
        return services;
    } catch (e) {
        return getAllProducts();
    }
}

function getAllProducts() {
    return [
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
    ];
}

// ==========================================
// RENDER SERVICES
// ==========================================
async function renderServices() {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;

    let services = await fetchServices();
    services = services.map(s => {
        const name = s.name || s.service_name || 'Unknown';
        return { ...s, name, category: getProductCategory(name), image: getProductImage(name) };
    });

    let filtered = services;
    if (currentCategory !== 'all') {
        filtered = services.filter(s => s.category === currentCategory);
    }

    if (!filtered.length) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:40px 0;color:#555577;">
                <i class="fas fa-search" style="font-size:36px;display:block;margin-bottom:12px;"></i>
                <p>Tidak ada produk di kategori ini</p>
                <button onclick="openSuggestModal()" class="btn btn-secondary" style="margin-top:12px;">
                    <i class="fas fa-plus"></i> Kasih saran produk
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(s => {
        const imageUrl = s.image || DEFAULT_IMAGE;
        return `
        <div class="service-card">
            <div class="icon">
                <img src="${imageUrl}" alt="${s.name}" loading="lazy" 
                     onerror="this.src='${DEFAULT_IMAGE}'">
            </div>
            <h3>${s.name}</h3>
            <div class="sub">${s.country || 'Global'}</div>
            <span class="price">Rp ${(s.price || 0).toLocaleString()}</span>
            <button class="order-btn" onclick="event.stopPropagation();autoOrder('${s.id || s.service_id}')">
                <i class="fas fa-bolt"></i> Order
            </button>
        </div>
    `}).join('');
}

// ==========================================
// AUTO ORDER
// ==========================================
async function autoOrder(serviceId) {
    if (!authToken) { openAuthModal(); showNotification('⚠️ Login dulu untuk order'); return; }

    const btn = event?.target?.closest?.('.order-btn') || document.querySelector('.order-btn');
    if (btn) { btn.textContent = '⏳...'; btn.disabled = true; }

    try {
        const res = await fetch('/api/order-auto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify({ service_id: serviceId, country: 'ID' })
        });
        const data = await res.json();

        if (data.success) {
            showNotification(`✅ Order berhasil! Nomor: ${data.phone_number || data.number || '...'}`);
            await autoCheckOTP(data.order_id || data.id);
        } else {
            showNotification('❌ ' + (data.error || 'Order gagal'));
        }
    } catch (error) {
        showNotification('❌ Error: ' + error.message);
    } finally {
        if (btn) { btn.textContent = 'Order'; btn.disabled = false; }
    }
}

async function autoCheckOTP(orderId) {
    let attempts = 0;
    const maxAttempts = 18;
    showNotification('⏳ Menunggu OTP...');

    const checkInterval = setInterval(async () => {
        attempts++;
        try {
            const res = await fetch(`/api/check-otp/${orderId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await res.json();
            if (data.success && data.otp_code) {
                clearInterval(checkInterval);
                showNotification(`🎉 OTP: ${data.otp_code} dari ${data.phone_number || data.number || ''}`);
                return;
            }
            if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                showNotification('⏰ Waktu habis, OTP tidak masuk');
            }
        } catch (error) { console.log('Check OTP error:', error); }
    }, 10000);
}

// ==========================================
// AUTH SYSTEM
// ==========================================
async function checkSession() {
    if (!authToken) { updateUI(); return false; }
    try {
        const res = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${authToken}` } });
        const data = await res.json();
        if (data.success) {
            currentUser = data.user;
            updateUI();
            await fetchBalance();
            return true;
        } else {
            logout();
            return false;
        }
    } catch (e) { return false; }
}

async function register(email, name) {
    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name })
        });
        return await res.json();
    } catch (e) { return { success: false, error: 'Network error' }; }
}

async function verifyOTP(email, otp, password) {
    try {
        const res = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, password })
        });
        const data = await res.json();
        if (data.success) {
            authToken = data.token;
            localStorage.setItem('doopedia_token', authToken);
            currentUser = data.user;
            updateUI();
            closeAuthModal();
            showNotification('✅ Registrasi berhasil!');
            await fetchBalance();
        }
        return data;
    } catch (e) { return { success: false, error: 'Network error' }; }
}

async function login(email, password) {
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
            authToken = data.token;
            localStorage.setItem('doopedia_token', authToken);
            currentUser = data.user;
            updateUI();
            closeAuthModal();
            showNotification('✅ Login berhasil!');
            await fetchBalance();
        }
        return data;
    } catch (e) { return { success: false, error: 'Network error' }; }
}

function logout() {
    authToken = null;
    localStorage.removeItem('doopedia_token');
    currentUser = null;
    updateUI();
    showNotification('👋 Logout berhasil');
}

function updateUI() {
    const authBtn = document.getElementById('authBtn');
    const headerUser = document.getElementById('headerUser');
    const userName = document.getElementById('headerUserName');
    const balanceDisplay = document.getElementById('headerBalance');
    
    if (currentUser) {
        authBtn.innerHTML = `<i class="fas fa-user-check"></i>`;
        headerUser.style.display = 'flex';
        userName.textContent = currentUser.name || 'User';
        balanceDisplay.innerHTML = `<i class="fas fa-coins"></i> <span>Rp ${currentUser.balance || 0}</span>`;
    } else {
        authBtn.innerHTML = `<i class="fas fa-user"></i>`;
        headerUser.style.display = 'none';
        balanceDisplay.innerHTML = `<i class="fas fa-coins"></i> <span>Rp 0</span>`;
    }
}

async function fetchBalance() {
    if (!authToken || !currentUser) return;
    try {
        const res = await fetch('/api/balance', { headers: { 'Authorization': `Bearer ${authToken}` } });
        const data = await res.json();
        if (data.success && currentUser) {
            currentUser.balance = data.balance;
            updateUI();
        }
    } catch (e) { console.log('Balance fetch error:', e); }
}

// ==========================================
// AUTH MODAL
// ==========================================
function openAuthModal() { document.getElementById('authModal').classList.add('show'); }
function closeAuthModal() {
    document.getElementById('authModal').classList.remove('show');
    document.getElementById('authStep').value = 'login';
}

function switchAuthTab(tab) {
    document.getElementById('authStep').value = tab;
    document.getElementById('loginTab').classList.toggle('active', tab === 'login');
    document.getElementById('registerTab').classList.toggle('active', tab === 'register');
    document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
    document.getElementById('otpForm').style.display = 'none';
}

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const result = await login(
        document.getElementById('loginEmail').value,
        document.getElementById('loginPassword').value
    );
    if (!result.success) showNotification('❌ ' + (result.error || 'Login gagal'));
});

document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const name = document.getElementById('registerName').value;
    const result = await register(email, name);
    if (result.success) {
        showNotification('✅ OTP telah dikirim ke email Anda');
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('otpForm').style.display = 'block';
        document.getElementById('otpEmail').value = email;
    } else {
        showNotification('❌ ' + (result.error || 'Registrasi gagal'));
    }
});

document.getElementById('otpForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const result = await verifyOTP(
        document.getElementById('otpEmail').value,
        document.getElementById('otpCode').value,
        document.getElementById('registerPassword').value
    );
    if (!result.success) showNotification('❌ ' + (result.error || 'Verifikasi gagal'));
});

// ==========================================
// DEPOSIT MODAL
// ==========================================
function openDepositModal() {
    if (!authToken || !currentUser) { openAuthModal(); return; }
    document.getElementById('depositBalance').textContent = `Rp ${currentUser.balance || 0}`;
    document.getElementById('depositModal').classList.add('show');
}
function closeDepositModal() { document.getElementById('depositModal').classList.remove('show'); }
function depositAmount(amount) { showNotification(`💳 Deposit Rp ${amount.toLocaleString()} via QRIS`); }
function depositCustom() {
    const input = document.getElementById('customDeposit');
    const amount = parseInt(input.value);
    if (!amount || amount < 1000) { showNotification('⚠️ Minimal deposit Rp 1.000'); return; }
    depositAmount(amount);
}

// ==========================================
// SUGGEST MODAL
// ==========================================
function openSuggestModal() { document.getElementById('suggestModal').classList.add('show'); }
function closeSuggestModal() { document.getElementById('suggestModal').classList.remove('show'); }

async function submitSuggestion(e) {
    e.preventDefault();
    const name = document.getElementById('suggestName').value;
    const category = document.getElementById('suggestCategory').value;
    const desc = document.getElementById('suggestDesc').value;
    const email = document.getElementById('suggestEmail').value;

    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
    btn.disabled = true;

    try {
        const res = await fetch('/api/suggest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, category, desc, email })
        });
        const data = await res.json();
        if (data.success) {
            showNotification('✅ Saran berhasil dikirim! Terima kasih 🙏');
            closeSuggestModal();
        } else {
            showNotification('❌ ' + (data.error || 'Gagal mengirim saran'));
        }
    } catch (error) {
        showNotification('❌ Error: ' + error.message);
    } finally {
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim Saran';
        btn.disabled = false;
    }
}

// ==========================================
// NOTIFICATION
// ==========================================
function showNotification(message) {
    const container = document.getElementById('notificationContainer');
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()">&times;</button>`;
    container.appendChild(notif);
    setTimeout(() => { if (notif.parentElement) notif.remove(); }, 5000);
}

// ==========================================
// CLOSE MODAL ON OUTSIDE CLICK
// ==========================================
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('show');
    });
});

// ==========================================
// AUTO REFRESH BALANCE
// ==========================================
setInterval(async () => { if (currentUser) await fetchBalance(); }, 30000);