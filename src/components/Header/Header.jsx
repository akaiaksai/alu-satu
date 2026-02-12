import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import searchIcon from "../../assets/icons/search.svg";
import cartIcon from "../../assets/icons/cart.svg";

const Header = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(() => {
    try {
      const raw = localStorage.getItem("cart") || "[]";
      const cart = JSON.parse(raw);
      return (cart || []).reduce((s, item) => s + (item.quantity || 1), 0);
    } catch {
      return 0;
    }
  });
  const [favCount, setFavCount] = useState(() => {
    try {
      const raw = localStorage.getItem("favorites") || "[]";
      const favs = JSON.parse(raw);
      return favs.length || 0;
    } catch {
      return 0;
    }
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(() => {
    try {
      const currentUser = localStorage.getItem("currentUser");
      return currentUser ? JSON.parse(currentUser) : null;
    } catch {
      return null;
    }
  });
  const [searchQuery, setSearchQuery] = useState("");

  const updateCartCount = () => {
    try {
      const raw = localStorage.getItem("cart") || "[]";
      const cart = JSON.parse(raw);
      const count = (cart || []).reduce((s, item) => s + (item.quantity || 1), 0);
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  };

  const updateFavCount = () => {
    try {
      const raw = localStorage.getItem("favorites") || "[]";
      const favs = JSON.parse(raw);
      setFavCount(favs.length || 0);
    } catch {
      setFavCount(0);
    }
  };

  useEffect(() => {
    window.addEventListener("cart:changed", updateCartCount);
    window.addEventListener("favorites:changed", updateFavCount);
    return () => {
      window.removeEventListener("cart:changed", updateCartCount);
      window.removeEventListener("favorites:changed", updateFavCount);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Link to="/" className={styles.logoLink}>Alu-Satu</Link>
        </div>

        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Поиск товаров"
            className={styles.searchInput}
            aria-label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className={styles.searchButton} title="Search" aria-label="Search">
            <img src={searchIcon} alt="Search" />
          </button>
        </form>

        <nav className={styles.navIcons}>
          <Link to="/sell" className={styles.sellBtn} title="Продать товар" aria-label="Sell">
            Sell
          </Link>
          
          <Link to="/favorites" className={styles.iconBtn} aria-label="Favorites" title="Избранное">
            ★
            {favCount > 0 && <span className={styles.favBadge}>{favCount}</span>}
          </Link>
          
          <Link to="/cart" className={styles.iconBtn} aria-label="Cart" title="Корзина">
            <img src={cartIcon} alt="Cart" className={styles.cartImg} />
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </Link>
          
          {user ? (
            <div className={styles.userMenu}>
              <span className={styles.username}>{user.username || user.email}</span>
              <button onClick={handleLogout} className={styles.logoutBtn}>Выход</button>
            </div>
          ) : (
            <button 
              onClick={() => {
                setShowAuthModal(true);
                setAuthMode("login");
              }}
              className={styles.authBtn}
              aria-label="Login"
              title="Вход"
            >
              Sign up / Log in
            </button>
          )}
        </nav>
      </header>

      {showAuthModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAuthModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowAuthModal(false)}>✕</button>
            <div className={styles.brand}>Alu-Satu</div>
            {authMode === "login" ? (
              <LoginForm 
                onSuccess={(userData) => {
                  setUser(userData);
                  setShowAuthModal(false);
                }} 
                onSwitchMode={() => setAuthMode("register")}
              />
            ) : (
              <RegisterForm 
                onSuccess={(userData) => {
                  setUser(userData);
                  setShowAuthModal(false);
                }} 
                onSwitchMode={() => setAuthMode("login")}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

function LoginForm({ onSuccess, onSwitchMode }) {
  const [credential, setCredential] = useState(""); 
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (!credential || !password) {
      setError("Заполните все поля");
      return;
    }

    try {
      const usersRaw = localStorage.getItem("users") || "[]";
      const users = JSON.parse(usersRaw);
      const user = users.find(u => (u.email === credential || u.username === credential) && u.password === password);
      
      if (user) {
        localStorage.setItem("currentUser", JSON.stringify({ email: user.email, id: user.id, username: user.username }));
        onSuccess({ email: user.email, id: user.id, username: user.username });
        setError("");
      } else {
        setError("Неверный email или пароль");
      }
    } catch {
      setError("Ошибка входа");
    }
  };

  return (
    <form onSubmit={handleLogin} className={styles.authForm}>
      <h2>Вход</h2>
      <input
        type="text"
        placeholder="Email или username"
        value={credential}
        onChange={(e) => setCredential(e.target.value)}
        className={styles.authInput}
        autoFocus
      />
      <div className={styles.passwordRow}>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.authInput}
        />
        <button
          type="button"
          className={styles.showPwdBtn}
          onClick={() => setShowPassword(s => !s)}
          aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
        >
          {showPassword ? "Скрыть" : "Показать"}
        </button>
      </div>
      {error && <p className={styles.authError}>{error}</p>}
      <button type="submit" className={styles.authSubmitBtn}>Войти</button>
      <p className={styles.authSwitch}>
        Нет аккаунта? <button type="button" onClick={onSwitchMode} className={styles.switchLink}>Зарегистрироваться</button>
      </p>
    </form>
  );
}

function RegisterForm({ onSuccess, onSwitchMode }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [sentCode, setSentCode] = useState(null);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError("Заполните все поля");
      return;
    }
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен быть минимум 6 символов");
      return;
    }

    try {
      const usersRaw = localStorage.getItem("users") || "[]";
      let users = JSON.parse(usersRaw);
      
      if (users.find(u => u.email === email)) {
        setError("Этот email уже зарегистрирован");
        return;
      }
      if (users.find(u => u.username === username)) {
        setError("Этот username уже занят");
        return;
      }

      const code = String(Math.floor(100000 + Math.random() * 900000));
      const pending = { id: Date.now(), username, email, password, code, createdAt: Date.now() };
      localStorage.setItem("pendingRegistration", JSON.stringify(pending));
      setSentCode(code);
      console.log("Registration code (simulate SMS):", code);
      setIsVerifying(true);
      setError("Код отправлен на указанный номер/почту. Введите код для подтверждения.");
    } catch {
      setError("Ошибка регистрации");
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    try {
      const pendingRaw = localStorage.getItem("pendingRegistration");
      if (!pendingRaw) {
        setError("Нет ожидающей регистрации. Сначала заполните форму.");
        return;
      }
      const pending = JSON.parse(pendingRaw);
      if (String(codeInput).trim() === String(pending.code)) {
        const usersRaw = localStorage.getItem("users") || "[]";
        const users = JSON.parse(usersRaw);
        const newUser = { id: pending.id, username: pending.username, email: pending.email, password: pending.password };
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.removeItem("pendingRegistration");
        localStorage.setItem("currentUser", JSON.stringify({ email: newUser.email, id: newUser.id, username: newUser.username }));
        setError("");
        onSuccess({ email: newUser.email, id: newUser.id, username: newUser.username });
      } else {
        setError("Неверный код подтверждения");
      }
    } catch {
      setError("Ошибка подтверждения");
    }
  };

  const handleResend = () => {
    try {
      const pendingRaw = localStorage.getItem("pendingRegistration");
      if (!pendingRaw) return;
      const pending = JSON.parse(pendingRaw);
      const code = String(Math.floor(100000 + Math.random() * 900000));
      pending.code = code;
      pending.createdAt = Date.now();
      localStorage.setItem("pendingRegistration", JSON.stringify(pending));
      setSentCode(code);
      console.log("Resent registration code (simulate SMS):", code);
      setError("Код повторно отправлен");
    } catch {
      setError("Не удалось отправить код");
    }
  };

  const handleCancelVerification = () => {
    localStorage.removeItem("pendingRegistration");
    setIsVerifying(false);
    setCodeInput("");
    setError("");
  };

  if (isVerifying) {
    return (
      <form onSubmit={handleVerify} className={styles.authForm}>
        <h2>Подтверждение кода</h2>
        <p>Мы отправили 6-значный код. Введите его ниже.</p>
        <input
          type="text"
          placeholder="Код из SMS"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value.replace(/[^0-9]/g, ""))}
          className={styles.authInput}
          maxLength={6}
          autoFocus
        />
        {sentCode && <p className={styles.authNote}>(Для разработки код: {sentCode})</p>}
        {error && <p className={styles.authError}>{error}</p>}
        <div className={styles.verifyRow}>
          <button type="submit" className={styles.authSubmitBtn}>Проверить</button>
          <button type="button" onClick={handleResend} className={styles.resendBtn}>Отправить снова</button>
          <button type="button" onClick={handleCancelVerification} className={styles.cancelBtn}>Отмена</button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleRegister} className={styles.authForm}>
      <h2>Регистрация</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className={styles.authInput}
        autoFocus
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.authInput}
      />
      <div className={styles.passwordRow}>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.authInput}
        />
        <button
          type="button"
          className={styles.showPwdBtn}
          onClick={() => setShowPassword(s => !s)}
          aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
        >
          {showPassword ? "Скрыть" : "Показать"}
        </button>
      </div>
      <div className={styles.passwordRow}>
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Подтвердите пароль"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={styles.authInput}
        />
        <button
          type="button"
          className={styles.showPwdBtn}
          onClick={() => setShowConfirmPassword(s => !s)}
          aria-label={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}
        >
          {showConfirmPassword ? "Скрыть" : "Показать"}
        </button>
      </div>
      {error && <p className={styles.authError}>{error}</p>}
      <button type="submit" className={styles.authSubmitBtn}>Зарегистрироваться</button>
      <p className={styles.authSwitch}>
        Уже есть аккаунт? <button type="button" onClick={onSwitchMode} className={styles.switchLink}>Войти</button>
      </p>
    </form>
  );
}

export default Header;
