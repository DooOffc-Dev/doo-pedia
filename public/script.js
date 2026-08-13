// ==========================================
// STATE
// ==========================================
let currentUser = null;
let authToken = localStorage.getItem('doopedia_token');
let currentPage = 'home';
let selectedDeposit = 5000;
let allServices = [];
let currentSlide = 0;
let slideInterval;

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
// HERO SLIDER
// ==========================================
function goToSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.dot');
    slides.forEach((el, i) => {
        el.style.display = i === index ? 'block' : 'none';
    });
    dots.forEach((el, i) => {
        el.classList.toggle('active', i === index);
    });
    currentSlide = index;
}

function changeSlide(direction) {
    const total = document.querySelectorAll('.hero-slide').length;
    const newIndex = (currentSlide + direction + total) % total;
    goToSlide(newIndex);
}

// Auto slide
function startAutoSlide() {
    if (slideInterval) clearInterval(slideInterval);
    slideInterval = setInterval(() => changeSlide(1), 5000);
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
            renderServices();
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
            renderServices();
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
// SERVICES
// ==========================================
async function fetchServices() {
    try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (data.success && data.data) {
            return data.data.map(s => ({
                service_code: s.service_code,
                service_name: s.service_name,
                service_img: s.service_img || null
            }));
        }
        return [];
    } catch (e) {
        console.log('Error fetching services:', e);
        return [];
    }
}

async function renderServices() {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;
    
    grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:40px 0;color:#445566;">
            <i class="bi bi-arrow-repeat fa-spin" style="font-size:32px;display:block;margin-bottom:12px;color:#0088FF;"></i>
            <p>Memuat layanan...</p>
        </div>
    `;
    
    const services = await fetchServices();
    allServices = services;
    
    if (!services || services.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:20px;color:#445566;">
                <i class="bi bi-inbox" style="font-size:32px;display:block;margin-bottom:8px;"></i>
                <p>Tidak ada layanan tersedia</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = services.map(s => `
        <div class="service-card" onclick="selectService('${s.service_code}')">
            <div class="icon">
                ${s.service_img ? 
                    `<img src="${s.service_img}" alt="${s.service_name}" loading="lazy" onerror="this.innerHTML='<i class=\\'bi bi-phone\\'></i>'" />` :
                    `<i class="bi bi-phone" style="font-size:24px;color:#0088FF;"></i>`
                }
            </div>
            <div class="name">${s.service_name || 'Unknown'}</div>
        </div>
    `).join('');
    
    // Update total countries
    try {
        const res = await fetch('/api/countries');
        const data = await res.json();
        if (data.success && data.data) {
            const count = data.data.length || 200;
            document.getElementById('totalCountryDisplay').textContent = count + '+';
            document.getElementById('totalCountryValue').textContent = count + ' Negara';
        }
    } catch (e) {}
}

function filterServices() {
    const query = document.getElementById('serviceSearch').value.toLowerCase();
    const grid = document.getElementById('servicesGrid');
    const filtered = allServices.filter(s => 
        s.service_name.toLowerCase().includes(query)
    );
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:20px;color:#445566;">
                <i class="bi bi-search" style="font-size:32px;display:block;margin-bottom:8px;"></i>
                <p>Tidak ditemukan</p>
            </div>
        `;
        return;
    }
    grid.innerHTML = filtered.map(s => `
        <div class="service-card" onclick="selectService('${s.service_code}')">
            <div class="icon">
                ${s.service_img ? 
                    `<img src="${s.service_img}" alt="${s.service_name}" loading="lazy" onerror="this.innerHTML='<i class=\\'bi bi-phone\\'></i>'" />` :
                    `<i class="bi bi-phone" style="font-size:24px;color:#0088FF;"></i>`
                }
            </div>
            <div class="name">${s.service_name || 'Unknown'}</div>
        </div>
    `).join('');
}

function selectService(serviceCode) {
    if (!authToken || !currentUser) {
        openAuthModal('login');
        return;
    }
    showNotification(`⏳ Memproses order untuk ${serviceCode}...`);
}

function switchServer(server) {
    document.querySelectorAll('.srv-tab').forEach(el => el.classList.remove('active'));
    document.querySelector(`.srv-tab[onclick*="${server}"]`).classList.add('active');
    showNotification(`🔄 Beralih ke ${server}`);
}

// ==========================================
// DEPOSIT
// ==========================================
function selectDepositAmount(el, amount) {
    document.querySelectorAll('.deposit-amount-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    selectedDeposit = amount;
}

async function generateQRIS() {
    const server = document.getElementById('qrisServer').value;
    if (!server) {
        showNotification('⚠️ Pilih server QRIS terlebih dahulu!');
        return;
    }
    if (!authToken || !currentUser) {
        openAuthModal('login');
        return;
    }
    try {
        showNotification('⏳ Membuat tagihan QRIS...');
        const res = await fetch('/api/deposit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: selectedDeposit })
        });
        const data = await res.json();
        if (data.success) {
            showNotification(`✅ Tagihan QRIS Rp ${selectedDeposit.toLocaleString()} berhasil dibuat!`);
            if (data.data && data.data.qr_code) {
                // Bisa tampilkan QR code di sini
                console.log('QR Code:', data.data.qr_code);
            }
        } else {
            showNotification('❌ ' + (data.error || 'Gagal membuat tagihan QRIS'));
        }
    } catch (error) {
        showNotification('❌ Error: ' + error.message);
    }
}

// ==========================================
// FAQ
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
// API DOCS
// ==========================================
function openApiDocs() {
    window.open('/api/docs', '_blank');
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
    if (page === 'home') {
        renderServices();
        startAutoSlide();
    }
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
window.addEventListener('load', function() {
    checkSession();
    startAutoSlide();
    document.querySelector('.bottom-nav .nav-item[data-page="home"]')?.classList.add('active');
});
