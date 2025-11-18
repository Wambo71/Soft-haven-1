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

// API base URL - dynamically uses current domain
const API_BASE_URL = window.location.origin + '/api';
// Cart functionality - now uses API
let sessionId = localStorage.getItem('sessionId') || generateSessionId();
localStorage.setItem('sessionId', sessionId);

// User authentication state
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let userSessionId = localStorage.getItem('userSessionId') || null;

// Check if user is authenticated
function isAuthenticated() {
    return currentUser !== null && userSessionId !== null;
}

// Protect routes - redirect to login if not authenticated
function protectRoute() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Allow access to signup and login pages without authentication
    const publicPages = ['signup.html', 'login.html'];

    if (!isAuthenticated() && !publicPages.includes(currentPage)) {
        // Store current page for redirect after login
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = 'login.html';
        return false;
    }

    return true;
}

// Update navigation based on authentication state
function updateNavigation() {
    const nav = document.querySelector('nav ul');
    if (!nav) return;

    // Remove existing auth links
    const existingAuthLinks = nav.querySelectorAll('li a[href*="signup"], li a[href*="login"], li.logout-link');
    existingAuthLinks.forEach(link => link.parentElement.remove());

    if (currentUser) {
        // User is logged in - show logout
        const logoutLi = document.createElement('li');
        logoutLi.innerHTML = '<a href="#" class="logout-link">Logout</a>';
        nav.appendChild(logoutLi);

        // Add logout event listener
        logoutLi.querySelector('.logout-link').addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    } else {
        // User is not logged in - show signup/login
        const signupLi = document.createElement('li');
        signupLi.innerHTML = '<a href="signup.html">Sign Up</a>';
        nav.appendChild(signupLi);

        const loginLi = document.createElement('li');
        loginLi.innerHTML = '<a href="login.html">Login</a>';
        nav.appendChild(loginLi);
    }
}

// Protect navigation links
function protectNavigationLinks() {
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');

        // Skip signup and login links
        if (href && (href.includes('signup.html') || href.includes('login.html') || href.includes('#'))) {
            return;
        }

        link.addEventListener('click', function(e) {
            if (!isAuthenticated()) {
                e.preventDefault();
                // Store current page for redirect after login
                sessionStorage.setItem('redirectAfterLogin', window.location.href);
                window.location.href = 'login.html';
            }
        });
    });
}

// Logout function
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('userSessionId');
    currentUser = null;
    userSessionId = null;
    updateNavigation();
    alert('Logged out successfully!');
    window.location.href = 'index.html';
}

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
    // Initialize authentication state
    updateNavigation();

    // Protect routes on page load
    if (!protectRoute()) {
        return; // Stop execution if redirected to login
    }

    // Protect navigation links
    protectNavigationLinks();

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

    // Signup form submission
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Clear previous errors
            document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

            const formData = new FormData(signupForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirm-password')
            };

            // Client-side validation
            let isValid = true;

            if (data.name.length < 2) {
                document.getElementById('name-error').textContent = 'Name must be at least 2 characters';
                isValid = false;
            }

            if (!data.email.includes('@')) {
                document.getElementById('email-error').textContent = 'Please enter a valid email';
                isValid = false;
            }

            if (data.password.length < 6) {
                document.getElementById('password-error').textContent = 'Password must be at least 6 characters';
                isValid = false;
            }

            if (data.password !== data.confirmPassword) {
                document.getElementById('confirm-password-error').textContent = 'Passwords do not match';
                isValid = false;
            }

            if (!isValid) return;

            try {
                const response = await fetch(`${API_BASE_URL}/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: data.name,
                        email: data.email,
                        password: data.password
                    }),
                });
                const result = await response.json();

                if (response.ok) {
                    alert('Account created successfully! Please login.');
                    window.location.href = 'login.html';
                } else {
                    if (result.error.includes('email')) {
                        document.getElementById('email-error').textContent = result.error;
                    } else {
                        alert(result.error);
                    }
                }
            } catch (error) {
                console.error('Error signing up:', error);
                alert('Failed to create account. Please try again.');
            }
        });
    }

    // Forgot password link
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            if (!email || !email.includes('@')) {
                alert('Please enter a valid email address first.');
                return;
            }

            if (confirm(`Send password reset email to ${email}?`)) {
                fetch(`${API_BASE_URL}/forgot-password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                })
                .then(response => response.json())
                .then(result => {
                    alert(result.message || 'Password reset email sent!');
                })
                .catch(error => {
                    console.error('Error sending reset email:', error);
                    alert('Failed to send reset email. Please try again.');
                });
            }
        });
    }

    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Clear previous errors
            document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

            const formData = new FormData(loginForm);
            const data = {
                email: formData.get('email'),
                password: formData.get('password')
            };

            // Client-side validation
            let isValid = true;

            if (!data.email.includes('@')) {
                document.getElementById('email-error').textContent = 'Please enter a valid email';
                isValid = false;
            }

            if (data.password.length < 1) {
                document.getElementById('password-error').textContent = 'Password is required';
                isValid = false;
            }

            if (!isValid) return;

            try {
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
                const result = await response.json();

                if (response.ok) {
                    // Store user session
                    localStorage.setItem('user', JSON.stringify(result.user));
                    localStorage.setItem('userSessionId', result.sessionId);
                    currentUser = result.user;
                    userSessionId = result.sessionId;
                    alert('Login successful!');

                    // Redirect to stored page or home
                    const redirectTo = sessionStorage.getItem('redirectAfterLogin') || 'index.html';
                    sessionStorage.removeItem('redirectAfterLogin');
                    window.location.href = redirectTo;
                } else {
                    if (result.error.includes('email') || result.error.includes('password')) {
                        document.getElementById('email-error').textContent = result.error;
                    } else {
                        alert(result.error);
                    }
                }
            } catch (error) {
                console.error('Error logging in:', error);
                alert('Failed to login. Please try again.');
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
                customer_name: formData.get('name'),
                customer_email: formData.get('email'),
                customer_phone: formData.get('phone'),
                delivery_address: formData.get('address'),
                payment_method: formData.get('payment'),
                sessionId: sessionId
            };

            try {
                const response = await fetch(`${API_BASE_URL}/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (response.ok) {
                    alert(result.message);
                    // Update cart count after clearing cart
                    updateCartCount();
                    window.location.href = 'index.html';
                } else {
                    alert(result.error || 'Failed to place order. Please try again.');
                }
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