#!/usr/bin/env node

/**
 * خادم API بسيط لـ Root Forest
 * استخدم هذا الملف كنقطة بداية لإنشاء خادم API خاص بك
 * 
 * التثبيت:
 * npm install express cors body-parser
 * 
 * التشغيل:
 * node server.js
 * 
 * سيعمل على: http://localhost:3000
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================
// Middleware
// ========================

// تفعيل CORS للسماح بالطلبات من أي موقع
// (في الإنتاج، حدد النطاق بدقة)
app.use(cors({
    origin: '*', // غيّر هذا في الإنتاج
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// تحليل JSON
app.use(bodyParser.json());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ========================
// المسارات (Routes)
// ========================

/**
 * GET / - اختبار أن الخادم يعمل
 */
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Root Forest API',
        version: '1.0.0',
        status: 'running ✅'
    });
});

/**
 * POST /api/checkout - استقبال طلب الشراء
 */
app.post('/api/checkout', (req, res) => {
    try {
        const orderData = req.body;

        console.log('\n📦 ========== طلب جديد ==========');
        console.log('العميل:', orderData.customer.fullName);
        console.log('البريد:', orderData.customer.email);
        console.log('الولاية:', orderData.customer.wilaya);
        console.log('العناصر:', orderData.items.length);
        console.log('الإجمالي:', orderData.pricing.total, 'دج');
        console.log('البيانات الكاملة:', JSON.stringify(orderData, null, 2));
        console.log('==============================\n');

        // ✅ هنا يمكنك:
        // 1. حفظ الطلب في قاعدة البيانات
        // 2. إرسال بريد تأكيد للعميل
        // 3. تحديث نظام الإدارة
        // 4. معالجة الدفع
        // إلخ...

        // إنشاء معرف الطلب الفريد
        const orderId = `ORD-${Date.now()}`;

        // إرسال استجابة النجاح
        res.status(200).json({
            success: true,
            orderId: orderId,
            message: 'تم استلام طلبك بنجاح! سيتم التواصل معك قريباً.',
            timestamp: new Date().toISOString(),
            nextSteps: [
                'سيتم إرسال رسالة تأكيد إلى بريدك الإلكتروني',
                'سيتاصل فريقنا بك لتأكيد الطلب',
                'سيتم توصيل المنتج في أسرع وقت ممكن'
            ]
        });

    } catch (error) {
        console.error('❌ خطأ في معالجة الطلب:', error);
        res.status(400).json({
            success: false,
            message: 'حدث خطأ في معالجة الطلب',
            error: error.message
        });
    }
});

/**
 * GET /api/health - فحص صحة الخادم
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy ✅',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

/**
 * GET /api/shipping-costs - الحصول على أسعار الشحن
 */
app.get('/api/shipping-costs', (req, res) => {
    const shippingCosts = {
        'algiers': 500,
        'adrar': 1200,
        'chlef': 800,
        'medea': 700,
        'laghouat': 1000,
        'oum-el-bouaghi': 900,
        'batna': 950,
        'annaba': 1100,
        'tamanrasset': 1500,
        'tebessa': 1050,
        'tlemcen': 850,
        'tiaret': 800,
        'tizi-ouzou': 650,
        'djelfa': 900,
        'jijel': 800,
        'sétif': 850,
        'saïda': 900,
        'skikda': 900,
        'sidi-bel-abbès': 950,
        'béjaïa': 750,
        'bechar': 1300,
        'blida': 600,
        'bouira': 700,
        'tamanghasset': 1600,
        'tissemsilt': 850,
        'el-oued': 1200,
        'khenchela': 1000,
        'souk-ahras': 950,
        'msila': 850,
        'mila': 900,
        'ain-defla': 650,
        'naama': 1100,
        'ain-temouchent': 900,
        'ghardaia': 1250,
        'relizane': 800
    };

    res.json({
        currency: 'DZD',
        shippingCosts: shippingCosts
    });
});

// ========================
// معالجة الأخطاء
// ========================

/**
 * 404 - المسار غير موجود
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'المسار غير موجود',
        path: req.path
    });
});

/**
 * معالج الأخطاء العام
 */
app.use((err, req, res, next) => {
    console.error('❌ خطأ:', err);
    res.status(500).json({
        success: false,
        message: 'حدث خطأ في الخادم',
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
});

// ========================
// بدء الخادم
// ========================

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 Root Forest API Server');
    console.log('='.repeat(50));
    console.log(`✅ الخادم يعمل على: http://localhost:${PORT}`);
    console.log(`📝 بيئة التشغيل: ${process.env.NODE_ENV || 'development'}`);
    console.log('\n📌 المسارات المتاحة:');
    console.log('   GET  /              - اختبار الاتصال');
    console.log('   GET  /api/health    - فحص صحة الخادم');
    console.log('   GET  /api/shipping-costs - أسعار الشحن');
    console.log('   POST /api/checkout  - استقبال الطلبات');
    console.log('\n💡 لإيقاف الخادم: اضغط Ctrl+C\n');
    console.log('='.repeat(50) + '\n');
});

// معالجة إيقاف الخادم بشكل آمن
process.on('SIGTERM', () => {
    console.log('\n⚠️ تم استلام إشارة SIGTERM - إيقاف الخادم...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n⚠️ تم استلام إشارة SIGINT - إيقاف الخادم...');
    process.exit(0);
});
