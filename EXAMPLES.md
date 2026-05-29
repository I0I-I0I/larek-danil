# Развернутое описание и примеры кода проекта "Ларёк"

Данный документ представляет собой подробный технический разбор проекта "Ларёк". Здесь собраны ключевые фрагменты кода с пояснениями, которые помогут защитить дипломную работу, демонстрируя понимание архитектуры Fullstack-приложения.

---

## 1. База данных: Схема и инициализация

В нашем проекте база данных — это фундамент. Мы используем **SQLite**, так как она не требует отдельного сервера и идеально подходит для демонстрации работы с данными.

### Фрагмент кода: Инициализация таблиц (`backend/db.js`)

Этот код отвечает за создание структуры таблиц при первом запуске приложения.

```javascript
// Импортируем библиотеку для работы с SQLite
import Database from 'better-sqlite3';

// Создаем подключение к файлу базы данных
const db = new Database('larek.db');

export const initDb = async () => {
  // 1. Таблица пользователей
  // Хранит логин, почту, зашифрованный пароль и роль (покупатель или продавец)
  db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, // Уникальный номер
    username TEXT UNIQUE,                 // Имя пользователя (не повторяется)
    email TEXT UNIQUE,                    // Почта (не повторяется)
    password TEXT,                        // Хэш пароля
    role TEXT DEFAULT 'buyer'             // Роль: 'buyer' или 'seller'
  )`);

  // 2. Таблица товаров
  // Описывает каждый товар: название, цена, описание, остаток на складе
  db.exec(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,                            // Название
    category TEXT,                        // Категория (вещи, продукты и т.д.)
    price INTEGER,                        // Цена в рублях
    description TEXT,                     // Краткое описание
    image TEXT,                           // Ссылка на картинку
    seller_id INTEGER,                    // ID продавца, который добавил товар
    brand TEXT,                           // Бренд
    full_description TEXT,                // Полное описание для страницы товара
    specs TEXT,                           // Технические характеристики
    in_stock INTEGER                      // Количество на складе
  )`);

  // 3. Таблица заказов
  // Фиксирует факт покупки: кто купил, куда везти и на какую сумму
  db.exec(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,                      // Кто сделал заказ
    address TEXT,                         // Адрес доставки
    phone TEXT,                           // Телефон для связи
    status TEXT,                          // Статус (Принят, В пути, Доставлен)
    date TEXT,                            // Дата и время
    total INTEGER,                        // Итоговая сумма
    FOREIGN KEY(user_id) REFERENCES users(id) // Связь с таблицей пользователей
  )`);

  // 4. Таблица состава заказов (связующая)
  // Позволяет хранить несколько разных товаров в одном заказе
  db.exec(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,                     // К какому заказу относится
    product_id INTEGER,                   // Какой товар купили
    quantity INTEGER,                     // Сколько штук
    price INTEGER,                        // Цена на момент покупки
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`);
};
```

**Описание для диплома:**
Использование реляционной модели данных (таблиц со связями) позволяет нам поддерживать целостность информации. Например, `FOREIGN KEY` в таблице заказов гарантирует, что заказ не может существовать без привязки к существующему пользователю. Разделение заказов на две таблицы (`orders` и `order_items`) реализует связь "один ко многим": один заказ может содержать много разных товаров.

---

## 2. Бэкенд: Авторизация и Безопасность

Серверная часть написана на Node.js. Самый важный аспект здесь — безопасность данных пользователя.

### Фрагмент кода: Регистрация пользователя (`backend/server.js`)

Мы не храним пароли в чистом виде, так как это небезопасно. Мы используем "хэширование".

```javascript
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

app.post('/api/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Шифруем пароль перед сохранением в базу.
    // Число 10 — это количество "соли" (сложность шифрования).
    const hashedPassword = await bcrypt.hash(password, 10);

    // Сохраняем пользователя в базу данных
    const result = await run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role || 'buyer']
    );

    // Создаем объект пользователя без пароля для возврата на фронтенд
    const user = { id: result.id, username, email, role: role || 'buyer' };

    // Генерируем секретный токен (JWT), чтобы пользователь оставался в системе
    const token = jwt.sign(user, 'SECRET_KEY');

    res.json({ user, token });
  } catch (err) {
    res.status(400).json({ error: 'Ошибка регистрации' });
  }
});
```

**Описание для диплома:**
В этом блоке кода демонстрируется применение современных стандартов безопасности. Библиотека `bcrypt` преобразует пароль "12345" в длинную нечитаемую строку, которую невозможно расшифровать обратно. Для идентификации пользователя после входа используется `JWT` (JSON Web Token). Это позволяет серверу "узнавать" пользователя в каждом следующем запросе без повторного ввода пароля.

---

## 3. Бэкенд: Управление товарами

Для управления товарами мы используем классические CRUD-операции (Create, Read, Update, Delete).

### Фрагмент кода: Защищенный маршрут создания товара (`backend/server.js`)

Только пользователи с ролью `seller` могут добавлять новые товары.

```javascript
// Middleware (посредник) для проверки авторизации
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401); // Если нет токена — ошибка "Не авторизован"

  jwt.verify(token, 'SECRET_KEY', (err, user) => {
    if (err) return res.sendStatus(403); // Если токен подделан — ошибка "Доступ запрещен"
    req.user = user; // Сохраняем данные пользователя в запрос
    next(); // Идем дальше к обработчику
  });
};

// Маршрут добавления товара
app.post('/api/products', authenticateToken, async (req, res) => {
  const { name, category, price, description, image } = req.body;

  // Проверка роли: только продавцы могут добавлять товары
  if (req.user.role !== 'seller') {
    return res.status(403).json({ error: 'Только продавцы могут добавлять товары' });
  }

  try {
    await run(
      'INSERT INTO products (name, category, price, description, image, seller_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category, price, description, image, req.user.id]
    );
    res.json({ message: 'Товар добавлен' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});
```

**Описание для диплома:**
Здесь реализована "Ролевая модель доступа" (RBAC). Посредник `authenticateToken` проверяет, вошел ли пользователь на сайт, а условие `req.user.role !== 'seller'` ограничивает возможности обычных покупателей, предотвращая несанкционированное изменение каталога.

---

## 4. Фронтенд: Взаимодействие с API

На стороне клиента (React) мы создали отдельный модуль для всех сетевых запросов.

### Фрагмент кода: Клиент для API (`frontend/src/api/api.js`)

Это слой абстракции, который изолирует логику сетевых запросов от визуальных компонентов.

```javascript
// Вспомогательная функция для получения токена из памяти браузера
const getAuthHeader = () => {
  const token = localStorage.getItem('larek_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
  // Получение всех товаров для каталога
  getProducts: async () => {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Ошибка при загрузке товаров');
    return res.json();
  },

  // Оформление заказа
  createOrder: async (orderData) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader() // Прикрепляем токен, чтобы сервер знал, кто делает заказ
      },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка при создании заказа');
    return data;
  }
};
```

**Описание для диплома:**
Разделение API-запросов и UI-компонентов — это принцип "Единственной ответственности" (Single Responsibility). Если завтра адрес сервера изменится, нам нужно будет поправить код только в одном месте (в файле `api.js`), а не искать по всем компонентам сайта.

---

## 5. Фронтенд: Глобальное хранилище данных (React Context)

В приложении много данных, которые нужны везде: информация о пользователе и состояние корзины. Чтобы не передавать их через "десять рук", мы используем Context API.

### Фрагмент кода: Управление корзиной и состоянием (`frontend/src/context/StoreContext.jsx`)

```javascript
import { createContext, useState, useEffect } from "react";

export const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  // Храним состояние корзины
  const [cart, setCart] = useState([]);
  
  // Храним данные текущего пользователя
  const [user, setUser] = useState(null);

  // Функция добавления товара в корзину
  const addToCart = (product) => {
    setCart((prev) => {
      // Проверяем, есть ли уже такой товар в корзине
      const existing = prev.find((item) => item.id === product.id);
      
      if (existing) {
        // Если есть, просто увеличиваем количество на 1
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      // Если товара нет, добавляем его с количеством 1
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Функция удаления товара
  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  // Подсчет общей стоимости товаров в корзине
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <StoreContext.Provider value={{ cart, user, addToCart, removeFromCart, cartTotal }}>
      {children}
    </StoreContext.Provider>
  );
};
```

**Описание для диплома:**
Context API решает проблему "Prop Drilling" (пробрасывание данных через множество уровней компонентов). Весь сайт обернут в `StoreProvider`, что позволяет любому компоненту (например, кнопке "Купить" в каталоге или иконке корзины в шапке) мгновенно получить доступ к списку покупок и функциям управления им.

---

## 6. Фронтенд: Отображение каталога

Компонент каталога отвечает за вывод товаров и их фильтрацию.

### Фрагмент кода: Компонент каталога (`frontend/src/views/Catalog.jsx`)

```javascript
import { useState } from 'react';
import { useStore } from '../context/StoreContext';

const Catalog = () => {
  // Получаем список товаров и функцию добавления из глобального хранилища
  const { products, addToCart } = useStore();
  
  // Состояние для фильтрации по категориям
  const [category, setCategory] = useState('все');

  // Фильтруем список перед отрисовкой
  const filteredProducts = category === 'все' 
    ? products 
    : products.filter(p => p.category === category);

  return (
    <div className="catalog">
      {/* Кнопки переключения категорий */}
      <div className="filters">
        {['все', 'вещи', 'продукты', 'электроника'].map(cat => (
          <button 
            key={cat} 
            onClick={() => setCategory(cat)}
            className={category === cat ? 'active' : ''}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Список товаров в виде сетки */}
      <div className="product-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="price">{product.price} ₽</p>
            <button onClick={() => addToCart(product)}>В корзину</button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

**Описание для диплома:**
Компонент реализован как "функциональный компонент" с использованием хуков `useState` и пользовательского хука `useStore`. Это современный подход к разработке на React. Логика фильтрации вынесена непосредственно в рендер, что обеспечивает мгновенную реакцию интерфейса на действия пользователя (переключение категорий).

---

## 7. Жизненный цикл данных: От нажатия кнопки до записи в БД

Рассмотрим путь данных при оформлении заказа:
1. **Пользователь** нажимает "Оформить заказ" в корзине.
2. **Фронтенд** собирает данные из состояния `cart` (StoreContext) и отправляет их через функцию `api.createOrder` (api.js).
3. **Сервер** получает запрос, проверяет токен (authenticateToken в server.js).
4. **Сервер** выполняет SQL-запросы: сначала создает запись в таблице `orders`, получает её `ID`, а затем для каждого товара из корзины создает запись в `order_items`.
5. **База данных** сохраняет изменения в файл `larek.db`.
6. **Пользователь** видит сообщение об успешном заказе.

Этот цикл демонстрирует полную интеграцию всех уровней приложения.

---

## Заключение

Проект "Ларёк" демонстрирует владение стеком **PERN/SERN** (с заменой Postgres на SQLite для упрощения). В ходе разработки были решены задачи:
- Проектирования реляционной базы данных.
- Создания защищенного RESTful API.
- Реализации современного реактивного интерфейса на React.
- Обеспечения безопасности пользовательских данных.

Данный код готов к масштабированию и может служить основой для реального интернет-магазина.
