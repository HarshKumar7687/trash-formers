import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import SocialFeed from "./pages/SocialFeed";
import WasteUpload from "./pages/WasteUpload";
import Learning from "./pages/Learning";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./components/UserManagement";
import WasteReview from "./components/WasteReview";
import Contests from "./components/ContestManagement";
import Statistics from "./components/SystemStats";
import Shop from "./pages/Shop";
import SellProduct from "./pages/SellProduct";
import ProductDetail from "./pages/ProductDetail";
import Orders from "./pages/Orders";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/waste-upload" element={<WasteUpload />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/social-feed" element={<SocialFeed />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/waste" element={<WasteReview />} />
        <Route path="/admin/contests" element={<Contests />} />
        <Route path="/admin/stats" element={<Statistics />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/sell" element={<SellProduct />} />
        <Route path="/shop/product/:id" element={<ProductDetail />} />
        <Route path="/shop/orders" element={<Orders />} />
      </Routes>
    </Router>
  );
};

export default App;
