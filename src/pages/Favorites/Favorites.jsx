import React, { useEffect, useState } from "react";
import styles from './Favorites.module.css'
import { mockProducts } from "../../data/mockProducts";
import ProductCard from "../../components/ProductCard/ProductCard";
import { getProducts } from "../../api/products.api";

const FAVORITES_KEY = "favorites";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const raw = localStorage.getItem(FAVORITES_KEY) || "[]";
      const ids = JSON.parse(raw);

      // get user-listed products from localStorage
      const listedRaw = localStorage.getItem("listedProducts") || "[]";
      const listed = JSON.parse(listedRaw);

      let remote = [];
      try {
        remote = await getProducts({ limit: 200 });
      } catch {
        // ignore, we'll fall back to mock + listed
        remote = [];
      }

      // build map by id
      const map = new Map();
      listed.forEach((p) => map.set(p.id, p));
      mockProducts.forEach((p) => map.set(p.id, p));
      remote.forEach((p) => map.set(p.id, p));

      // resolve favorites to product objects, if missing attempt fetch per-id
      const resolved = [];
      for (const id of ids) {
        let p = map.get(id);
        if (!p) {
          try {
            const res = await fetch(`https://dummyjson.com/products/${id}`);
            if (res.ok) {
              const data = await res.json();
              p = {
                id: data.id,
                name: data.title || data.name,
                price: data.price ?? 0,
                image: (data.images && data.images[0]) || data.thumbnail || "",
                description: data.description || "",
              };
              map.set(p.id, p);
            }
          } catch {
            p = null;
          }
        }
        if (p) resolved.push(p);
      }

      setFavorites(resolved);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("favorites:changed", handler);
    return () => window.removeEventListener("favorites:changed", handler);
  }, []);

  return (
    <div className={styles.container}>
      <h1>Избранное</h1>
      {loading ? (
        <p>Загрузка...</p>
      ) : favorites.length === 0 ? (
        <p>Пока нет избранных товаров.</p>
      ) : (
        <div className={styles.grid}>
          {favorites
            .filter(p => p.image && !/placeholder\.com/.test(p.image) && p.image.trim() !== "")
            .slice(0, 12)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
