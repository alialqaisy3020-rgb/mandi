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
        
        handleSliderChange(slider.value);

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
    
    // استدعاء دالة الإرسال المتطورة عند الضغط على زر الإرسال
    if (orderForm) orderForm.addEventListener('submit', submitOrder);

    // إغلاق النافذة عند الضغط خارجها
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
    
    // تلوين السلايدر
    const percentage = ((currentMaxPrice - minPrice) / (maxPriceLimit - minPrice)) * 100;
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

    const total = subtotal;
    subSpan.textContent = formatCurrency(subtotal);
    totalSpan.textContent = formatCurrency(total);
}

// --- دوال النافذة (Modal) وإدارة الحقول ---

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

// دالة عالمية للتبديل بين الحقول بناء على نوع الطلب
window.toggleFormFields = function() {
    const method = document.getElementById('delivery-method').value;
    const contactGroup = document.getElementById('contact-group');
    const addressGroup = document.getElementById('address-group');
    const tableGroup = document.getElementById('table-group');

    // إظهار/إخفاء الحقول حسب الاختيار
    contactGroup.style.display = 'block'; 
    addressGroup.style.display = 'none';
    tableGroup.style.display = 'none';

    if (method === 'delivery') {
        addressGroup.style.display = 'block'; 
    } else if (method === 'table') {
        contactGroup.style.display = 'none'; 
        tableGroup.style.display = 'block'; 
    }
}

// **********************************************
// دالة تحديد الموقع الجغرافي (Geolocation)
// **********************************************
function getGeolocation() {
    return new Promise((resolve, reject) => {
        // التحقق من دعم المتصفح
        if (!navigator.geolocation) {
            reject("المتصفح لا يدعم تحديد الموقع.");
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000, 
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                // رابط خرائط جوجل الصحيح
                const mapLink = `https://www.google.com/maps?q=${lat},${lon}`;
                resolve(mapLink);
            },
            (error) => {
                // في حالة الخطأ، نرجع رفض (Reject) ليتم التقاطه في دالة الإرسال
                reject(error);
            },
            options
        );
    });
}


// **********************************************
// دالة إرسال الطلب (Submit Order) مع الواتساب
// **********************************************
async function submitOrder(e) {
    e.preventDefault();
    const method = document.getElementById('delivery-method').value;
    
    // 1. التحقق من صحة البيانات (Validation)
    let isValid = true;
    let errorMsg = "";

    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    
    if (method !== 'table' && (!name || !phone)) {
        isValid = false;
        errorMsg = "يرجى ملء حقول الاسم ورقم الهاتف.";
    }

    if (method === 'delivery' && isValid) {
        const addr = document.getElementById('delivery-address').value.trim();
        if (!addr) {
            isValid = false;
            errorMsg = "يرجى كتابة عنوان التوصيل (اسم المنطقة).";
        }
    }
    
    if (!isValid) {
        alert(errorMsg);
        return; 
    }
    
    // 2. معالجة الموقع الجغرافي (شرط صارم للدليفري)
    let locationResult = "";
    
    if (method === 'delivery') {
        // تنبيه المستخدم قبل محاولة جلب الموقع (لضمان الفهم)
        alert("تنبيه: سيتم الآن طلب تحديد موقعك الحالي لإرفاقه بالطلب. يرجى الضغط على 'سماح' (Allow) عند ظهور النافذة.");
        
        try {
            // محاولة جلب الموقع
            locationResult = await getGeolocation();
        } catch (error) {
            // إذا فشل (رفض المستخدم أو الـ GPS مغلق)
            console.error("Geolocation Error:", error);
            alert("⚠️ عذراً، لا يمكن إرسال طلب التوصيل بدون موقع جغرافي.\n\nيرجى تفعيل الـ GPS في هاتفك والموافقة على صلاحية الموقع، ثم حاول الإرسال مرة أخرى.");
            return; // إيقاف الدالة فوراً وعدم فتح الواتساب
        }
    }
    
    // 3. توليد رقم طلب فريد (أرقام فقط ومتسلسل زمنياً)
    // الصيغة: السنة الشهر اليوم الساعة الدقيقة الثانية (مثال: 20231025143005)
    const date = new Date();
    const orderID = date.getFullYear().toString() +
                    (date.getMonth() + 1).toString().padStart(2, '0') +
                    date.getDate().toString().padStart(2, '0') +
                    date.getHours().toString().padStart(2, '0') +
                    date.getMinutes().toString().padStart(2, '0') +
                    date.getSeconds().toString().padStart(2, '0');

    // 4. تجهيز رسالة الواتساب
    const total = document.getElementById('total').textContent;

    let message = `*طلب جديد من الموقع* 🍽️\n`;
    message += `*رقم الطلب:* ${orderID}\n`; // الرقم التسلسلي (أرقام فقط)
    message += `-------------------------\n`;
    message += `*نوع الطلب:* ${method === 'delivery' ? '🛵 توصيل (Delivery)' : method === 'table' ? '🍽️ داخل الصالة' : '🛍️ استلام (سفري)'}\n`;
    
    if (method !== 'table') {
        message += `*الاسم:* ${name}\n`;
        message += `*الهاتف:* ${phone}\n`;
    }
    
    if (method === 'delivery') {
        const address = document.getElementById('delivery-address').value.trim();
        message += `*العنوان الكتابي:* ${address}\n`;
        // هنا نضمن أن الرابط موجود لأننا أوقفنا الدالة في حالة الخطأ
        message += `*رابط الموقع:* ${locationResult}\n`;
    } else if (method === 'table') {
        const table = document.getElementById('table-number').value.trim();
        message += `*رقم الطاولة:* ${table}\n`;
    }
    
    message += `-------------------------\n`;
    message += `*الطلبات:*\n`;
    
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} (x${item.quantity}) - ${formatCurrency(item.price * item.quantity)}\n`;
    });
    
    message += `-------------------------\n`;
    message += `*المجموع الكلي المطلوب: ${total}*\n`;
    
    // 5. فتح الواتساب (طريقة متوافقة مع الموبايل)
    const restaurantPhoneNumber = '9647830103053'; // ضع رقم المطعم هنا
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${restaurantPhoneNumber}?text=${encodedMessage}`;
    
    // استخدام location.href
    window.location.href = whatsappURL;
    
    // تنظيف السلة 
    setTimeout(() => {
        closeModal();
        clearCart();
    }, 2000); 
}
