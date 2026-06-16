import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || join(__dirname, 'larek.db');

// Ensure database directory exists
mkdirSync(dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.exec("PRAGMA foreign_keys = ON;");

const initialProducts = [
  { 
    id: 1, 
    name: 'Стильная рубашка', 
    category: 'вещи', 
    price: 2500, 
    description: 'Хлопковая рубашка для любого случая.', 
    image: '/images/previews/shirt.jpg',
    brand: 'RetroThread',
    full_description: 'Высококачественная хлопковая рубашка классического кроя. Отлично подходит как для повседневной носки, так и для деловых встреч. Ткань приятна к телу, дышит и легко гладится. Воротник стойка, аккуратные швы и надежные пуговицы.',
    specs: 'Материал: 100% Хлопок\nЦвет: Голубой\nРазмер: L\nСтрана производства: Россия',
    in_stock: 12
  },
  { 
    id: 2, 
    name: 'Кеды "Ретро"', 
    category: 'вещи', 
    price: 4200, 
    description: 'Удобные кеды в классическом стиле.', 
    image: '/images/previews/sneakers.jpg',
    brand: 'UrbanClassic',
    full_description: 'Кеды в стиле ретро из натуральной парусины с прочной резиновой подошвой. Отличаются повышенным комфортом благодаря мягкой стельке с поддержкой свода стопы. Идеальный выбор для долгих городских прогулок.',
    specs: 'Материал: Канвас, Резина\nЦвет: Белый с черным\nРазмер: 42\nОсобенности: Усиленный носок',
    in_stock: 5
  },
  { 
    id: 3, 
    name: 'Свежий багет', 
    category: 'продукты', 
    price: 120, 
    description: 'Хрустящий багет прямо из печи.', 
    image: '/images/previews/baguette.jpg',
    brand: 'Пекарня №5',
    full_description: 'Настоящий французский багет, приготовленный по традиционному рецепту на живой закваске. Выпекается каждое утро, чтобы вы могли насладиться хрустящей корочкой и нежным пористым мякишем.',
    specs: 'Состав: Мука пшеничная в/с, вода, дрожжи, соль\nВес: 250 г\nСрок годности: 24 часа',
    in_stock: 20
  },
  { 
    id: 4, 
    name: 'Горный мед', 
    category: 'продукты', 
    price: 850, 
    description: 'Натуральный мед из алтайских трав.', 
    image: '/images/previews/honey.jpg',
    brand: 'Алтайский Нектар',
    full_description: 'Натуральный горный мед, собранный на экологически чистых пасеках Алтая. Обладает богатым янтарным цветом, изысканным ароматом диких трав и выраженными целебными свойствами.',
    specs: 'Вид меда: Цветочный горный\nВес нетто: 500 г\nУпаковка: Стеклянная банка\nГод сбора: 2025',
    in_stock: 8
  },
  { 
    id: 5, 
    name: 'Радиоприемник', 
    category: 'электроника', 
    price: 3400, 
    description: 'Винтажный радиоприемник с современным звуком.', 
    image: '/images/previews/radio.jpg',
    brand: 'RetroWave',
    full_description: 'Сочетание элегантного винтажного дизайна 60-х годов и современных аудио-технологий. Поддерживает FM/AM диапазоны, а также беспроводное подключение по Bluetooth. Корпус выполнен из натурального дерева, что обеспечивает теплое и глубокое звучание.',
    specs: 'Диапазоны: FM/AM\nИнтерфейсы: Bluetooth, AUX, USB\nПитание: Сеть 220V / Встроенный аккумулятор\nМатериал корпуса: Ореховое дерево',
    in_stock: 3
  },
  { 
    id: 6, 
    name: 'Наушники Hi-Fi', 
    category: 'электроника', 
    price: 7800, 
    description: 'Чистый звук и глубокие басы.', 
    image: '/images/previews/headphones.jpg',
    brand: 'SoundMaster',
    full_description: 'Полноразмерные наушники закрытого типа для истинных ценителей качественного звука. Оснащены мощными 50-мм динамиками с неодимовыми магнитами. Эргономичные амбушюры из искусственной кожи обеспечивают отличную пассивную шумоизоляцию.',
    specs: 'Тип наушников: Полноразмерные закрытые\nЧастотный диапазон: 10 - 25000 Гц\nСопротивление: 32 Ом\nДлина кабеля: 1.8 м\nРазъем: Mini-jack 3.5 мм',
    in_stock: 15
  },
];

export const initDb = async () => {
  // Users table
  db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'buyer'
  )`);

  // Products table
  db.exec(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    price INTEGER,
    description TEXT,
    image TEXT,
    seller_id INTEGER,
    brand TEXT,
    full_description TEXT,
    specs TEXT,
    in_stock INTEGER
  )`);

  // Seed products if empty
  const count = db.prepare("SELECT COUNT(*) as count FROM products").get().count;
  if (count === 0) {
    const insert = db.prepare(`
      INSERT INTO products (id, name, category, price, description, image, seller_id, brand, full_description, specs, in_stock) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMany = db.transaction((products) => {
      for (const p of products) {
        insert.run(
          p.id, 
          p.name, 
          p.category, 
          p.price, 
          p.description, 
          p.image, 
          null, 
          p.brand || null, 
          p.full_description || null, 
          p.specs || null, 
          p.in_stock !== undefined ? p.in_stock : 0
        );
      }
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
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL
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
