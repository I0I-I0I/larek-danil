import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db, { initDb, query, get, run } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
const SECRET_KEY = 'super_secret_key_larek'; // In production, this should be in .env

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

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

  const parsedPrice = parseInt(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ error: 'Некорректная цена' });
  }
  const parsedStock = in_stock !== undefined ? parseInt(in_stock) : 0;
  const stock = isNaN(parsedStock) || parsedStock < 0 ? 0 : parsedStock;

  try {
    const result = await run(
      'INSERT INTO products (name, category, price, description, image, seller_id, brand, full_description, specs, in_stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, category, parsedPrice, description, image, req.user.id, brand || null, full_description || null, specs || null, stock]
    );
    res.json({ 
      id: result.id, 
      name, 
      category, 
      price: parsedPrice, 
      description, 
      image, 
      seller_id: req.user.id,
      brand: brand || null,
      full_description: full_description || null,
      specs: specs || null,
      in_stock: stock
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

  const parsedPrice = parseInt(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ error: 'Некорректная цена' });
  }
  const parsedStock = in_stock !== undefined ? parseInt(in_stock) : 0;
  const stock = isNaN(parsedStock) || parsedStock < 0 ? 0 : parsedStock;

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
      [name, category, parsedPrice, description, image, brand || null, full_description || null, specs || null, stock, id]
    );

    res.json({ 
      id: parseInt(id), 
      name, 
      category, 
      price: parsedPrice, 
      description, 
      image, 
      seller_id: req.user.id,
      brand: brand || null,
      full_description: full_description || null,
      specs: specs || null,
      in_stock: stock
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

// Image Upload
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // The URL should be relative to the domain, e.g., /uploads/filename.jpg
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Auth
app.post('/api/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const userRole = role === 'seller' ? 'seller' : 'buyer';

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

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Корзина пуста' });
  }
  if (!address || !phone) {
    return res.status(400).json({ error: 'Не указаны адрес или телефон' });
  }

  try {
    // Transaction runs synchronously
    const createOrderTx = db.transaction((orderItems) => {
      let calculatedTotal = 0;
      const verifiedItems = [];

      for (const item of orderItems) {
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.id);
        if (!product) {
          throw new Error(`Товар с ID ${item.id} не найден`);
        }

        if (product.in_stock < item.quantity) {
          throw new Error(`Недостаточно товара "${product.name}" в наличии (осталось: ${product.in_stock} шт.)`);
        }

        calculatedTotal += product.price * item.quantity;

        db.prepare('UPDATE products SET in_stock = in_stock - ? WHERE id = ?').run(item.quantity, item.id);

        verifiedItems.push({
          id: product.id,
          quantity: item.quantity,
          price: product.price
        });
      }

      const orderInfo = db.prepare(
        'INSERT INTO orders (user_id, address, phone, status, date, total) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(userId, address, phone, 'Принят', new Date().toISOString(), calculatedTotal);

      const orderId = orderInfo.lastInsertRowid;

      const insertOrderItem = db.prepare(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
      );
      for (const item of verifiedItems) {
        insertOrderItem.run(orderId, item.id, item.quantity, item.price);
      }

      return orderId;
    });

    const orderId = createOrderTx(items);
    res.json({ id: orderId });
  } catch (err) {
    console.error('Error creating order within transaction:', err);
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  
  try {
    const orders = await query('SELECT * FROM orders WHERE user_id = ? ORDER BY date DESC', [userId]);
    
    for (const order of orders) {
      const items = await query(
        `SELECT oi.*, COALESCE(p.name, 'Удаленный товар') AS name 
         FROM order_items oi 
         LEFT JOIN products p ON oi.product_id = p.id 
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
