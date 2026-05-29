import { useStore } from './context/StoreContext';
import { ShoppingCart, User, LogOut } from 'lucide-react';

// Import Views (we'll create these next)
import HomeView from './views/Home';
import CatalogView from './views/Catalog';
import LoginView from './views/Login';
import RegisterView from './views/Register';
import CartView from './views/Cart';
import CheckoutView from './views/Checkout';
import OrdersView from './views/Orders';
import SellerDashboardView from './views/SellerDashboard';

function App() {
  const { view, navigate, user, logout, cartCount } = useStore();

  const renderView = () => {
    switch (view) {
      case 'home': return <HomeView />;
      case 'catalog': return <CatalogView />;
      case 'login': return <LoginView />;
      case 'register': return <RegisterView />;
      case 'cart': return <CartView />;
      case 'checkout': return <CheckoutView />;
      case 'orders': return <OrdersView />;
      case 'seller-dashboard': return <SellerDashboardView />;
      default: return <HomeView />;
    }
  };

  const isAuthPage = ['login', 'register'].includes(view);

  return (
    <div className={`app-layout ${isAuthPage ? 'auth-layout' : ''}`} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <header className="app-header">
        <div className="container header-container">
          <div className="header-left">
            <h1 onClick={() => navigate('home')} style={{ cursor: 'pointer', fontSize: '1.8rem' }}>ЛАРЁК</h1>
            <nav className="header-nav">
              <button className="btn-ghost btn" onClick={() => navigate('catalog')}>Каталог</button>
              {user && <button className="btn-ghost btn" onClick={() => navigate('orders')}>Мои заказы</button>}
              {user && user.role === 'seller' && <button className="btn-ghost btn" onClick={() => navigate('seller-dashboard')}>Мои товары</button>}
            </nav>
          </div>

          <div className="header-actions">
            {user ? (
              <div className="flex" style={{ gap: '1rem' }}>
                <div className="flex" style={{ gap: '0.5rem', color: 'var(--color-text-muted)' }}>
                  <User size={18} />
                  <span>{user.username}</span>
                </div>
                <button className="btn-ghost btn" onClick={logout} title="Выйти">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button className="btn-outline btn" onClick={() => navigate('login')}>Войти</button>
            )}
            
            <button className="btn-primary btn" onClick={() => navigate('cart')}>
              <ShoppingCart size={18} />
              <span>{cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem 0' }}>
        <div className="container">
          {renderView()}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: 'var(--color-secondary)', 
        color: 'white', 
        padding: '3rem 0',
        marginTop: '2rem'
      }}>
        <div className="container footer-content">
          <div>
            <h3 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>ЛАРЁК</h3>
            <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Вещи, продукты и электроника в одном месте. Просто и со вкусом.</p>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '1rem' }}>Навигация</h4>
            <ul style={{ listStyle: 'none', opacity: 0.8, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li onClick={() => navigate('catalog')} style={{ cursor: 'pointer' }}>Каталог</li>
              <li onClick={() => navigate('home')} style={{ cursor: 'pointer' }}>О нас</li>
              <li>Доставка</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '1rem' }}>Контакты</h4>
            <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Email: support@larek.ru</p>
            <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Тел: 8 (800) 555-35-35</p>
          </div>
        </div>
        <div className="container" style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem' }}>
          © 2026 ЛАРЁК. Все права защищены. Дипломный проект.
        </div>
      </footer>
    </div>
  );
}

export default App;
