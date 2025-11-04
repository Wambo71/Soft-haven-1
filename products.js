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
    },
    // Add more products as needed
];

function getProductsByCategory(category) {
    if (category === 'all') {
        return products;
    }
    return products.filter(product => product.category === category);
}

function getProductById(id) {
    return products.find(product => product.id === id);
}