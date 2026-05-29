import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { initDb, query, get, run } from './db.js';

const app = express();
const port = 3000;
const SECRET_KEY = 'super_secret_key_larek'; // In production, this should be in .env

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await query('SELECT * FROM products ORDER BY id DESC');
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', authenticateToken, async (req, res) => {
  const { name, category, price, description, image, brand, full_description, specs, in_stock } = req.body;
  if (req.user.role !== 'seller') {
    return res.status(403).json({ error: 'Only sellers can add products' });
  }
  if (!name || !category || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await run(
      'INSERT INTO products (name, category, price, description, image, seller_id, brand, full_description, specs, in_stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, category, price, description, image, req.user.id, brand || null, full_description || null, specs || null, in_stock !== undefined ? parseInt(in_stock) : 0]
    );
    res.json({ 
      id: result.id, 
      name, 
      category, 
      price, 
      description, 
      image, 
      seller_id: req.user.id,
      brand: brand || null,
      full_description: full_description || null,
      specs: specs || null,
      in_stock: in_stock !== undefined ? parseInt(in_stock) : 0
    });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, category, price, description, image, brand, full_description, specs, in_stock } = req.body;

  if (req.user.role !== 'seller') {
    return res.status(403).json({ error: 'Only sellers can edit products' });
  }

  if (!name || !category || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const product = await get('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the product owner can edit this product' });
    }

    await run(
      'UPDATE products SET name = ?, category = ?, price = ?, description = ?, image = ?, brand = ?, full_description = ?, specs = ?, in_stock = ? WHERE id = ?',
      [name, category, price, description, image, brand || null, full_description || null, specs || null, in_stock !== undefined ? parseInt(in_stock) : 0, id]
    );

    res.json({ 
      id: parseInt(id), 
      name, 
      category, 
      price, 
      description, 
      image, 
      seller_id: req.user.id,
      brand: brand || null,
      full_description: full_description || null,
      specs: specs || null,
      in_stock: in_stock !== undefined ? parseInt(in_stock) : 0
    });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'seller') {
    return res.status(403).json({ error: 'Only sellers can delete products' });
  }

  try {
    const product = await get('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the product owner can delete this product' });
    }

    await run('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product successfully deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/seller/products', authenticateToken, async (req, res) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({ error: 'Only sellers can view this' });
  }
  try {
    const products = await query('SELECT * FROM products WHERE seller_id = ? ORDER BY id DESC', [req.user.id]);
    res.json(products);
  } catch (err) {
    console.error('Error fetching seller products:', err);
    res.status(500).json({ error: err.message });
  }
});

// Auth
app.post('/api/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const userRole = role || 'buyer';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, userRole]
    );
    const user = { id: result.id, username, email, role: userRole };
    const token = jwt.sign(user, SECRET_KEY);
    res.json({ user, token });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      console.error('Error during registration:', err);
      res.status(500).json({ error: err.message });
    }
  }
});

app.post('/api/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;
  
  try {
    const user = await get(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [emailOrUsername, emailOrUsername]
    );

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid login or password' });
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = jwt.sign(userWithoutPassword, SECRET_KEY);
    res.json({ user: userWithoutPassword, token });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: err.message });
  }
});

// Orders
app.post('/api/orders', authenticateToken, async (req, res) => {
  const { items, total, address, phone } = req.body;
  const userId = req.user.id;

  try {
    // Start transaction manually if needed, but for simplicity:
    const orderResult = await run(
      'INSERT INTO orders (user_id, address, phone, status, date, total) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, address, phone, 'Принят', new Date().toISOString(), total]
    );
    
    const orderId = orderResult.id;

    for (const item of items) {
      await run(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.price]
      );
    }

    res.json({ id: orderId });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  
  try {
    const orders = await query('SELECT * FROM orders WHERE user_id = ? ORDER BY date DESC', [userId]);
    
    for (const order of orders) {
      const items = await query(
        `SELECT oi.*, p.name 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }
    
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: err.message });
  }
});

// Initialize DB and start server
initDb().then(() => {
  app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
