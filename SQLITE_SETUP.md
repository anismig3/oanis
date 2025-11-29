# SQLite Database Setup Guide - Root Forest API

## نظرة عامة
تم تحويل Root Forest API من PostgreSQL (Neon) إلى **SQLite** لتخزين محلي سهل وسريع، مع إمكانية عرض البيانات مباشرة في **DB Browser for SQLite**.

---

## المتطلبات

- **Node.js** (v14.0.0 أو أحدث)
- **npm** (v6.0.0 أو أحدث)
- **DB Browser for SQLite** (اختياري، للعرض البصري)
  - التحميل من: https://sqlitebrowser.org/

---

## الإعداد السريع

### 1. تثبيت المكتبات
```bash
npm install
```

### 2. بدء السيرفر
```bash
npm start
```

### 3. التحقق من الاتصال
```bash
curl http://localhost:3000/api/health
```

---

## هيكل قاعدة البيانات

### ملف البيانات
- **الموقع**: `./data/orders.db`
- **النوع**: SQLite 3
- **الحجم**: تزايدي (يعتمد على عدد الطلبات)

### الجداول

#### 1. جدول `orders`
```sql
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    wilaya TEXT NOT NULL,
    municipality TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    product_price REAL NOT NULL,
    shipping_cost REAL NOT NULL,
    total_price REAL NOT NULL,
    payment_method TEXT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'معلق',
    notes TEXT
);
```

#### 2. جدول `statistics`
```sql
CREATE TABLE statistics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    total_orders INTEGER DEFAULT 0,
    total_revenue REAL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### المؤشرات (Indexes)
- `idx_customer_name` على `customer_name`
- `idx_phone` على `phone`
- `idx_wilaya` على `wilaya`
- `idx_status` على `status`

---

## API Endpoints

### 1. إنشاء طلب جديد
```
POST /api/orders
Content-Type: application/json

{
    "customerName": "أحمد علي",
    "phone": "0123456789",
    "address": "شارع النيل",
    "city": "الجزائر",
    "wilaya": "الجزائر",
    "municipality": "الجزائر الوسطى",
    "quantity": 2,
    "paymentMethod": "الدفع عند الاستقبال"
}
```

**الرد**: 
```json
{
    "success": true,
    "orderId": "ORD-1234567890123",
    "totalPrice": 6200
}
```

---

### 2. جلب جميع الطلبات
```
GET /api/orders
```

**الرد**:
```json
[
    {
        "id": "ORD-1234567890123",
        "customer_name": "أحمد علي",
        "phone": "0123456789",
        "total_price": 6200,
        "status": "معلق",
        "order_date": "2024-01-15T10:30:00Z"
    }
]
```

---

### 3. جلب طلب واحد
```
GET /api/orders/:id
```

**مثال**:
```
GET /api/orders/ORD-1234567890123
```

---

### 4. تحديث الطلب
```
PATCH /api/orders/:id
Content-Type: application/json

{
    "status": "تم التسليم",
    "notes": "تم التسليم بنجاح"
}
```

---

### 5. حذف الطلب
```
DELETE /api/orders/:id
```

---

### 6. الإحصائيات
```
GET /api/statistics
```

**الرد**:
```json
{
    "totalOrders": 42,
    "totalRevenue": 245800,
    "averageOrderValue": 5847.62,
    "lastUpdated": "2024-01-15T10:30:00Z"
}
```

---

### 7. البحث عن طلبات
```
GET /api/search?q=أحمد
```

**يبحث عن**:
- اسم العميل
- رقم الهاتف
- المدينة
- الولاية

---

### 8. فحص صحة الخادم
```
GET /api/health
```

**الرد**:
```json
{
    "status": "ok",
    "timestamp": "2024-01-15T10:30:00Z",
    "database": "SQLite",
    "databasePath": "C:\\Users\\anis\\oanis\\data\\orders.db"
}
```

---

## عرض البيانات في DB Browser

### الخطوات:

1. **تحميل DB Browser**
   - اذهب إلى: https://sqlitebrowser.org/
   - حمل النسخة الخاصة بنظام التشغيل

2. **فتح الملف**
   - افتح DB Browser
   - اذهب إلى: File → Open
   - انتقل إلى: `C:\Users\anis\oanis\data\orders.db`

3. **استعرض الجداول**
   - اضغط على تبويب "Database Structure"
   - ستجد جداول: `orders` و `statistics`
   - اضغط على أي جدول لعرض البيانات

4. **تشغيل الاستعلامات**
   - اذهب إلى تبويب "Execute SQL"
   - اكتب استعلامات SQL للبحث والتحليل

### استعلامات مفيدة:

```sql
-- جميع الطلبات
SELECT * FROM orders ORDER BY order_date DESC;

-- الطلبات حسب الولاية
SELECT wilaya, COUNT(*) as count FROM orders GROUP BY wilaya;

-- الطلبات المعلقة
SELECT * FROM orders WHERE status = 'معلق';

-- إجمالي الإيرادات
SELECT SUM(total_price) FROM orders;

-- الطلبات في تاريخ محدد
SELECT * FROM orders WHERE DATE(order_date) = '2024-01-15';
```

---

## معلومات مهمة

### ✅ المميزات
- ✨ **تخزين محلي**: بدون اتصال بالإنترنت
- 🚀 **سرعة عالية**: استعلامات فورية
- 📁 **سهل المشاركة**: ملف واحد يحتوي على كل البيانات
- 🔍 **عرض مباشر**: DB Browser يعرض البيانات بصريًا
- 💾 **موثوق**: بدون تاريخ انتهاء أو حدود

### ⚠️ القيود
- **عمليات الكتابة المتزامنة**: محدودة (لا تستخدمها في حمل عالي جدًا)
- **حجم البيانات**: يعتمد على حجم القرص الصلب
- **التوسع**: ليست مثالية لملايين السجلات

---

## استكشاف الأخطاء

### المشكلة: السيرفر لا يبدأ
```bash
# تأكد من تثبيت المكتبات
npm install

# تأكد من عدم استخدام المنفذ 3000
netstat -ano | findstr 3000
```

### المشكلة: ملف قاعدة البيانات غير موجود
```bash
# السيرفر سينشئ الملف تلقائيًا عند البدء
# تأكد من أن المجلد data موجود
ls -la data/
```

### المشكلة: DB Browser لا يفتح الملف
- تأكد من أن السيرفر متوقف (Ctrl+C)
- أغلق DB Browser تمامًا
- جرب فتح الملف مرة أخرى

---

## ملفات مهمة

```
oanis/
├── server.js              # سيرفر Express + SQLite
├── index.html             # الموقع الأمامي
├── package.json           # المكتبات المطلوبة
├── data/
│   └── orders.db          # ✨ قاعدة البيانات SQLite
├── SQLITE_SETUP.md        # 📖 هذا الملف
├── README_AR.md           # التوثيق الشامل
└── .gitignore             # (يتضمن data/orders.db)
```

---

## النسخة الاحتياطية

### نسخ احتياطي من قاعدة البيانات
```bash
# انسخ الملف إلى مكان آمن
cp data/orders.db data/orders.db.backup

# أو استخدم DB Browser: File → Export
```

---

## الدعم والتحديثات

- **المستودع**: https://github.com/anismig3/oanis
- **الفرع**: root
- **الإصدار الحالي**: v3.0.0
- **آخر تحديث**: 2024

---

## الملخص السريع

✅ **السيرفر**:
```bash
npm start
```

✅ **فتح قاعدة البيانات**:
- استخدم DB Browser
- اختر: `./data/orders.db`

✅ **الاختبار**:
```bash
curl http://localhost:3000/api/health
```

---

🎉 **تم! قاعدة البيانات جاهزة للاستخدام**
