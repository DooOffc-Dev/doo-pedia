// ==========================================
// STATE
// ==========================================
let currentCategory = 'all';
let allServices = [];
let currentSlide = 0;
let slideInterval;
let servicePrices = {};

// ==========================================
// JAM REAL TIME
// ==========================================
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    
    const clockDisplay = document.getElementById('clockDisplay');
    if (clockDisplay) {
        clockDisplay.textContent = timeString;
    }
}
setInterval(updateClock, 1000);
updateClock();

// ==========================================
// PRODUCT IMAGES
// ==========================================
const productImages = {
    'whatsapp': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/whatsapp.svg',
    'telegram': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/telegram.svg',
    'instagram': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg',
    'gmail': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/gmail.svg',
    'twitter': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/twitter.svg',
    'tiktok': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tiktok.svg',
    'facebook': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg',
    'discord': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/discord.svg',
    'line': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/line.svg',
    'signal': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/signal.svg',
    'microsoft': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/microsoft.svg',
    'apple': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/apple.svg',
    'netflix': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/netflix.svg',
    'spotify': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/spotify.svg',
    'youtube': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg',
    'twitch': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/twitch.svg',
    'steam': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/steam.svg',
    'epicgames': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/epicgames.svg',
    'callofduty': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/callofduty.svg',
    'mobilelegends': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/mobilelegends.svg',
    'freefire': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/freefire.svg',
    'pubg': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/pubg.svg',
    'valorant': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/valorant.svg',
    'genshinimpact': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/genshinimpact.svg'
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
    // Sosial Media
    'whatsapp': 'sosmed',
    'telegram': 'sosmed',
    'instagram': 'sosmed',
    'gmail': 'sosmed',
    'twitter': 'sosmed',
    'tiktok': 'sosmed',
    'facebook': 'sosmed',
    'discord': 'sosmed',
    'line': 'sosmed',
    'signal': 'sosmed',
    'youtube': 'sosmed',
    'twitch': 'sosmed',
    // Game
    'steam': 'game',
    'epicgames': 'game',
    'callofduty': 'game',
    'mobilelegends': 'game',
    'freefire': 'game',
    'pubg': 'game',
    'valorant': 'game',
    'genshinimpact': 'game',
    // Lainnya
    'microsoft': 'lainnya',
    'apple': 'lainnya',
    'netflix': 'lainnya',
    'spotify': 'lainnya'
};

function getProductCategory(name) {
    return categoryMap[name] || 'lainnya';
}

// ==========================================
// LOADING
// ==========================================
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loading').classList.add('hide');
    }, 1000);
    renderServices();
    slideInterval = setInterval(() => changeSlide(1), 5000);
});

// ==========================================
// HERO SLIDER
// ==========================================
function changeSlide(direction) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.dot');
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + direction + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.dot');
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
    clearInterval(slideInterval);
    slideInterval = setInterval(() => changeSlide(1), 5000);
}

document.querySelector('.hero-slider')?.addEventListener('mouseenter', () => clearInterval(slideInterval));
document.querySelector('.hero-slider')?.addEventListener('mouseleave', () => {
    slideInterval = setInterval(() => changeSlide(1), 5000);
});

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
    document.querySelector('.main-content').style.display = 'block';
    document.getElementById('servicesGrid').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
    document.querySelector('#emptyState h3').textContent = '👤 Profil';
    document.querySelector('#emptyState p').innerHTML = 'Memuat profil...';
    document.querySelector('#emptyState .btn').style.display = 'none';
    
    fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                document.querySelector('#emptyState p').innerHTML = `
                    Saldo: Rp ${(data.data.balance || 0) * 15000}<br>
                    Email: ${data.data.email || '-'}<br>
                    Username: ${data.data.username || '-'}
                `;
            }
        })
        .catch(() => {
            document.querySelector('#emptyState p').innerHTML = 'Gagal ambil profil';
        });
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
// FETCH SERVICES & PRICES DARI 5SIM
// ==========================================
async function fetchServices() {
    try {
        // 1. Ambil daftar service
        const res = await fetch('/api/services');
        const data = await res.json();
        
        let services = [];
        if (data.success) {
            services = Object.keys(data.data || {}).map(name => ({
                id: name,
                name: name.charAt(0).toUpperCase() + name.slice(1),
                country: 'Indonesia',
                price: 0
            }));
        }
        
        // 2. Ambil harga dari /api/prices
        try {
            const priceRes = await fetch('/api/prices');
            const priceData = await priceRes.json();
            if (priceData.success) {
                // Simpan harga per service
                const prices = priceData.data || {};
                for (const [country, services] of Object.entries(prices)) {
                    for (const [service, price] of Object.entries(services)) {
                        servicePrices[service] = price;
                    }
                }
            }
        } catch (e) {
            console.log('Gagal ambil harga:', e);
        }
        
        return services;
    } catch (e) {
        return getAllProducts();
    }
}

function getAllProducts() {
    return [
        { id: 'whatsapp', name: 'WhatsApp', country: 'Indonesia', price: 2500 },
        { id: 'telegram', name: 'Telegram', country: 'Indonesia', price: 2000 },
        { id: 'instagram', name: 'Instagram', country: 'Indonesia', price: 3500 },
        { id: 'gmail', name: 'Gmail', country: 'Indonesia', price: 5000 },
        { id: 'twitter', name: 'Twitter', country: 'Indonesia', price: 4000 },
        { id: 'tiktok', name: 'TikTok', country: 'Indonesia', price: 4500 },
        { id: 'facebook', name: 'Facebook', country: 'Indonesia', price: 3000 },
        { id: 'discord', name: 'Discord', country: 'Indonesia', price: 5000 },
        { id: 'line', name: 'LINE', country: 'Indonesia', price: 3500 },
        { id: 'signal', name: 'Signal', country: 'Indonesia', price: 6000 },
        { id: 'netflix', name: 'Netflix', country: 'Indonesia', price: 8000 },
        { id: 'spotify', name: 'Spotify', country: 'Indonesia', price: 7000 },
        { id: 'youtube', name: 'YouTube', country: 'Indonesia', price: 5000 },
        { id: 'twitch', name: 'Twitch', country: 'Indonesia', price: 6000 },
        { id: 'steam', name: 'Steam', country: 'Indonesia', price: 8000 },
        { id: 'mobilelegends', name: 'Mobile Legends', country: 'Indonesia', price: 5000 },
        { id: 'freefire', name: 'Free Fire', country: 'Indonesia', price: 4000 },
        { id: 'pubg', name: 'PUBG', country: 'Indonesia', price: 5000 },
        { id: 'valorant', name: 'Valorant', country: 'Indonesia', price: 6000 },
        { id: 'genshinimpact', name: 'Genshin Impact', country: 'Indonesia', price: 7000 }
    ];
}

function getServicePrice(serviceId) {
    // Ambil harga dari API, kalo ga ada pake fallback
    const priceInUsd = servicePrices[serviceId] || 0.008;
    return Math.round(priceInUsd * 18000); // Konversi USD ke Rp
}

// ==========================================
// RENDER SERVICES
// ==========================================
async function renderServices() {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;

    grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:#445566;">
            <i class="fas fa-spinner fa-spin" style="font-size:36px;display:block;margin-bottom:12px;color:#0088FF;"></i>
            <h3 style="color:#fff;font-size:16px;">🔄 Sedang menyiapkan layanan...</h3>
            <p style="font-size:13px;margin-top:4px;">Mohon tunggu sebentar</p>
        </div>
    `;

    await new Promise(resolve => setTimeout(resolve, 1500));

    let services = await fetchServices();
    services = services.map(s => ({
        ...s,
        category: getProductCategory(s.id),
        image: getProductImage(s.id)
    }));

    let filtered = services;
    if (currentCategory !== 'all') {
        filtered = services.filter(s => s.category === currentCategory);
    }

    if (!filtered.length) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:40px 0;color:#445566;">
                <i class="fas fa-search" style="font-size:36px;display:block;margin-bottom:12px;"></i>
                <p>Tidak ada layanan di kategori ini</p>
                <button onclick="openSuggestModal()" class="btn btn-secondary" style="margin-top:12px;">
                    <i class="fas fa-plus"></i> Kasih saran layanan
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(s => {
        const price = getServicePrice(s.id);
        return `
        <div class="service-card">
            <div class="icon">
                <img src="${s.image || DEFAULT_IMAGE}" alt="${s.name}" loading="lazy" 
                     onerror="this.src='${DEFAULT_IMAGE}'">
            </div>
            <h3>${s.name}</h3>
            <div class="sub">${s.country || 'Global'}</div>
            <span class="price">Rp ${price.toLocaleString()}</span>
            <button class="order-btn" onclick="event.stopPropagation();autoOrder('${s.id}')">
                <i class="fas fa-bolt"></i> Beli
            </button>
        </div>
    `}).join('');
}

// ==========================================
// AUTO ORDER
// ==========================================
async function autoOrder(serviceId) {
    const btn = event?.target?.closest?.('.order-btn') || document.querySelector('.order-btn');
    if (btn) { btn.textContent = '⏳...'; btn.disabled = true; }

    try {
        const res = await fetch('/api/order-auto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ service_id: serviceId, country: 'indonesia' })
        });
        const data = await res.json();

        if (data.success) {
            document.getElementById('orderNumber').textContent = data.phone_number || data.phone || '-';
            document.getElementById('orderId').value = data.order_id || data.id;
            document.getElementById('orderStatus').textContent = 'Menunggu OTP...';
            document.getElementById('orderCode').textContent = '-';
            document.getElementById('orderModal').classList.add('show');
            showNotification(`✅ Nomor: ${data.phone_number || data.phone || '...'}`);
            await autoCheckOTP(data.order_id || data.id);
        } else {
            showNotification('❌ ' + (data.error || 'Gagal order'));
        }
    } catch (error) {
        showNotification('❌ Error: ' + error.message);
    } finally {
        if (btn) { btn.textContent = 'Beli'; btn.disabled = false; }
    }
}

// ==========================================
// AUTO CHECK OTP
// ==========================================
async function autoCheckOTP(orderId) {
    let attempts = 0;
    const maxAttempts = 30;
    showNotification('⏳ Menunggu OTP...');

    const checkInterval = setInterval(async () => {
        attempts++;
        try {
            const res = await fetch(`/api/check-otp/${orderId}`);
            const data = await res.json();
            
            if (data.success && data.otp_code) {
                clearInterval(checkInterval);
                document.getElementById('orderStatus').textContent = '✅ OTP Diterima';
                document.getElementById('orderCode').textContent = data.otp_code;
                showNotification(`🎉 Kode OTP: ${data.otp_code}`);
                return;
            }
            
            if (data.success && data.status === 'FINISHED') {
                clearInterval(checkInterval);
                document.getElementById('orderStatus').textContent = '✅ Selesai';
                showNotification('✅ Order selesai');
                return;
            }
            
            if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                document.getElementById('orderStatus').textContent = '⏰ Waktu habis';
                showNotification('⏰ Waktu habis, OTP tidak masuk');
            }
        } catch (error) { console.log('Check OTP error:', error); }
    }, 5000);
}

// ==========================================
// CANCEL ORDER
// ==========================================
async function cancelOrder() {
    const id = document.getElementById('orderId').value;
    if (!id) return;
    
    try {
        const res = await fetch(`/api/cancel-order/${id}`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            showNotification('✅ Order dibatalkan');
            document.getElementById('orderModal').classList.remove('show');
        }
    } catch (error) {
        showNotification('❌ Gagal batalkan order');
    }
}

// ==========================================
// FINISH ORDER
// ==========================================
async function finishOrder() {
    const id = document.getElementById('orderId').value;
    if (!id) return;
    
    try {
        const res = await fetch(`/api/finish-order/${id}`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            showNotification('✅ Order selesai');
            document.getElementById('orderModal').classList.remove('show');
        }
    } catch (error) {
        showNotification('❌ Gagal selesaikan order');
    }
}

// ==========================================
// UPDATE UI - SALDO RP
// ==========================================
function updateUI() {
    const balanceDisplay = document.getElementById('headerBalance');
    if (balanceDisplay) {
        fetch('/api/balance')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const balanceRp = Math.round((data.balance || 0) * 18000);
                    balanceDisplay.innerHTML = `<i class="fas fa-coins"></i> <span>Rp ${balanceRp.toLocaleString()}</span>`;
                }
            })
            .catch(() => {});
    }
}
updateUI();
setInterval(updateUI, 30000);

// ==========================================
// SUGGEST
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
// DEPOSIT
// ==========================================
function openDepositModal() { document.getElementById('depositModal').classList.add('show'); }
function closeDepositModal() { document.getElementById('depositModal').classList.remove('show'); }

function depositAmount(amount) {
    showNotification(`💳 Deposit Rp ${amount.toLocaleString()} via QRIS`);
}

function depositCustom() {
    const input = document.getElementById('customDeposit');
    const amount = parseInt(input.value);
    if (!amount || amount < 1000) { showNotification('⚠️ Minimal deposit Rp 1.000'); return; }
    depositAmount(amount);
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
// EXIT POPUP
// ==========================================
let exitTriggered = false;
document.addEventListener('mouseleave', (e) => {
    if (e.clientY < 0 && !exitTriggered &&
