// SIMULATED DATABASE
const products = [
    { id: 1, name: "Paracetamol 500mg (20 tabletas)", category: "Farmacia", price: 45.00, stock: 120, barcode: "75010001", expiry: "2025-12-01" },
    { id: 2, name: "Amoxicilina 500mg Capsulas", category: "Farmacia", price: 120.50, stock: 45, barcode: "75010002", expiry: "2025-06-15" },
    { id: 3, name: "Alcohol Etílico 70% 500ml", category: "Higiene", price: 35.00, stock: 68, barcode: "75010003", expiry: "2026-01-10" },
    { id: 4, name: "Gasa Estéril 10x10cm (Caja 10pza)", category: "Farmacia", price: 28.00, stock: 5, barcode: "75010004", expiry: "2027-03-20" },
    { id: 5, name: "Cuaderno Raya 100hj Profesional", category: "Papelería", price: 18.00, stock: 154, barcode: "75010005", expiry: "N/A" },
    { id: 6, name: "Lápiz Grafito #2 (Paquete 12pza)", category: "Papelería", price: 42.00, stock: 12, barcode: "75010006", expiry: "N/A" },
    { id: 7, name: "Caja de Colores 24 pzas", category: "Papelería", price: 95.00, stock: 35, barcode: "75010007", expiry: "N/A" },
    { id: 8, name: "Jarabe Tos Infantil (Fresa)", category: "Farmacia", price: 89.90, stock: 3, barcode: "75010008", expiry: "2025-05-10" },
];

let cart = [];
let currentUser = null;

// DOM ELEMENTS - NAVIGATION
const loginScreen = document.getElementById('login-screen');
const appWrapper = document.getElementById('app-wrapper');
const loginForm = document.getElementById('login-form');
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');
const screenTitle = document.getElementById('current-screen-title');

// DOM ELEMENTS - POS
const posSearchInput = document.getElementById('pos-barcode-search');
const posSearchResults = document.getElementById('pos-search-results');
const cartList = document.getElementById('cart-list');
const cartTotal = document.getElementById('cart-total');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartTax = document.getElementById('cart-tax');

// 1️⃣ INITIAL LOGIN HANDLER
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    
    // Simple simulation: any username works
    currentUser = { name: username === 'admin' ? 'Administrador Olam' : 'Cajero 1', role: 'admin' };
    document.getElementById('current-user-name').innerText = currentUser.name;

    showNotification(`Bienvenido, ${currentUser.name}`, 'success');
    
    loginScreen.classList.add('hidden');
    appWrapper.classList.remove('hidden');
    switchView('dashboard');
});

// 2️⃣ NAVIGATION LOGIC
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        if (item.id === 'logout-btn') {
            logout();
            return;
        }
        
        const screenId = item.getAttribute('data-screen');
        if (screenId) {
            switchView(screenId);
        }
    });
});

function switchView(viewId) {
    // UI Update
    views.forEach(view => view.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
    
    navItems.forEach(nav => nav.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-screen="${viewId}"]`);
    if (activeNav) activeNav.classList.add('active');

    // Title Title Update
    const titles = {
        'dashboard': 'Panel Principal / Dashboard',
        'pos': 'Punto de Venta (Nueva Venta)',
        'inventory': 'Gestión de Inventario',
        'reports': 'Reportes y Analítica',
        'users': 'Gestión de Usuarios'
    };
    screenTitle.innerText = `Módulo: ${titles[viewId] || viewId}`;

    // Refresh Data for specific views
    if (viewId === 'inventory') renderInventory();
    if (viewId === 'pos') renderPOSSearch('');
}

function logout() {
    currentUser = null;
    appWrapper.classList.add('hidden');
    loginScreen.classList.remove('hidden');
}

// 3️⃣ POS MODULE LOGIC
posSearchInput.addEventListener('input', (e) => {
    renderPOSSearch(e.target.value);
});

function renderPOSSearch(query = '') {
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.barcode.includes(query)
    );

    posSearchResults.innerHTML = filtered.map(p => `
        <tr>
            <td>
                <strong>${p.name}</strong><br>
                <small class="text-muted">${p.barcode}</small>
            </td>
            <td>$${p.price.toFixed(2)}</td>
            <td>
                <span class="${p.stock < 10 ? 'text-danger font-bold' : ''}">
                    ${p.stock} pzas
                </span>
            </td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="addToCart(${p.id})">
                    <i class="fas fa-plus"></i> Agregar
                </button>
            </td>
        </tr>
    `).join('');
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (product.stock <= 0) {
        showNotification('¡Producto agotado!', 'error');
        return;
    }

    const cartItem = { 
        instanceId: Date.now(), 
        ...product,
        qty: 1 
    };
    
    cart.push(cartItem);
    updateCartUI();
    showNotification(`Agregado: ${product.name}`);
}

function removeFromCart(instanceId) {
    cart = cart.filter(item => item.instanceId !== instanceId);
    updateCartUI();
}

function updateCartUI() {
    if (cart.length === 0) {
        cartList.innerHTML = '<div class="empty-cart-message">No hay productos en el carrito.</div>';
    } else {
        cartList.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)} x 1</div>
                </div>
                <div class="cart-item-subtotal"><strong>$${item.price.toFixed(2)}</strong></div>
                <button class="btn-icon text-danger" onclick="removeFromCart(${item.instanceId})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    // Totals
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const tax = subtotal * 0.16;
    const total = subtotal + tax;

    cartSubtotal.innerText = `$${subtotal.toFixed(2)}`;
    cartTax.innerText = `$${tax.toFixed(2)}`;
    cartTotal.innerText = `$${total.toFixed(2)}`;
}

// 4️⃣ INVENTORY MODULE
function renderInventory() {
    const tableBody = document.getElementById('inventory-table-body');
    tableBody.innerHTML = products.map(p => `
        <tr>
            <td>#${p.id}</td>
            <td><strong>${p.name}</strong></td>
            <td>${p.category}</td>
            <td>$${p.price.toFixed(2)}</td>
            <td>
                <div class="stock-cell">
                    <span class="badge ${p.stock < 10 ? 'badge-danger' : 'badge-cashier'}">
                        ${p.stock} pzas
                    </span>
                    ${p.stock < 10 ? '<i class="fas fa-exclamation-triangle text-warning" title="Bajo Stock"></i>' : ''}
                </div>
            </td>
            <td>
                <span class="${isExpiringSoon(p.expiry) ? 'text-danger' : ''}">
                    ${p.expiry || 'N/A'}
                </span>
            </td>
            <td>
                <button class="btn-icon text-primary"><i class="fas fa-edit"></i></button>
                <button class="btn-icon text-danger"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function isExpiringSoon(dateStr) {
    if (!dateStr || dateStr === 'N/A') return false;
    const expiry = new Date(dateStr);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 90; // Warn if < 3 months
}

// 5️⃣ MODAL MANAGEMENT
const productModal = document.getElementById('product-modal');
const paymentModal = document.getElementById('payment-modal');
const closeButtons = document.querySelectorAll('.close-modal');

document.getElementById('btn-open-add-product')?.addEventListener('click', () => {
    productModal.classList.remove('hidden');
});

closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        productModal.classList.add('hidden');
        paymentModal.classList.add('hidden');
    });
});

// POS FINALIZATION
document.getElementById('btn-finish-sale').addEventListener('click', () => {
    if (cart.length === 0) {
        showNotification('El carrito está vacío', 'error');
        return;
    }
    
    document.getElementById('payment-total-amount').innerText = cartTotal.innerText;
    paymentModal.classList.remove('hidden');
});

document.getElementById('cash-received').addEventListener('input', (e) => {
    const received = parseFloat(e.target.value) || 0;
    const total = parseFloat(cartTotal.innerText.replace('$', '')) || 0;
    const change = received - total;
    document.getElementById('change-amount').innerText = `$${Math.max(0, change).toFixed(2)}`;
});

document.getElementById('btn-confirm-payment').addEventListener('click', () => {
    const received = parseFloat(document.getElementById('cash-received').value) || 0;
    const total = parseFloat(cartTotal.innerText.replace('$', '')) || 0;

    if (received < total) {
        showNotification('Efectivo insuficiente', 'error');
        return;
    }

    // Success Loop
    showNotification('¡Venta realizada con éxito!', 'success');
    paymentModal.classList.add('hidden');
    cart = [];
    updateCartUI();
    document.getElementById('cash-received').value = '';
    document.getElementById('change-amount').innerText = '$0.00';
    switchView('dashboard');
});

document.getElementById('btn-cancel-sale').addEventListener('click', () => {
    if (confirm('¿Está seguro de cancelar la venta actual?')) {
        cart = [];
        updateCartUI();
        showNotification('Venta cancelada');
    }
});

// 6️⃣ UTILS
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const msgSpan = document.getElementById('notification-message');
    
    notification.style.display = 'flex';
    notification.style.borderLeft = type === 'error' ? '5px solid #e74c3c' : '5px solid #2ecc71';
    msgSpan.innerText = message;
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Initialize
renderPOSSearch('');
