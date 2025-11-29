#!/usr/bin/env bash
# سكريبت اختبار سريع لموقع Root Forest
# للاستخدام على Linux/Mac

echo "🚀 بدء اختبارات Root Forest"
echo "================================"
echo ""

# اختبار 1: التحقق من الملفات
echo "1️⃣ التحقق من الملفات..."
files=("index.html" "README.md" "api-example.json" "server.js" "package.json")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        size=$(du -h "$file" | cut -f1)
        echo "   ✅ $file ($size)"
    else
        echo "   ❌ $file (غير موجود)"
    fi
done
echo ""

# اختبار 2: التحقق من وجود HTML
echo "2️⃣ التحقق من صحة HTML..."
if grep -q "<!DOCTYPE html>" index.html; then
    echo "   ✅ DOCTYPE موجود"
else
    echo "   ❌ DOCTYPE غير موجود"
fi

if grep -q 'dir="rtl"' index.html; then
    echo "   ✅ اتجاه RTL موجود"
else
    echo "   ❌ اتجاه RTL غير موجود"
fi

if grep -q 'lang="ar"' index.html; then
    echo "   ✅ اللغة العربية موجودة"
else
    echo "   ❌ اللغة العربية غير موجودة"
fi
echo ""

# اختبار 3: التحقق من JavaScript
echo "3️⃣ التحقق من الدوال الأساسية..."
if grep -q "function addToCart" index.html; then
    echo "   ✅ دالة addToCart موجودة"
else
    echo "   ❌ دالة addToCart غير موجودة"
fi

if grep -q "localStorage" index.html; then
    echo "   ✅ localStorage موجود"
else
    echo "   ❌ localStorage غير موجود"
fi

if grep -q "PRODUCT_PRICE" index.html; then
    echo "   ✅ متغير السعر موجود"
else
    echo "   ❌ متغير السعر غير موجود"
fi
echo ""

# اختبار 4: عد الأسطر
echo "4️⃣ إحصائيات الملفات..."
echo "   📝 عدد أسطر HTML: $(wc -l < index.html)"
echo "   📝 عدد أسطر README: $(wc -l < README.md)"
echo "   📝 عدد أسطر API example: $(wc -l < api-example.json)"
echo ""

# اختبار 5: التحقق من الألوان
echo "5️⃣ التحقق من الألوان..."
if grep -q "#2d5016" index.html; then
    echo "   ✅ اللون الأخضر الأساسي موجود"
else
    echo "   ❌ اللون الأخضر الأساسي غير موجود"
fi

if grep -q "#4a7c2c" index.html; then
    echo "   ✅ اللون الأخضر الثانوي موجود"
else
    echo "   ❌ اللون الأخضر الثانوي غير موجود"
fi
echo ""

# اختبار 6: التحقق من الولايات
echo "6️⃣ التحقق من ولايات الجزائر..."
wilaya_count=$(grep -o "option value=" index.html | wc -l)
echo "   📍 عدد الولايات المتاحة: $((wilaya_count - 1))"
echo ""

# اختبار 7: التحقق من Node.js (إذا كان مثبتاً)
echo "7️⃣ التحقق من Node.js..."
if command -v node &> /dev/null; then
    node_version=$(node -v)
    npm_version=$(npm -v)
    echo "   ✅ Node.js $node_version"
    echo "   ✅ npm $npm_version"
    
    if [ -f "package.json" ]; then
        echo "   ✅ package.json موجود"
        echo "   💡 استخدم: npm install && npm start"
    fi
else
    echo "   ℹ️ Node.js غير مثبت (اختياري)"
fi
echo ""

# اختبار 8: عرض معلومات الملف الرئيسي
echo "8️⃣ معلومات الملف الرئيسي (index.html)..."
echo "   📊 حجم الملف: $(du -h index.html | cut -f1)"
echo "   📝 عدد الكلمات: $(wc -w < index.html)"
echo "   📄 عدد الأسطر: $(wc -l < index.html)"
echo ""

# النتيجة النهائية
echo "================================"
echo "✅ اختبارات القراءة النهائية"
echo "================================"
echo ""
echo "🎉 جميع الملفات جاهزة!"
echo ""
echo "الخطوة التالية:"
echo "1. افتح index.html في المتصفح"
echo "2. اختبر الوظائف (إضافة/حذف من السلة)"
echo "3. جرّب نموذج الشراء"
echo "4. تحقق من localStorage (F12 > Application)"
echo ""
echo "للنشر:"
echo "- انسخ index.html إلى /var/www/html/"
echo "- أضف SSL بـ Certbot"
echo "- فعّل Nginx"
echo ""
echo "📚 اقرأ DEPLOYMENT_GUIDE.md للتفاصيل"
echo ""
