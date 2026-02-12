// src/pages/Auth/Login.jsx
import styles from "./Auth.module.css";

const Login = () => (
  <div className={styles.container}>
    <h1>Login</h1>
    <input type="text" placeholder="Email" />
    <input type="password" placeholder="Password" />
    <button>Login</button>
  </div>
);

export default Login;
