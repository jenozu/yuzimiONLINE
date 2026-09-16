/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Collections } from "./pages/Collections";
import { Lookbook } from "./pages/Lookbook";
import { Archive } from "./pages/Archive";
import { Support } from "./pages/Support";
import { Legal } from "./pages/Legal";
import { ProductDetail } from "./pages/ProductDetail";
import { CartProvider } from "./context/CartContext";

export default function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="collections" element={<Collections />} />
            <Route path="lookbook" element={<Lookbook />} />
            <Route path="archive" element={<Archive />} />
            <Route path="support" element={<Support />} />
            <Route path="privacy" element={<Legal />} />
            <Route path="terms" element={<Legal />} />
            <Route path="security" element={<Legal />} />
            <Route path="product/:id" element={<ProductDetail />} />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}
