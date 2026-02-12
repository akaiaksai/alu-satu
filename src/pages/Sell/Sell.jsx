// src/pages/Sell/Sell.jsx
import React, { useState } from "react";
import styles from "./Sell.module.css";

const categories = ["Телефоны", "Ноутбуки", "Одежда", "Обувь", "Часы", "Сумки", "Аксессуары", "Электроника", "Дом и сад"];

const generateRouteId = () => {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // ignore
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const Sell = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Телефоны");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !price) {
      setMsgType("error");
      setMsg("⚠️ Пожалуйста, введите название и цену.");
      return;
    }

    if (!image.trim()) {
      setMsgType("error");
      setMsg("⚠️ Добавьте ссылку на фото (без фото товар не публикуется).");
      return;
    }

    try {
      const raw = localStorage.getItem("listedProducts") || "[]";
      const list = JSON.parse(raw);
      const id = generateRouteId();
      const product = { 
        id, 
        name: title, 
        price: +price, 
        category, 
        description, 
        image
      };
      list.push(product);
      localStorage.setItem("listedProducts", JSON.stringify(list));
      setMsgType("success");
      setMsg("✓ Товар успешно опубликован!");
      setTitle(""); 
      setPrice(""); 
      setCategory("Телефоны"); 
      setDescription(""); 
      setImage("");
      window.dispatchEvent(new CustomEvent("myproducts:changed"));
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setMsgType("error");
      setMsg("✗ Ошибка при добавлении товара.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Продайте свой товар</h1>
        <p className={styles.subtitle}>Быстро и просто разместите объявление</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Название товара <span className={styles.required}>*</span>
          </label>
          <input 
            id="title"
            type="text" 
            placeholder="Например: iPhone 13 Pro" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label htmlFor="price" className={styles.label}>
              Цена (₸) <span className={styles.required}>*</span>
            </label>
            <input 
              id="price"
              type="number" 
              placeholder="0" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              Категория
            </label>
            <select 
              id="category"
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className={styles.select}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="image" className={styles.label}>
            Ссылка на фото
          </label>
          <input 
            id="image"
            type="url" 
            placeholder="https://example.com/photo.jpg" 
            value={image} 
            onChange={(e) => setImage(e.target.value)}
            className={styles.input}
          />
          {image && (
            <div className={styles.preview}>
              <img src={image} alt="Превью" onError={(e) => e.target.src = "https://via.placeholder.com/200?text=Ошибка+загрузки"} />
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Описание
          </label>
          <textarea 
            id="description"
            placeholder="Расскажите подробнее о товаре..." 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textarea}
            rows="6"
          />
        </div>

        <button type="submit" className={styles.submitBtn}>
          Опубликовать товар
        </button>
      </form>

      {msg && (
        <div className={`${styles.message} ${styles[msgType]}`}>
          {msg}
        </div>
      )}
    </div>
  );
};

export default Sell;
