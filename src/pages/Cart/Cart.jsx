import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Cart.module.css";
import formatPrice from "../../utils/formatPrice";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const load = () => {
    try {
      const raw = localStorage.getItem("cart") || "[]";
      setCart(JSON.parse(raw));
    } catch {
      setCart([]);
    }
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("cart:changed", handler);
    return () => window.removeEventListener("cart:changed", handler);
  }, []);

  const removeItem = (id) => {
    const updated = cart.filter(item => item.id !== id);
    localStorage.setItem("cart", JSON.stringify(updated));
    setCart(updated);
  };

  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    const updated = cart.map(item => 
      item.id === id ? { ...item, quantity: qty } : item
    );
    localStorage.setItem("cart", JSON.stringify(updated));
    setCart(updated);
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    setPaymentMessage("");

    // simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // payment successful
      const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
      setPaymentMessage(`✓ Спасибо! ${itemCount} товар(ов) успешно оплачен(ы).`);
      
      // clear cart after 2 seconds and optionally redirect
      setTimeout(() => {
        localStorage.setItem("cart", JSON.stringify([]));
        setCart([]);
        setPaymentMessage("");
      }, 2000);
    } catch {
      setPaymentMessage("✗ Ошибка при оплате. Попробуйте еще раз.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const fallbackImg = (seed) => `https://source.unsplash.com/featured/400x400?product&sig=${encodeURIComponent(String(seed ?? "0"))}`;

  return (
    <div className={styles.container}>
      <h1>Ваша корзина</h1>
      
      {paymentMessage && (
        <div className={`${styles.notification} ${paymentMessage.includes("✓") ? styles.success : styles.error}`}>
          {paymentMessage}
        </div>
      )}
      
      {cart.length === 0 ? (
        <p className={styles.empty}>Корзина пуста</p>
      ) : (
        <>
          <div className={styles.items}>
            {cart.map((item) => (
              <div key={item.id} className={styles.item}>
                <img
                  src={item.image}
                  alt={item.name}
                  className={styles.itemImg}
                  onError={(e) => {
                    const el = e.currentTarget;
                    if (el.dataset.fallbackApplied) return;
                    el.dataset.fallbackApplied = "1";
                    el.src = fallbackImg(item.id);
                  }}
                />
                <div className={styles.itemInfo}>
                  <h3>{item.name}</h3>
                  <p>{formatPrice(item.price)}</p>
                </div>
                <div className={styles.itemControls}>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <div className={styles.itemTotal}>
                  <p>{formatPrice(item.price * item.quantity)}</p>
                </div>
                <button 
                  className={styles.removeBtn}
                  onClick={() => removeItem(item.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className={styles.summary}>
            <h2>Итого: {formatPrice(total)}</h2>
            <button 
              className={styles.checkoutBtn}
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? "Обработка..." : "Оформить заказ"}
            </button>
            <button 
              className={styles.continueShopping}
              onClick={handleContinueShopping}
              disabled={isProcessing}
            >
              Продолжить покупки
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
