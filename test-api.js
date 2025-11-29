#!/usr/bin/env node

/**
 * Script لاختبار قاعدة البيانات والطلبات
 * استخدام: node test-api.js
 */

const http = require('http');

const API_BASE = 'http://localhost:3000/api';

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, API_BASE);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        body: body ? JSON.parse(body) : null
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        body: body
                    });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function main() {
    console.log('🧪 اختبار قاعدة البيانات - Root Forest\n');

    try {
        // 1. فحص صحة الخادم
        console.log('1️⃣  فحص صحة الخادم...');
        const healthRes = await makeRequest('GET', '/health');
        if (healthRes.status === 200) {
            console.log('✅ الخادم يعمل\n');
        } else {
            console.log('❌ الخادم لا يستجيب\n');
            return;
        }

        // 2. جلب الطلبات القديمة
        console.log('2️⃣  جلب الطلبات الحالية...');
        const ordersRes = await makeRequest('GET', '/orders?limit=5');
        console.log(`✅ عدد الطلبات: ${ordersRes.body.total}\n`);

        // 3. إرسال طلب جديد
        console.log('3️⃣  إرسال طلب اختبار جديد...');
        const newOrder = {
            customer: {
                fullName: `عميل الاختبار ${Date.now()}`,
                phone: '0781234567',
                address: 'عنوان الاختبار',
                wilaya: 'الجزائر',
                municipality: 'الجزائر الوسطى'
            },
            items: [
                { name: 'Root Forest', price: 3000, quantity: 1 }
            ],
            pricing: {
                subtotal: 3000,
                shipping: 200,
                total: 3200
            },
            currency: 'DZD',
            timestamp: new Date().toISOString()
        };

        const createRes = await makeRequest('POST', '/orders', newOrder);
        if (createRes.status === 201) {
            console.log(`✅ تم حفظ الطلب بنجاح: ${createRes.body.orderId}\n`);
        } else {
            console.log(`❌ خطأ: ${createRes.body.error}\n`);
            return;
        }

        // 4. جلب الطلبات الجديدة
        console.log('4️⃣  جلب الطلبات بعد الإضافة...');
        const ordersRes2 = await makeRequest('GET', '/orders?limit=5');
        console.log(`✅ عدد الطلبات: ${ordersRes2.body.total}`);
        console.log(`   الطلبات:`);
        ordersRes2.body.orders.forEach((order, i) => {
            console.log(`   ${i + 1}. ${order.order_id} - ${order.customer_name}`);
        });
        console.log();

        // 5. جلب إحصائيات العملاء
        console.log('5️⃣  جلب إحصائيات العملاء...');
        const statsRes = await makeRequest('GET', '/stats/customers');
        if (statsRes.status === 200) {
            const stats = statsRes.body.statistics;
            console.log(`✅ الإحصائيات:`);
            console.log(`   • عدد العملاء المميزين: ${stats.total_customers}`);
            console.log(`   • إجمالي الطلبات: ${stats.total_orders}`);
            console.log(`   • إجمالي الإيرادات: ${stats.total_revenue} دج`);
            console.log(`   • أسماء العملاء: ${stats.customer_names.join(', ')}`);
        } else {
            console.log(`❌ خطأ في جلب الإحصائيات`);
        }

        console.log('\n✅ اكتمل الاختبار بنجاح!');

    } catch (error) {
        console.error('❌ خطأ:', error.message);
        console.log('\n💡 تأكد من أن السيرفر يعمل على http://localhost:3000');
    }
}

main();
