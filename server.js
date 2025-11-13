require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { databaseOperations } = require('./database');
const app = express();
const PORT = process.env.PORT || 3001;

// Email configuration
const emailTransporter = nodemailer.createTransport({
    service: 'gmail', // You can change this to your email provider
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com', // Set your email
        pass: process.env.EMAIL_PASS || 'your-app-password' // Set your app password
    }
});

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
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    databaseOperations.saveContactMessage(name, email, message, async (err, result) => {
        if (err) {
            console.error('Error saving contact message:', err);
            res.status(500).json({ error: 'Failed to save contact message' });
        } else {
            // Send email notification to seller
            try {
                await emailTransporter.sendMail({
                    from: process.env.EMAIL_USER || 'your-email@gmail.com',
                    to: process.env.SELLER_EMAIL || 'seller@example.com', // Set your seller email
                    subject: 'New Contact Message - Soft Haven',
                    html: `
                        <h2>New Contact Message Received</h2>
                        <p><strong>From:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Message:</strong></p>
                        <p>${message}</p>
                        <hr>
                        <p><em>Received at: ${new Date().toLocaleString()}</em></p>
                    `
                });
                console.log('Contact notification email sent successfully');
            } catch (emailError) {
                console.error('Error sending contact notification email:', emailError);
                // Don't fail the request if email fails
            }

            res.json({ success: true, message: 'Thank you for your message! We will get back to you soon.' });
        }
    });
});

// User signup
app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    try {
        // Check if user already exists
        databaseOperations.getUserByEmail(email, (err, existingUser) => {
            if (err) {
                console.error('Error checking user:', err);
                return res.status(500).json({ error: 'Server error' });
            }

            if (existingUser) {
                return res.status(400).json({ error: 'User with this email already exists' });
            }

            // Hash password
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    console.error('Error hashing password:', err);
                    return res.status(500).json({ error: 'Server error' });
                }

                // Create user
                databaseOperations.createUser(name, email, hashedPassword, (err, result) => {
                    if (err) {
                        console.error('Error creating user:', err);
                        return res.status(500).json({ error: 'Failed to create user' });
                    }

                    res.json({ success: true, message: 'User created successfully', userId: result.id });
                });
            });
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Forgot password
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    databaseOperations.getUserByEmail(email, async (err, user) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        if (!user) {
            // Don't reveal if email exists or not for security
            return res.json({ success: true, message: 'If an account with this email exists, a password reset link has been sent.' });
        }

        // Generate reset token (simple approach - in production use JWT)
        const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const resetExpiry = Date.now() + 3600000; // 1 hour

        // Store reset token (in production, store in database)
        // For now, we'll send the token directly in email

        try {
            await emailTransporter.sendMail({
                from: process.env.EMAIL_USER || 'your-email@gmail.com',
                to: email,
                subject: 'Password Reset - Soft Haven',
                html: `
                    <h2>Password Reset Request</h2>
                    <p>You requested a password reset for your Soft Haven account.</p>
                    <p>Your reset token is: <strong>${resetToken}</strong></p>
                    <p>This token will expire in 1 hour.</p>
                    <p>If you didn't request this reset, please ignore this email.</p>
                    <p>Use this token on the password reset page to create a new password.</p>
                    <hr>
                    <p><em>Soft Haven Team</em></p>
                `
            });

            console.log('Password reset email sent successfully');
            res.json({ success: true, message: 'If an account with this email exists, a password reset link has been sent.' });
        } catch (emailError) {
            console.error('Error sending password reset email:', emailError);
            res.status(500).json({ error: 'Failed to send reset email. Please try again.' });
        }
    });
});

// User login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    databaseOperations.getUserByEmail(email, (err, user) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Error comparing password:', err);
                return res.status(500).json({ error: 'Server error' });
            }

            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // For simplicity, we'll use a session-based approach
            // In production, you'd want to use JWT or proper session management
            const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

            res.json({
                success: true,
                message: 'Login successful',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                },
                sessionId: sessionId
            });
        });
    });
});

// Create order
app.post('/api/orders', async (req, res) => {
    const { customer_name, customer_email, customer_phone, delivery_address, payment_method, sessionId } = req.body;

    try {
        // Get cart items
        databaseOperations.getCartItems(sessionId, async (err, cartItems) => {
            if (err) {
                console.error('Error fetching cart:', err);
                return res.status(500).json({ error: 'Failed to fetch cart items' });
            }

            if (cartItems.length === 0) {
                return res.status(400).json({ error: 'Cart is empty' });
            }

            // Calculate total
            const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // Create order
            const orderData = {
                customer_name,
                customer_email,
                customer_phone,
                delivery_address,
                payment_method,
                order_items: cartItems,
                total_amount: totalAmount
            };

            databaseOperations.createOrder(orderData, async (err, result) => {
                if (err) {
                    console.error('Error creating order:', err);
                    return res.status(500).json({ error: 'Failed to create order' });
                }

                // Send email notification to seller
                try {
                    const orderItemsHtml = cartItems.map(item =>
                        `<li>${item.name} x ${item.quantity} - KSH ${item.price * item.quantity}</li>`
                    ).join('');

                    await emailTransporter.sendMail({
                        from: process.env.EMAIL_USER || 'your-email@gmail.com',
                        to: process.env.SELLER_EMAIL || 'seller@example.com',
                        subject: 'New Order Received - Soft Haven',
                        html: `
                            <h2>New Order Received!</h2>
                            <h3>Order #${result.id}</h3>
                            <p><strong>Customer:</strong> ${customer_name}</p>
                            <p><strong>Email:</strong> ${customer_email}</p>
                            <p><strong>Phone:</strong> ${customer_phone}</p>
                            <p><strong>Delivery Address:</strong> ${delivery_address}</p>
                            <p><strong>Payment Method:</strong> ${payment_method}</p>
                            <h4>Order Items:</h4>
                            <ul>${orderItemsHtml}</ul>
                            <p><strong>Total Amount: KSH ${totalAmount}</strong></p>
                            <hr>
                            <p><em>Order placed at: ${new Date().toLocaleString()}</em></p>
                        `
                    });

                    // Send confirmation email to customer
                    await emailTransporter.sendMail({
                        from: process.env.EMAIL_USER || 'your-email@gmail.com',
                        to: customer_email,
                        subject: 'Order Confirmation - Soft Haven',
                        html: `
                            <h2>Thank you for your order!</h2>
                            <p>Dear ${customer_name},</p>
                            <p>Your order has been received successfully. Here are the details:</p>
                            <h3>Order #${result.id}</h3>
                            <h4>Order Items:</h4>
                            <ul>${orderItemsHtml}</ul>
                            <p><strong>Total Amount: KSH ${totalAmount}</strong></p>
                            <p><strong>Delivery Address:</strong> ${delivery_address}</p>
                            <p><strong>Payment Method:</strong> ${payment_method}</p>
                            <p>We will contact you soon regarding delivery arrangements.</p>
                            <p>Thank you for shopping with Soft Haven!</p>
                            <hr>
                            <p><em>Order placed at: ${new Date().toLocaleString()}</em></p>
                        `
                    });

                    console.log('Order notification emails sent successfully');
                } catch (emailError) {
                    console.error('Error sending order notification emails:', emailError);
                    // Don't fail the request if email fails
                }

                // Clear cart after successful order
                databaseOperations.clearCart(sessionId, (err, clearResult) => {
                    if (err) {
                        console.error('Error clearing cart:', err);
                    }
                });

                res.json({
                    success: true,
                    message: 'Order placed successfully! Check your email for confirmation.',
                    orderId: result.id
                });
            });
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin routes
app.get('/api/admin/orders', (req, res) => {
    // Simple admin authentication - in production, use proper authentication
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    databaseOperations.getAllOrders((err, orders) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).json({ error: 'Failed to fetch orders' });
        }

        res.json(orders);
    });
});

app.get('/api/admin/contact-messages', (req, res) => {
    // Simple admin authentication
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    db.all("SELECT * FROM contact_messages ORDER BY created_at DESC", (err, messages) => {
        if (err) {
            console.error('Error fetching contact messages:', err);
            return res.status(500).json({ error: 'Failed to fetch messages' });
        }

        res.json(messages);
    });
});

app.put('/api/admin/orders/:id/status', (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { status } = req.body;

    databaseOperations.updateOrderStatus(id, status, (err, result) => {
        if (err) {
            console.error('Error updating order status:', err);
            return res.status(500).json({ error: 'Failed to update order status' });
        }

        res.json({ success: true, message: 'Order status updated successfully' });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;