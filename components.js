import React from 'react';

const ProductCard = ({ product }) => {
    return (
        <div className="product-card" data-id={product.id}>
            <img src={product.image} alt={product.name} className="product-image" />
            <h3 className="product-name">{product.name}</h3>
            <p className="product-description">{product.description}</p>
            <p className="product-price">${product.price.toFixed(2)}</p>
            <button className="btn add-to-cart-btn" data-id={product.id}>Add to Cart</button>
        </div>
    );
};

const CartItem = ({ item }) => {
    return (
        <div className="cart-item" data-id={item.id}>
            <img src={item.image} alt={item.name} className="cart-item-image" />
            <div className="cart-item-details">
                <h4>{item.name}</h4>
                <p>${item.price.toFixed(2)} x {item.quantity}</p>
            </div>
            <button className="remove-btn" data-id={item.id}>Remove</button>
        </div>
    );
};

const Header = () => {
    return (
        <header>
            <div className="container">
                <h1>Soft Haven</h1>
                <nav>
                    <ul>
                        <li><a href="index.html">Home</a></li>
                        <li><a href="products.html">Products</a></li>
                        <li><a href="cart.html">Cart (<span id="cart-count">0</span>)</a></li>
                        <li><a href="about.html">About</a></li>
                        <li><a href="contact.html">Contact</a></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

const Footer = () => {
    return (
        <footer>
            <div className="container">
                <p>&copy; 2023 Soft Haven. All rights reserved.</p>
            </div>
        </footer>
    );
};
export { ProductCard, CartItem, Header, Footer };