const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Products data (in a real app, this would come from a database)
const products = [
    {
        id: 1,
        name: "Egyptian Cotton Bedsheets",
        category: "bedsheets",
        price: 89.99,
        image: "images/bedsheets.jpg",
        description: "Luxurious 100% Egyptian cotton bedsheets for ultimate comfort."
    },
    {
        id: 2,
        name: "Down Duvet",
        category: "duvets",
        price: 149.99,
        image: "images/duvet.jpg",
        description: "Premium down-filled duvet for cozy nights."
    },
    {
        id: 3,
        name: "Shag Carpet",
        category: "carpets",
        price: 199.99,
        image: "images/carpet.jpg",
        description: "Soft and stylish shag carpet for your living room."
    },
    {
        id: 4,
        name: "Welcome Doormat",
        category: "doormats",
        price: 29.99,
        image: "images/doormat.jpg",
        description: "Durable and absorbent doormat to welcome guests."
    },
    {
        id: 5,
        name: "Memory Foam Pillow",
        category: "pillows",
        price: 49.99,
        image: "images/pillow.jpg",
        description: "Ergonomic memory foam pillow for better sleep."
    },
    {
        id: 6,
        name: "Silk Pillowcase",
        category: "pillowcases",
        price: 24.99,
        image: "images/pillowcase.jpg",
        description: "Smooth silk pillowcase to protect your hair and skin."
    },
    {
        id: 7,
        name: "Waterproof Mattress Protector",
        category: "mattress-protectors",
        price: 39.99,
        image: "images/mattress-protector.jpg",
        description: "Protect your mattress from spills and allergens."
    }
];

// In-memory cart storage (in a real app, this would be in a database)
let carts = {};

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
    const { category } = req.query;
    if (category && category !== 'all') {
        const filteredProducts = products.filter(product => product.category === category);
        res.json(filteredProducts);
    } else {
        res.json(products);
    }
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

// Get cart for a user (using session ID for simplicity)
app.get('/api/cart/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const cart = carts[sessionId] || [];
    res.json(cart);
});

// Add item to cart
app.post('/api/cart/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const { productId, quantity = 1 } = req.body;

    if (!carts[sessionId]) {
        carts[sessionId] = [];
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const existingItem = carts[sessionId].find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        carts[sessionId].push({ ...product, quantity });
    }

    res.json(carts[sessionId]);
});

// Update cart item quantity
app.put('/api/cart/:sessionId/:productId', (req, res) => {
    const { sessionId, productId } = req.params;
    const { quantity } = req.body;

    if (!carts[sessionId]) {
        return res.status(404).json({ error: 'Cart not found' });
    }

    const item = carts[sessionId].find(item => item.id === parseInt(productId));
    if (!item) {
        return res.status(404).json({ error: 'Item not found in cart' });
    }

    item.quantity = quantity;
    if (item.quantity <= 0) {
        carts[sessionId] = carts[sessionId].filter(item => item.id !== parseInt(productId));
    }

    res.json(carts[sessionId]);
});

// Remove item from cart
app.delete('/api/cart/:sessionId/:productId', (req, res) => {
    const { sessionId, productId } = req.params;

    if (!carts[sessionId]) {
        return res.status(404).json({ error: 'Cart not found' });
    }

    carts[sessionId] = carts[sessionId].filter(item => item.id !== parseInt(productId));
    res.json(carts[sessionId]);
});

// Clear cart
app.delete('/api/cart/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    carts[sessionId] = [];
    res.json(carts[sessionId]);
});

// Contact form submission
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    // In a real app, you would save this to a database or send an email
    console.log('Contact form submission:', { name, email, message });

    res.json({ success: true, message: 'Thank you for your message! We will get back to you soon.' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;