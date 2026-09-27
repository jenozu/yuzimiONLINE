import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { Toast } from "./Toast";
import { ScrollToTop } from "./ScrollToTop";
import { RouteMeta } from "./PageMeta";

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-cherry selection:text-charcoal">
      <ScrollToTop />
      <RouteMeta />
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
