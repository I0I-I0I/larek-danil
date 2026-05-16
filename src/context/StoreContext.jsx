import { createContext, useContext, useState, useEffect } from "react";
import { mockDb } from "../api/mockDb";

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("larek_user")),
  );
  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("larek_cart")) || [],
  );
  const [view, setView] = useState("home"); // 'home', 'catalog', 'login', 'register', 'cart', 'checkout', 'orders'
  const [products] = useState(mockDb.getProducts());

  useEffect(() => {
    localStorage.setItem("larek_user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("larek_cart", JSON.stringify(cart));
  }, [cart]);

  const login = (emailOrUsername, password) => {
    const loggedInUser = mockDb.login(emailOrUsername, password);
    setUser(loggedInUser);
    setView("home");
    return loggedInUser;
  };

  const logout = () => {
    setUser(null);
    setView("home");
  };

  const register = (userData) => {
    const newUser = mockDb.register(userData);
    setUser(newUser);
    setView("home");
    return newUser;
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navigate = (newView) => {
    // Protected views
    if (["cart", "checkout", "orders"].includes(newView) && !user) {
      setView("login");
    } else {
      setView(newView);
      window.scrollTo(0, 0);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        view,
        navigate,
        products,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
