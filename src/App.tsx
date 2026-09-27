/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { Layout } from "./components/Layout";
import { CartProvider } from "./context/CartContext";

const Home = lazy(() => import("./pages/Home").then((module) => ({ default: module.Home })));
const Collections = lazy(() => import("./pages/Collections").then((module) => ({ default: module.Collections })));
const Lookbook = lazy(() => import("./pages/Lookbook").then((module) => ({ default: module.Lookbook })));
const Archive = lazy(() => import("./pages/Archive").then((module) => ({ default: module.Archive })));
const Support = lazy(() => import("./pages/Support").then((module) => ({ default: module.Support })));
const Legal = lazy(() => import("./pages/Legal").then((module) => ({ default: module.Legal })));
const ProductDetail = lazy(() => import("./pages/ProductDetail").then((module) => ({ default: module.ProductDetail })));
const Admin = lazy(() => import("./pages/Admin").then((module) => ({ default: module.Admin })));
const AdminOrders = lazy(() => import("./pages/AdminOrders").then((module) => ({ default: module.AdminOrders })));
const CheckoutResult = lazy(() => import("./pages/CheckoutResult").then((module) => ({ default: module.CheckoutResult })));

function RouteFallback() {
  return <div className="min-h-[50vh] grid place-items-center font-black uppercase tracking-[0.2em]">Loading yuzimiONLINE…</div>;
}

export default function App() {
  return (
    <CartProvider>
      <MotionConfig reducedMotion="user">
        <Router>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
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
              <Route path="checkout/success" element={<CheckoutResult />} />
              <Route path="checkout/cancel" element={<CheckoutResult />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
            </Routes>
          </Suspense>
        </Router>
      </MotionConfig>
    </CartProvider>
  );
}
