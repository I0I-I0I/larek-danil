import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { mockDb } from "../api/mockDb";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { useFormValidation } from "../hooks/useFormValidation";
import { validatePhone, validateMinLength } from "../utils/validation";

const Checkout = () => {
  const { user, cart, cartTotal, clearCart, navigate } = useStore();
  const [orderId, setOrderId] = useState(null);
  const [serverError, setServerError] = useState("");

  const validate = (values) => {
    const errors = {};
    
    const addressError = validateMinLength(values.address, 5, 'Адрес');
    if (addressError) errors.address = addressError;

    const phoneError = validatePhone(values.phone);
    if (phoneError) errors.phone = phoneError;

    return errors;
  };

  const handleCreateOrder = (values) => {
    setServerError("");
    try {
      const newOrder = mockDb.createOrder({
        userId: user.id,
        userName: user.username,
        items: cart,
        total: cartTotal,
        address: values.address,
        phone: values.phone,
        status: "Принят",
      });
      setOrderId(newOrder.id);
      clearCart();
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
    { address: "", phone: "" },
    validate,
    handleCreateOrder
  );

  if (orderId) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "4rem 0",
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        <CheckCircle
          size={80}
          style={{ color: "var(--color-accent)", marginBottom: "1.5rem" }}
        />
        <h2 style={{ marginBottom: "1rem" }}>Заказ №{orderId} принят!</h2>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "2.5rem" }}>
          Спасибо за покупку, {user.username}! Мы свяжемся с вами в ближайшее
          время для уточнения деталей доставки.
        </p>
        <div className="flex" style={{ gap: "1rem", justifyContent: "center" }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate("orders")}
          >
            Мои заказы
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigate("catalog")}
          >
            В каталог
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="checkout-view"
      style={{ maxWidth: "600px", margin: "0 auto" }}
    >
      <button
        className="btn btn-ghost"
        style={{ marginBottom: "1.5rem", paddingLeft: 0 }}
        onClick={() => navigate("cart")}
      >
        <ArrowLeft size={18} /> Назад в корзину
      </button>

      <h2 style={{ fontSize: "2rem", marginBottom: "2rem" }}>
        Оформление заказа
      </h2>

      <div className="card">
        {serverError && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              padding: "0.8rem",
              borderRadius: "var(--radius)",
              marginBottom: "1rem",
              fontSize: "0.9rem",
            }}
          >
            {serverError}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="grid"
          style={{ gap: "1.5rem" }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.4rem",
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              Имя получателя
            </label>
            <input
              type="text"
              className="input"
              value={user.username}
              disabled
              style={{ backgroundColor: "#f5f0e8", cursor: "not-allowed" }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.4rem",
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              Адрес доставки
            </label>
            <textarea
              name="address"
              className={`input ${touched.address && errors.address ? 'input-error' : ''}`}
              required
              rows="3"
              placeholder="Город, улица, дом, квартира..."
              value={values.address}
              onChange={handleChange}
              onBlur={handleBlur}
              style={{ resize: "vertical" }}
            />
            {touched.address && errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.4rem",
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              Телефон
            </label>
            <input
              name="phone"
              type="tel"
              className={`input ${touched.phone && errors.phone ? 'input-error' : ''}`}
              required
              placeholder="+7 (___) ___-__-__"
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.phone && errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              backgroundColor: "#fffbeb",
              borderRadius: "var(--radius)",
              border: "1px dashed var(--color-primary)",
            }}
          >
            <div
              className="flex justify-between"
              style={{ fontWeight: 700, fontSize: "1.1rem" }}
            >
              <span>Итого к оплате:</span>
              <span className="mono">{cartTotal} ₽</span>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: "0.5rem", width: "100%", fontSize: "1.1rem" }}
          >
            Подтвердить заказ
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
