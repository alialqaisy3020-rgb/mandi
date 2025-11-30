// **********************************************
// دالة تحديد الموقع الجغرافي (Geolocation)
// **********************************************
function getGeolocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            resolve("الموقع غير متوفر / المتصفح لا يدعم");
            return;
        }

        // تحديد إعدادات الطلب (لجعلها دقيقة وسريعة)
        const options = {
            enableHighAccuracy: true,
            timeout: 15000, // مهلة 15 ثانية
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                // رابط خرائط جوجل الدقيق (تعديل بسيط لضمان الفتح)
                const mapLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
                resolve(`رابط الموقع الجغرافي: ${mapLink}`);
            },
            (error) => {
                console.error("Geolocation Error:", error.code, error.message);
                // إرجاع رسالة خطأ واضحة بدلاً من رفض الـ Promise
                resolve(`تعذر تحديد الموقع تلقائياً (رمز الخطأ: ${error.code}). يرجى التأكد من تشغيل GPS والسماح للمتصفح بالوصول للموقع.`);
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
    
    // 2. الحصول على الموقع الجغرافي (فقط في حالة الدليفري)
    let locationResult = "";
    if (method === 'delivery') {
        // إشعار المستخدم قبل طلب الإذن
        alert("انتباه: سيطلب المتصفح إذن تحديد موقعك الآن. يرجى الموافقة لإرسال الموقع الدقيق للتوصيل.");
        locationResult = await getGeolocation();
    }
    
    // 3. تجهيز رسالة الواتساب
    const total = document.getElementById('total').textContent;

    let message = `*طلب جديد من الموقع* 🍽️\n`;
    message += `-------------------------\n`;
    message += `*نوع الطلب:* ${method === 'delivery' ? '🛵 توصيل (Delivery)' : method === 'table' ? '🍽️ داخل الصالة' : '🛍️ استلام (سفري)'}\n`;
    
    if (method !== 'table') {
        message += `*الاسم:* ${name}\n`;
        message += `*الهاتف:* ${phone}\n`;
    }
    
    if (method === 'delivery') {
        const address = document.getElementById('delivery-address').value.trim();
        message += `*العنوان الكتابي:* ${address}\n`;
        message += `*الموقع الجغرافي:* ${locationResult}\n`; // إضافة النتيجة هنا
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
    message += `شكراً لاختياركم مطعمنا!`;
    
    // 4. فتح الواتساب وإشعار المستخدم
    const restaurantPhoneNumber = '9647830103053'; // تأكد من تغيير هذا الرقم
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${restaurantPhoneNumber}?text=${encodedMessage}`;
    
    // رسالة تأكيد قبل الفتح
    alert("✅ اكتمل تجهيز الطلب. سيتم الآن فتح تطبيق الواتساب لإرسال رسالة إلى المطعم. يرجى الضغط على زر الإرسال في الواتساب.");
    
    window.open(whatsappURL, '_blank');
    
    // تنظيف السلة وإغلاق النافذة
    setTimeout(() => {
        closeModal();
        clearCart();
    }, 1000); // تأخير بسيط لضمان فتح الواتساب أولاً
}
