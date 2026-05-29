import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus } from 'lucide-react';

const Catalog = () => {
  const { products, addToCart, user, navigate } = useStore();
  const [category, setCategory] = useState('все');

  const filteredProducts = category === 'все' 
    ? products 
    : products.filter(p => p.category === category);

  const categories = ['все', 'вещи', 'продукты', 'электроника'];

  return (
    <div className="catalog-view">
      <div className="catalog-header">
        <div>
          <h2 style={{ fontSize: '2rem' }}>Каталог товаров</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Найдено {filteredProducts.length} товаров</p>
        </div>

        <div className="flex" style={{ gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="catalog-categories">
            {categories.map(cat => (
              <button 
                key={cat}
                className={`btn ${category === cat ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}
                onClick={() => setCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {user && user.role === 'seller' && (
            <button 
              className="btn btn-outline" 
              style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }} 
              onClick={() => navigate('seller-dashboard')}
            >
              <Plus size={18} /> Добавить товар
            </button>
          )}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
        {filteredProducts.map(product => (
          <div key={product.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '200px', overflow: 'hidden' }}>
              <img 
                src={product.image} 
                alt={product.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            </div>
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="badge" style={{ marginBottom: '0.5rem', alignSelf: 'flex-start' }}>{product.category}</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{product.name}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                {product.description}
              </p>
              <div className="flex justify-between">
                <span className="mono" style={{ fontWeight: 700, fontSize: '1.2rem' }}>{product.price} ₽</span>
                <button className="btn btn-primary" style={{ padding: '0.5rem' }} onClick={() => addToCart(product)}>
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Catalog;
