# 🗄️ Database Testing & Troubleshooting Guide

## 📋 نظرة عامة

هذا الدليل يشرح كيفية اختبار قاعدة البيانات والتأكد من حفظ الطلبات بشكل صحيح على جميع الأجهزة.

---

## 🔍 المشكلة السابقة

**المشكلة**: الطلبات لم تُحفظ في قاعدة البيانات بشكل صحيح.

**السبب**: مشاكل في معالجة الـ callbacks و SQLITE_BUSY locking.

**الحل**: تحسين معالجة الأخطاء وإضافة retry logic.

---

## ✅ التحسينات المطبقة

### 1️⃣ تحسين معالجة الـ Callbacks
```javascript
// قبل: استخدام this.lastID
dbRunWithRetry(query, values, function(err) {
    res.json({ id: this.lastID }); // قد يكون undefined
});

// بعد: تمرير lastID كمعامل
dbRunWithRetry(query, values, (err, lastID) => {
    res.json({ id: lastID }); // صحيح دائماً
});
```

### 2️⃣ إضافة Logging تفصيلي
```javascript
console.log('📦 تم استقبال طلب جديد');
console.log('👤 العميل:', customer?.fullName);
console.log('📍 الموقع:', customer?.wilaya);
console.log('💾 محاولة حفظ الطلب في قاعدة البيانات...');
console.log(`✅ طلب جديد محفوظ: ${orderId}`);
```

### 3️⃣ التحقق من البيانات الكاملة
```javascript
// التحقق من وجود جميع الحقول المطلوبة
if (!customer.fullName || !customer.phone || 
    !customer.wilaya || !customer.municipality) {
    console.error('❌ بيانات العميل غير صحيحة');
    return res.status(400).json({ error: 'بيانات غير صحيحة' });
}
```

### 4️⃣ إضافة Endpoint للإحصائيات
```javascript
// جديد: GET /api/stats/customers
GET /api/stats/customers
→ يعيد:
  {
    "total_customers": 5,
    "total_orders": 12,
    "total_revenue": 45000,
    "customer_names": ["أحمد", "محمد", "علي", ...]
  }
```

---

## 🧪 أدوات الاختبار

### أداة 1: Test Script (Node.js)

**الملف**: `test-api.js`

**الاستخدام**:
```bash
# 1. تأكد من أن السيرفر يعمل
npm start

# 2. في terminal جديد
node test-api.js
```

**الخطوات**:
1. ✅ فحص صحة الخادم
2. ✅ جلب الطلبات الحالية
3. ✅ إرسال طلب اختبار جديد
4. ✅ جلب الطلبات بعد الإضافة
5. ✅ عرض إحصائيات العملاء

**المخرجات**:
```
🧪 اختبار قاعدة البيانات - Root Forest

1️⃣  فحص صحة الخادم...
✅ الخادم يعمل

2️⃣  جلب الطلبات الحالية...
✅ عدد الطلبات: 5

3️⃣  إرسال طلب اختبار جديد...
✅ تم حفظ الطلب بنجاح: ORD-1732891234567

4️⃣  جلب الطلبات بعد الإضافة...
✅ عدد الطلبات: 6

5️⃣  جلب إحصائيات العملاء...
✅ الإحصائيات:
   • عدد العملاء المميزين: 5
   • إجمالي الطلبات: 6
   • إجمالي الإيرادات: 48200 دج
```

---

### أداة 2: Test Dashboard (HTML)

**الملف**: `test-database.html`

**الاستخدام**:
1. افتح الملف في المتصفح: `file:///c:/Users/anis/oanis/test-database.html`
2. اضغط على الأزرار المختلفة للاختبار

**الأزرار المتاحة**:
- 📦 **إرسال طلب اختبار**: أرسل طلب جديد
- 👥 **عرض جميع العملاء**: جلب قائمة العملاء
- 📋 **عرض جميع الطلبات**: جلب الطلبات
- 💚 **فحص صحة الخادم**: اختبر اتصال الخادم
- 🔄 **تحديث الإحصائيات**: حدّث الإحصائيات

---

## 📊 الـ API Endpoints

### جديد: الإحصائيات

```
GET /api/stats/customers
```

**الرد**:
```json
{
  "success": true,
  "statistics": {
    "total_customers": 5,
    "total_orders": 12,
    "total_revenue": 45000,
    "customer_names": ["أحمد علي", "محمد حسن", "علي خالد"]
  }
}
```

### موجود: إنشاء طلب

```
POST /api/orders
```

**البيانات**:
```json
{
  "customer": {
    "fullName": "أحمد محمد",
    "phone": "0781234567",
    "address": "شارع النيل 5",
    "wilaya": "الجزائر",
    "municipality": "الجزائر الوسطى"
  },
  "items": [{"name": "Root Forest", "price": 3000, "quantity": 1}],
  "pricing": {
    "subtotal": 3000,
    "shipping": 200,
    "total": 3200
  }
}
```

**الرد**:
```json
{
  "success": true,
  "message": "✅ تم حفظ الطلب بنجاح",
  "orderId": "ORD-1732891234567",
  "data": {
    "id": 1,
    "order_id": "ORD-1732891234567",
    "customer_name": "أحمد محمد",
    "total_price": 3200,
    "status": "جديد"
  }
}
```

---

## 🔧 استكشاف الأخطاء

### المشكلة: لا تظهر الطلبات في قاعدة البيانات

**التشخيص**:
```bash
# 1. تحقق من تشغيل السيرفر
curl http://localhost:3000/api/health

# 2. تحقق من عدد الطلبات
curl http://localhost:3000/api/orders

# 3. تحقق من الإحصائيات
curl http://localhost:3000/api/stats/customers
```

**الحل**:
```bash
# 1. أوقف السيرفر
Ctrl + C

# 2. احذف قاعدة البيانات القديمة (اختياري)
Remove-Item -Path data -Recurse -Force

# 3. أعد تشغيل السيرفر
npm start

# 4. اختبر مرة أخرى
node test-api.js
```

### المشكلة: SQLITE_BUSY error

**السبب**: قاعدة البيانات مقفولة من عملية أخرى.

**الحل**:
```bash
# 1. أوقف جميع عمليات Node
Get-Process -Name node | Stop-Process -Force

# 2. أعد تشغيل السيرفر
npm start
```

### المشكلة: البيانات لا تُرسل من الموقع

**التشخيص**:
```javascript
// افتح Console في المتصفح (F12)
// ستجد الطلب المرسل:
console.log('📦 طلب جديد:', checkoutData);
```

**التحقق**:
1. افتح `index.html` في المتصفح
2. اضغط F12 لفتح Developer Console
3. أملأ نموذج الشراء واضغط "متابعة الشراء"
4. انظر إلى Console لترى الطلب المرسل

---

## 📱 اختبار على جميع الأجهزة

### على الهاتف (iOS/Android)

**الخطوة 1**: احصل على IP الكمبيوتر
```bash
ipconfig | findstr "IPv4"
# مثال: 192.168.1.100
```

**الخطوة 2**: عدّل الـ API endpoint في `index.html`
```javascript
// غيّر من:
const API_ENDPOINT = 'http://localhost:3000/api/orders';

// إلى:
const API_ENDPOINT = 'http://192.168.1.100:3000/api/orders';
```

**الخطوة 3**: افتح الموقع على الهاتف
```
http://192.168.1.100:3000
```

**الخطوة 4**: اختبر الشراء
1. أضف منتج إلى السلة
2. اضغط "متابعة الشراء"
3. أملأ البيانات
4. اضغط "إتمام الطلب"

**التحقق**: تحقق من الطلبات على السيرفر
```bash
curl http://192.168.1.100:3000/api/stats/customers
```

---

## 📚 ملفات الاختبار

| الملف | النوع | الوصف |
|------|-------|--------|
| `test-api.js` | Node.js Script | اختبار سطر الأوامر |
| `test-database.html` | HTML Dashboard | لوحة اختبار الويب |

---

## 💾 عرض البيانات المباشر

### استخدام DB Browser

1. حمّل [DB Browser for SQLite](https://sqlitebrowser.org/)
2. افتح الملف: `data/orders.db`
3. اذهب إلى تبويب "Browse Data"
4. اختر جدول `orders`
5. ستجد جميع الطلبات المحفوظة

### استعلامات SQL مفيدة

```sql
-- جميع الطلبات
SELECT * FROM orders ORDER BY created_at DESC;

-- عدد الطلبات لكل عميل
SELECT customer_name, COUNT(*) FROM orders GROUP BY customer_name;

-- الطلبات في يوم محدد
SELECT * FROM orders WHERE DATE(created_at) = '2024-11-29';

-- الطلبات حسب الولاية
SELECT customer_wilaya, COUNT(*) FROM orders GROUP BY customer_wilaya;
```

---

## 🎯 Checklist للتحقق

- [ ] السيرفر يعمل على `localhost:3000`
- [ ] قاعدة البيانات تُنشأ في `data/orders.db`
- [ ] الطلبات تُحفظ بشكل صحيح
- [ ] جميع حقول العميل موجودة
- [ ] الإحصائيات تُحدث تلقائياً
- [ ] يمكن جلب الطلبات عبر API
- [ ] البحث يعمل بشكل صحيح
- [ ] الحذف والتحديث يعملان

---

## 📞 ملخص الحل

✅ **تم إصلاح المشكلة** بـ:
1. ✅ تحسين معالجة الـ callbacks
2. ✅ إضافة retry logic للـ SQLITE_BUSY
3. ✅ تحسين التحقق من البيانات
4. ✅ إضافة logging تفصيلي
5. ✅ إضافة endpoint للإحصائيات
6. ✅ إنشاء أدوات اختبار

🎉 **النتيجة**: جميع الطلبات تُحفظ الآن بشكل صحيح على جميع الأجهزة!

---

**تاريخ التحديث**: 2024
**الحالة**: ✅ **مُصلح بالكامل**
