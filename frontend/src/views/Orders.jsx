import { useEffect, useState } from "react";
import { useStore } from "../context/StoreContext";
import { api } from "../api/api";
import { Package, Clock, MapPin } from "lucide-react";

const Orders = () => {
  const { user } = useStore();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          const data = await api.getOrders();
          setOrders(data);
        } catch (err) {
          console.error("Failed to fetch orders:", err);
        }
      }
    };
    fetchOrders();
  }, [user]);

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 0" }}>
        <Package
          size={80}
          style={{
            color: "var(--color-border)",
            marginBottom: "1.5rem",
            margin: "0 auto",
          }}
        />
        <h2>У вас пока нет заказов</h2>
        <p style={{ color: "var(--color-text-muted)", marginTop: "1rem" }}>
          Сделайте ваш первый заказ в каталоге!
        </p>
      </div>
    );
  }

  return (
    <div className="orders-view">
      <h2 style={{ fontSize: "2rem", marginBottom: "2rem" }}>Мои заказы</h2>

      <div className="grid" style={{ gap: "1.5rem" }}>
        {orders.map((order) => (
          <div key={order.id} className="card">
            <div className="order-header-flex">
              <div>
                <h3 style={{ fontSize: "1.2rem" }}>Заказ №{order.id}</h3>
                <div
                  className="flex"
                  style={{
                    gap: "1rem",
                    marginTop: "0.4rem",
                    color: "var(--color-text-muted)",
                    fontSize: "0.9rem",
                  }}
                >
                  <span className="flex" style={{ gap: "0.3rem" }}>
                    <Clock size={16} />{" "}
                    {new Date(order.date).toLocaleDateString()}
                  </span>
                  <span
                    className="badge"
                    style={{ backgroundColor: "#fff7ed", color: "#c2410c" }}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
              <div
                className="mono"
                style={{ fontSize: "1.3rem", fontWeight: 700 }}
              >
                {order.total} ₽
              </div>
            </div>

            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "2rem",
              }}
            >
              <div>
                <h4
                  style={{
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    color: "var(--color-text-muted)",
                    marginBottom: "0.8rem",
                  }}
                >
                  Товары
                </h4>
                <div className="grid" style={{ gap: "0.5rem" }}>
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between"
                      style={{ fontSize: "0.95rem" }}
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="mono">
                        {item.price * item.quantity} ₽
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4
                  style={{
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    color: "var(--color-text-muted)",
                    marginBottom: "0.8rem",
                  }}
                >
                  Доставка
                </h4>
                <div
                  style={{ fontSize: "0.95rem", color: "var(--color-text)" }}
                >
                  <div
                    className="flex"
                    style={{ gap: "0.5rem", marginBottom: "0.3rem" }}
                  >
                    <MapPin
                      size={16}
                      style={{ color: "var(--color-primary)" }}
                    />
                    {order.address}
                  </div>
                  <div style={{ paddingLeft: "1.5rem", opacity: 0.8 }}>
                    Тел: {order.phone}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
