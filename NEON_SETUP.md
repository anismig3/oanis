# 🚀 Root Forest - دليل التثبيت مع Neon PostgreSQL

## المتطلبات

- **Node.js** (الإصدار 14 أو أحدث)
- **npm** (مثبت مع Node.js)
- **حساب Neon PostgreSQL** (تم إعداده بالفعل)

## خطوات التثبيت

### 1. تثبيت المكتبات المطلوبة

```bash
npm install
```

سيقوم هذا بتثبيت:
- `express` - خادم الويب
- `pg` - مشغل PostgreSQL
- `cors` - السماح بالطلبات من مصادر مختلفة
- `body-parser` - معالجة البيانات
- `dotenv` - إدارة متغيرات البيئة

### 2. تكوين متغيرات البيئة

تم إنشاء ملف `.env` بالفعل يحتوي على:

```
DATABASE_URL=postgresql://neondb_owner:npg_8dGUTqrn9kbt@ep-delicate-dream-aeqg5zdu-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=3000
NODE_ENV=development
```

**ملاحظة أمان**: لا تشارك هذا الملف علناً على GitHub!

### 3. تشغيل الخادم

```bash
npm start
```

أو

```bash
node server.js
```

### 4. التحقق من أن الخادم يعمل

افتح المتصفح واذهب إلى:
- `http://localhost:3000` - اختبار الاتصال
- `http://localhost:3000/api/health` - فحص صحة الخادم

## المسارات المتاحة

### الطلبات (Orders)

- **`POST /api/orders`** - إنشاء طلب جديد
  ```json
  {
    "customer": {
      "fullName": "أحمد محمد",
      "phone": "0123456789",
      "address": "شارع النيل",
      "wilaya": "الجزائر",
      "municipality": "الجزائر الوسطى"
    },
    "items": [
      {"name": "Root Forest", "price": 3000, "quantity": 1}
    ],
    "pricing": {
      "subtotal": 3000,
      "shipping": 200,
      "total": 3200
    },
    "currency": "DZD",
    "timestamp": "2025-11-29T..."
  }
  ```

- **`GET /api/orders`** - جلب جميع الطلبات
  - معاملات اختيارية: `?wilaya=الجزائر&status=جديد&limit=50&offset=0`

- **`GET /api/orders/:id`** - جلب طلب واحد
  - مثال: `GET /api/orders/ORD-1732829284920`

- **`PATCH /api/orders/:id`** - تحديث حالة الطلب
  ```json
  {
    "status": "قيد المعالجة",
    "notes": "تم التحضير للشحن"
  }
  ```

- **`DELETE /api/orders/:id`** - حذف الطلب

### الإحصائيات

- **`GET /api/statistics`** - الحصول على الإحصائيات
  ```json
  {
    "success": true,
    "statistics": {
      "total_orders": 0,
      "total_revenue": 0,
      "last_order_date": null
    }
  }
  ```

### البحث

- **`GET /api/search?query=أحمد`** - البحث عن طلبات

## اختبار الخادم محلياً

### باستخدام cURL

```bash
# إنشاء طلب جديد
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
    "items": [{"name": "Root Forest", "price": 3000, "quantity": 1}],
    "pricing": {"subtotal": 3000, "shipping": 200, "total": 3200},
    "currency": "DZD"
  }'
```

### باستخدام Postman

1. افتح Postman
2. أنشئ طلب `POST` إلى `http://localhost:3000/api/orders`
3. أضف headers: `Content-Type: application/json`
4. أضف البيانات أعلاه في Body

## نشر الخادم

### على Heroku

1. إنشاء حساب Heroku
2. تثبيت Heroku CLI
3. تسجيل الدخول: `heroku login`
4. إنشاء تطبيق: `heroku create root-forest-api`
5. تعيين متغيرات البيئة:
   ```bash
   heroku config:set DATABASE_URL="your-neon-url"
   ```
6. النشر: `git push heroku main`

### على Railway

1. إنشاء حساب Railway
2. ربط مستودع GitHub
3. Railway سيكتشف `package.json` تلقائياً
4. تعيين `DATABASE_URL` في الإعدادات
5. النشر سيتم تلقائياً

### على Vercel Functions

1. تثبيت Vercel CLI: `npm i -g vercel`
2. النشر: `vercel deploy`

## استكشاف الأخطاء

### الخطأ: `connect ECONNREFUSED`

هذا يعني أن الخادم غير متصل بقاعدة البيانات. تحقق من:
- اتصال الإنترنت
- صحة `DATABASE_URL` في ملف `.env`
- وصول Neon للمشغل

### الخطأ: `certificate verify failed`

حاول إضافة هذا إلى `server.js`:
```javascript
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // للتطوير فقط!
```

## الأمان

⚠️ **تذكيرات أمان مهمة:**

1. **لا تنشر `.env`** على GitHub
2. استخدم متغيرات البيئة على الخادم
3. حقق صحة جميع المدخلات
4. استخدم HTTPS في الإنتاج
5. استخدم مصادقة (Authentication) للإدارة

## المراجع

- [Neon PostgreSQL](https://neon.tech)
- [Express.js](https://expressjs.com)
- [Node.js pg](https://node-postgres.com)

---

**آخر تحديث**: 29 نوفمبر 2025
