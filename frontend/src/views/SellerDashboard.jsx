import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../api/api';
import { Package, Plus, Loader2 } from 'lucide-react';

const SellerDashboard = () => {
  const { user } = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'вещи',
    price: '',
    description: '',
    image: ''
  });

  const categories = ['вещи', 'продукты', 'электроника'];

  const fetchSellerProducts = async () => {
    try {
      const data = await api.getSellerProducts();
      setProducts(data);
    } catch (err) {
      setError('Не удалось загрузить ваши товары');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerProducts();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    setError('');
    try {
      const added = await api.addSellerProduct({
        ...newProduct,
        price: parseInt(newProduct.price)
      });
      setProducts([added, ...products]);
      setNewProduct({
        name: '',
        category: 'вещи',
        price: '',
        description: '',
        image: ''
      });
      alert('Товар успешно добавлен!');
    } catch (err) {
      setError(err.message || 'Ошибка при добавлении товара');
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center" style={{ padding: '4rem' }}>
      <Loader2 className="animate-spin" size={32} />
    </div>
  );

  return (
    <div>
      <div className="view-header">
        <h2>Мои товары</h2>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Панель продавца: <strong>{user?.username}</strong>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Form to add product */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} /> Добавить товар
          </h3>
          
          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.8rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleAddProduct} className="grid" style={{ gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Название</label>
              <input 
                type="text" 
                className="input" 
                required 
                value={newProduct.name}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Категория</label>
              <select 
                className="input" 
                value={newProduct.category}
                onChange={e => setNewProduct({...newProduct, category: e.target.value})}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Цена (₽)</label>
              <input 
                type="number" 
                className="input" 
                required 
                value={newProduct.price}
                onChange={e => setNewProduct({...newProduct, price: e.target.value})}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Описание</label>
              <textarea 
                className="input" 
                rows="3"
                value={newProduct.description}
                onChange={e => setNewProduct({...newProduct, description: e.target.value})}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>URL изображения</label>
              <input 
                type="url" 
                className="input" 
                placeholder="https://images.unsplash.com/..."
                value={newProduct.image}
                onChange={e => setNewProduct({...newProduct, image: e.target.value})}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isAdding}>
              {isAdding ? 'Добавление...' : 'Добавить товар'}
            </button>
          </form>
        </div>

        {/* List of products */}
        <div className="grid" style={{ gap: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={20} /> Список ваших товаров ({products.length})
          </h3>
          
          {products.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              У вас пока нет добавленных товаров.
            </div>
          ) : (
            products.map(product => (
              <div key={product.id} className="card flex" style={{ gap: '1rem', padding: '1rem' }}>
                <img 
                  src={product.image || 'https://via.placeholder.com/80'} 
                  alt={product.name} 
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius)' }}
                />
                <div style={{ flex: 1 }}>
                  <div className="flex justify-between">
                    <h4 style={{ margin: 0 }}>{product.name}</h4>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{product.price} ₽</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{product.category}</p>
                  <p style={{ fontSize: '0.9rem', margin: 0 }} className="line-clamp-1">{product.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
