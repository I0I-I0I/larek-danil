import { useStore } from '../context/StoreContext';
import { ArrowRight, ShoppingBag, Zap, Apple } from 'lucide-react';

const Home = () => {
  const { navigate } = useStore();

  return (
    <div className="home-view">
      <section className="hero-section">
        <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Вещи, продукты, электроника</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          Добро пожаловать в «ЛАРЁК» — ваш уютный уголок качественных товаров. 
          Мы собрали лучшее для вашего дома и жизни.
        </p>
        <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => navigate('catalog')}>
          Перейти в каталог <ArrowRight size={20} />
        </button>
      </section>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div className="card" onClick={() => navigate('catalog')} style={{ cursor: 'pointer' }}>
          <div className="flex" style={{ gap: '1rem', marginBottom: '1rem' }}>
            <ShoppingBag className="color-primary" style={{ color: 'var(--color-primary)' }} />
            <h3>Вещи</h3>
          </div>
          <p style={{ color: 'var(--color-text-muted)' }}>Стильная одежда и аксессуары для тех, кто ценит качество.</p>
        </div>
        <div className="card" onClick={() => navigate('catalog')} style={{ cursor: 'pointer' }}>
          <div className="flex" style={{ gap: '1rem', marginBottom: '1rem' }}>
            <Apple style={{ color: 'var(--color-primary)' }} />
            <h3>Продукты</h3>
          </div>
          <p style={{ color: 'var(--color-text-muted)' }}>Свежие продукты и деликатесы прямо к вашему столу.</p>
        </div>
        <div className="card" onClick={() => navigate('catalog')} style={{ cursor: 'pointer' }}>
          <div className="flex" style={{ gap: '1rem', marginBottom: '1rem' }}>
            <Zap style={{ color: 'var(--color-primary)' }} />
            <h3>Электроника</h3>
          </div>
          <p style={{ color: 'var(--color-text-muted)' }}>Современные гаджеты и техника для вашего удобства.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
