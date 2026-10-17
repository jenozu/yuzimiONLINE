import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { Toast } from "./Toast";
import { ScrollToTop } from "./ScrollToTop";

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-cherry selection:text-charcoal">
      {import.meta.env.VITE_EDITORIAL_PREVIEW === "true" && <div className="preview-banner" role="status">Editorial design preview · Simulated checkout · No orders or payments</div>}
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <Toast />
    </div>
  );
}
