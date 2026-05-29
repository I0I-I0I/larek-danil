import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../api/api';
import { Package, Plus, Loader2, Edit2, Trash2 } from 'lucide-react';

const SellerDashboard = () => {
  const { user, refreshProducts } = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'вещи',
    price: '',
    description: '',
    image: '',
    brand: '',
    full_description: '',
    specs: '',
    in_stock: ''
  });

  const categories = ['вещи', 'продукты', 'электроника'];

  const fetchSellerProducts = async () => {
    try {
      const data = await api.getSellerProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching seller products:', err);
      setError('Не удалось загрузить ваши товары');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    setError('');
    setSuccessMessage('');
    try {
      if (editingProduct) {
        // Edit flow
        const updated = await api.editSellerProduct(editingProduct.id, {
          ...newProduct,
          price: parseInt(newProduct.price),
          in_stock: parseInt(newProduct.in_stock) || 0
        });
        setProducts(products.map(p => p.id === editingProduct.id ? updated : p));
        setEditingProduct(null);
        setSuccessMessage('Товар успешно обновлен!');
      } else {
        // Add flow
        const added = await api.addSellerProduct({
          ...newProduct,
          price: parseInt(newProduct.price),
          in_stock: parseInt(newProduct.in_stock) || 0
        });
        setProducts([added, ...products]);
        setSuccessMessage('Товар успешно добавлен!');
      }
      
      setNewProduct({
        name: '',
        category: 'вещи',
        price: '',
        description: '',
        image: '',
        brand: '',
        full_description: '',
        specs: '',
        in_stock: ''
      });
      
      if (refreshProducts) {
        await refreshProducts();
      }
    } catch (err) {
      setError(err.message || 'Ошибка при сохранении товара');
    } finally {
      setIsAdding(false);
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      description: product.description || '',
      image: product.image || '',
      brand: product.brand || '',
      full_description: product.full_description || '',
      specs: product.specs || '',
      in_stock: product.in_stock !== undefined ? product.in_stock.toString() : '0'
    });
    setError('');
    setSuccessMessage('');
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setNewProduct({
      name: '',
      category: 'вещи',
      price: '',
      description: '',
      image: '',
      brand: '',
      full_description: '',
      specs: '',
      in_stock: ''
    });
    setError('');
    setSuccessMessage('');
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }
    
    setError('');
    setSuccessMessage('');
    try {
      await api.deleteSellerProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      setSuccessMessage('Товар успешно удален!');
      
      if (editingProduct && editingProduct.id === productId) {
        cancelEdit();
      }
      
      if (refreshProducts) {
        await refreshProducts();
      }
    } catch (err) {
      setError(err.message || 'Ошибка при удалении товара');
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
        {/* Form to add/edit product */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {editingProduct ? <Edit2 size={20} /> : <Plus size={20} />}
            {editingProduct ? 'Редактировать товар' : 'Добавить товар'}
          </h3>
          
          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.8rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {successMessage && (
            <div style={{ backgroundColor: '#ecfdf5', color: '#047857', padding: '0.8rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid #a7f3d0' }}>
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid" style={{ gap: '1rem' }}>
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
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Бренд / Производитель</label>
              <input 
                type="text" 
                className="input" 
                placeholder="Например, RetroThread"
                value={newProduct.brand}
                onChange={e => setNewProduct({...newProduct, brand: e.target.value})}
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
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Количество в наличии</label>
              <input 
                type="number" 
                className="input" 
                placeholder="10"
                value={newProduct.in_stock}
                onChange={e => setNewProduct({...newProduct, in_stock: e.target.value})}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Краткое описание (для превью)</label>
              <textarea 
                className="input" 
                rows="2"
                value={newProduct.description}
                onChange={e => setNewProduct({...newProduct, description: e.target.value})}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Подробное описание (полная страница)</label>
              <textarea 
                className="input" 
                rows="4"
                placeholder="Подробное описание товара..."
                value={newProduct.full_description}
                onChange={e => setNewProduct({...newProduct, full_description: e.target.value})}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Характеристики (по одной на строку)</label>
              <textarea 
                className="input" 
                rows="3"
                placeholder="Материал: Хлопок 100%&#10;Размер: XL"
                value={newProduct.specs}
                onChange={e => setNewProduct({...newProduct, specs: e.target.value})}
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

            {!editingProduct ? (
              <button type="submit" className="btn btn-primary" disabled={isAdding}>
                {isAdding ? 'Добавление...' : 'Добавить товар'}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isAdding}>
                  {isAdding ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-ghost" 
                  onClick={cancelEdit} 
                  style={{ border: '1px solid var(--color-border)' }}
                >
                  Отмена
                </button>
              </div>
            )}
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
              <div key={product.id} className="card flex" style={{ gap: '1rem', padding: '1rem', alignItems: 'flex-start' }}>
                <img 
                  src={product.image || 'https://via.placeholder.com/80'} 
                  alt={product.name} 
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius)', marginTop: '0.2rem' }}
                />
                <div style={{ flex: 1 }}>
                  <div className="flex justify-between">
                    <h4 style={{ margin: 0 }}>{product.name}</h4>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{product.price} ₽</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                    {product.category} {product.brand && `• ${product.brand}`} {product.in_stock !== undefined && `• В наличии: ${product.in_stock} шт.`}
                  </p>
                  <p style={{ fontSize: '0.9rem', margin: 0 }} className="line-clamp-2">{product.description}</p>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button 
                      onClick={() => startEdit(product)} 
                      className="btn btn-outline" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', height: 'auto', borderRadius: 'var(--radius)', border: '1px solid var(--color-primary)' }}
                    >
                      <Edit2 size={13} /> Редактировать
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)} 
                      className="btn btn-outline" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', height: 'auto', borderRadius: 'var(--radius)', border: '1px solid #dc2626', color: '#dc2626' }}
                    >
                      <Trash2 size={13} /> Удалить
                    </button>
                  </div>
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
