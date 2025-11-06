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
        id: 7,
        name: "Waterproof Mattress Protector",
        category: "mattress-protectors",
        price: 39.99,
        image: "images/mattress-protector.jpg",
        description: "Protect your mattress from spills and allergens."
    },
    {
        id: 8,
        name: "Mattress Protector 6x6",
        category: "mattress-protectors",
        price: 2200,
        image: "images/mattress-6x6.jpg",
        description: "Mattress protectors available in all sizes. Colours: white, grey, navy blue and sky blue."
    },
    {
        id: 9,
        name: "Mattress Protector 5x6",
        category: "mattress-protectors",
        price: 2000,
        image: "images/mattress-5x6.jpg",
        description: "Mattress protectors available in all sizes. Colours: white, navy blue, grey, maroon and purple."
    },
    {
        id: 10,
        name: "Mattress Protector 4x6",
        category: "mattress-protectors",
        price: 1800,
        image: "images/mattress-4x6.jpg",
        description: "Mattress protectors available in all sizes. Colours: sky blue, white, grey, purple and navy blue."
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