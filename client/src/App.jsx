import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Products from "./pages/products";
import AboutUs from "./pages/aboutUs";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import ProductPage from "./pages/productPage";
import DashboardAdmin from "./pages/admin/dashboard";
import DashboardUser from "./pages/user/dashboard";
import ListUser from "./pages/admin/listUser";
import ListProduct from "./pages/admin/manageProduct/listProduct";
import ListCategory from "./pages/admin/listCategory";
import AddProduct from "./pages/admin/manageProduct/addProduct";
import EditProduct from "./pages/admin/manageProduct/editProduct";
import Receipt from "./pages/admin/receipt";
import NotFound from "./pages/notFound";
import ProtectedRoute from "./components/protectedRoute";
import ProfileUser from "./pages/user/profile";
import OrdersUser from "./pages/user/orders";
import EditProfileUser from "./pages/user/editProfile";
import CartPage from "./pages/cart"; // Import CartPage

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/productpage/:id" element={<ProductPage />} />
        <Route path="/cart" element={<ProtectedRoute requiredRole="user"><CartPage /></ProtectedRoute>} /> {/* Rute baru untuk keranjang */}

        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><DashboardAdmin /></ProtectedRoute>} />
        <Route path="/admin/Users" element={<ProtectedRoute requiredRole="admin"><ListUser /></ProtectedRoute>} />
        <Route path="/admin/list-produk" element={<ProtectedRoute requiredRole="admin"><ListProduct /></ProtectedRoute>} />
        <Route path="/admin/list-kategori" element={<ProtectedRoute requiredRole="admin"><ListCategory /></ProtectedRoute>} />
        <Route path="/admin/tambah-produk" element={<ProtectedRoute requiredRole="admin"><AddProduct /></ProtectedRoute>} />
        <Route path="/admin/edit-produk/:id" element={<ProtectedRoute requiredRole="admin"><EditProduct /></ProtectedRoute>} />
        <Route path="/admin/riwayat" element={<ProtectedRoute requiredRole="admin"><Receipt /></ProtectedRoute>} />
       
        <Route path="/user/dashboard" element={<ProtectedRoute requiredRole="user"><DashboardUser /></ProtectedRoute>} />
        <Route path="/user/profile" element={<ProtectedRoute requiredRole="user"><ProfileUser /></ProtectedRoute>} />
        <Route path="/user/orders" element={<ProtectedRoute requiredRole="user"><OrdersUser /></ProtectedRoute>} />
        <Route path="/user/edit-profile" element={<ProtectedRoute requiredRole="user"><EditProfileUser /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;