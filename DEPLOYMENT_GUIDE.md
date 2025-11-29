# 🚀 دليل النشر على VPS - Root Forest

دليل شامل خطوة بخطوة لنشر موقع Root Forest على خادم VPS باستخدام Linux و Nginx.

## المتطلبات

- خادم VPS مع Linux (Ubuntu 20.04 أو أحدث)
- اسم نطاق (Domain)
- الوصول إلى SSH
- معرفة أساسية بسطر الأوامر

## 📋 الخطوات السريعة (30 دقيقة)

### 1️⃣ الاتصال بالخادم

```bash
ssh root@your-server-ip
# أو
ssh user@your-server-ip
```

### 2️⃣ تحديث النظام

```bash
sudo apt update
sudo apt upgrade -y
```

### 3️⃣ تثبيت Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4️⃣ إنشاء مجلد الموقع

```bash
sudo mkdir -p /var/www/html/root-forest
sudo chown -R $USER:$USER /var/www/html/root-forest
cd /var/www/html/root-forest
```

### 5️⃣ نسخ ملفات الموقع

من جهازك المحلي:

```bash
# خيار 1: استخدام SCP
scp index.html user@your-server-ip:/var/www/html/root-forest/

# خيار 2: استخدام Git (إذا كنت تستخدم Git)
cd /var/www/html/root-forest
git clone your-repo-url .
```

### 6️⃣ إعداد Nginx

```bash
sudo nano /etc/nginx/sites-available/root-forest
```

انسخ الإعدادات من `nginx-config-example.conf`، ثم:

```bash
# فعّل الموقع
sudo ln -s /etc/nginx/sites-available/root-forest /etc/nginx/sites-enabled/

# عطّل الإعداد الافتراضي (اختياري)
sudo rm /etc/nginx/sites-enabled/default

# تحقق من الإعدادات
sudo nginx -t

# أعد تشغيل Nginx
sudo systemctl restart nginx
```

### 7️⃣ إضافة SSL بـ Certbot (مهم جداً)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

اتبع التعليمات على الشاشة. سيتم تحديث إعدادات Nginx تلقائياً.

### 8️⃣ فتح جدار الحماية (إذا كان مفعلاً)

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 9️⃣ اختبر الموقع

```
https://your-domain.com
```

✅ يجب أن ترى الموقع يعمل بشكل صحيح!

---

## 🔧 إعداد API (اختياري)

إذا كنت تريد استخدام خادم Node.js للـ API:

### 1. تثبيت Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
npm --version
node --version
```

### 2. نسخ ملفات API

```bash
sudo mkdir -p /var/www/root-forest-api
sudo chown -R www-data:www-data /var/www/root-forest-api
cd /var/www/root-forest-api

# انسخ الملفات
sudo cp server.js package.json /var/www/root-forest-api/
```

### 3. تثبيت المتطلبات

```bash
cd /var/www/root-forest-api
npm install
```

### 4. إعداد Systemd Service

```bash
sudo cp systemd-service-example.service /etc/systemd/system/root-forest-api.service
sudo systemctl daemon-reload
sudo systemctl enable root-forest-api
sudo systemctl start root-forest-api
```

### 5. التحقق من الخادم

```bash
sudo systemctl status root-forest-api
# أو
curl http://localhost:3000
```

### 6. تحديث إعدادات Nginx

تأكد من أن إعدادات Nginx تتضمن:

```nginx
location /api/ {
    proxy_pass http://localhost:3000;
    # ... بقية الإعدادات
}
```

---

## 🌐 تخطيط النطاق (DNS)

أضف هذه السجلات في لوحة التحكم الخاصة بمسجل النطاق:

| النوع | الاسم | القيمة |
|------|-------|--------|
| A | @ | your-server-ip |
| A | www | your-server-ip |
| CNAME | www | your-domain.com |

انتظر 24 ساعة لانتشار DNS.

---

## 📊 المراقبة والإدارة

### عرض سجلات Nginx

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### عرض حالة الخادم

```bash
ps aux | grep nginx
ps aux | grep node
```

### إعادة تشغيل الخدمات

```bash
sudo systemctl restart nginx
sudo systemctl restart root-forest-api
```

### مراقبة استخدام الموارد

```bash
free -h                    # الذاكرة
df -h                      # المساحة
top                        # المعالج
```

---

## 🔐 الأمان - نصائح مهمة

### 1. تحديث منتظم

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. تفعيل جدار الحماية

```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
```

### 3. إنشاء مستخدم جديد (بدلاً من root)

```bash
sudo useradd -m -s /bin/bash webapp
sudo usermod -aG sudo webapp
```

### 4. تحديث SSL تلقائياً

Certbot يفعل هذا تلقائياً:

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### 5. حماية SSH

```bash
sudo nano /etc/ssh/sshd_config
# غيّر:
# Port 22 → Port 2222 (أو منفذ آخر)
# PermitRootLogin no
# PasswordAuthentication no (استخدم مفاتيح SSH)

sudo systemctl restart sshd
```

---

## 📝 التخصيص والصيانة

### تغيير سعر المنتج

```bash
nano /var/www/html/root-forest/index.html
```

ابحث عن:
```javascript
const PRODUCT_PRICE = 1200;
```
غيّره إلى السعر المطلوب.

### تغيير أسعار الشحن

في نفس الملف، جد:
```javascript
const SHIPPING_COSTS = {
    'algiers': 500,
    // ... إضافة المزيد
};
```

### تغيير الألوان

ابحث عن:
```css
:root {
    --primary-green: #2d5016;
    // ... الألوان الأخرى
}
```

بعد كل تغيير:

```bash
sudo systemctl reload nginx
```

---

## 🆘 استكشاف الأخطاء

### ❌ الموقع لا يفتح

1. تحقق من Nginx:
```bash
sudo systemctl status nginx
sudo nginx -t
```

2. تحقق من المجلد:
```bash
ls -la /var/www/html/root-forest/
```

3. تحقق من الصلاحيات:
```bash
sudo chown -R www-data:www-data /var/www/html/root-forest
sudo chmod -R 755 /var/www/html/root-forest
```

### ❌ SSL لا يعمل

```bash
sudo certbot renew --dry-run
sudo certbot certificates
```

### ❌ API لا يعمل

```bash
sudo systemctl status root-forest-api
sudo journalctl -u root-forest-api -f
curl http://localhost:3000
```

### ❌ أداء الخادم بطيء

```bash
# تحقق من الموارد
free -h
df -h
ps aux --sort=-%cpu

# تحقق من السجلات
sudo tail -100 /var/log/nginx/error.log
```

---

## 📈 الترقيات والتحسينات

### تفعيل HTTP/2

تأكد من أن إعدادات Nginx تحتوي على:
```nginx
listen 443 ssl http2;
```

### تفعيل الضغط

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### التخزين المؤقت

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### CDN (اختياري)

استخدم Cloudflare أو CDN آخر لتسريع التحميل.

---

## 🔄 النسخ الاحتياطية

### نسخة احتياطية يومية

```bash
sudo crontab -e
```

أضف:
```
0 2 * * * tar -czf /backup/root-forest-$(date +\%Y-\%m-\%d).tar.gz /var/www/html/root-forest
```

### التعافي من النسخة الاحتياطية

```bash
sudo tar -xzf /backup/root-forest-2025-11-28.tar.gz -C /var/www/html/
```

---

## 📞 الدعم والمساعدة

### السجلات المهمة

```bash
# سجلات Nginx
/var/log/nginx/access.log
/var/log/nginx/error.log

# سجلات النظام
journalctl -f

# سجلات API
sudo journalctl -u root-forest-api -f
```

### أوامر مفيدة للتصحيح

```bash
# تحقق من الملفات
sudo find /var/www/html/root-forest -type f -ls

# تحقق من الحقوق
ls -laR /var/www/html/root-forest

# اختبر الاتصال
wget https://your-domain.com
curl -I https://your-domain.com

# اختبر API
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

---

## ✅ قائمة التحقق النهائية

- [ ] تم تثبيت Nginx بنجاح
- [ ] ملفات الموقع موجودة في `/var/www/html/root-forest/`
- [ ] تم تكوين SSL و HTTPS
- [ ] الموقع متاح على https://your-domain.com
- [ ] localStorage يعمل (اختبر في الموقع)
- [ ] النموذج يعمل
- [ ] API مثبتة وتعمل (إن وجدت)
- [ ] جدار الحماية مفعل
- [ ] النسخ الاحتياطية مفعلة
- [ ] المراقبة تعمل

---

## 📅 الصيانة الدورية

| التكرار | المهمة |
|--------|--------|
| يومي | مراقبة السجلات |
| أسبوعي | تحديث النظام |
| شهري | تحديث المكتبات |
| ربع سنوي | مراجعة الأداء |
| سنوي | مراجعة الأمان |

---

**آخر تحديث:** 2025-11-28  
**الإصدار:** 1.0  
حظ موفق! 🎉

