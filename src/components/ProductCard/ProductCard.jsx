import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./ProductCard.module.css";
import formatPrice from "../../utils/formatPrice";

const FAVORITES_KEY = "favorites";

const getCategoryFallbackImage = (category, seed) => {
  const c = (category || "").toLowerCase();
  const sig = encodeURIComponent(String(seed ?? "0"));

  if (c.includes("телефон")) return `https://source.unsplash.com/featured/800x800?phone&sig=${sig}`;
  if (c.includes("ноут")) return `https://source.unsplash.com/featured/800x800?laptop&sig=${sig}`;
  if (c.includes("электрон")) return `https://source.unsplash.com/featured/800x800?electronics&sig=${sig}`;
  if (c.includes("одеж")) return `https://source.unsplash.com/featured/800x800?clothing&sig=${sig}`;
  if (c.includes("обув")) return `https://source.unsplash.com/featured/800x800?shoes&sig=${sig}`;
  if (c.includes("час")) return `https://source.unsplash.com/featured/800x800?watch&sig=${sig}`;
  if (c.includes("сум")) return `https://source.unsplash.com/featured/800x800?bag&sig=${sig}`;
  if (c.includes("аксесс")) return `https://source.unsplash.com/featured/800x800?accessories&sig=${sig}`;
  if (c.includes("дом") || c.includes("сад")) return `https://source.unsplash.com/featured/800x800?home&sig=${sig}`;

  return `https://source.unsplash.com/featured/800x800?product&sig=${sig}`;
};

const ProductCard = ({ product }) => {
  const isBannedImage =
    typeof product?.image === "string" &&
    (product.image.includes("/sparkle.png") || /placeholder\.com/.test(product.image));

  const productIdKey = String(product?.id);

  const [isHidden, setIsHidden] = useState(() => !product?.image || isBannedImage);
  const [isFav, setIsFav] = useState(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY) || "[]";
      const favs = JSON.parse(raw);
      return (favs || []).some((x) => String(x) === productIdKey);
    } catch {
      return false;
    }
  });

  const [imgSrc, setImgSrc] = useState(() => (isBannedImage ? "" : product.image));
  const [, setImgAttempt] = useState(0);

  const toggleFavorite = () => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY) || "[]";
      const favs = JSON.parse(raw) || [];

      const has = favs.some((x) => String(x) === productIdKey);
      let next;
      if (has) {
        next = favs.filter((x) => String(x) !== productIdKey);
        setIsFav(false);
      } else {
        next = [...favs, product.id];
        setIsFav(true);
      }
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("favorites:changed"));
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  const addToCart = () => {
    try {
      const raw = localStorage.getItem("cart") || "[]";
      const cart = JSON.parse(raw);
      const existing = (cart || []).find((item) => String(item?.id) === productIdKey);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent("cart:changed"));
      alert(`${product.name} добавлен в корзину!`);
    } catch (err) {
      console.error("Failed to add to cart", err);
    }
  };

  const handleImageError = () => {
    const apiImages = Array.isArray(product?.images) ? product.images : [];
    const fallbacks = [
      ...apiImages.filter((u) => typeof u === "string" && u.trim() && u.trim() !== imgSrc),
      getCategoryFallbackImage(product.category, `${product.id}-1`),
      getCategoryFallbackImage(product.category, `${product.id}-2`),
    ];

    setImgAttempt((attempt) => {
      if (attempt >= fallbacks.length) {
        setIsHidden(true);
        return attempt;
      }
      setImgSrc(fallbacks[attempt]);
      return attempt + 1;
    });
  };

  if (isHidden) return null;

  return (
    <div className={styles.card}>
      <img
        src={imgSrc}
        alt={product.name}
        className={styles.image}
        loading="lazy"
        onError={handleImageError}
      />
      <h3 className={styles.name}>{product.name}</h3>
      {product.description && (
        <p className={styles.preview}>
          {product.description.slice(0, 100)}
          {product.description.length > 100 ? "..." : ""}
        </p>
      )}
      <p className={styles.price}>{formatPrice(product.price)}</p>

      <div className={styles.actionsTop}>
        <button
          type="button"
          aria-pressed={isFav}
          className={`${styles.favBtn} ${isFav ? styles.favActive : ""}`}
          onClick={toggleFavorite}
          title="Добавить в избранное"
        >
          {isFav ? "★" : "☆"}
        </button>

        <button
          type="button"
          className={styles.cartBtn}
          onClick={addToCart}
          aria-label="Добавить в корзину"
          title="Добавить в корзину"
        >
          В корзину
        </button>
      </div>

      <div className={styles.actionsBottom}>
        <Link to={`/product/${product.id}`} className={styles.viewBtn} title="Посмотреть" aria-label="Посмотреть">
          Просмотреть
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
