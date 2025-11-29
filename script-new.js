// ==================== Configuration ==================== 
const PRODUCT = {
    id: 'root-forest',
    name: 'Root Forest مسحوق بروتين',
    price: 3800,
    unit: 'دج'
};

// ==================== Cart Management ==================== 
class Cart {
    constructor() {
        this.items = this.loadCart();
    }

    // تحميل السلة من LocalStorage
    loadCart() {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    }

    // حفظ السلة في LocalStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartUI();
    }

    // إضافة منتج
    addItem(product, quantity = 1) {
        const existing = this.items.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.items.push({ ...product, quantity });
        }
        this.saveCart();
        return true;
    }

    // حساب إجمالي السلة
    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // الحصول على عدد العناصر
    getItemCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    // تحديث واجهة السلة
    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = this.getItemCount();
        }
    }

    // مسح السلة
    clear() {
        this.items = [];
        this.saveCart();
    }
}

// إنشاء instance من السلة
const cart = new Cart();

// ==================== Toast Notification ==================== 
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// ==================== Modal Functions ==================== 
function showSuccessModal(message) {
    const modal = document.getElementById('successModal');
    const messageEl = document.getElementById('successMessage');
    messageEl.textContent = message;
    modal.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('show');
}

function showErrorModal(message) {
    const modal = document.getElementById('errorModal');
    const messageEl = document.getElementById('errorMessage');
    messageEl.textContent = message;
    modal.classList.add('show');
}

function closeErrorModal() {
    const modal = document.getElementById('errorModal');
    modal.classList.remove('show');
}

// ==================== Button Event Listeners ==================== 
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 تطبيق Root Forest جاهز');

    // زر إضافة إلى السلة
    const addToCartBtn = document.getElementById('addToCartBtn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            console.log('✅ تم الضغط على زر الإضافة');
            cart.addItem(PRODUCT, 1);
            showToast('✓ تمت إضافة المنتج إلى السلة');
            showSuccessModal('تمت إضافة المنتج إلى السلة بنجاح!');
        });
    }

    // زر اشتر الآن
    const buyNowBtn = document.getElementById('buyNowBtn');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', () => {
            console.log('✅ تم الضغط على زر الشراء');
            cart.addItem(PRODUCT, 1);
            // الانتقال إلى صفحة checkout
            window.location.href = './checkout-new.html';
        });
    }

    // زر السلة في الهيدر
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            console.log('🛒 عدد العناصر:', cart.getItemCount());
            alert(`السلة تحتوي على ${cart.getItemCount()} منتج`);
        });
    }

    // تحديث العداد عند التحميل
    cart.updateCartUI();

    // إغلاق المودالات عند الضغط خارجها
    document.addEventListener('click', (e) => {
        if (e.target.id === 'successModal') {
            closeModal();
        }
        if (e.target.id === 'errorModal') {
            closeErrorModal();
        }
    });
});

// ==================== Utilities ==================== 
console.log('📦 Root Forest Store Script Loaded');
