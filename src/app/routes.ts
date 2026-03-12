import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./components/pages/HomePage";
import { ShopPage } from "./components/pages/ShopPage";
import { ProductDetailPage } from "./components/pages/ProductDetailPage";
import { AboutPage } from "./components/pages/AboutPage";
import { ContactPage } from "./components/pages/ContactPage";
import { ImpressumPage } from "./components/pages/ImpressumPage";
import { DatenschutzPage } from "./components/pages/DatenschutzPage";
import { AGBPage } from "./components/pages/AGBPage";
import { WiderrufPage } from "./components/pages/WiderrufPage";
import { CheckoutPage } from "./components/pages/CheckoutPage";
import { OrderConfirmationPage } from "./components/pages/OrderConfirmationPage";
import { SetupGuidePage } from "./components/pages/SetupGuidePage";
import { NotFoundPage } from "./components/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "shop", Component: ShopPage },
      { path: "shop/:id", Component: ProductDetailPage },
      { path: "unsere-geschichte", Component: AboutPage },
      { path: "kontakt", Component: ContactPage },
      { path: "checkout", Component: CheckoutPage },
      { path: "bestellung-bestaetigt", Component: OrderConfirmationPage },
      { path: "setup", Component: SetupGuidePage },
      { path: "impressum", Component: ImpressumPage },
      { path: "datenschutz", Component: DatenschutzPage },
      { path: "agb", Component: AGBPage },
      { path: "widerruf", Component: WiderrufPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);