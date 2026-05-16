import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useFormValidation } from '../hooks/useFormValidation';
import { validateEmail, validateMinLength } from '../utils/validation';

const Register = () => {
  const { register, navigate } = useStore();
  const [serverError, setServerError] = useState('');

  const validate = (values) => {
    const errors = {};
    
    const usernameError = validateMinLength(values.username, 3, 'Имя пользователя');
    if (usernameError) errors.username = usernameError;

    const emailError = validateEmail(values.email);
    if (emailError) errors.email = emailError;

    const passwordError = validateMinLength(values.password, 4, 'Пароль');
    if (passwordError) errors.password = passwordError;

    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Пароли не совпадают';
    }

    return errors;
  };

  const handleRegister = (values) => {
    setServerError('');
    try {
      const userData = { ...values };
      delete userData.confirmPassword;
      register(userData);
    } catch (err) {
      setServerError(err.message);
    }
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit
  } = useFormValidation(
    { 
      username: '', 
      email: '', 
      password: '', 
      confirmPassword: '',
      role: 'покупатель'
    },
    validate,
    handleRegister
  );

  return (
    <div style={{ maxWidth: '450px', margin: '4rem auto' }}>
      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Регистрация</h2>
        
        {serverError && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.8rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid" style={{ gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Имя пользователя (Логин)</label>
            <input 
              name="username"
              type="text" 
              className={`input ${touched.username && errors.username ? 'input-error' : ''}`}
              required 
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.username && errors.username && <span className="error-text">{errors.username}</span>}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Email</label>
            <input 
              name="email"
              type="email" 
              className={`input ${touched.email && errors.email ? 'input-error' : ''}`}
              required 
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.email && errors.email && <span className="error-text">{errors.email}</span>}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Роль</label>
            <select 
              name="role"
              className="input" 
              value={values.role}
              onChange={handleChange}
            >
              <option value="покупатель">Покупатель</option>
              <option value="продавец">Продавец</option>
            </select>
          </div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Пароль</label>
              <input 
                name="password"
                type="password" 
                className={`input ${touched.password && errors.password ? 'input-error' : ''}`}
                required 
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.password && errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Подтверждение</label>
              <input 
                name="confirmPassword"
                type="password" 
                className={`input ${touched.confirmPassword && errors.confirmPassword ? 'input-error' : ''}`}
                required 
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.confirmPassword && errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
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
