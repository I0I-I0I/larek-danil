import { useState } from 'react';
import { useStore } from '../context/StoreContext';

const Register = () => {
  const { register, navigate } = useStore();
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    role: 'покупатель'
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 4) {
      return setError('Пароль должен быть не менее 4 символов');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Пароли не совпадают');
    }

    try {
      const userData = { ...formData };
      delete userData.confirmPassword;
      register(userData);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '4rem auto' }}>
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Регистрация</h2>
        
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.8rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid" style={{ gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Имя пользователя (Логин)</label>
            <input 
              type="text" 
              className="input" 
              required 
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Email</label>
            <input 
              type="email" 
              className="input" 
              required 
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Роль</label>
            <select 
              className="input" 
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="покупатель">Покупатель</option>
              <option value="продавец">Продавец</option>
            </select>
          </div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Пароль</label>
              <input 
                type="password" 
                className="input" 
                required 
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Подтверждение</label>
              <input 
                type="password" 
                className="input" 
                required 
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Создать аккаунт</button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Уже есть аккаунт? <span onClick={() => navigate('login')} style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}>Войти</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
