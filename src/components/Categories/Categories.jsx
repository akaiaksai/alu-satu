import React, { useState } from "react";
import styles from "./Categories.module.css";

const categories = ["Все", "Телефоны", "Ноутбуки", "Одежда", "Обувь", "Часы", "Сумки", "Аксессуары", "Электроника", "Дом и сад"];

const Categories = ({ onFilter }) => {
  const [selected, setSelected] = useState("Все");

  const handleSelect = (cat) => {
    setSelected(cat);
    onFilter(cat === "Все" ? "All" : cat);
  };

  return (
    <div className={styles.container}>
      <h3>Категории</h3>
      <div className={styles.btns}>
        {categories.map((cat, index) => (
          <button 
            key={index} 
            className={`${styles.categoryBtn} ${selected === cat ? styles.active : ""}`}
            onClick={() => handleSelect(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Categories;
