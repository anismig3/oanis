#!/usr/bin/env node

/**
 * خادم API لـ Root Forest مع قاعدة بيانات SQLite
 * 
 * التثبيت:
 * npm install express sqlite3 cors body-parser
 * 
 * التشغيل:
 * node server.js
 * 
 * عرض قاعدة البيانات:
 * DB Browser for SQLite → Open: ./data/orders.db
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

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
// إعداد قاعدة البيانات SQLite
// ========================

const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'orders.db');

// التأكد من وجود مجلد data
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`✅ تم إنشاء مجلد البيانات: ${dataDir}`);
}

// إنشاء اتصال SQLite مع تحسين الأداء
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err.message);
    } else {
        console.log(`✅ تم الاتصال بقاعدة البيانات SQLite`);
        console.log(`📁 الموقع: ${dbPath}`);
        
        // تطبيق إعدادات الأداء بعد الاتصال
        db.serialize(() => {
            db.run('PRAGMA journal_mode = WAL'); // استخدام Write-Ahead Logging
            db.run('PRAGMA synchronous = NORMAL'); // تحسين الأداء مع الأمان
            db.run('PRAGMA cache_size = -128000'); // 128MB cache
            db.run('PRAGMA temp_store = MEMORY'); // استخدام الذاكرة للملفات المؤقتة
            db.run('PRAGMA foreign_keys = ON'); // تفعيل foreign keys
            db.run('PRAGMA busy_timeout = 30000'); // انتظر 30 ثانية قبل رفع خطأ BUSY
            db.run('PRAGMA wal_autocheckpoint = 1000'); // تقليل حجم WAL log
        });
    }
});

// ========================
// إنشاء الجداول
// ========================

function createTables() {
    // جدول الطلبات
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT UNIQUE NOT NULL,
            customer_name TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            customer_address TEXT NOT NULL,
            customer_wilaya TEXT NOT NULL,
            customer_municipality TEXT NOT NULL,
            items TEXT NOT NULL,
            subtotal REAL NOT NULL,
            shipping_cost REAL NOT NULL,
            total_price REAL NOT NULL,
            currency TEXT DEFAULT 'DZD',
            status TEXT DEFAULT 'جديد',
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `, (err) => {
        if (err && !err.message.includes('already exists')) {
            console.error('❌ خطأ في إنشاء جدول orders:', err.message);
        } else {
            console.log('✅ جدول orders جاهز');
        }
    });

    // جدول الإحصائيات
    db.run(`
        CREATE TABLE IF NOT EXISTS statistics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            total_orders INTEGER DEFAULT 0,
            total_revenue REAL DEFAULT 0,
            last_order_date DATETIME,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `, (err) => {
        if (err && !err.message.includes('already exists')) {
            console.error('❌ خطأ في إنشاء جدول statistics:', err.message);
        } else {
            console.log('✅ جدول statistics جاهز');
        }
    });

    // إنشاء الفهارس بعد 1 ثانية
    setTimeout(() => {
        db.run(`CREATE INDEX IF NOT EXISTS idx_customer_name ON orders(customer_name);`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_customer_phone ON orders(customer_phone);`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_wilaya ON orders(customer_wilaya);`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_status ON orders(status);`);
    }, 1000);
}

createTables();

// ========================
// Routes
// ========================

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Root Forest API',
        version: '3.0.0',
        status: 'running ✅',
        database: 'SQLite',
        dbLocation: dbPath
    });
});

// إضافة طلب جديد
app.post('/api/orders', async (req, res) => {
    try {
        const { customer, items, pricing, currency, timestamp } = req.body;

        // تسجيل البيانات المستقبلة
        console.log('📦 تم استقبال طلب جديد');
        console.log('👤 العميل:', customer?.fullName);
        console.log('📞 الهاتف:', customer?.phone);
        console.log('📍 الموقع:', customer?.wilaya, '-', customer?.municipality);
        console.log('💰 السعر:', pricing?.total);

        if (!customer || !items || !pricing) {
            console.error('❌ بيانات غير كاملة - العميل:', !!customer, 'المنتجات:', !!items, 'السعر:', !!pricing);
            return res.status(400).json({ error: 'بيانات غير كاملة' });
        }

        // التحقق من البيانات المهمة
        if (!customer.fullName || !customer.phone || !customer.wilaya || !customer.municipality) {
            console.error('❌ بيانات العميل غير صحيحة:', customer);
            return res.status(400).json({ error: 'بيانات العميل غير صحيحة' });
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            orderId,
            customer.fullName,
            customer.phone,
            customer.address || 'غير محدد',
            customer.wilaya,
            customer.municipality,
            JSON.stringify(items),
            pricing.subtotal,
            pricing.shipping,
            pricing.total,
            currency || 'DZD',
            'جديد'
        ];

        console.log('💾 محاولة حفظ الطلب في قاعدة البيانات...');

        // استخدام دالة الإعادة المحسّنة
        dbRunWithRetry(query, values, (err, lastID) => {
            if (err) {
                console.error('❌ خطأ في إضافة الطلب:', err.message);
                console.error('❌ Stack:', err.stack);
                
                // رسالة مفصلة للمستخدم حسب نوع الخطأ
                let errorMessage = 'خطأ في حفظ الطلب';
                if (err.message.includes('SQLITE_BUSY')) {
                    errorMessage = 'قاعدة البيانات مشغولة حالياً، يرجى المحاولة مرة أخرى';
                } else if (err.message.includes('SQLITE_CANTOPEN')) {
                    errorMessage = 'لا يمكن الوصول إلى قاعدة البيانات';
                } else if (err.message.includes('SQLITE_READONLY')) {
                    errorMessage = 'قاعدة البيانات في وضع القراءة فقط';
                }
                
                return res.status(500).json({
                    success: false,
                    error: errorMessage,
                    message: errorMessage,
                    details: err.message
                });
            }

            if (!lastID || lastID === 0) {
                console.error('❌ فشل إدراج الطلب - لم يتم الحصول على معرف الصف');
                return res.status(500).json({
                    success: false,
                    error: 'فشل حفظ الطلب',
                    message: 'فشل حفظ الطلب في قاعدة البيانات'
                });
            }

            console.log(`✅ طلب جديد محفوظ: ${orderId}`);
            console.log(`✅ معرف الصف: ${lastID}`);
            console.log(`✅ من: ${customer.fullName}`);

            // تحديث الإحصائيات
            updateStatistics();

            res.status(201).json({
                success: true,
                message: '✅ تم حفظ الطلب بنجاح',
                orderId: orderId,
                data: {
                    id: lastID,
                    order_id: orderId,
                    customer_name: customer.fullName,
                    total_price: pricing.total,
                    status: 'جديد'
                }
            });
        });

    } catch (error) {
        console.error('❌ خطأ:', error.message);
        console.error('❌ Stack:', error.stack);
        res.status(500).json({
            error: 'خطأ في حفظ الطلب',
            details: error.message
        });
    }
});

// جلب جميع الطلبات
app.get('/api/orders', (req, res) => {
    try {
        const { wilaya, status, limit = 50, offset = 0 } = req.query;

        let query = 'SELECT * FROM orders WHERE 1=1';
        const values = [];

        if (wilaya) {
            query += ' AND customer_wilaya = ?';
            values.push(wilaya);
        }

        if (status) {
            query += ' AND status = ?';
            values.push(status);
        }

        query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        values.push(parseInt(limit), parseInt(offset));

        db.all(query, values, (err, rows) => {
            if (err) {
                console.error('❌ خطأ في جلب الطلبات:', err.message);
                return res.status(500).json({ error: 'خطأ في جلب الطلبات' });
            }

            res.json({
                success: true,
                total: rows.length,
                orders: rows
            });
        });

    } catch (error) {
        console.error('❌ خطأ:', error.message);
        res.status(500).json({ error: 'خطأ في جلب الطلبات' });
    }
});

// جلب طلب واحد
app.get('/api/orders/:id', (req, res) => {
    try {
        const { id } = req.params;

        const query = 'SELECT * FROM orders WHERE order_id = ?';
        
        db.get(query, [id], (err, row) => {
            if (err) {
                console.error('❌ خطأ:', err.message);
                return res.status(500).json({ error: 'خطأ في جلب الطلب' });
            }

            if (!row) {
                return res.status(404).json({ error: 'الطلب غير موجود' });
            }

            // تحويل JSON string إلى object
            if (row.items) {
                row.items = JSON.parse(row.items);
            }

            res.json({
                success: true,
                order: row
            });
        });

    } catch (error) {
        console.error('❌ خطأ:', error.message);
        res.status(500).json({ error: 'خطأ في جلب الطلب' });
    }
});

// تحديث الطلب
app.patch('/api/orders/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        if (!status && !notes) {
            return res.status(400).json({ error: 'يجب إدخال status أو notes' });
        }

        let query = 'UPDATE orders SET updated_at = CURRENT_TIMESTAMP';
        const values = [];

        if (status) {
            query += ', status = ?';
            values.push(status);
        }

        if (notes) {
            query += ', notes = ?';
            values.push(notes);
        }

        query += ' WHERE order_id = ?';
        values.push(id);

        // استخدام دالة الإعادة
        dbRunWithRetry(query, values, function(err) {
            if (err) {
                console.error('❌ خطأ:', err.message);
                return res.status(500).json({ error: 'خطأ في تحديث الطلب' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'الطلب غير موجود' });
            }

            updateStatistics();

            res.json({
                success: true,
                message: '✅ تم تحديث الطلب بنجاح'
            });
        });

    } catch (error) {
        console.error('❌ خطأ:', error.message);
        res.status(500).json({ error: 'خطأ في تحديث الطلب' });
    }
});

// حذف الطلب
app.delete('/api/orders/:id', (req, res) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM orders WHERE order_id = ?';
        
        // استخدام دالة الإعادة
        dbRunWithRetry(query, [id], function(err) {
            if (err) {
                console.error('❌ خطأ:', err.message);
                return res.status(500).json({ error: 'خطأ في حذف الطلب' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: 'الطلب غير موجود' });
            }

            updateStatistics();

            res.json({
                success: true,
                message: '✅ تم حذف الطلب بنجاح'
            });
        });

    } catch (error) {
        console.error('❌ خطأ:', error.message);
        res.status(500).json({ error: 'خطأ في حذف الطلب' });
    }
});

// الإحصائيات
app.get('/api/statistics', (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(*) as total_orders,
                COALESCE(SUM(total_price), 0) as total_revenue,
                MAX(created_at) as last_order_date
            FROM orders;
        `;

        db.get(query, [], (err, row) => {
            if (err) {
                console.error('❌ خطأ:', err.message);
                return res.status(500).json({ error: 'خطأ في جلب الإحصائيات' });
            }

            res.json({
                success: true,
                statistics: {
                    total_orders: row.total_orders || 0,
                    total_revenue: row.total_revenue || 0,
                    last_order_date: row.last_order_date || null
                }
            });
        });

    } catch (error) {
        console.error('❌ خطأ:', error.message);
        res.status(500).json({ error: 'خطأ في جلب الإحصائيات' });
    }
});

// البحث
app.get('/api/search', (req, res) => {
    try {
        const { query: searchQuery } = req.query;

        if (!searchQuery) {
            return res.status(400).json({ error: 'يجب إدخال نص البحث' });
        }

        const query = `
            SELECT * FROM orders 
            WHERE 
                customer_name LIKE ? 
                OR customer_phone LIKE ? 
                OR order_id LIKE ?
            ORDER BY created_at DESC
            LIMIT 50;
        `;

        const searchTerm = `%${searchQuery}%`;

        db.all(query, [searchTerm, searchTerm, searchTerm], (err, rows) => {
            if (err) {
                console.error('❌ خطأ:', err.message);
                return res.status(500).json({ error: 'خطأ في البحث' });
            }

            res.json({
                success: true,
                total: rows.length,
                orders: rows
            });
        });

    } catch (error) {
        console.error('❌ خطأ:', error.message);
        res.status(500).json({ error: 'خطأ في البحث' });
    }
});

// صحة الخادم
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy ✅',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'SQLite',
        dbFile: dbPath
    });
});

// عدد الطلبات والعملاء (للاختبار والمراقبة)
app.get('/api/stats/customers', (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(DISTINCT customer_name) as total_customers,
                COUNT(*) as total_orders,
                COALESCE(SUM(total_price), 0) as total_revenue,
                GROUP_CONCAT(DISTINCT customer_name, ', ') as customer_names
            FROM orders;
        `;

        db.get(query, [], (err, row) => {
            if (err) {
                console.error('❌ خطأ:', err.message);
                return res.status(500).json({ error: 'خطأ في جلب الإحصائيات' });
            }

            res.json({
                success: true,
                statistics: {
                    total_customers: row.total_customers || 0,
                    total_orders: row.total_orders || 0,
                    total_revenue: row.total_revenue || 0,
                    customer_names: row.customer_names ? row.customer_names.split(', ') : []
                }
            });
        });

    } catch (error) {
        console.error('❌ خطأ:', error.message);
        res.status(500).json({ error: 'خطأ في جلب الإحصائيات' });
    }
});

// ========================
// دوال مساعدة
// ========================

function updateStatistics() {
    const query = `
        SELECT 
            COUNT(*) as total_orders,
            COALESCE(SUM(total_price), 0) as total_revenue
        FROM orders;
    `;

    db.get(query, [], (err, row) => {
        if (err) {
            console.error('❌ خطأ في تحديث الإحصائيات:', err.message);
            return;
        }

        const updateQuery = `
            UPDATE statistics 
            SET total_orders = ?, total_revenue = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = 1;
        `;

        db.run(updateQuery, [row.total_orders, row.total_revenue], (err) => {
            if (err && err.message.includes('no rows')) {
                // إذا لم تكن هناك صفوف، أنشئ واحدة
                const insertQuery = `
                    INSERT INTO statistics (total_orders, total_revenue)
                    VALUES (?, ?);
                `;
                db.run(insertQuery, [row.total_orders, row.total_revenue]);
            }
        });
    });
}

// دالة مساعدة لإعادة محاولة العملية عند فشلها بسبب القفل
function dbRunWithRetry(query, params, callback, retries = 20, delay = 100) {
    db.run(query, params, function(err) {
        if (err && err.message.includes('SQLITE_BUSY') && retries > 0) {
            const attempt = 21 - retries;
            const exponentialDelay = delay * Math.pow(1.2, 21 - retries - 1);
            console.warn(`⚠️ قاعدة البيانات مشغولة، إعادة محاولة... (${attempt}/20) - انتظار ${Math.round(exponentialDelay)}ms`);
            setTimeout(() => {
                dbRunWithRetry(query, params, callback, retries - 1, delay);
            }, exponentialDelay);
        } else {
            if (err && err.message.includes('SQLITE_BUSY')) {
                console.error('❌ فشلت جميع المحاولات - قاعدة البيانات مقفولة');
            }
            // تمرير lastID كمعامل
            callback(err, this.lastID);
        }
    });
}

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

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(70));
    console.log('🚀 Root Forest API Server - SQLite Edition');
    console.log('='.repeat(70));
    console.log(`✅ الخادم يعمل على: http://localhost:${PORT}`);
    console.log(`📊 قاعدة البيانات: SQLite`);
    console.log(`📁 ملف قاعدة البيانات: ${dbPath}`);
    console.log(`🔍 افتح DB Browser وحمل: ${dbPath}`);
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
    console.log('   GET  /api/search?q=        - البحث عن طلبات');
    console.log('\n💡 لإيقاف الخادم: اضغط Ctrl+C\n');
    console.log('='.repeat(70) + '\n');
});

// معالجة إيقاف الخادم بشكل آمن
process.on('SIGTERM', () => {
    console.log('\n⚠️ تم استلام إشارة SIGTERM - إيقاف الخادم...');
    db.close((err) => {
        if (err) {
            console.error('❌ خطأ في إغلاق قاعدة البيانات:', err.message);
        } else {
            console.log('✅ تم إغلاق قاعدة البيانات');
        }
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n⚠️ تم استلام إشارة SIGINT - إيقاف الخادم...');
    db.close((err) => {
        if (err) {
            console.error('❌ خطأ في إغلاق قاعدة البيانات:', err.message);
        } else {
            console.log('✅ تم إغلاق قاعدة البيانات');
        }
        process.exit(0);
    });
});

module.exports = app;
