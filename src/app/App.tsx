import { RouterProvider } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { router } from "./routes";
import { CartProvider } from "./components/CartContext";
import { CookieBanner } from "./components/CookieBanner";
import { BackendStatusBadge } from "./components/BackendStatusBadge";

export default function App() {
  return (
    <HelmetProvider>
      <CartProvider>
        <RouterProvider router={router} />
        <CookieBanner />
        <BackendStatusBadge />
      </CartProvider>
    </HelmetProvider>
  );
}