import { useStore } from '../context/StoreContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react';

const Cart = () => {
  const { cart, cartTotal, updateQuantity, removeFromCart, navigate } = useStore();

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div style={{ marginBottom: '1.5rem', color: 'var(--color-border)' }}>
          <ShoppingCart size={80} style={{ margin: '0 auto' }} />
        </div>
        <h2 style={{ marginBottom: '1rem' }}>Ваша корзина пуста</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Самое время добавить в неё что-нибудь интересное!</p>
        <button className="btn btn-primary" onClick={() => navigate('catalog')}>Перейти в каталог</button>
      </div>
    );
  }

  return (
    <div className="cart-view">
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Корзина</h2>
      
      <div className="cart-layout">
        <div className="grid" style={{ gap: '1rem' }}>
          {cart.map(item => (
            <div key={item.id} className="card cart-item-card">
              <div className="cart-item-info">
                <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                <div>
                  <h4 style={{ fontSize: '1.1rem' }}>{item.name}</h4>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{item.category}</p>
                  <p className="mono" style={{ fontWeight: 700, marginTop: '0.5rem' }}>{item.price} ₽</p>
                </div>
              </div>

              <div className="cart-item-controls">
                <div className="flex" style={{ gap: '0.5rem', backgroundColor: '#f5f0e8', padding: '0.3rem', borderRadius: 'var(--radius)' }}>
                  <button className="btn-ghost" style={{ padding: '0.2rem' }} onClick={() => updateQuantity(item.id, -1)}>
                    <Minus size={16} />
                  </button>
                  <span className="mono" style={{ fontWeight: 700, width: '30px', textAlign: 'center' }}>{item.quantity}</span>
                  <button className="btn-ghost" style={{ padding: '0.2rem' }} onClick={() => updateQuantity(item.id, 1)}>
                    <Plus size={16} />
                  </button>
                </div>
                
                <button className="btn-ghost" style={{ color: '#ef4444' }} onClick={() => removeFromCart(item.id)}>
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ position: 'sticky', top: '100px' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Итого</h3>
          <div className="flex justify-between" style={{ marginBottom: '1rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Товары ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
            <span className="mono">{cartTotal} ₽</span>
          </div>
          <div className="flex justify-between" style={{ marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 700 }}>
            <span>К оплате</span>
            <span className="mono" style={{ color: 'var(--color-primary)' }}>{cartTotal} ₽</span>
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('checkout')}>
            Оформить заказ <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
