import { RouterProvider } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { router } from "./routes";
import { CookieBanner } from "./components/CookieBanner";

export default function App() {
  return (
    <HelmetProvider>
      <RouterProvider router={router} />
      <CookieBanner />
    </HelmetProvider>
  );
}