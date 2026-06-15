const DB_KEY = 'larek_db';

const initialProducts = [
  { id: 1, name: 'Стильная рубашка', category: 'вещи', price: 2500, description: 'Хлопковая рубашка для любого случая.', image: '/images/previews/shirt.jpg' },
  { id: 2, name: 'Кеды "Ретро"', category: 'вещи', price: 4200, description: 'Удобные кеды в классическом стиле.', image: '/images/previews/sneakers.jpg' },
  { id: 3, name: 'Свежий багет', category: 'продукты', price: 120, description: 'Хрустящий багет прямо из печи.', image: '/images/previews/baguette.jpg' },
  { id: 4, name: 'Горный мед', category: 'продукты', price: 850, description: 'Натуральный мед из алтайских трав.', image: '/images/previews/honey.jpg' },
  { id: 5, name: 'Радиоприемник', category: 'электроника', price: 3400, description: 'Винтажный радиоприемник с современным звуком.', image: '/images/previews/radio.jpg' },
  { id: 6, name: 'Наушники Hi-Fi', category: 'электроника', price: 7800, description: 'Чистый звук и глубокие басы.', image: '/images/previews/headphones.jpg' },
];

const getDb = () => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    const initialDb = { users: [], orders: [], products: initialProducts };
    saveDb(initialDb);
    return initialDb;
  }
  return JSON.parse(data);
};

const saveDb = (db) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const mockDb = {
  getProducts: () => getDb().products,
  
  register: (user) => {
    const db = getDb();
    if (db.users.find(u => u.email === user.email || u.username === user.username)) {
      throw new Error('Пользователь с таким email или логином уже существует');
    }
    const newUser = { ...user, id: Date.now() };
    db.users.push(newUser);
    saveDb(db);
    return newUser;
  },

  login: (emailOrUsername, password) => {
    const db = getDb();
    const user = db.users.find(u => (u.email === emailOrUsername || u.username === emailOrUsername) && u.password === password);
    if (!user) throw new Error('Неверный логин или пароль');
    return user;
  },

  createOrder: (order) => {
    const db = getDb();
    const newOrder = { ...order, id: db.orders.length + 1, date: new Date().toISOString() };
    db.orders.push(newOrder);
    saveDb(db);
    return newOrder;
  },

  getOrders: (userId) => {
    return getDb().orders.filter(o => o.userId === userId);
  }
};
