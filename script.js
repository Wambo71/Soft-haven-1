// Product card creation function
function createProductCard(product) {
    return `
        <div class="product-card" data-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <p class="product-price">KSH ${product.price}</p>
            <button class="btn add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
        </div>
    `;
}

// Cart item creation function
function createCartItem(item) {
    return `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>KSH ${item.price} x ${item.quantity}</p>
            </div>
            <button class="remove-btn" data-id="${item.id}">Remove</button>
        </div>
    `;
}

// API base URL
const API_BASE_URL = 'http://localhost:3001/api';
// Cart functionality - now uses API
let sessionId = localStorage.getItem('sessionId') || generateSessionId();
localStorage.setItem('sessionId', sessionId);

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Update cart count in header
async function updateCartCount() {
    try {
        const response = await fetch(`${API_BASE_URL}/cart/${sessionId}`);
        const cart = await response.json();
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Add item to cart
async function addToCart(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/cart/${sessionId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId, quantity: 1 }),
        });
        const cart = await response.json();
        updateCartCount();
        alert('Product added to cart!');
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add product to cart');
    }
}

// Remove item from cart
async function removeFromCart(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/cart/${sessionId}/${productId}`, {
            method: 'DELETE',
        });
        const cart = await response.json();
        updateCartCount();
        renderCart();
    } catch (error) {
        console.error('Error removing from cart:', error);
    }
}

// Render cart items
async function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    if (cartItems) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/${sessionId}`);
            const cart = await response.json();
            cartItems.innerHTML = cart.map(item => createCartItem(item)).join('');
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotal.textContent = total;
        } catch (error) {
            console.error('Error rendering cart:', error);
            cartItems.innerHTML = '<p>Error loading cart</p>';
        }
    }
}

// Render checkout items
async function renderCheckout() {
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total');

    if (checkoutItems) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/${sessionId}`);
            const cart = await response.json();
            checkoutItems.innerHTML = cart.map(item => `
                <div class="checkout-item">
                    <p>${item.name} x ${item.quantity} - KSH ${item.price * item.quantity}</p>
                </div>
            `).join('');
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            checkoutTotal.textContent = total;
        } catch (error) {
            console.error('Error rendering checkout:', error);
            checkoutItems.innerHTML = '<p>Error loading checkout</p>';
        }
    }
}

// Render products
async function renderProducts(category = 'all') {
    const productList = document.getElementById('product-list');
    if (productList) {
        productList.innerHTML = '<p>Loading products...</p>';
        try {
            const response = await fetch(`${API_BASE_URL}/products?category=${category}`);
            const products = await response.json();
            productList.innerHTML = products.map(product => createProductCard(product)).join('');
        } catch (error) {
            console.error('Error fetching products:', error);
            productList.innerHTML = '<p>Error loading products</p>';
        }
    }
}

// Render featured products on home page
async function renderFeaturedProducts() {
    const featuredProducts = document.getElementById('featured-products');
    if (featuredProducts) {
        featuredProducts.innerHTML = '<p>Loading featured products...</p>';
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            const products = await response.json();
            const featured = products.slice(0, 3); // Show first 3 products as featured
            featuredProducts.innerHTML = featured.map(product => createProductCard(product)).join('');
        } catch (error) {
            console.error('Error fetching featured products:', error);
            featuredProducts.innerHTML = '<p>Error loading featured products</p>';
        }
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', async function() {
    await updateCartCount();

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
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                message: formData.get('message')
            };

            try {
                const response = await fetch(`${API_BASE_URL}/contact`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
                const result = await response.json();
                alert(result.message || 'Thank you for your message!');
                contactForm.reset();
            } catch (error) {
                console.error('Error submitting contact form:', error);
                alert('Failed to send message. Please try again.');
            }
        });
    }

    // Checkout form submission
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(checkoutForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                payment: formData.get('payment')
            };

            try {
                // Here you would typically send the order data to your backend
                // For now, we'll just show a success message
                alert('Order placed successfully! We will contact you soon.');
                // Clear cart after successful order
                await fetch(`${API_BASE_URL}/cart/${sessionId}`, {
                    method: 'DELETE',
                });
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Error placing order:', error);
                alert('Failed to place order. Please try again.');
            }
        });
    }

    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async function() {
            try {
                const response = await fetch(`${API_BASE_URL}/cart/${sessionId}`);
                const cart = await response.json();
                if (cart.length === 0) {
                    alert('Your cart is empty!');
                } else {
                    window.location.href = 'checkout.html';
                }
            } catch (error) {
                console.error('Error checking cart:', error);
                alert('Error checking cart. Please try again.');
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
    if (document.getElementById('checkout-items')) {
        renderCheckout();
    }
});