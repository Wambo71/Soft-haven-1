const express = require('express');
const cors = require('cors');
const path = require('path');
const { databaseOperations } = require('./database');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

// Products data is now handled by the database

// Cart storage is now handled by the database

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
    const { category } = req.query;
    databaseOperations.getProductsByCategory(category || 'all', (err, products) => {
        if (err) {
            console.error('Error fetching products:', err);
            res.status(500).json({ error: 'Failed to fetch products' });
        } else {
            res.json(products);
        }
    });
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    databaseOperations.getProductById(productId, (err, product) => {
        if (err) {
            console.error('Error fetching product:', err);
            res.status(500).json({ error: 'Failed to fetch product' });
        } else if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    });
});

// Get cart for a user (using session ID for simplicity)
app.get('/api/cart/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    databaseOperations.getCartItems(sessionId, (err, cartItems) => {
        if (err) {
            console.error('Error fetching cart:', err);
            res.status(500).json({ error: 'Failed to fetch cart' });
        } else {
            res.json(cartItems);
        }
    });
});

// Add item to cart
app.post('/api/cart/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const { productId, quantity = 1 } = req.body;

    databaseOperations.addToCart(sessionId, productId, quantity, (err, result) => {
        if (err) {
            console.error('Error adding to cart:', err);
            res.status(500).json({ error: 'Failed to add item to cart' });
        } else {
            // Fetch updated cart
            databaseOperations.getCartItems(sessionId, (err, cartItems) => {
                if (err) {
                    res.status(500).json({ error: 'Failed to fetch updated cart' });
                } else {
                    res.json(cartItems);
                }
            });
        }
    });
});

// Update cart item quantity
app.put('/api/cart/:sessionId/:productId', (req, res) => {
    const { sessionId, productId } = req.params;
    const { quantity } = req.body;

    databaseOperations.updateCartItem(sessionId, parseInt(productId), quantity, (err, result) => {
        if (err) {
            console.error('Error updating cart item:', err);
            res.status(500).json({ error: 'Failed to update cart item' });
        } else {
            // Fetch updated cart
            databaseOperations.getCartItems(sessionId, (err, cartItems) => {
                if (err) {
                    res.status(500).json({ error: 'Failed to fetch updated cart' });
                } else {
                    res.json(cartItems);
                }
            });
        }
    });
});

// Remove item from cart
app.delete('/api/cart/:sessionId/:productId', (req, res) => {
    const { sessionId, productId } = req.params;

    databaseOperations.removeFromCart(sessionId, parseInt(productId), (err, result) => {
        if (err) {
            console.error('Error removing from cart:', err);
            res.status(500).json({ error: 'Failed to remove item from cart' });
        } else {
            // Fetch updated cart
            databaseOperations.getCartItems(sessionId, (err, cartItems) => {
                if (err) {
                    res.status(500).json({ error: 'Failed to fetch updated cart' });
                } else {
                    res.json(cartItems);
                }
            });
        }
    });
});

// Clear cart
app.delete('/api/cart/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    databaseOperations.clearCart(sessionId, (err, result) => {
        if (err) {
            console.error('Error clearing cart:', err);
            res.status(500).json({ error: 'Failed to clear cart' });
        } else {
            res.json([]);
        }
    });
});

// Contact form submission
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    databaseOperations.saveContactMessage(name, email, message, (err, result) => {
        if (err) {
            console.error('Error saving contact message:', err);
            res.status(500).json({ error: 'Failed to save contact message' });
        } else {
            res.json({ success: true, message: 'Thank you for your message! We will get back to you soon.' });
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;