// src/pages/Auth/Register.jsx
import styles from "./Auth.module.css";

const Register = () => (
  <div className={styles.container}>
    <h1>Register</h1>
    <input type="text" placeholder="Name" />
    <input type="text" placeholder="Email" />
    <input type="password" placeholder="Password" />
    <button>Register</button>
  </div>
);

export default Register;
