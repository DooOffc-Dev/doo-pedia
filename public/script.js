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
// PRODUCT IMAGES (TETAP)
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
// CATEGORY MAP (TETAP)
// ==========================================
const categoryMap = {
    'callofduty': 'games', 'mobilelegends': 'games', 'freefire': 'games',
    'pubg': 'games', 'valorant': 'games', 'genshinimpact': 'games',
    'whatsapp': 'utility', 'telegram': 'utility', 'instagram': 'utility',
    'gmail': 'utility', 'twitter': 'utility', 'tiktok': 'utility',
    'facebook': 'utility', 'discord': 'utility', 'line': 'utility',
    'signal': 'utility', 'microsoft': 'utility', 'apple': 'utility'
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
    document.querySelector('#emptyState p').innerHTML = 'Loading profile...';
    document.querySelector('#emptyState .btn').style.display = 'none';
    
    // Ambil profile dari API 5sim
    fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                document.querySelector('#emptyState p').innerHTML = `
                    Saldo: $${data.data.balance || 0}<br>
                    Email: ${data.data.email || '-'}<br>
                    Username: ${data.data.username || '-'}
                `;
            }
        })
        .catch(() => {
            document.querySelector('#emptyState p').innerHTML = 'Gagal ambil profile';
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
// FETCH SERVICES (DARI 5SIM)
// ==========================================
async function fetchServices() {
    try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (data.success) {
            // Format response 5sim ke array services
            const services = Object.keys(data.data || {}).map(name => ({
                id: name,
                name: name.charAt(0).toUpperCase() + name.slice(1),
                country: 'Global',
                price: 0
            }));
            return services;
        }
        return getAllProducts();
    } catch (e) {
        return getAllProducts();
    }
}

function getAllProducts() {
    return [
        { id: 'whatsapp', name: 'WhatsApp', country: 'Global', price: 0 },
        { id: 'telegram', name: 'Telegram', country: 'Global', price: 0 },
        { id: 'instagram', name: 'Instagram', country: 'Global', price: 0 },
        { id: 'gmail', name: 'Gmail', country: 'Global', price: 0 },
        { id: 'twitter', name: 'Twitter', country: 'Global', price: 0 },
        { id: 'tiktok', name: 'TikTok', country: 'Global', price: 0 },
        { id: 'facebook', name: 'Facebook', country: 'Global', price: 0 },
        { id: 'discord', name: 'Discord', country: 'Global', price: 0 },
        { id: 'line', name: 'LINE', country: 'Global', price: 0 },
        { id: 'signal', name: 'Signal', country: 'Global', price: 0 }
    ];
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
            <h3 style="color:#fff;font-size:16px;">🔄 Sedang menyiapkan layanan produk...</h3>
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
                <p>Tidak ada produk di kategori ini</p>
                <button onclick="openSuggestModal()" class="btn btn-secondary" style="margin-top:12px;">
                    <i class="fas fa-plus"></i> Kasih saran produk
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(s => `
        <div class="service-card">
            <div class="icon">
                <img src="${s.image || DEFAULT_IMAGE}" alt="${s.name}" loading="lazy" 
                     onerror="this.src='${DEFAULT_IMAGE}'">
            </div>
            <h3>${s.name}</h3>
            <div class="sub">${s.country || 'Global'}</div>
            <span class="price">Cek Harga</span>
            <button class="order-btn" onclick="event.stopPropagation();autoOrder('${s.id}')">
                <i class="fas fa-bolt"></i> Order
            </button>
        </div>
    `).join('');
}

// ==========================================
// AUTO ORDER (PAKE 5SIM)
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
            showNotification(`✅ Order berhasil! Nomor: ${data.phone_number || data.phone || '...'}`);
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

// ==========================================
// AUTO CHECK OTP (PAKE 5SIM)
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
                showNotification(`🎉 OTP: ${data.otp_code} dari ${data.phone_number || ''}`);
                return;
            }
            
            if (data.success && data.status === 'FINISHED') {
                clearInterval(checkInterval);
                showNotification('✅ Order selesai');
                return;
            }
            
            if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                showNotification('⏰ Waktu habis, OTP tidak masuk');
            }
        } catch (error) { console.log('Check OTP error:', error); }
    }, 5000);
}

// ==========================================
// UPDATE UI
// ==========================================
function updateUI() {
    const balanceDisplay = document.getElementById('headerBalance');
    if (balanceDisplay) {
        fetch('/api/balance')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    balanceDisplay.innerHTML = `<i class="fas fa-coins"></i> <span>$${data.balance || 0}</span>`;
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
        // Simpan ke backend (masih pake endpoint suggest)
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
function depositAmount(amount) { showNotification(`💳 Deposit $${amount} via QRIS`); }
function depositCustom() {
    const input = document.getElementById('customDeposit');
    const amount = parseInt(input.value);
    if (!amount || amount < 1) { showNotification('⚠️ Minimal deposit $1'); return; }
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
    if (e.clientY < 0 && !exitTriggered && !document.getElementById('authModal')?.classList.contains('show')) {
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
