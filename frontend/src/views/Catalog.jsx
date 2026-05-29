import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, X, ShoppingBag } from 'lucide-react';

const Catalog = () => {
  const { products, addToCart, user, navigate } = useStore();
  const [category, setCategory] = useState('все');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = category === 'все' 
    ? products 
    : products.filter(p => p.category === category);

  const categories = ['все', 'вещи', 'продукты', 'электроника'];

  const renderSpecs = (specsString) => {
    if (!specsString) return null;
    const lines = specsString.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return null;
    
    return (
      <div style={{ marginTop: '1.5rem' }}>
        <h4 style={{ fontSize: '1rem', color: 'var(--color-secondary)', marginBottom: '0.8rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.3rem' }}>
          Характеристики
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
          {lines.map((line, idx) => {
            const parts = line.split(':');
            const key = parts[0]?.trim();
            const val = parts.slice(1).join(':')?.trim();
            if (!key) return null;
            return (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--color-border)', paddingBottom: '0.2rem' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>{key}</span>
                <span style={{ fontWeight: 600, textAlign: 'right' }}>{val || '—'}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="catalog-view">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

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
          <div 
            key={product.id} 
            className="card" 
            style={{ 
              padding: 0, 
              overflow: 'hidden', 
              display: 'flex', 
              flexDirection: 'column',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onClick={() => setSelectedProduct(product)}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '8px 8px 0px 0px rgba(69, 26, 3, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-retro)';
            }}
          >
            <div style={{ height: '200px', overflow: 'hidden' }}>
              <img 
                src={product.image} 
                alt={product.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="flex justify-between" style={{ marginBottom: '0.5rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div className="badge" style={{ alignSelf: 'flex-start' }}>{product.category}</div>
                {product.brand && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)' }}>{product.brand}</span>
                )}
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{product.name}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                {product.description}
              </p>
              <div className="flex justify-between">
                <span className="mono" style={{ fontWeight: 700, fontSize: '1.2rem' }}>{product.price} ₽</span>
                <button 
                  className="btn btn-primary" 
                  style={{ 
                    padding: '0.5rem',
                    backgroundColor: product.in_stock === 0 ? 'var(--color-border)' : 'var(--color-primary)',
                    borderColor: product.in_stock === 0 ? 'var(--color-border)' : 'var(--color-primary)',
                    cursor: product.in_stock === 0 ? 'not-allowed' : 'pointer'
                  }} 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (product.in_stock !== 0) {
                      addToCart(product);
                    }
                  }}
                  disabled={product.in_stock === 0}
                  title={product.in_stock === 0 ? 'Нет в наличии' : 'Добавить в корзину'}
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Float Page / Product Detail Modal Overlay */}
      {selectedProduct && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(69, 26, 3, 0.4)',
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.2s ease-out',
            padding: '1rem'
          }}
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="card"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '800px',
              backgroundColor: 'var(--color-surface)',
              border: '2px solid var(--color-secondary)',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '8px 8px 0px 0px rgba(69, 26, 3, 0.2)',
              animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              className="btn btn-ghost"
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                padding: '0.4rem',
                borderRadius: '50%',
                border: '1px solid var(--color-border)',
                width: '36px',
                height: '36px',
                minWidth: '36px'
              }}
              onClick={() => setSelectedProduct(null)}
            >
              <X size={20} />
            </button>

            {/* Modal Body */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
              {/* Product Image */}
              <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--color-border)', height: '320px' }}>
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Product Details */}
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Meta details */}
                <div className="flex" style={{ gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <div className="badge">{selectedProduct.category}</div>
                  {selectedProduct.brand && (
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {selectedProduct.brand}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 style={{ fontSize: '1.8rem', lineHeight: '1.2', marginBottom: '0.8rem', marginTop: '0.5rem' }}>{selectedProduct.name}</h2>

                {/* Price and Stock Indicator */}
                <div className="flex justify-between" style={{ borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <span className="mono" style={{ fontWeight: 700, fontSize: '1.8rem', color: 'var(--color-secondary)' }}>
                    {selectedProduct.price} ₽
                  </span>
                  
                  {/* Stock Indicator */}
                  {selectedProduct.in_stock !== undefined ? (
                    selectedProduct.in_stock > 0 ? (
                      <span className="badge" style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                        В наличии: {selectedProduct.in_stock} шт.
                      </span>
                    ) : (
                      <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                        Нет в наличии
                      </span>
                    )
                  ) : (
                    <span className="badge" style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                      В наличии
                    </span>
                  )}
                </div>

                {/* Descriptions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', fontStyle: 'italic', margin: 0 }}>
                    {selectedProduct.description}
                  </p>
                  
                  {selectedProduct.full_description && (
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-text)', margin: 0 }}>
                      {selectedProduct.full_description}
                    </p>
                  )}
                </div>

                {/* Specifications */}
                {renderSpecs(selectedProduct.specs)}

                {/* Add to Cart Action */}
                <div style={{ marginTop: '2rem' }}>
                  <button 
                    className="btn" 
                    style={{ 
                      width: '100%', 
                      padding: '0.8rem', 
                      fontSize: '1.1rem',
                      backgroundColor: selectedProduct.in_stock === 0 ? 'var(--color-border)' : 'var(--color-accent)',
                      borderColor: selectedProduct.in_stock === 0 ? 'var(--color-border)' : 'var(--color-accent)',
                      color: selectedProduct.in_stock === 0 ? 'var(--color-text-muted)' : 'white',
                      cursor: selectedProduct.in_stock === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.8rem',
                      boxShadow: selectedProduct.in_stock === 0 ? 'none' : 'var(--shadow-retro)'
                    }} 
                    onClick={() => {
                      if (selectedProduct.in_stock !== 0) {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }
                    }}
                    disabled={selectedProduct.in_stock === 0}
                  >
                    <ShoppingBag size={20} />
                    {selectedProduct.in_stock === 0 ? 'Нет в наличии' : 'Добавить в корзину'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
