import React, { useState, useEffect } from "react";
import ProductCard from "../../components/ProductCard/ProductCard";
import Categories from "../../components/Categories/Categories";
import styles from "./Home.module.css";
import { getCuratedProducts, getProducts } from "../../api/products.api";
import { mockProducts } from "../../data/mockProducts";

const HOME_CATEGORIES = [
  "Телефоны",
  "Ноутбуки",
  "Одежда",
  "Обувь",
  "Часы",
  "Сумки",
  "Аксессуары",
  "Электроника",
  "Дом и сад",
];

const Home = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let data = [];
        try {
          data = await getCuratedProducts({ perCategory: 12 });
          if (!data.length) data = await getProducts({ limit: 200 });
        } catch {
          data = [];
        }

        const listedRaw = localStorage.getItem("listedProducts") || "[]";
        const listed = JSON.parse(listedRaw);
        data = [...data, ...listed];

        if (!data.length) data = mockProducts;

        const seenImages = new Set();
        const allowedCategories = new Set(HOME_CATEGORIES);

        const validProducts = data.filter((p) => {
          const img = (p.image || "").toString();
          const isPlaceholder = /placeholder\.com|via\.placeholder\.com/i.test(img);
          if (!img.trim() || isPlaceholder) return false;
          if (seenImages.has(img)) return false;

          const category = (p.category || "").trim();
          if (!allowedCategories.has(category)) return false;

          seenImages.add(img);
          return true;
        });
        if (mounted) {
          setAllProducts(validProducts);
        }
      } catch {
        if (mounted) {
          setAllProducts(mockProducts);
          setError("Ошибка загрузки. Показываются доступные товары.");
        }
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
  }, []);

  const getProductsByCategory = (category) => {
    return allProducts.filter((p) => {
      const pcat = (p.category || "").toLowerCase();
      return pcat.includes(category.toLowerCase()) || category.toLowerCase().includes(pcat);
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 style={{color: "white"}}>Добро пожаловать в Alu-Satu</h1>
        <p>Лучшие товары по доступным ценам</p>
      </div>

      <Categories onFilter={setSelectedCategory} />

      {error && <p className={styles.error}>{error}</p>}
      {loading && <p className={styles.loading}>Загрузка товаров...</p>}

      {!loading && (
        <>
          <div className={styles.grid}>
            {selectedCategory && selectedCategory !== "All"
              ? getProductsByCategory(selectedCategory).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              : allProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
