// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count in header
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
}

// Add item to cart
function addToCart(productId) {
    const product = getProductById(productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        alert(`${product.name} added to cart!`);
    }
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

// Render cart items
function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    if (cartItems) {
        cartItems.innerHTML = cart.map(item => createCartItem(item)).join('');
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total.toFixed(2);
    }
}

// Render products
function renderProducts(category = 'all') {
    const productList = document.getElementById('product-list');
    if (productList) {
        const filteredProducts = getProductsByCategory(category);
        productList.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
    }
}

// Render featured products on home page
function renderFeaturedProducts() {
    const featuredProducts = document.getElementById('featured-products');
    if (featuredProducts) {
        const featured = products.slice(0, 3); // Show first 3 products as featured
        featuredProducts.innerHTML = featured.map(product => createProductCard(product)).join('');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();

    // Product filtering
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            renderProducts(this.dataset.category);
        });
    });

    // Add to cart buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId);
        }
    });

    // Remove from cart buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-btn')) {
            const productId = parseInt(e.target.dataset.id);
            removeFromCart(productId);
        }
    });

    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }

    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                alert('Your cart is empty!');
            } else {
                alert('Checkout functionality would be implemented here.');
            }
        });
    }

    // Initialize page-specific content
    if (document.getElementById('product-list')) {
        renderProducts();
    }
    if (document.getElementById('featured-products')) {
        renderFeaturedProducts();
    }
    if (document.getElementById('cart-items')) {
        renderCart();
    }
});