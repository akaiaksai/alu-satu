import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.column}>
          <h4>О компании</h4>
          <ul>
            <li><a href="#">О нас</a></li>
            <li><a href="#">История</a></li>
            <li><a href="#">Карьера</a></li>
            <li><a href="#">Пресс-центр</a></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h4>Помощь и поддержка</h4>
          <ul>
            <li><a href="#">Центр помощи</a></li>
            <li><a href="#">Как купить</a></li>
            <li><a href="#">Как продать</a></li>
            <li><a href="#">Доставка и возврат</a></li>
            <li><a href="#">Найти заказ</a></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h4>Правовая информация</h4>
          <ul>
            <li><a href="#">Условия использования</a></li>
            <li><a href="#">Политика конфиденциальности</a></li>
            <li><a href="#">Политика cookies</a></li>
            <li><a href="#">Безопасность</a></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h4>Свяжитесь с нами</h4>
          <ul>
            <li>support@alu-satu.com</li>
            <li>+7 (999) 999-99-99</li>
            <li> г. Караганды, ул. Акай Аксая, 11</li>
          </ul>
          <div className={styles.social}>
            <a href="#">TT</a>
            <a href="#">INST</a>
            <a href="#">TWT</a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>&copy; 2026 Alu-Satu Marketplace. Все права защищены.</p>
      </div>
    </footer>
  );
};

export default Footer;
