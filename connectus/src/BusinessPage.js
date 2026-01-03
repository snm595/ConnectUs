import React, { useState } from 'react';
import './BusinessPage.css';

function BusinessPage() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Handmade Soap",
      price: 5.99,
      description: "Natural, organic handmade soap",
      seller: "Jane's Organics",
      contact: "jane@email.com"
    },
    {
      id: 2,
      name: "Fresh Bread",
      price: 4.50,
      description: "Freshly baked sourdough bread",
      seller: "Local Bakery",
      contact: "bakery@email.com"
    }
  ]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    seller: '',
    contact: ''
  });

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (newProduct.name && newProduct.price && newProduct.description && newProduct.seller && newProduct.contact) {
      setProducts([...products, { 
        ...newProduct, 
        id: products.length + 1,
        price: parseFloat(newProduct.price) // Convert price to number
      }]);
      setNewProduct({
        name: '',
        price: '',
        description: '',
        seller: '',
        contact: ''
      });
    } else {
      alert('Please fill in all fields');
    }
  };

  const formatPrice = (price) => {
    // Ensure price is treated as a number and formatted with 2 decimal places
    return Number(price).toFixed(2);
  };

  return (
    <div className="business-page">
      <h1>Community Marketplace</h1>
      
      <div className="business-content">
        {/* Products List */}
        <div className="products-container">
          <h2>Available Products</h2>
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <h3>{product.name}</h3>
                <p className="price">${formatPrice(product.price)}</p>
                <p className="description">{product.description}</p>
                <div className="seller-info">
                  <p><strong>Seller:</strong> {product.seller}</p>
                  <p><strong>Contact:</strong> {product.contact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Product Form */}
        <div className="add-product-form">
          <h2>List Your Product</h2>
          <form onSubmit={handleAddProduct}>
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                placeholder="Enter product name"
              />
            </div>

            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                placeholder="Enter price"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                placeholder="Enter product description"
              />
            </div>

            <div className="form-group">
              <label>Seller Name</label>
              <input
                type="text"
                value={newProduct.seller}
                onChange={(e) => setNewProduct({...newProduct, seller: e.target.value})}
                placeholder="Enter seller name"
              />
            </div>

            <div className="form-group">
              <label>Contact Information</label>
              <input
                type="text"
                value={newProduct.contact}
                onChange={(e) => setNewProduct({...newProduct, contact: e.target.value})}
                placeholder="Enter contact information"
              />
            </div>

            <button type="submit" className="submit-button">List Product</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BusinessPage;
