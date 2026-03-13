import { RouterProvider } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { router } from "./routes";
import { CookieBanner } from "./components/CookieBanner";
import { CartProvider } from "./components/CartContext";

export default function App() {
  return (
    <HelmetProvider>
      <CartProvider>
        <RouterProvider router={router} />
        <CookieBanner />
      </CartProvider>
    </HelmetProvider>
  );
}
