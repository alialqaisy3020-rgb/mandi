// --- البيانات ---
const menuData = [
    { id: 1, name: 'برجر عراقي خاص', description: 'لحم كباب عراقي متبل.', price: 15000, category: 'مشويات', image: 'burger.jpg' },
    { id: 2, name: 'تكة لحم غنم', description: 'تكة لحم طازج مشوي.', price: 20000, category: 'مشويات', image: 'tikka.jpg' },
    { id: 3, name: 'سلطة جرجير', description: 'جرجير ورمان ودبس.', price: 8000, category: 'سلطات', image: 'salad.jpg' },
    { id: 4, name: 'كنافة بالجبن', description: 'كنافة هشة ومقرمشة.', price: 12000, category: 'حلويات', image: 'kunafa.jpg' },
    { id: 5, name: 'كباب دجاج', description: 'أسياخ كباب دجاج متبلة.', price: 14000, category: 'مشويات', image: 'chicken-kebab.jpg' },
    { id: 6, name: 'بيبسي', description: 'مشروب غازي بارد.', price: 1500, category: 'مشروبات', image: 'pepsi.jpg' },
    { id: 7, name: 'تبولة', description: 'بقدونس وبرغل.', price: 6000, category: 'مقبلات', image: 'tabbouleh.jpg' },
    { id: 8, name: 'حمص بطحينة', description: 'حمص وزيت زيتون.', price: 5000, category: 'مقبلات', image: 'hummus.jpg' },
    { id: 9, name: 'عرض العائلة', description: 'كيلو مشاوي مع مقبلات.', price: 65000, category: 'العروض', image: 'offer.jpg' },
    { id: 10, name: 'وجبة سريعة', description: 'برجر وبطاطا وبيبسي.', price: 18000, category: 'العروض', image: 'fast-offer.jpg' },
];

let cart = [];
let currentCategory = 'العروض';
const minPrice = 1000;
const maxPriceRaw = menuData.reduce((max, item) => Math.max(max, item.price), 0);
const maxPriceLimit = maxPriceRaw + 1000;
let currentMaxPrice = maxPriceLimit;

// --- عند تحميل الصفحة ---
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. تهيئة السلايدر
    const slider = document.getElementById('price-range-slider');
    const minPriceLabel = document.getElementById('min-price-label');

    if (slider) {
        slider.min = minPrice;
        slider.max = maxPriceLimit;
        slider.value = maxPriceLimit; 
        minPriceLabel.textContent = formatCurrency(minPrice);
        
        // تحديث أولي
        handleSliderChange(slider.value);

        // عند التحريك
        slider.addEventListener('input', (e) => {
            handleSliderChange(e.target.value);
        });
    }

    // 2. تهيئة القائمة
    renderCategories();
    renderMenu();

    // 3. ربط الأزرار
    const clearBtn = document.getElementById('clear-cart-btn');
    const checkoutBtn = document.getElementById('final-checkout-btn');
    const modalCloseBtn = document.querySelector('.close-button');
    const orderForm = document.getElementById('order-form');

    if (clearBtn) clearBtn.addEventListener('click', clearCart);
    if (checkoutBtn) checkoutBtn.addEventListener('click', openModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (orderForm) orderForm.addEventListener('submit', submitOrder);

    window.onclick = function(event) {
        const modal = document.getElementById('checkout-modal');
        if (event.target == modal) closeModal();
    }
});

// --- دوال العرض والمنطق ---

function formatCurrency(num) {
    return Number(num).toLocaleString('en-US') + ' د.ع';
}

function handleSliderChange(value) {
    currentMaxPrice = parseInt(value);
    const label = document.getElementById('current-price-label');
    const slider = document.getElementById('price-range-slider');
    
    if (label) label.textContent = formatCurrency(currentMaxPrice);
    
    // معادلة التلوين للسلايدر العربي (من اليمين لليسار)
    // التدرج اللوني "to left" يعني أن اللون الأول يبدأ من اليمين
    const percentage = ((currentMaxPrice - minPrice) / (maxPriceLimit - minPrice)) * 100;
    
    // الأزرق يبدأ من اليمين (0%) ويمتد حتى النسبة الحالية
    slider.style.background = `linear-gradient(to left, var(--slider-fill-color) ${percentage}%, var(--slider-track-color) ${percentage}%)`;

    renderMenu();
}

function renderCategories() {
    const cats = ['الكل', 'مقبلات', 'مشويات', 'سلطات', 'مشروبات', 'حلويات', 'العروض'];
    const container = document.getElementById('category-bar');
    container.innerHTML = '';

    cats.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `category-btn ${cat === currentCategory ? 'active' : ''}`;
        btn.textContent = cat;
        btn.onclick = () => {
            currentCategory = cat;
            renderCategories(); 
            renderMenu();
        };
        container.appendChild(btn);
    });
}

function renderMenu() {
    const container = document.getElementById('menu-container');
    container.innerHTML = '';

    let items = menuData;
    if (currentCategory !== 'الكل') {
        items = items.filter(i => i.category === currentCategory);
    }
    items = items.filter(i => i.price <= currentMaxPrice);

    if (items.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 20px;">لا توجد عناصر مطابقة.</p>';
        return;
    }

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.innerHTML = `
            <span class="item-category-tag">${item.category}</span>
            <img src="images/${item.image}" class="item-image" alt="${item.name}">
            <div class="item-details">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <span class="item-price">${formatCurrency(item.price)}</span>
                <button class="add-to-cart-btn" onclick="addToCart(${item.id})">
                    <i class="fas fa-cart-plus"></i> أضف للسلة
                </button>
            </div>
        `;
        container.appendChild(div);
    });
}

// --- دوال السلة ---

function addToCart(id) {
    const item = menuData.find(i => i.id === id);
    const existing = cart.find(i => i.id === id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    updateCartUI();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    updateCartUI();
}

function changeQty(id, change) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) removeFromCart(id);
        else updateCartUI();
    }
}

function clearCart() {
    cart = [];
    updateCartUI();
}

function updateCartUI() {
    const list = document.getElementById('cart-list');
    const subSpan = document.getElementById('subtotal');
    // const taxSpan = document.getElementById('tax'); // تم حذف الضريبة
    const totalSpan = document.getElementById('total');
    
    list.innerHTML = '';
    
    if (cart.length === 0) {
        list.innerHTML = '<li class="empty-message">العربة فارغة.</li>';
        subSpan.textContent = '0';
        totalSpan.textContent = '0';
        return;
    }

    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
            <div>
                <h4>${item.name}</h4>
                <small>${formatCurrency(item.price)}</small>
            </div>
            <div class="quantity-controls">
                <button onclick="changeQty(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="changeQty(${item.id}, 1)">+</button>
                <button style="background:#d32f2f; color:white" onclick="removeFromCart(${item.id})">x</button>
            </div>
        `;
        list.appendChild(li);
    });

    // لا توجد ضريبة
    const total = subtotal;

    subSpan.textContent = formatCurrency(subtotal);
    // taxSpan.textContent = formatCurrency(tax);
    totalSpan.textContent = formatCurrency(total);
}

// --- دوال النافذة (Modal) والنموذج ---

function openModal() {
    if (cart.length === 0) {
        alert("السلة فارغة!");
        return;
    }
    toggleFormFields();
    document.getElementById('checkout-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('checkout-modal').style.display = 'none';
}

window.toggleFormFields = function() {
    const method = document.getElementById('delivery-method').value;
    const contactGroup = document.getElementById('contact-group');
    const addressGroup = document.getElementById('address-group');
    const tableGroup = document.getElementById('table-group');

    // الافتراضي (الاسم والهاتف ظاهران)
    contactGroup.style.display = 'block';
    addressGroup.style.display = 'none';
    tableGroup.style.display = 'none';

    if (method === 'delivery') {
        addressGroup.style.display = 'block'; 
    } else if (method === 'table') {
        contactGroup.style.display = 'none'; 
        tableGroup.style.display = 'block'; 
    } else if (method === 'pickup') {
        // يبقى الاسم والهاتف ظاهرين فقط
    }
}

// **********************************************
// دالة مساعدة جديدة: للحصول على الموقع الجغرافي
// **********************************************
function getGeolocation() {
    return new Promise((resolve, reject) => {
        // التحقق مما إذا كان المتصفح يدعم خاصية الموقع الجغرافي
        if (!navigator.geolocation) {
            // حل مؤقت إذا لم يتم الدعم أو إذا كان المستخدم لا يريد مشاركة الموقع
            resolve("الموقع غير متوفر / تم رفض المشاركة");
            return;
        }

        // طلب الموقع من المتصفح (المستخدم سيرى نافذة تطلب الإذن)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                // إرجاع رابط مباشر للموقع
                resolve(`الموقع: https://www.google.com/maps?q=${lat},${lon}`);
            },
            (error) => {
                // التعامل مع الأخطاء (مثل رفض المستخدم)
                console.error("Geolocation Error:", error.code, error.message);
                resolve("الموقع: تم رفض مشاركة الموقع من قبل المستخدم.");
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    });
}


// **********************************************
// دالة submitOrder المعدلة لاستقبال الموقع
// **********************************************
async function submitOrder(e) {
    e.preventDefault();
    const method = document.getElementById('delivery-method').value;
    
    let isValid = true;
    let errorMsg = "";

    // 1. منطق التحقق من صحة الحقول (Validation Logic) - (يبقى كما هو)
    if (method === 'pickup' || method === 'delivery') {
        const name = document.getElementById('customer-name').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        if (!name || !phone) {
            isValid = false;
            errorMsg = "يرجى ملء حقول الاسم ورقم الهاتف.";
        }
    }
    
    if (method === 'delivery' && isValid) {
        const addr = document.getElementById('delivery-address').value.trim();
        if (!addr) {
            isValid = false;
            errorMsg = "يرجى كتابة عنوان التوصيل.";
        }
    }
    
    if (method === 'table') {
        const tbl = document.getElementById('table-number').value.trim();
        if (!tbl) {
            isValid = false;
            errorMsg = "يرجى كتابة رقم الطاولة.";
        }
    }

    if (!isValid) {
        alert(errorMsg);
        return; 
    }
    
    // ** 2. الخطوة الجديدة والحاسمة: الحصول على الموقع الجغرافي **
    
    // إظهار تنبيه للمستخدم بأنه سيطلب الإذن
    alert("لإتمام طلب التوصيل، سيطلب المتصفح إذن مشاركة الموقع الجغرافي. يرجى الموافقة.");
    
    // الانتظار حتى يتم الحصول على الموقع أو رفضه
    const geolocationResult = await getGeolocation();


    // 3. بناء رسالة الواتساب
    
    const total = document.getElementById('total').textContent;
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();

    let message = `*طلب جديد من منيو المطعم* 🍽️\n`;
    message += `-------------------------\n`;
    message += `*نوع الطلب:* ${method === 'delivery' ? 'توصيل' : method === 'table' ? 'صالة' : 'استلام'}\n`;
    message += `*الاسم:* ${name || 'N/A'}\n`;
    message += `*الهاتف:* ${phone || 'N/A'}\n`;
    
    if (method === 'delivery') {
        const address = document.getElementById('delivery-address').value.trim();
        message += `*العنوان الكتابي:* ${address}\n`;
        // إضافة الموقع الذي تم الحصول عليه هنا
        message += `*${geolocationResult}*\n`;
    } else if (method === 'table') {
        const table = document.getElementById('table-number').value.trim();
        message += `*رقم الطاولة:* ${table}\n`;
    }
    
    message += `-------------------------\n`;
    message += `*تفاصيل الوجبات:*\n`;
    
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} (x${item.quantity}) - ${formatCurrency(item.price * item.quantity)}\n`;
    });
    
    message += `-------------------------\n`;
    message += `*المجموع الكلي المطلوب: ${total}*\n`;
    message += `شكراً لاختياركم مطعمنا!`;

    // 4. تشفير الرسالة وإنشاء الرابط وفتح الواتساب
    
    const encodedMessage = encodeURIComponent(message);
    const restaurantPhoneNumber = '9647xxxxxxxxx'; // !!! استبدل هذا الرقم !!!
    const whatsappURL = `https://wa.me/${restaurantPhoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappURL, '_blank');
    alert("تم تجهيز الطلب. سيتم فتح نافذة الواتساب، يرجى إرسال الرسالة لإكمال الطلب.");

    closeModal();
    clearCart();
}