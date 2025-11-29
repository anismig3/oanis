# Root Forest - موقع المنتج 🌿

موقع صفحة واحدة احترافي لمنتج **Root Forest** - مسحوق بروتين طبيعي 100%

## محتويات الملفات

```
.
├── index.html          # الملف الرئيسي الوحيد (HTML + CSS + JavaScript مضمنين)
├── README.md           # هذا الملف
└── api-example.json    # مثال على بيانات الطلب (Checkout Payload)
```

## المميزات الرئيسية

✅ **واجهة داكنة عصرية** - ألوان طبيعية أخضر/ترابية  
✅ **تصميم متجاوب** - يعمل على جوال/تابلت/ديسكتوب  
✅ **محتوى عربي كامل** - بخط RTL (من اليمين لليسار)  
✅ **سلة شراء محلية** - تحفظ البيانات في localStorage  
✅ **نموذج شراء كامل** - التحقق من البيانات وإرسالها للخادم  
✅ **حساب الشحن** - أسعار شحن مختلفة لكل ولاية جزائرية  
✅ **بدون اعتمادات خارجية** - HTML/CSS/Vanilla JavaScript فقط  
✅ **سهل النشر** - ملف واحد، جاهز للنشر على أي سيرفر  

## كيفية الاستخدام المحلي

### 1. فتح الموقع بسهولة

```bash
# على Windows - افتح PowerShell/CMD في مجلد الملف
cd C:\Users\anis\oanis
# ثم افتح الملف مباشرة في المتصفح
start index.html

# أو على Mac/Linux
open index.html

# أو ابدأ خادم محلي بسيط (اختياري لاختبار API)
# إذا كان Python مثبتاً:
python -m http.server 8000
# ثم افتح: http://localhost:8000
```

### 2. الاختبار المحلي

- ✅ أضف منتجات إلى السلة
- ✅ عدّل الكميات (+ و -)
- ✅ احذف عناصر من السلة
- ✅ اختر ولاية لحساب الشحن
- ✅ اضغط "اشترِ الآن" لملء النموذج
- ✅ سيشاهد رسالة في Console (F12 > Console) تظهر بيانات الطلب

## تخصيص الموقع

### تغيير سعر المنتج

افتح `index.html` وابحث عن:

```javascript
// ** تحذير: غيّر هذه القيمة لتعديل سعر المنتج **
const PRODUCT_PRICE = 1200; // السعر بالدينار الجزائري (دج)
```

غيّر القيمة `1200` إلى السعر المطلوب.

### تغيير أسعار الشحن

ابحث عن جدول `SHIPPING_COSTS` في الكود:

```javascript
const SHIPPING_COSTS = {
    'algiers': 500,      // الجزائر: 500 دج
    'adrar': 1200,       // أدرار: 1200 دج
    // ... إضافة المزيد
};
```

عدّل القيم حسب احتياجاتك.

### تغيير الألوان

ابحث عن متغيرات الألوان في قسم CSS:

```css
:root {
    --primary-green: #2d5016;      /* اللون الأساسي */
    --secondary-green: #4a7c2c;    /* اللون الثانوي */
    /* ... إضافة المزيد */
}
```

غيّر قيم HEX للألوان حسب ذوقك.

## إعداد API الخادم (Backend)

### 1. نقطة النهاية المطلوبة

الموقع سيرسل طلب POST إلى:

```
POST /api/checkout
Content-Type: application/json
```

### 2. مثال على Payload (البيانات المرسلة)

```json
{
  "customer": {
    "fullName": "محمد علي",
    "email": "muhammad@example.com",
    "address": "شارع النيل، 123، الجزائر العاصمة",
    "wilaya": "algiers"
  },
  "items": [
    {
      "id": "root-forest",
      "name": "Root Forest مسحوق بروتين",
      "price": 1200,
      "quantity": 2
    }
  ],
  "pricing": {
    "subtotal": 2400,
    "shipping": 500,
    "total": 2900
  },
  "currency": "DZD",
  "timestamp": "2025-11-28T10:30:00.000Z"
}
```

### 3. تغيير عنوان API

افتح `index.html` وابحث عن:

```javascript
const API_ENDPOINT = '/api/checkout'; // ** عدّل هذا العنوان **
```

غيّره إلى عنوان الخادم الفعلي:

```javascript
const API_ENDPOINT = 'https://yourserver.com/api/checkout';
// أو للاختبار المحلي:
const API_ENDPOINT = 'http://localhost:3000/api/checkout';
```

### 4. مثال سريع لـ API بـ Node.js/Express

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// تفعيل CORS (مهم إذا كان الموقع على نطاق مختلف)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.post('/api/checkout', (req, res) => {
    const orderData = req.body;
    console.log('✅ طلب جديد:', orderData);
    
    // احفظ الطلب في قاعدة البيانات
    // أرسل بريد تأكيد للعميل
    // إلخ...
    
    res.json({
        success: true,
        orderId: `ORD-${Date.now()}`,
        message: 'تم استلام طلبك بنجاح'
    });
});

app.listen(3000, () => {
    console.log('🚀 الخادم يعمل على: http://localhost:3000');
});
```

## نشر على VPS (Linux Nginx)

### خطوات النشر السريعة:

#### 1. انسخ الملفات إلى الخادم

```bash
# من جهازك المحلي
scp index.html user@your-server.com:/var/www/html/

# أو استخدم SFTP
```

#### 2. إعداد Nginx

اعدّل ملف الإعدادات: `/etc/nginx/sites-available/default`

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # إذا كان لديك API على خادم آخر
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 3. أعد تشغيل Nginx

```bash
sudo systemctl restart nginx
```

#### 4. إضافة SSL (اختياري لكن مهم)

```bash
# استخدم Certbot لـ Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### إعداد Systemd Service لـ API (Node.js)

إنشئ ملف الخدمة: `/etc/systemd/system/root-forest-api.service`

```ini
[Unit]
Description=Root Forest API Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/root-forest-api
ExecStart=/usr/bin/node /var/www/root-forest-api/server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

تفعيل الخدمة:

```bash
sudo systemctl daemon-reload
sudo systemctl enable root-forest-api
sudo systemctl start root-forest-api
```

## معالجة الأخطاء الشائعة

### ❌ خطأ CORS

**المشكلة:** عند الإرسال للخادم يظهر خطأ CORS

**الحل:** أضف رؤوس CORS في الخادم:

```javascript
res.header('Access-Control-Allow-Origin', '*');
res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
res.header('Access-Control-Allow-Headers', 'Content-Type');
```

### ❌ localStorage لا يعمل

**المشكلة:** السلة لا تحفظ البيانات

**الحل:** قد تكون في وضع الخصوصية. جرّب في المتصفح العادي.

### ❌ الصور لا تظهر

**المشكلة:** أيقونات SVG أو صور لا تظهر

**الحل:** جميع الرسومات مضمنة في الملف. إذا لم تظهر، تحقق من وحدة التحكم (Console).

## ملاحظات تقنية مهمة

### المتغيرات الرئيسية للتخصيص

| المتغير | الموقع | القيمة الحالية | الوصف |
|---------|--------|-----------------|--------|
| `PRODUCT_PRICE` | سطر 320 | 1200 | سعر المنتج |
| `PRODUCT_NAME` | سطر 321 | Root Forest مسحوق بروتين | اسم المنتج |
| `SHIPPING_COSTS` | سطر 326+ | مختلفة | أسعار الشحن |
| `API_ENDPOINT` | سطر 572 | /api/checkout | عنوان API |

### localStorage

- **مفتاح التخزين:** `rootForestCart`
- **الشكل:** JSON تسلسلي لمصفوفة السلة
- **المسح:** `localStorage.removeItem('rootForestCart')`

## دعم العملات والولايات

### العملة
- **الرسمية:** دينار جزائري (دج - DZD)
- **موضوع في كل جزء من الموقع**

### الولايات المدعومة
جميع 58 ولاية جزائرية مدعومة (مدرجة في القوائم المنسدلة)

## التوافقية

- ✅ Chrome/Chromium (آخر إصدار)
- ✅ Firefox (آخر إصدار)
- ✅ Safari (آخر إصدار)
- ✅ Edge (آخر إصدار)
- ✅ Mobile browsers

## الترخيص والاستخدام

هذا الملف متاح للاستخدام الحر لأغراض تجارية وشخصية.

## الدعم والمساعدة

### مشاكل شائعة؟

1. افتح وحدة التحكم (F12 > Console)
2. ابحث عن الأخطاء
3. تحقق من الرسائل في Console (يتم طباعة الكثير من المعلومات)

### معلومات تصحيح الأخطاء

الموقع يطبع الكثير من رسائل `console.log()` لمساعدتك على فهم ما يحدث:

```javascript
console.log('✅ تم تحميل الموقع - السلة محملة من localStorage');
console.log('📦 بيانات الطلب (Checkout Payload):', ...);
console.log('✅ نجح الطلب:', ...);
console.log('❌ خطأ في الإرسال:', ...);
```

---

**آخر تحديث:** 2025-11-28  
**الإصدار:** 1.0  
**الحالة:** جاهز للنشر ✅

