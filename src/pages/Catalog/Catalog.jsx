import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { mockProducts } from "../../data/mockProducts";
import ProductCard from "../../components/ProductCard/ProductCard";
import Categories from "../../components/Categories/Categories";
import styles from "./Catalog.module.css";
import { getCuratedProducts, getProducts, searchProducts } from "../../api/products.api";
import formatPrice from "../../utils/formatPrice";

const isPlaceholderImage = (url) => /placeholder\.com|via\.placeholder\.com/i.test((url || "").toString());
const ALLOWED_CATEGORIES = new Set([
  "Телефоны",
  "Ноутбуки",
  "Одежда",
  "Обувь",
  "Часы",
  "Сумки",
  "Аксессуары",
  "Электроника",
  "Дом и сад",
]);

const Catalog = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const search = query.get("search") || "";

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceMax, setPriceMax] = useState(1000000);
  const [priceRange, setPriceRange] = useState([0, 1000000]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        let data;
        if (search) {
          data = await searchProducts(search, { limit: 200 });
        } else {
          data = await getCuratedProducts({ perCategory: 20 });
          if (!data.length) data = await getProducts({ limit: 200 });
        }
        const listedRaw = localStorage.getItem("listedProducts") || "[]";
        const listed = JSON.parse(listedRaw);
        data = [...data, ...listed]
          .filter((p) => p && p.image && !isPlaceholderImage(p.image) && p.image.toString().trim() !== "")
          .filter((p) => ALLOWED_CATEGORIES.has((p.category || "").toString().trim()));

        const max = data.reduce((acc, p) => Math.max(acc, Number(p.price) || 0), 0);
        const roundedMax = Math.max(1000, Math.ceil(max / 1000) * 1000);
        if (!mounted) return;
        setProducts(data);
        setFiltered(data.slice(0, 30));
        setPriceMax(roundedMax);
        setPriceRange([0, roundedMax]);
      } catch (e) {
        if (!mounted) return;
        console.warn("Catalog load failed, falling back to mockProducts", e);
        setProducts(mockProducts);
        setFiltered(mockProducts.slice(0, 30));
        setError(e.message || "Failed to load products");
        const max = mockProducts.reduce((acc, p) => Math.max(acc, Number(p.price) || 0), 0);
        const roundedMax = Math.max(1000, Math.ceil(max / 1000) * 1000);
        setPriceMax(roundedMax);
        setPriceRange([0, roundedMax]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    const handleProducts = () => load();
    window.addEventListener("myproducts:changed", handleProducts);

    return () => {
      mounted = false;
      window.removeEventListener("myproducts:changed", handleProducts);
    };
  }, [search]);

  useEffect(() => {
    let result = products.slice();
    if (selectedCategory && selectedCategory !== "All") {
      const searchTerm = selectedCategory.toLowerCase();
      result = result.filter((p) => {
        const category = (p.category || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        // First try exact category match
        if (category.includes(searchTerm) || searchTerm.includes(category)) return true;
        // Also search in name for fallback
        return name.includes(searchTerm);
      });
    }
    result = result.filter((p) => (p.price || 0) >= priceRange[0] && (p.price || 0) <= priceRange[1]);
    setFiltered(result);
  }, [products, selectedCategory, priceRange]);

  return (
    <div className={styles.container}>
      <h1>Catalog</h1>

      <Categories onFilter={setSelectedCategory} />

      <div className={styles.filterSection}>
        <h3>Фильтр по цене</h3>
        <div className={styles.priceFilter}>
          <input
            type="range"
            min="0"
            max={priceMax}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, +e.target.value])}
            className={styles.slider}
          />
          <span>{formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}</span>
        </div>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <>
          {error && <p className={styles.error}>Ошибка: {error}</p>}
          {filtered.length === 0 ? (
            <p className={styles.noProducts}>Нет товаров, соответствующих фильтрам</p>
          ) : (
            <div className={styles.grid}>
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Catalog;
