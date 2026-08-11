// ==========================================
// STATE
// ==========================================
let currentCategory = 'all';
let allServices = [];
let allCountries = [];
let currentSlide = 0;
let slideInterval;
let selectedCountry = 'indonesia';
let selectedService = 'whatsapp';

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
// LOADING
// ==========================================
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loading').classList.add('hide');
    }, 1000);
    loadCountries();
    loadServices();
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
        document.querySelector('#emptyState h3').textContent = '📋 Riwayat Order';
        document.querySelector('#emptyState p').textContent = 'Belum ada order. Mulai beli nomor sekarang!';
        document.querySelector('#emptyState .btn').style.display = 'none';
    }
}

function openProfile() {
    fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                document.querySelector('.main-content').style.display = 'block';
                document.getElementById('servicesGrid').style.display = 'none';
                document.getElementById('emptyState').style.display = 'block';
                document.querySelector('#emptyState h3').textContent = '👤 Profile';
                document.querySelector('#emptyState p').innerHTML = `
                    Saldo: $${data.data.balance || 0}<br>
                    Email: ${data.data.email || '-'}<br>
                    Username: ${data.data.username || '-'}
                `;
                document.querySelector('#emptyState .btn').style.display = 'none';
            }
        })
        .catch(() => {
            showNotification('❌ Gagal ambil profile');
        });
}

// ==========================================
// LOAD COUNTRIES
// ==========================================
async function loadCountries() {
    try {
        const res = await fetch('/api/countries');
        const data = await res.json();
        if (data.success) {
            allCountries = Object.keys(data.data || {});
            populateCountryDropdown();
        }
    } catch (e) {
        console.log('Error loading countries:', e);
    }
}

function populateCountryDropdown() {
    const select = document.getElementById('countrySelect');
    if (!select) return;
    select.innerHTML = allCountries.map(c => 
        `<option value="${c}">${c.toUpperCase()}</option>`
    ).join('');
}

// ==========================================
// LOAD SERVICES (PRODUK)
// ==========================================
async function loadServices() {
    try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (data.success) {
            allServices = Object.keys(data.data || {});
            renderServices();
        }
    } catch (e) {
        console.log('Error loading services:', e);
    }
}

// ==========================================
// RENDER SERVICES
// ==========================================
function renderServices() {
    const grid = document.getElementById('servicesGrid');
    if (!grid) return;

    if (!allServices.length) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:#445566;">
                <i class="fas fa-spinner fa-spin" style="font-size:36px;display:block;margin-bottom:12px;color:#0088FF;"></i>
                <p>Memuat layanan...</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = allServices.map(service => `
        <div class="service-card" onclick="buyNumber('${service}')">
            <div class="icon">
                <i class="fas fa-mobile-alt" style="font-size:28px;color:#0088FF;"></i>
            </div>
            <h3>${service.toUpperCase()}</h3>
            <div class="sub">${selectedCountry.toUpperCase()}</div>
            <span class="price">Cek Harga</span>
            <button class="order-btn" onclick="event.stopPropagation();buyNumber('${service}')">
                <i class="fas fa-shopping-cart"></i> Beli
            </button>
        </div>
    `).join('');
}

// ==========================================
// BUY NUMBER
// ==========================================
async function buyNumber(service) {
    const country = document.getElementById('countrySelect')?.value || 'indonesia';
    const operator = document.getElementById('operatorSelect')?.value || 'any';
    
    const btn = event?.target?.closest?.('.order-btn') || document.querySelector('.order-btn');
    if (btn) { btn.textContent = '⏳...'; btn.disabled = true; }

    try {
        const res = await fetch('/api/buy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country, operator, service })
        });
        const data = await res.json();

        if (data.success) {
            const order = data.data;
            showNotification(`✅ Nomor: ${order.phone} (${order.country})`);
            document.getElementById('orderId').value = order.id;
            document.getElementById('orderNumber').textContent = order.phone;
            document.getElementById('orderStatus').textContent = 'Menunggu OTP...';
            document.getElementById('orderModal').classList.add('show');
            
            // Auto check OTP
            autoCheckOTP(order.id);
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

    const checkInterval = setInterval(async () => {
        attempts++;
        try {
            const res = await fetch(`/api/check/${orderId}`);
            const data = await res.json();
            
            if (data.success) {
                const status = data.data.status;
                document.getElementById('orderStatus').textContent = status;
                
                if (status === 'RECEIVED' || status === 'FINISHED') {
                    clearInterval(checkInterval);
                    const code = data.data.code || data.data.sms?.code || '???';
                    document.getElementById('orderCode').textContent = code;
                    showNotification(`🎉 OTP: ${code}`);
                }
            }
            if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                document.getElementById('orderStatus').textContent = '⏰ Waktu habis';
            }
        } catch (error) {
            console.log('Check error:', error);
        }
    }, 5000);
}

// ==========================================
// CANCEL ORDER
// ==========================================
async function cancelOrder() {
    const id = document.getElementById('orderId').value;
    if (!id) return;
    
    try {
        const res = await fetch(`/api/cancel/${id}`, { method: 'POST' });
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
        const res = await fetch(`/api/finish/${id}`, { method: 'POST' });
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
// UPDATE UI
// ==========================================
function updateUI() {
    const balanceDisplay = document.getElementById('headerBalance');
    if (balanceDisplay) {
        // Ambil saldo dari API
        fetch('/api/profile')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    balanceDisplay.innerHTML = `<i class="fas fa-coins"></i> <span>$${data.data.balance || 0}</span>`;
                }
            })
            .catch(() => {});
    }
}
updateUI();
setInterval(updateUI, 30000);

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
        // Simpan ke database lokal atau kirim email
        showNotification('✅ Saran berhasil dikirim! Terima kasih 🙏');
        closeSuggestModal();
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
