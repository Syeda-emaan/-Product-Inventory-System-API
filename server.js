const express = require('express');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Helper function for low stock warning
const checkLowStock = (quantity) => {
  if (quantity < 5) {
    return "WARNING: Low stock! Quantity is less than 5.";
  }
  return null;
};

// 1. POST /api/products - Create Product
app.post('/api/products', async (req, res) => {
  try {
    const { name, sku, quantity, price, category } = req.body;

    if (quantity < 0) {
      return res.status(400).json({ error: "Quantity cannot be negative." });
    }
    if (price <= 0) {
      return res.status(400).json({ error: "Price must be greater than 0." });
    }

    const query = `
      INSERT INTO products (name, sku, quantity, price, category, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, name, sku, quantity, price, category, created_at;
    `;
    const values = [name, sku, quantity, price, category];

    const newProduct = await db.query(query, values);
    
    console.log(`[Inventory Log] Created Product: ID ${newProduct.rows[0].id}, Name: ${name}`);

    res.status(201).json({
      product: newProduct.rows[0],
      warning: checkLowStock(quantity)
    });
  } catch (err) {
    console.error(err.message);
    
    // Check if error is due to duplicate SKU (PostgreSQL unique constraint violation error code is '23505')
    if (err.code === '23505') {
      return res.status(400).json({ error: "Product with this SKU already exists." });
    }

    res.status(500).send("Server Error");
  }
});

// 2. GET /api/products - Get All Products
app.get('/api/products', async (req, res) => {
  try {
    const query = `
      SELECT id, name, sku, quantity, price, category, created_at, updated_at 
      FROM products;
    `;
    const allProducts = await db.query(query);
    res.json(allProducts.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 3. GET /api/products/:id - Get Single Product By ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT id, name, sku, quantity, price, category, created_at, updated_at 
      FROM products 
      WHERE id = $1;
    `;
    const product = await db.query(query, [id]);

    if (product.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      product: product.rows[0],
      warning: checkLowStock(product.rows[0].quantity)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 4. PUT /api/products/:id - Update Product By ID
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, quantity, price, category } = req.body;

    if (quantity !== undefined && quantity < 0) {
      return res.status(400).json({ error: "Quantity cannot be negative." });
    }
    if (price !== undefined && price <= 0) {
      return res.status(400).json({ error: "Price must be greater than 0." });
    }

    const query = `
      UPDATE products 
      SET name = COALESCE($1, name),
          sku = COALESCE($2, sku),
          quantity = COALESCE($3, quantity),
          price = COALES_CE($4, price),
          category = COALESCE($5, category),
          updated_at = NOW()
      WHERE id = $6
      RETURNING id, name, sku, quantity, price, category, updated_at;
    `;
    const values = [name, sku, quantity, price, category, id];

    const updatedProduct = await db.query(query, values);

    if (updatedProduct.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    console.log(`[Inventory Log] Updated Product ID: ${id}`);

    res.json({
      product: updatedProduct.rows[0],
      warning: checkLowStock(updatedProduct.rows[0].quantity)
    });
  } catch (err) {
    console.error(err.message);
    
    if (err.code === '23505') {
      return res.status(400).json({ error: "Product with this SKU already exists." });
    }

    res.status(500).send("Server Error");
  }
});

// 5. DELETE /api/products/:id - Delete Product By ID
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteQuery = `
      DELETE FROM products 
      WHERE id = $1 
      RETURNING id, name;
    `;
    const deleted = await db.query(deleteQuery, [id]);

    if (deleted.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    console.log(`[Inventory Log] Deleted Product ID: ${id}`);
    res.json({ message: "Product deleted successfully", product: deleted.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});