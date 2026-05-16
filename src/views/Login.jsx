import { useState } from 'react';
import { useStore } from '../context/StoreContext';

const Login = () => {
  const { login, navigate } = useStore();
  const [formData, setFormData] = useState({ emailOrUsername: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    try {
      login(formData.emailOrUsername, formData.password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Вход в систему</h2>
        
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.8rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid" style={{ gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Email или Логин</label>
            <input 
              type="text" 
              className="input" 
              required 
              value={formData.emailOrUsername}
              onChange={e => setFormData({ ...formData, emailOrUsername: e.target.value })}
            />
          </div>
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
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Войти</button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Нет аккаунта? <span onClick={() => navigate('register')} style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}>Зарегистрироваться</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
