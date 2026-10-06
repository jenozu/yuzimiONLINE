/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Collections } from "./pages/Collections";
import { Support } from "./pages/Support";
import { Legal } from "./pages/Legal";
import { ProductDetail } from "./pages/ProductDetail";
import { Admin } from "./pages/Admin";
import { CheckoutResult } from "./pages/CheckoutResult";
import { CartProvider } from "./context/CartContext";

export default function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="collections" element={<Collections />} />
            <Route path="support" element={<Support />} />
            <Route path="privacy" element={<Legal />} />
            <Route path="terms" element={<Legal />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="checkout/success" element={<CheckoutResult />} />
            <Route path="checkout/cancel" element={<CheckoutResult />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}
