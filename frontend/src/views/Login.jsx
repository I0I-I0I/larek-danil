import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useFormValidation } from '../hooks/useFormValidation';
import { validateRequired } from '../utils/validation';

const Login = () => {
  const { login, navigate } = useStore();
  const [serverError, setServerError] = useState('');

  const validate = (values) => {
    const errors = {};
    const emailOrUsernameError = validateRequired(values.emailOrUsername, 'Email или Логин');
    if (emailOrUsernameError) errors.emailOrUsername = emailOrUsernameError;

    const passwordError = validateRequired(values.password, 'Пароль');
    if (passwordError) errors.password = passwordError;

    return errors;
  };

  const handleLogin = async (values) => {
    setServerError("");
    try {
      await login(values.emailOrUsername, values.password);
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
    { emailOrUsername: '', password: '' },
    validate,
    handleLogin
  );

  return (
    <>
      <div className="login-page-bg"></div>
      <div style={{ maxWidth: '400px', margin: '4rem auto' }}>
        <div className="card">
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Вход в систему</h2>
        
        {serverError && (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.8rem', borderRadius: 'var(--radius)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid" style={{ gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>Email или Логин</label>
            <input 
              name="emailOrUsername"
              type="text" 
              className={`input ${touched.emailOrUsername && errors.emailOrUsername ? 'input-error' : ''}`}
              required 
              value={values.emailOrUsername}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.emailOrUsername && errors.emailOrUsername && <span className="error-text">{errors.emailOrUsername}</span>}
          </div>
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
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Войти</button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Нет аккаунта? <span onClick={() => navigate('register')} style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}>Зарегистрироваться</span>
        </p>
      </div>
    </div>
    </>
  );
};

export default Login;
