// ==========================================
// STATE
// ==========================================
let currentUser = null;
let authToken = localStorage.getItem('doopedia_token');
let currentPage = 'home';
let selectedDeposit = 5000;
let selectedService = null;

// ==========================================
// GREETING
// ==========================================
function getGreeting() {
    const hour = new Date().getHours();
    let greet = 'Selamat malam 🌙';
    if (hour >= 4 && hour < 11) { greet = 'Selamat pagi 🌅'; }
    else if (hour >= 11 && hour < 15) { greet = 'Selamat siang ☀️'; }
    else if (hour >= 15 && hour < 18) { greet = 'Selamat sore 🌤️'; }
    return greet;
}

function updateGreeting() {
    const el = document.getElementById('greetingText');
    if (el) el.textContent = getGreeting();
}

// ==========================================
// SERVICES DATA
// ==========================================
const servicesList = [
    { id: 'whatsapp', name: 'WhatsApp', icon: 'https://cdn.simpleicons.org/whatsapp/25D366' },
    { id: 'telegram', name: 'Telegram', icon: 'https://cdn.simpleicons.org/telegram/229ED9' },
    { id: 'instagram', name: 'Instagram', icon: 'https://cdn.simpleicons.org/instagram/E4405F' },
    { id: 'facebook', name: 'Facebook', icon: 'https://cdn.simpleicons.org/facebook/1877F2' },
    { id: 'twitter', name: 'Twitter/X', icon: 'https://cdn.simpleicons.org/twitter/1DA1F2' },
    { id: 'tiktok', name: 'TikTok', icon: 'https://cdn.simpleicons.org/tiktok/000000' },
    { id: 'discord', name: 'Discord', icon: 'https://cdn.simpleicons.org/discord/5865F2' },
    { id: 'snapchat', name: 'Snapchat', icon: 'https://cdn.simpleicons.org/snapchat/FFFC00' },
    { id: 'reddit', name: 'Reddit', icon: 'https://cdn.simpleicons.org/reddit/FF4500' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'https://cdn.simpleicons.org/linkedin/0A66C2' },
    { id: 'pinterest', name: 'Pinterest', icon: 'https://cdn.simpleicons.org/pinterest/BD081C' },
    { id: 'line', name: 'LINE', icon: 'https://cdn.simpleicons.org/line/00C300' },
    { id: 'signal', name: 'Signal', icon: 'https://cdn.simpleicons.org/signal/3A76F0' },
    { id: 'gmail', name: 'Gmail', icon: 'https://cdn.simpleicons.org/gmail/EA4335' },
    { id: 'google', name: 'Google', icon: 'https://cdn.simpleicons.org/google/4285F4' },
    { id: 'netflix', name: 'Netflix', icon: 'https://cdn.simpleicons.org/netflix/E50914' },
    { id: 'spotify', name: 'Spotify', icon: 'https://cdn.simpleicons.org/spotify/1ED760' },
    { id: 'youtube', name: 'YouTube', icon: 'https://cdn.simpleicons.org/youtube/FF0000' },
    { id: 'twitch', name: 'Twitch', icon: 'https://cdn.simpleicons.org/twitch/9146FF' },
    { id: 'shopee', name: 'Shopee', icon: 'https://cdn.simpleicons.org/shopee/EE4D2D' },
    { id: 'tokopedia', name: 'Tokopedia', icon: 'https://cdn.simpleicons.org/tokopedia/00AA5B' },
    { id: 'grab', name: 'Grab', icon: 'https://cdn.simpleicons.org/grab/00B14F' },
    { id: 'gojek', name: 'Gojek', icon: 'https://cdn.simpleicons.org/gojek/00AA6C' },
    { id: 'dana', name: 'DANA', icon: 'https://cdn.simpleicons.org/dana/FF5C00' },
    { id: 'ovo', name: 'OVO', icon: 'https://cdn.simpleicons.org/ovo/502D9F' },
    { id: 'amazon', name: 'Amazon', icon: 'https://cdn.simpleicons.org/amazon/FF9900' },
    { id: 'paypal', name: 'PayPal', icon: 'https://cdn.simpleicons.org/paypal/00457C' },
    { id: 'uber', name: 'Uber', icon: 'https://cdn.simpleicons.org/uber/000000' },
    { id: 'chatgpt', name: 'ChatGPT', icon: 'https://cdn.simpleicons.org/openai/412991' },
    { id: 'canva', name: 'Canva', icon: 'https://cdn.simpleicons.org/canva/00C4CC' },
    { id: 'capcut', name: 'CapCut', icon: 'https://cdn.simpleicons.org/capcut/FF0000' },
    { id: 'zoom', name: 'Zoom', icon: 'https://cdn.simpleicons.org/zoom/2D8CFF' }
];

// ==========================================
// RENDER SERVICES
// ==========================================
function renderServices() {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;
    grid.innerHTML = servicesList.map(s => `
        <div class="service-card" onclick="selectService('${s.id}')">
            <div class="icon"><img src="${s.icon}" alt="${s.name}" loading="lazy" onerror="this.innerHTML='<i class=\\'bi bi-phone\\'></i>'" /></div>
            <div class="name">${s.name}</div>
        </div>
    `).join('');
    updateTotalCountries();
}

function filterServices() {
    const query = document.getElementById('serviceSearch').value.toLowerCase();
    const grid = document.getElementById('servicesGrid');
    const filtered = servicesList.filter(s => s.name.toLowerCase().includes(query));
    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:20px;color:#445566;">Tidak ditemukan</div>';
        return;
    }
    grid.innerHTML = filtered.map(s => `
        <div class="service-card" onclick="selectService('${s.id}')">
            <div class="icon"><img src="${s.icon}" alt="${s.name}" loading="lazy" onerror="this.innerHTML='<i class=\\'bi bi-phone\\'></i>'" /></div>
            <div class="name">${s.name}</div>
        </div>
    `).join('');
}

function selectService(id) {
    selectedService = id;
    const service = servicesList.find(s => s.id === id);
    if (!service) return;
    showNotification(`📱 Memuat produk untuk ${service.name}...`);
    fetchProducts(id);
}

function fetchProducts(serviceId) {
    fetch('/api/v1/services')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.data && data.data.services) {
                const products = data.data.services.filter(s => s.id == serviceId || s.service_id == serviceId);
                if (products.length > 0) showProducts(products, serviceId);
                else showProducts([{ id: serviceId, name: serviceId.charAt(0).toUpperCase() + serviceId.slice(1), country: 'Indonesia', price: 2000 }], serviceId);
            } else {
                showProducts([{ id: serviceId, name: serviceId.charAt(0).toUpperCase() + serviceId.slice(1), country: 'Indonesia', price: 2000 }], serviceId);
            }
        })
        .catch(() => {
            showProducts([{ id: serviceId, name: serviceId.charAt(0).toUpperCase() + serviceId.slice(1), country: 'Indonesia', price: 2000 }], serviceId);
        });
}

function showProducts(products, serviceId) {
    const grid = document.getElementById('servicesGrid');
    const searchBox = document.getElementById('serviceSearch');
    const title = document.querySelector('.section-title');
    const subText = document.querySelector('.section-title + div');
    const serviceName = servicesList.find(s => s.id === serviceId)?.name || 'layanan';
    
    if (searchBox) searchBox.style.display = 'none';
    if (title) title.textContent = `📱 ${serviceName}`;
    if (subText) subText.textContent = `Pilih nomor virtual untuk ${serviceName}`;
    
    grid.innerHTML = `
        <div style="grid-column:1/-1;margin-bottom:8px;">
            <button class="back-btn" onclick="backToServices()"><i class="bi bi-arrow-left"></i> Kembali</button>
        </div>
        <div style="grid-column:1/-1;">
            <div class="product-grid">
                ${products.map(p => `
                    <div class="product-item" onclick="orderProduct('${p.id}')">
                        <div class="info">
                            <div class="name">${p.name || p.service_name || 'Nomor Virtual'}</div>
                            <div class="country">${p.country || 'Global'}</div>
                        </div>
                        <div class="price">Rp ${(p.price || 0).toLocaleString()}</div>
                        <button class="btn-order" onclick="event.stopPropagation();orderProduct('${p.id}')">Order</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function backToServices() {
    const grid = document.getElementById('servicesGrid');
    const searchBox = document.getElementById('serviceSearch');
    const title = document.querySelector('.section-title');
    const subText = document.querySelector('.section-title + div');
    if (searchBox) searchBox.style.display = 'block';
    if (title) title.textContent = '📱 Get Virtual Number';
    if (subText) subText.textContent = 'Pilih layanan dari 200+ negara';
    renderServices();
}

function orderProduct(productId) {
    if (!authToken || !currentUser) {
        openAuthModal('login');
        return;
    }
    showNotification(`⏳ Memproses order ${productId}...`);
}

function updateTotalCountries() {
    fetch('/api/v1/services')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.data) {
                const count = Object.keys(data.data || {}).length || 200;
                document.getElementById('totalCountryDisplay').textContent = count + '+';
                document.getElementById('totalCountryValue').textContent = count + ' Negara';
            }
        })
        .catch(() => {
            document.getElementById('totalCountryDisplay').textContent = '200+';
            document.getElementById('totalCountryValue').textContent = '204 Negara';
        });
}

// ==========================================
// FAQ - ACCORDION
// ==========================================
function toggleFaq(btn) {
    const item = btn.closest('.faq-item');
    const body = item.querySelector('.faq-a');
    const isOpen = item.classList.contains('is-open');
    
    document.querySelectorAll('.faq-item').forEach(el => {
        el.classList.remove('is-open');
        el.querySelector('.faq-a').style.maxHeight = null;
    });
    
    if (!isOpen) {
        item.classList.add('is-open');
        body.style.maxHeight = body.scrollHeight + 'px';
    }
}

// ==========================================
// TERMS MODAL
// ==========================================
function openTermsModal() {
    document.getElementById('termsModal').classList.add('show');
}

function closeTermsModal() {
    document.getElementById('termsModal').classList.remove('show');
}

// ==========================================
// SWITCH SERVER
// ==========================================
function switchServer(server) {
    document.querySelectorAll('.srv-tab').forEach(el => el.classList.remove('active'));
    document.querySelector(`.srv-tab[onclick*="${server}"]`).classList.add('active');
    showNotification(`🔄 Beralih ke ${server}`);
}

// ==========================================
// AUTH FUNCTIONS
// ==========================================
async function registerUser(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const errorEl = document.getElementById('registerError');
    const successEl = document.getElementById('registerSuccess');
    errorEl.style.display = 'none';
    successEl.style.display = 'none';
    
    if (password !== confirmPassword) {
        errorEl.textContent = 'Password tidak sama!';
        errorEl.style.display = 'block';
        return;
    }
    if (password.length < 6) {
        errorEl.textContent = 'Password minimal 6 karakter!';
        errorEl.style.display = 'block';
        return;
    }
    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, confirmPassword })
        });
        const data = await res.json();
        if (data.success) {
            successEl.textContent = '✅ ' + data.message;
            successEl.style.display = 'block';
            document.getElementById('registerForm').reset();
            setTimeout(() => {
                switchAuthTab('login');
                document.getElementById('loginEmail').value = email;
            }, 1500);
        } else {
            errorEl.textContent = '❌ ' + data.error;
            errorEl.style.display = 'block';
        }
    } catch (error) {
        errorEl.textContent = '❌ Error: ' + error.message;
        errorEl.style.display = 'block';
    }
}

async function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    errorEl.style.display = 'none';
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
            closeAuthModal();
            updateUI();
            showNotification('✅ Selamat datang, ' + currentUser.username + '!');
        } else {
            errorEl.textContent = '❌ ' + data.error;
            errorEl.style.display = 'block';
        }
    } catch (error) {
        errorEl.textContent = '❌ Error: ' + error.message;
        errorEl.style.display = 'block';
    }
}

async function logoutUser() {
    if (authToken) {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
        } catch (e) {}
    }
    authToken = null;
    localStorage.removeItem('doopedia_token');
    currentUser = null;
    updateUI();
    showNotification('👋 Logout berhasil!');
}

async function changeAPIKey() {
    if (!authToken) return;
    try {
        const res = await fetch('/api/auth/change-apikey', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await res.json();
        if (data.success) {
            currentUser.apiKey = data.apiKey;
            updateUI();
            showNotification('✅ API Key berhasil diubah!');
        } else {
            showNotification('❌ Gagal mengubah API Key');
        }
    } catch (e) {
        showNotification('❌ Error: ' + e.message);
    }
}

// ==========================================
// SESSION CHECK
// ==========================================
async function checkSession() {
    if (!authToken) {
        updateUI();
        renderServices();
        return;
    }
    try {
        const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await res.json();
        if (data.success) {
            currentUser = data.user;
            updateUI();
            renderProfile();
        } else {
            logoutUser();
        }
    } catch (e) {
        logoutUser();
    }
}

// ==========================================
// UPDATE UI
// ==========================================
function updateUI() {
    const userInfo = document.getElementById('userInfo');
    const authButtons = document.getElementById('authButtons');
    const displayUsername = document.getElementById('displayUsername');
    const homeSaldo = document.getElementById('homeSaldo');
    
    if (currentUser) {
        userInfo.style.display = 'block';
        authButtons.style.display = 'none';
        displayUsername.textContent = currentUser.username;
        homeSaldo.textContent = 'Rp ' + (currentUser.balance || 0);
        renderProfile();
        updateGreeting();
    } else {
        userInfo.style.display = 'none';
        authButtons.style.display = 'flex';
        homeSaldo.textContent = 'Rp 0';
    }
}

function renderProfile() {
    if (!currentUser) return;
    document.getElementById('profileAvatar').textContent = currentUser.username.charAt(0).toUpperCase();
    document.getElementById('profileName').textContent = currentUser.username;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profileBadge').textContent = 'ID: ' + (currentUser.apiKey || '-');
    document.getElementById('apiKeyDisplay').textContent = currentUser.apiKey || '-';
    document.getElementById('profileRegistered').textContent = currentUser.registeredAt || '-';
    document.getElementById('profileBalance').textContent = 'Rp ' + (currentUser.balance || 0);
    document.getElementById('profileTotalOrder').textContent = (currentUser.totalOrder || 0) + 'x';
    document.getElementById('profileDeposit').textContent = (currentUser.totalDeposit || 0) + 'x';
}

// ==========================================
// DEPOSIT
// ==========================================
function selectDepositAmount(el, amount) {
    document.querySelectorAll('.deposit-amount-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    selectedDeposit = amount;
}

function generateQRIS() {
    const server = document.getElementById('qrisServer').value;
    if (!server) {
        showNotification('⚠️ Pilih server QRIS terlebih dahulu!');
        return;
    }
    showNotification(`💳 Tagihan QRIS Rp ${selectedDeposit.toLocaleString()} sedang dibuat...`);
}

// ==========================================
// NAVIGATION
// ==========================================
function navigateTo(page) {
    currentPage = page;
    document.querySelectorAll('.bottom-nav .nav-item').forEach(el => {
        el.classList.remove('active');
        if (el.dataset.page === page || (el.classList.contains('order-btn') && page === 'home')) {
            el.classList.add('active');
        }
    });
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
    const targetPage = document.getElementById(`page${page.charAt(0).toUpperCase() + page.slice(1)}`);
    if (targetPage) targetPage.classList.add('active');
    if (page === 'profile' && currentUser) renderProfile();
    if (page === 'home') backToServices();
}

// ==========================================
// AUTH MODAL
// ==========================================
function openAuthModal(tab = 'login') {
    document.getElementById('authModal').classList.add('show');
    switchAuthTab(tab);
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('show');
}

function switchAuthTab(tab) {
    document.querySelectorAll('.modal-auth-tabs .tab').forEach(el => el.classList.remove('active'));
    document.querySelector(`.modal-auth-tabs .tab[data-tab="${tab}"]`).classList.add('active');
    document.querySelectorAll('.auth-form').forEach(el => el.classList.remove('active'));
    document.getElementById(tab + 'Form').classList.add('active');
    document.getElementById('authModalTitle').textContent = tab === 'login' ? '✦ Login' : '✦ Daftar';
}

// ==========================================
// SUPPORT MODAL
// ==========================================
function openSupportModal() {
    document.getElementById('supportModal').classList.add('show');
}

function closeSupportModal() {
    document.getElementById('supportModal').classList.remove('show');
}

// ==========================================
// NOTIFICATION
// ==========================================
function showNotification(message) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
        background: #0f1a2e; border: 1px solid rgba(0,102,204,0.1); 
        padding: 12px 20px; border-radius: 10px; color: #fff; 
        z-index: 99999; max-width: 360px; font-size: 13px;
        animation: fadeIn 0.3s ease; box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        text-align: center;
    `;
    notif.innerHTML = message;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transition = '0.3s';
        setTimeout(() => notif.remove(), 300);
    }, 3500);
}

// ==========================================
// EXIT POPUP
// ==========================================
let exitTriggered = false;
document.addEventListener('mouseleave', function(e) {
    if (e.clientY < 0 && !exitTriggered && !document.getElementById('authModal').classList.contains('show')) {
        exitTriggered = true;
        document.getElementById('exitPopup').classList.add('show');
    }
});

function closeExitPopup() {
    document.getElementById('exitPopup').classList.remove('show');
}

// ==========================================
// CLICK OUTSIDE MODAL
// ==========================================
document.getElementById('authModal').addEventListener('click', function(e) {
    if (e.target === this) closeAuthModal();
});

document.getElementById('supportModal').addEventListener('click', function(e) {
    if (e.target === this) closeSupportModal();
});

document.getElementById('termsModal').addEventListener('click', function(e) {
    if (e.target === this) closeTermsModal();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeAuthModal();
        closeSupportModal();
        closeTermsModal();
        closeExitPopup();
    }
});

// ==========================================
// BURGER
// ==========================================
document.getElementById('lpBurger').addEventListener('click', function() {
    showNotification('📱 DooPedia - Home, Deposit, Order, Activity, Profile');
});

// ==========================================
// INIT
// ==========================================
checkSession();
document.querySelector('.bottom-nav .nav-item[data-page="home"]')?.classList.add('active');
