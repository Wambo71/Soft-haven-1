const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database path
const dbPath = path.join(__dirname, 'soft-haven.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    // Create products table
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            image TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating products table:', err.message);
        } else {
            console.log('Products table ready.');
            seedProducts();
        }
    });

    // Create cart table
    db.run(`
        CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products (id)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating cart_items table:', err.message);
        } else {
            console.log('Cart items table ready.');
        }
    });

    // Create contact_messages table
    db.run(`
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating contact_messages table:', err.message);
        } else {
            console.log('Contact messages table ready.');
        }
    });
}

// Seed initial products
function seedProducts() {
    const products = [
        {
            name: "3D Carpets",
            category: "carpets",
            price: 3000,
            image: "/images/3D carpets .jpg",
            description: "3D carpets made from high-quality materials that offer a plush and soft feel underfoot, enhancing comfort. Size 5*8 ksh 3000"
        },
        {
            name: "Velvet Duvet",
            category: "duvets",
            price: 3500,
            image: "/images/Velvet duvet.jpg",
            description: "One Bedsheet, Two Pillowcases, Size 6/7"
        },
        {
            name: "Bathroom Mat",
            category: "doormats",
            price: 800,
            image: "/images/Bathroom Mat.jpg",
            description: "Anti-slip Bathroom Mat ; 🌹Make the bathroom safe for everyone,including children and the elderly. The non-slip bath mat can be used on all types of bathrooms and showering areas. 🌹 It always allows the water to drain away, as the light texture remains gentle on your soles 💫 Size 50 cm by 80 cm ksh800"
        },
        {
            name: "Bedsheet",
            category: "bedsheets",
            price: 2200,
            image: "/images/Bedsheet.jpg",
            description: "Mix and match bedsheet 1 fitted 1 flat and 4 pillow case size 6*6 ksh2200"
        },
        {
            name: "Carpet",
            category: "carpets",
            price: 3000,
            image: "/images/carpet.jpg",
            description: "Heavy non Slip Absorbent Soft luxurious carpet for sitting room size 5*8 ksh3000"
        },
        {
            name: "Cotton Binded Duvet",
            category: "duvets",
            price: 3000,
            image: "/images/Cotton binded duvet.jpg",
            description: "Cotton binded duvets 1 bedsheet 2 pillow case 6*7 ksh3000"
        },
        {
            name: "Duvet",
            category: "duvets",
            price: 3000,
            image: "/images/Duvet.jpg",
            description: "available in all colours,, 1 bedsheet 2 pillow case 6*7 ksh3000"
        },
        {
            name: "Oval Rubber Bathroom Mat",
            category: "doormats",
            price: 800,
            image: "/images/oval rubber bathroom mat.jpg",
            description: "Super Absorbent oval rubber Mat,Slip-resistant Bath Room Mat,  Big size size 47x78cm Price ksh800"
        },
        {
            name: "Silk Duvet",
            category: "duvets",
            price: 4500,
            image: "/images/Silk Duvet.jpeg",
            description: "Heavy Silk Duvet , Duvet , 1 Bedsheet , 2  throw Pillowcases , 2 pillowcases 6*7 ksh4500"
        },
        {
            name: "Slip-resistant Bathroom Mat",
            category: "doormats",
            price: 800,
            image: "/images/Slip-resistant  bathroom mat.jpg",
            description: "Slip-resistant bathroom mat for enhanced safety. Similar to oval rubber bathroom mat. Price ksh 800"
        },
        {
            name: "Striped Binded Duvet",
            category: "duvets",
            price: 3000,
            image: "/images/Striped binded duvet.jpg",
            description: "Striped Binded Duvet Set, including One Bedsheet and Two Pillowcases in size 6x7, Available in White , Grey , Cream and Navy Blue ksh3000"
        },
        {
            name: "Mattress Protector 6x6",
            category: "mattress-protectors",
            price: 2200,
            image: "/images/mattress-6x6.jpg",
            description: "Mattress protectors available in all sizes. Colours: white, grey, navy blue and sky blue."
        },
        {
            name: "Mattress Protector 5x6",
            category: "mattress-protectors",
            price: 2000,
            image: "/images/mattress-5x6.jpg",
            description: "Mattress protectors available in all sizes. Colours: white, navy blue, grey, maroon and purple."
        },
        {
            name: "Mattress Protector 4x6",
            category: "mattress-protectors",
            price: 1800,
            image: "/images/mattress-4x6.jpg",
            description: "Mattress protectors available in all sizes. Colours: sky blue, white, grey, purple and navy blue."
        }
    ];

    // Check if products already exist
    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
        if (err) {
            console.error('Error checking products count:', err.message);
            return;
        }

        if (row.count === 0) {
            // Insert products
            const stmt = db.prepare(`
                INSERT INTO products (name, category, price, image, description)
                VALUES (?, ?, ?, ?, ?)
            `);

            products.forEach(product => {
                console.log('Seeding product:', product.name, '- Description:', product.description, '- Price:', product.price);
                stmt.run([
                    product.name,
                    product.category,
                    product.price,
                    product.image,
                    product.description
                ]);
            });

            stmt.finalize();
            console.log('Initial products seeded.');
            // Log current products for debugging
            db.all("SELECT * FROM products", (err, rows) => {
                if (err) {
                    console.error('Error fetching products:', err);
                } else {
                    console.log('Current products in database:');
                    rows.forEach(row => {
                        console.log(`ID: ${row.id}, Name: ${row.name}, Description: ${row.description}`);
                    });
                }
            });
        }
    });
}

// Database operations
const databaseOperations = {
    // Products operations
    getAllProducts: (callback) => {
        db.all("SELECT * FROM products ORDER BY id", callback);
    },

    getProductsByCategory: (category, callback) => {
        if (category === 'all') {
            databaseOperations.getAllProducts(callback);
        } else {
            db.all("SELECT * FROM products WHERE category = ? ORDER BY id", [category], callback);
        }
    },

    getProductById: (id, callback) => {
        db.get("SELECT * FROM products WHERE id = ?", [id], callback);
    },

    // Cart operations
    getCartItems: (sessionId, callback) => {
        const query = `
            SELECT ci.*, p.name, p.price, p.image, p.description
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.session_id = ?
            ORDER BY ci.created_at
        `;
        db.all(query, [sessionId], callback);
    },

    addToCart: (sessionId, productId, quantity, callback) => {
        // Check if item already exists in cart
        db.get(
            "SELECT * FROM cart_items WHERE session_id = ? AND product_id = ?",
            [sessionId, productId],
            (err, existingItem) => {
                if (err) {
                    callback(err);
                    return;
                }

                if (existingItem) {
                    // Update quantity
                    db.run(
                        "UPDATE cart_items SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                        [quantity, existingItem.id],
                        function(err) {
                            callback(err, { id: existingItem.id, session_id: sessionId, product_id: productId, quantity: existingItem.quantity + quantity });
                        }
                    );
                } else {
                    // Insert new item
                    db.run(
                        "INSERT INTO cart_items (session_id, product_id, quantity) VALUES (?, ?, ?)",
                        [sessionId, productId, quantity],
                        function(err) {
                            callback(err, { id: this.lastID, session_id: sessionId, product_id: productId, quantity });
                        }
                    );
                }
            }
        );
    },

    updateCartItem: (sessionId, productId, quantity, callback) => {
        if (quantity <= 0) {
            databaseOperations.removeFromCart(sessionId, productId, callback);
        } else {
            db.run(
                "UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE session_id = ? AND product_id = ?",
                [quantity, sessionId, productId],
                function(err) {
                    callback(err, { changes: this.changes });
                }
            );
        }
    },

    removeFromCart: (sessionId, productId, callback) => {
        db.run(
            "DELETE FROM cart_items WHERE session_id = ? AND product_id = ?",
            [sessionId, productId],
            function(err) {
                callback(err, { changes: this.changes });
            }
        );
    },

    clearCart: (sessionId, callback) => {
        db.run(
            "DELETE FROM cart_items WHERE session_id = ?",
            [sessionId],
            function(err) {
                callback(err, { changes: this.changes });
            }
        );
    },

    // Contact operations
    saveContactMessage: (name, email, message, callback) => {
        db.run(
            "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
            [name, email, message],
            function(err) {
                callback(err, { id: this.lastID });
            }
        );
    }
};

module.exports = { db, databaseOperations };