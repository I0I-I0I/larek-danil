import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'larek.db');

const db = new Database(dbPath);

const initialProducts = [
  { id: 1, name: 'Стильная рубашка', category: 'вещи', price: 2500, description: 'Хлопковая рубашка для любого случая.', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500' },
  { id: 2, name: 'Кеды "Ретро"', category: 'вещи', price: 4200, description: 'Удобные кеды в классическом стиле.', image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500' },
  { id: 3, name: 'Свежий багет', category: 'продукты', price: 120, description: 'Хрустящий багет прямо из печи.', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500' },
  { id: 4, name: 'Горный мед', category: 'продукты', price: 850, description: 'Натуральный мед из алтайских трав.', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500' },
  { id: 5, name: 'Радиоприемник', category: 'электроника', price: 3400, description: 'Винтажный радиоприемник с современным звуком.', image: 'https://images.unsplash.com/photo-1558537330-3490799863fc?w=500' },
  { id: 6, name: 'Наушники Hi-Fi', category: 'электроника', price: 7800, description: 'Чистый звук и глубокие басы.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' },
];

export const initDb = async () => {
  // Users table
  db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT
  )`);

  // Products table
  db.exec(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    price INTEGER,
    description TEXT,
    image TEXT
  )`);

  // Seed products if empty
  const count = db.prepare("SELECT COUNT(*) as count FROM products").get().count;
  if (count === 0) {
    const insert = db.prepare("INSERT INTO products (id, name, category, price, description, image) VALUES (?, ?, ?, ?, ?, ?)");
    const insertMany = db.transaction((products) => {
      for (const p of products) insert.run(p.id, p.name, p.category, p.price, p.description, p.image);
    });
    insertMany(initialProducts);
  }

  // Orders table
  db.exec(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    address TEXT,
    phone TEXT,
    status TEXT,
    date TEXT,
    total INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // Order items table
  db.exec(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price INTEGER,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`);
};

export const query = async (sql, params = []) => {
  return db.prepare(sql).all(params);
};

export const get = async (sql, params = []) => {
  return db.prepare(sql).get(params);
};

export const run = async (sql, params = []) => {
  const info = db.prepare(sql).run(params);
  return { id: info.lastInsertRowid, changes: info.changes };
};

export default db;
