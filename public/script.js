// ==========================================
// STATE
// ==========================================
let currentCategory = 'all';
let allServices = [];
let currentSlide = 0;
let slideInterval;

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
// FLAG EMOJI UNTUK TIAP NEGARA
// ==========================================
const countryFlags = {
    'Indonesia': '🇮🇩',
    'US': '🇺🇸',
    'United States': '🇺🇸',
    'Global': '🌍',
    'Japan': '🇯🇵',
    'Korea': '🇰🇷',
    'China': '🇨🇳',
    'UK': '🇬🇧',
    'Singapore': '🇸🇬',
    'Malaysia': '🇲🇾',
    'Thailand': '🇹🇭',
    'Vietnam': '🇻🇳',
    'Philippines': '🇵🇭',
    'India': '🇮🇳',
    'Brazil': '🇧🇷',
    'Russia': '🇷🇺',
    'Australia': '🇦🇺',
    'Germany': '🇩🇪',
    'France': '🇫🇷'
};

function getFlag(country) {
    return countryFlags[country] || '🌍';
}

// ==========================================
// PRODUCT IMAGES
// ==========================================
const productImages = {
    'WhatsApp': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/whatsapp.svg',
    'Telegram': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/telegram.svg',
    'Instagram': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg',
    'Gmail': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/gmail.svg',
    'Twitter': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/twitter.svg',
    'TikTok': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tiktok.svg',
    'Facebook': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg',
    'Discord': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/discord.svg',
    'LINE': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/line.svg',
    'Signal': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/signal.svg',
    'Microsoft': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/microsoft.svg',
    'Apple': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/apple.svg',
    'Call of Duty': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/callofduty.svg',
    'Point Blank': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/pointblank.svg',
    'Clash of Clans': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/clashofclans.svg',
    'Mobile Legends': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/mobilelegends.svg',
    'Free Fire': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/freefire.svg',
    'PUBG Mobile': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/pubg.svg',
    'Valorant': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/valorant.svg',
    'Genshin Impact': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/genshinimpact.svg',
    'Indosat': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/indosat.svg',
    'XL Axiata': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/xlaxiata.svg',
    'Telkomsel': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/telkomsel.svg',
    'Smartfren': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/smartfren.svg',
    'Gojek': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/gojek.svg',
    'Grab': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/grab.svg',
    'OVO': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/ovo.svg',
    'DANA': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/dana.svg',
    'Shopee': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/shopee.svg',
    'Tokopedia': 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/tokopedia.svg'
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
    'Mobile Legends': 'games', 'Free Fire': 'games', 'PUBG Mobile': 'games',
    'Valorant': 'games', 'Genshin Impact': 'games',
    'Indosat': 'money', 'XL Axiata': 'money', 'Telkomsel': 'money',
    'Smartfren': 'money', 'Gojek': 'money', 'Grab': 'money',
    'OVO': 'money', 'DANA': 'money', 'Shopee': 'money', 'Tokopedia': 'money'
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

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') changeSlide(-1);
    if (e.key === 'ArrowRight') changeSlide(1);
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
    document.querySelector('#emptyState h3').textContent = '👤 Profile';
    document.querySelector('#emptyState p').innerHTML = 'Silakan login untuk melihat profile';
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
// RENDER SERVICES - LANGSUNG MUNCUL
// ==========================================
async function renderServices() {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;

    // TAMPILIN LOADING DULU
    grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:#445566;">
            <i class="fas fa-spinner fa-spin" style="font-size:36px;display:block;margin-bottom:12px;color:#0088FF;"></i>
            <h3 style="color:#fff;font-size:16px;">🔄 Sedang menyiapkan layanan produk...</h3>
            <p style="font-size:13px;margin-top:4px;">Mohon tunggu sebentar</p>
        </div>
    `;

    // TUNGGU 1.5 DETIK
    await new Promise(resolve => setTimeout(resolve, 1500));

    // AMBIL DATA SERVICES
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
            <div style="grid-column:1/-1;text-align:center;padding:40px 0;color:#445566;">
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
        const flag = getFlag(s.country || 'Global');
        return `
        <div class="service-card">
            <div class="icon">
                <img src="${s.image || DEFAULT_IMAGE}" alt="${s.name}" loading="lazy" 
                     onerror="this.src='${DEFAULT_IMAGE}'">
            </div>
            <h3>${s.name}</h3>
            <div class="sub">${flag} ${s.country || 'Global'}</div>
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
    const btn = event?.target?.closest?.('.order-btn') || document.querySelector('.order-btn');
    if (btn) { btn.textContent = '⏳...'; btn.disabled = true; }

    try {
        const res = await fetch('/api/order-auto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
            const res = await fetch(`/api/check-otp/${orderId}`);
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
// UPDATE UI - TANPA LOGIN
// ==========================================
function updateUI() {
    const balanceDisplay = document.getElementById('headerBalance');
    if (balanceDisplay) {
        balanceDisplay.innerHTML = `<i class="fas fa-coins"></i> <span>Rp 0</span>`;
    }
}
updateUI();

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
function openDepositModal() {
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
    if (e.clientY < 0 && !exitTriggered && !document.getElementById('authModal').classList.contains('show')) {
        exitTriggered = true;
        document.getElementById('exitPopup').classList.add('show');
    }
});
function closeExitPopup() { document.getElementById('exitPopup').classList.remove('show'); }

// ==========================================
// CLOSE MODAL ON OUTSIDE CLICK
// ==========================================
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('show');
    });
});
