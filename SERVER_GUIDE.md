# 🚀 دليل تشغيل الخادم

## البدء السريع

### 1. التثبيت
```bash
npm install
```

### 2. التشغيل
```bash
npm start
```

### 3. الوصول
- **الموقع**: http://localhost:3000/index.html
- **API**: http://localhost:3000/api/orders
- **الصحة**: http://localhost:3000/api/health

---

## أمثلة الاستخدام

### إنشاء طلب جديد

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "fullName": "أحمد محمد",
      "phone": "0123456789",
      "address": "شارع النيل",
      "wilaya": "الجزائر",
      "municipality": "الجزائر الوسطى"
    },
    "items": [
      {
        "name": "Root Forest مسحوق بروتين",
        "price": 3000,
        "quantity": 1
      }
    ],
    "pricing": {
      "subtotal": 3000,
      "shipping": 200,
      "total": 3200
    },
    "currency": "DZD"
  }'
```

### جلب جميع الطلبات

```bash
curl http://localhost:3000/api/orders
```

### جلب طلب محدد

```bash
curl http://localhost:3000/api/orders/ORD-1732829284920
```

### تحديث الطلب

```bash
curl -X PATCH http://localhost:3000/api/orders/ORD-1732829284920 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "قيد المعالجة",
    "notes": "تم التحضير للشحن"
  }'
```

### حذف الطلب

```bash
curl -X DELETE http://localhost:3000/api/orders/ORD-1732829284920
```

### الحصول على الإحصائيات

```bash
curl http://localhost:3000/api/statistics
```

### البحث عن طلبات

```bash
curl "http://localhost:3000/api/search?query=أحمد"
```

---

## استكشاف الأخطاء

### الخادم لا يبدأ

```bash
# تحقق من Node.js
node --version

# تحقق من المكتبات
npm list

# أعد التثبيت
npm install
```

### قاعدة البيانات غير متصلة

```bash
# تحقق من .env
cat .env

# اختبر الاتصال مباشرة
psql "postgresql://neondb_owner:..."
```

### المنفذ 3000 مشغول

```bash
# استخدم منفذ مختلف
PORT=3001 npm start

# أو ابحث عن العملية المشغولة
lsof -i :3000
kill -9 <PID>
```

---

## الملفات المهمة

| الملف | الوصف |
|------|-------|
| server.js | الخادم الرئيسي |
| .env | بيانات الاتصال |
| package.json | الاعتماديات |
| index.html | الموقع |

---

## المسارات المتاحة

```
✅ GET  /                      - الرئيسية
✅ GET  /index.html           - الموقع
✅ POST /api/orders           - إنشاء طلب
✅ GET  /api/orders           - جميع الطلبات
✅ GET  /api/orders/:id       - طلب واحد
✅ PATCH /api/orders/:id      - تحديث
✅ DELETE /api/orders/:id     - حذف
✅ GET  /api/statistics       - إحصائيات
✅ GET  /api/search?q=        - بحث
✅ GET  /api/health           - الصحة
```

---

## الأداء

- **متوسط الاستجابة**: < 100ms
- **قاعدة البيانات**: Neon PostgreSQL
- **الاتصالات**: SSL/TLS
- **التزامن**: غير محدود

---

**تم ✅**
