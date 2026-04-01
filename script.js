// Wedding Invitation Script

// Escape HTML to prevent XSS attacks
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', function() {
    // Countdown Timer
    const firstDate = new Date('April 4, 2026 09:00:00').getTime();
    const secondDate = new Date('April 25, 2026 09:00:00').getTime();
    let currentTargetDate = firstDate;
    let isSecondCountdown = false;
    
    function updateCountdown() {
        const now = new Date().getTime();
        let distance = currentTargetDate - now;
        
        // If first countdown finished, switch to second date
        if (distance < 0 && !isSecondCountdown) {
            isSecondCountdown = true;
            currentTargetDate = secondDate;
            distance = currentTargetDate - now;
            
            // Update the display text to show second event
            const countdownTitle = document.querySelector('.countdown-title');
            if (countdownTitle) {
                countdownTitle.textContent = 'Đếm ngược đến ngày Thành Hôn';
            }
        }
        
        // If both countdowns finished
        if (distance < 0) {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // Gallery Lightbox
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            lightboxImg.src = img.src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Fetch wishes from Google Sheets on page load
    fetchWishesFromSheet();
    
    // Fallback: if sheet fails to load in 5 seconds, try localStorage
    setTimeout(function() {
        const wishesList = document.getElementById('wishesList');
        if (wishesList && wishesList.children.length === 0) {
            console.log('Sheet load timeout - loading from localStorage');
            loadWishes();
        }
    }, 5000);
    
    console.log('💕 Wedding Invitation Loaded Successfully!');
});

// Google Apps Script Web App URL - Replace with your deployed script URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyfPcsLV231QhNgV4zI4iMS0qZeE3xTAo_rA5kULIxYn7_PEfkgx7bRoAHpWJ27zq4b/exec';

// Lightbox Functions
function closeLightbox(event) {
    if (event.target.classList.contains('lightbox') || 
        event.target.classList.contains('lightbox-close')) {
        const lightbox = document.getElementById('lightbox');
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Send Wish Function
function sendWish() {
    const name = document.getElementById('wishName');
    const message = document.getElementById('wishMessage');
    const nameValue = name.value;
    const messageValue = message.value;
    
    if (!messageValue.trim()) {
        alert('Vui lòng nhập lờii chúc!');
        return;
    }
    
    const senderName = nameValue.trim() || 'Khách mờii';
    const currentDate = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const firstLetter = senderName.charAt(0).toUpperCase();
    
    // Clear form immediately for better UX
    name.value = '';
    message.value = '';
    
    // Add to display immediately
    addWishToDisplay(senderName, messageValue, currentDate, firstLetter);
    
    // Save to localStorage
    saveWish(senderName, messageValue, currentDate);
    
    // Send to Google Sheet (fire and forget - non-blocking)
    setTimeout(() => {
        sendToGoogleSheet(senderName, messageValue, currentDate);
    }, 0);
    
    // Show notification immediately
    showNotification('Đã gửi lờii chúc! 💕');
}

function addWishToDisplay(name, message, date, firstLetter) {
    const wishesList = document.getElementById('wishesList');
    const wishItem = document.createElement('div');
    wishItem.className = 'wish-item';
    wishItem.innerHTML = `
        <div class="wish-header">
            <div class="wish-avatar">${escapeHtml(firstLetter)}</div>
            <div class="wish-meta">
                <span class="wish-author-name">${escapeHtml(name)}</span>
                <span class="wish-date">${escapeHtml(date)}</span>
            </div>
        </div>
        <p class="wish-text">${escapeHtml(message)}</p>
    `;
    
    // Insert at the beginning (top left in masonry layout)
    wishesList.insertBefore(wishItem, wishesList.firstChild);
}

function sendToGoogleSheet(name, message, date) {
    // Create form data for Google Apps Script
    const formData = new FormData();
    formData.append('name', name);
    formData.append('message', message);
    formData.append('date', date);
    
    // Send using fetch with no-cors mode (fire and forget)
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
    }).then(() => {
        console.log('Wish sent to Google Sheet');
    }).catch((error) => {
        console.log('Google Sheet sync error:', error);
    });
}

// Refresh button handler
function refreshWishes() {
    const btn = document.querySelector('.btn-refresh');
    const originalText = btn.innerHTML;
    
    // Show loading state
    btn.innerHTML = '⏳ Đang tải...';
    btn.disabled = true;
    
    // Clear all current wishes
    const wishesList = document.getElementById('wishesList');
    if (wishesList) {
        wishesList.innerHTML = '';
    }
    
    // Clear localStorage to sync with sheet
    localStorage.removeItem('weddingWishes');
    
    // Fetch from sheet
    fetchWishesFromSheet(true);
    
    // Reset button after loading
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        showNotification('Đã cập nhật danh sách! ✨');
    }, 2000);
}

// Fetch wishes from Google Sheets using JSONP (bypasses CORS)
function fetchWishesFromSheet(isRefresh = false) {
    console.log('Fetching wishes from sheet...');
    
    const callbackName = 'wishCallback_' + Date.now();
    const scriptUrl = GOOGLE_SCRIPT_URL + '?action=get&callback=' + callbackName;
    
    console.log('JSONP URL:', scriptUrl);
    
    // Create global callback function
    window[callbackName] = function(data) {
        console.log('JSONP callback received:', data);
        if (data && data.result === 'success' && data.wishes) {
            console.log('Wishes count:', data.wishes.length);
            displaySheetWishes(data.wishes);
        } else {
            console.log('No wishes data or error:', data);
        }
        // Clean up
        delete window[callbackName];
        const script = document.getElementById('jsonp_' + callbackName);
        if (script) script.remove();
    };
    
    // Create script tag for JSONP
    const script = document.createElement('script');
    script.id = 'jsonp_' + callbackName;
    script.src = scriptUrl;
    script.onerror = function() {
        console.error('Failed to load script from:', scriptUrl);
        delete window[callbackName];
        script.remove();
    };
    
    // Add to document
    document.head.appendChild(script);
    console.log('Script tag added to head');
    
    // Timeout cleanup
    setTimeout(function() {
        if (window[callbackName]) {
            console.log('JSONP timeout - no response received');
            delete window[callbackName];
            const script = document.getElementById('jsonp_' + callbackName);
            if (script) script.remove();
        }
    }, 10000);
}

// Format date to dd/MM/yyyy in UTC+7
function formatDateVN(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Display wishes from Google Sheets
function displaySheetWishes(wishes) {
    const wishesList = document.getElementById('wishesList');
    if (!wishesList) return;
    
    // Clear existing wishes first
    wishesList.innerHTML = '';
    
    // Also clear and rebuild localStorage
    const localWishes = [];
    
    // Add all wishes from sheet (in reverse order to show newest first)
    const reversedWishes = [...wishes].reverse();
    
    reversedWishes.forEach(wish => {
        const firstLetter = wish.name.charAt(0).toUpperCase();
        const formattedDate = formatDateVN(wish.date);
        const wishItem = document.createElement('div');
        wishItem.className = 'wish-item';
        wishItem.innerHTML = `
            <div class="wish-header">
                <div class="wish-avatar">${escapeHtml(firstLetter)}</div>
                <div class="wish-meta">
                    <span class="wish-author-name">${escapeHtml(wish.name)}</span>
                    <span class="wish-date">${escapeHtml(formattedDate)}</span>
                </div>
            </div>
            <p class="wish-text">${escapeHtml(wish.message)}</p>
        `;
        wishesList.appendChild(wishItem);
        
        // Save to localStorage array
        localWishes.push({
            name: wish.name,
            message: wish.message,
            date: formattedDate
        });
    });
    
    // Update localStorage with sheet data
    localStorage.setItem('weddingWishes', JSON.stringify(localWishes));
}

// Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--primary);
        color: white;
        padding: 15px 30px;
        border-radius: 25px;
        z-index: 10001;
        animation: slideDown 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Save wish to localStorage
function saveWish(name, message, date) {
    const savedWishes = localStorage.getItem('weddingWishes');
    const wishes = savedWishes ? JSON.parse(savedWishes) : [];
    
    wishes.unshift({
        name: name,
        message: message,
        date: date
    });
    
    localStorage.setItem('weddingWishes', JSON.stringify(wishes));
}

// Load wishes from localStorage
function loadWishes() {
    const wishesList = document.getElementById('wishesList');
    if (!wishesList) return;
    
    const savedWishes = localStorage.getItem('weddingWishes');
    
    if (savedWishes) {
        const wishes = JSON.parse(savedWishes);
        wishes.forEach(wish => {
            const firstLetter = wish.name.charAt(0).toUpperCase();
            const wishItem = document.createElement('div');
            wishItem.className = 'wish-item';
            wishItem.innerHTML = `
                <div class="wish-header">
                    <div class="wish-avatar">${escapeHtml(firstLetter)}</div>
                    <div class="wish-meta">
                        <span class="wish-author-name">${escapeHtml(wish.name)}</span>
                        <span class="wish-date">${escapeHtml(wish.date)}</span>
                    </div>
                </div>
                <p class="wish-text">${escapeHtml(wish.message)}</p>
            `;
            wishesList.appendChild(wishItem);
        });
    }
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
