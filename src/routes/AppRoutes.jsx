  import { Routes, Route } from "react-router-dom";
  import MainLayout from "../layouts/MainLayout";
  import Home from "../pages/Home/Home";
  import Catalog from "../pages/Catalog/Catalog";
  import Product from "../pages/Product/Product";
  import Sell from "../pages/Sell/Sell";
  import Profile from "../pages/Profile/Profile";
  import Login from "../pages/Auth/Login";
  import Register from "../pages/Auth/Register";
  import NotFound from "../pages/NotFound";
  import Favorites from "../pages/Favorites/Favorites";
  import Cart from "../pages/Cart/Cart";


  const AppRoutes = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/product/:id" element={<Product />} />
      <Route path="/sell" element={<Sell />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/cart" element={<Cart />} />
    </Route>

    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="*" element={<NotFound />} />
  </Routes>

  );

  export default AppRoutes;
