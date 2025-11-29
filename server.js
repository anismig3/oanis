#!/usr/bin/env node

/**
 * خادم API لـ Root Forest مع قاعدة بيانات Neon PostgreSQL
 * 
 * التثبيت:
 * npm install express pg cors body-parser dotenv
 * 
 * ملف .env:
 * DATABASE_URL=postgresql://neondb_owner:npg_8dGUTqrn9kbt@ep-delicate-dream-aeqg5zdu-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
 * 
 * التشغيل:
 * node server.js
 */

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ========================
// Middleware
// ========================

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ========================
// اتصال قاعدة البيانات Neon
// ========================

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_8dGUTqrn9kbt@ep-delicate-dream-aeqg5zdu-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('connect', () => {
    console.log('✅ تم الاتصال بقاعدة بيانات Neon بنجاح');
});

pool.on('error', (err) => {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err);
});

// ========================
// إنشاء الجداول
// ========================

async function createTables() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                order_id VARCHAR(50) UNIQUE NOT NULL,
                customer_name VARCHAR(255) NOT NULL,
                customer_phone VARCHAR(20) NOT NULL,
                customer_address TEXT NOT NULL,
                customer_wilaya VARCHAR(100) NOT NULL,
                customer_municipality VARCHAR(100) NOT NULL,
                items JSONB NOT NULL,
                subtotal DECIMAL(10, 2) NOT NULL,
                shipping_cost DECIMAL(10, 2) NOT NULL,
                total_price DECIMAL(10, 2) NOT NULL,
                currency VARCHAR(10) DEFAULT 'DZD',
                status VARCHAR(50) DEFAULT 'جديد',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('✅ تم إنشاء جدول الطلبات بنجاح');
    } catch (error) {
        console.error('❌ خطأ في إنشاء الجداول:', error.message);
    }
}

// ========================
// Routes
// ========================

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Root Forest API',
        version: '2.0.0',
        status: 'running ✅',
        database: 'Neon PostgreSQL'
    });
});

// إضافة طلب جديد
app.post('/api/orders', async (req, res) => {
    try {
        const { customer, items, pricing, currency, timestamp } = req.body;

        if (!customer || !items || !pricing) {
            return res.status(400).json({ error: 'بيانات غير كاملة' });
        }

        const orderId = `ORD-${Date.now()}`;

        const query = `
            INSERT INTO orders (
                order_id, 
                customer_name, 
                customer_phone, 
                customer_address, 
                customer_wilaya, 
                customer_municipality, 
                items, 
                subtotal, 
                shipping_cost, 
                total_price, 
                currency, 
                status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *;
        `;

        const values = [
            orderId,
            customer.fullName,
            customer.phone,
            customer.address,
            customer.wilaya,
            customer.municipality,
            JSON.stringify(items),
            pricing.subtotal,
            pricing.shipping,
            pricing.total,
            currency || 'DZD',
            'جديد'
        ];

        const result = await pool.query(query, values);

        console.log(`✅ طلب جديد: ${orderId} من ${customer.fullName}`);

        res.status(201).json({
            success: true,
            message: '✅ تم حفظ الطلب بنجاح',
            orderId: orderId,
            data: result.rows[0]
        });

    } catch (error) {
        console.error('❌ خطأ في إضافة الطلب:', error.message);
        res.status(500).json({
            error: 'خطأ في حفظ الطلب',
            details: error.message
        });
    }
});

// الحصول على جميع الطلبات
app.get('/api/orders', async (req, res) => {
    try {
        const { wilaya, status, limit = 50, offset = 0 } = req.query;

        let query = 'SELECT * FROM orders WHERE 1=1';
        const values = [];
        let paramCount = 0;

        if (wilaya) {
            paramCount++;
            query += ` AND customer_wilaya = $${paramCount}`;
            values.push(wilaya);
        }

        if (status) {
            paramCount++;
            query += ` AND status = $${paramCount}`;
            values.push(status);
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        values.push(parseInt(limit), parseInt(offset));

        const result = await pool.query(query, values);

        res.json({
            success: true,
            total: result.rows.length,
            orders: result.rows
        });

    } catch (error) {
        console.error('❌ خطأ في جلب الطلبات:', error.message);
        res.status(500).json({ error: 'خطأ في جلب الطلبات' });
    }
});

// الحصول على طلب واحد
app.get('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'SELECT * FROM orders WHERE order_id = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'الطلب غير موجود' });
        }

        res.json({
            success: true,
            order: result.rows[0]
        });

    } catch (error) {
        console.error('❌ خطأ في جلب الطلب:', error.message);
        res.status(500).json({ error: 'خطأ في جلب الطلب' });
    }
});

// تحديث حالة الطلب
app.patch('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        let query = 'UPDATE orders SET updated_at = CURRENT_TIMESTAMP';
        const values = [];
        let paramCount = 1;

        if (status) {
            paramCount++;
            query += `, status = $${paramCount}`;
            values.push(status);
        }

        if (notes) {
            paramCount++;
            query += `, notes = $${paramCount}`;
            values.push(notes);
        }

        query += ` WHERE order_id = $1 RETURNING *`;
        values.unshift(id);

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'الطلب غير موجود' });
        }

        res.json({
            success: true,
            message: '✅ تم تحديث الطلب بنجاح',
            order: result.rows[0]
        });

    } catch (error) {
        console.error('❌ خطأ في تحديث الطلب:', error.message);
        res.status(500).json({ error: 'خطأ في تحديث الطلب' });
    }
});

// حذف الطلب
app.delete('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM orders WHERE order_id = $1 RETURNING *';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'الطلب غير موجود' });
        }

        res.json({
            success: true,
            message: '✅ تم حذف الطلب بنجاح'
        });

    } catch (error) {
        console.error('❌ خطأ في حذف الطلب:', error.message);
        res.status(500).json({ error: 'خطأ في حذف الطلب' });
    }
});

// الحصول على الإحصائيات
app.get('/api/statistics', async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(*) as total_orders,
                COALESCE(SUM(total_price), 0) as total_revenue,
                MAX(created_at) as last_order_date
            FROM orders;
        `;

        const result = await pool.query(query);
        const stats = result.rows[0];

        res.json({
            success: true,
            statistics: {
                total_orders: parseInt(stats.total_orders) || 0,
                total_revenue: parseFloat(stats.total_revenue) || 0,
                last_order_date: stats.last_order_date || null
            }
        });

    } catch (error) {
        console.error('❌ خطأ في جلب الإحصائيات:', error.message);
        res.status(500).json({ error: 'خطأ في جلب الإحصائيات' });
    }
});

// البحث عن طلبات
app.get('/api/search', async (req, res) => {
    try {
        const { query: searchQuery } = req.query;

        if (!searchQuery) {
            return res.status(400).json({ error: 'يجب إدخال نص البحث' });
        }

        const query = `
            SELECT * FROM orders 
            WHERE 
                customer_name ILIKE $1 
                OR customer_phone ILIKE $1 
                OR order_id ILIKE $1
            ORDER BY created_at DESC
            LIMIT 50;
        `;

        const result = await pool.query(query, [`%${searchQuery}%`]);

        res.json({
            success: true,
            total: result.rows.length,
            orders: result.rows
        });

    } catch (error) {
        console.error('❌ خطأ في البحث:', error.message);
        res.status(500).json({ error: 'خطأ في البحث' });
    }
});

// صحة الخادم
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy ✅',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'Neon PostgreSQL'
    });
});

// ========================
// معالجة الأخطاء
// ========================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'المسار غير موجود',
        path: req.path
    });
});

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

async function startServer() {
    try {
        await createTables();

        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(60));
            console.log('🚀 Root Forest API Server');
            console.log('='.repeat(60));
            console.log(`✅ الخادم يعمل على: http://localhost:${PORT}`);
            console.log(`📊 قاعدة البيانات: Neon PostgreSQL`);
            console.log(`📝 بيئة التشغيل: ${process.env.NODE_ENV || 'development'}`);
            console.log('\n📌 المسارات المتاحة:');
            console.log('   GET  /                     - اختبار الاتصال');
            console.log('   GET  /api/health           - فحص صحة الخادم');
            console.log('   POST /api/orders           - إنشاء طلب جديد');
            console.log('   GET  /api/orders           - جلب جميع الطلبات');
            console.log('   GET  /api/orders/:id       - جلب طلب واحد');
            console.log('   PATCH /api/orders/:id      - تحديث الطلب');
            console.log('   DELETE /api/orders/:id     - حذف الطلب');
            console.log('   GET  /api/statistics       - الإحصائيات');
            console.log('   GET  /api/search           - البحث عن طلبات');
            console.log('\n💡 لإيقاف الخادم: اضغط Ctrl+C\n');
            console.log('='.repeat(60) + '\n');
        });
    } catch (error) {
        console.error('❌ خطأ في بدء الخادم:', error);
        process.exit(1);
    }
}

process.on('SIGTERM', () => {
    console.log('\n⚠️ تم استلام إشارة SIGTERM - إيقاف الخادم...');
    pool.end();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n⚠️ تم استلام إشارة SIGINT - إيقاف الخادم...');
    pool.end();
    process.exit(0);
});

startServer();

module.exports = app;
