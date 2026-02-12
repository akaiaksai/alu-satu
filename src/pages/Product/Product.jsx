import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { mockProducts } from "../../data/mockProducts";
import styles from "./Product.module.css";
import formatPrice from "../../utils/formatPrice";

const getFallbackImage = (seed) => `https://source.unsplash.com/featured/900x900?product&sig=${encodeURIComponent(String(seed ?? "0"))}`;
const isNumericId = (value) => /^[0-9]+$/.test(String(value ?? "").trim());

const findListedProductById = (routeId) => {
  try {
    const raw = localStorage.getItem("listedProducts") || "[]";
    const listed = JSON.parse(raw);
    const rid = String(routeId);
    return (listed || []).find((p) => String(p?.id) === rid) || null;
  } catch {
    return null;
  }
};

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const listed = findListedProductById(id);
        if (listed) {
          if (mounted) setProduct(listed);
          return;
        }

        const fromMock = mockProducts.find((x) => String(x.id) === String(id));
        if (fromMock) {
          if (mounted) setProduct(fromMock);
          return;
        }

        if (!isNumericId(id)) {
          if (mounted) setProduct(null);
          return;
        }

        const res = await fetch(`https://dummyjson.com/products/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        const p = {
          id: data.id,
          name: data.title || data.name,
          price: data.price ?? 0,
          image: (data.images && data.images[0]) || data.thumbnail || "",
          description: data.description || "",
        };
        if (mounted) setProduct(p);
      } catch {
        if (mounted) setProduct(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false };
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;
  return (
    <div className={styles.productPage}>
      <div className={styles.media}>
        <img
          src={product.image}
          alt={product.name}
          onError={(e) => {
            const el = e.currentTarget;
            if (el.dataset.fallbackApplied) return;
            el.dataset.fallbackApplied = "1";
            el.src = getFallbackImage(product.id);
          }}
        />
      </div>
      <div className={styles.info}>
        <h1>{product.name}</h1>
        <p className={styles.price}>{formatPrice(product.price)}</p>
        {product.description && <p className={styles.desc}>{product.description}</p>}
        <button
          className={styles.addBtn}
          aria-label="Add to cart"
          title="Добавить в корзину"
          onClick={() => {
            try {
              const raw = localStorage.getItem("cart") || "[]";
              const cart = JSON.parse(raw);
              const existing = cart.find(item => String(item.id) === String(product.id));
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
          }}
        >
          Добавить в корзину
        </button>
      </div>
    </div>
  );
};

export default Product;
