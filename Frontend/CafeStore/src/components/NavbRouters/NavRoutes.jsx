import React from "react";
import { Route, Routes } from "react-router-dom";
import Allpages from "../../pages/allPages";
import Navbar from "./Navbar";
import Footer from "./Footer";
export default function NavRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Allpages.Home />} />
        <Route path="/menu" element={<Allpages.Menu />} />
        <Route path="/categories" element={<Allpages.Categories />} />
        <Route path="/about" element={<Allpages.About />} />
        <Route path="/contact" element={<Allpages.Contact />} />
        <Route path="/cart" element={<Allpages.Cart />} />
        <Route path="/login" element={<Allpages.Login />} />
        <Route path="/register" element={<Allpages.Register />} />
        <Route path="/orders" element={<Allpages.Orders />} />
        <Route path="*" element={<Allpages.NotFound />} />
        <Route element={<Allpages.AdminRoute />}>
          <Route path="/admin/orders" element={<Allpages.AdminOrders />} />
          <Route path="/admin/manage" element={<Allpages.AdminManagement />} />
          <Route
            path="/admin/inventory"
            element={<Allpages.AdminInventory />}
          />
          <Route
            path="/admin/promotions"
            element={<Allpages.AdminPromotions />}
          />
        </Route>
      </Routes>
      <Footer />
    </>
  );
}
