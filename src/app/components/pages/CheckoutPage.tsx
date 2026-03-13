import {
  updateCart,
  addShippingMethod,
  fetchShippingOptions,
  fetchCartForCheckout,
  fetchCartForCheckoutWithRetry,
  initPaymentSession,
  completeCart,
  forceNewCart,
  addToCart,
  clearStoredCartId,
  type MedusaAddress,
} from "../api/medusa-client";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Truck,
  Store,
  Banknote,
  ShieldCheck,
  Lock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useCart } from "../CartContext";
import { SEOHead } from "../SEOHead";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { IS_BACKEND_ENABLED } from "../api/config";

type PaymentMethod = "vorkasse" | "barzahlung";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  notes: string;
}

const SHIPPING_FREE_THRESHOLD = 50;
const SHIPPING_COST = 5.9;

const paymentMethods: {
  id: PaymentMethod;
  label: string;
  desc: string;
  icon: typeof Banknote;
}[] = [
  {
    id: "vorkasse",
    label: "Vorkasse (Überweisung)",
    desc: "Per Banküberweisung vorab bezahlen",
    icon: Banknote,
  },
  {
    id: "barzahlung",
    label: "Barzahlung bei Abholung",
    desc: "Direkt in unserer Werkstatt in Innsbruck bezahlen",
    icon: Store,
  },
];

// Checkout step indicator
type CheckoutStep = "form" | "processing" | "error";

export function CheckoutPage() {
  const { items, totalPrice, clearCart, medusaCartId, syncing, ensureMedusaCart } = useCart();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<PaymentMethod>("vorkasse");
  const [showSummary, setShowSummary] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [step, setStep] = useState<CheckoutStep>("form");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    zip: "",
    city: "",
    country: "AT",
    notes: "",
  });

  const isPickup = payment === "barzahlung";
  const shippingCost = isPickup ? 0 : totalPrice >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_COST;
  const grandTotal = totalPrice + shippingCost;

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.firstName.trim()) newErrors.firstName = "Bitte Vorname eingeben";
    if (!form.lastName.trim()) newErrors.lastName = "Bitte Nachname eingeben";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Bitte gültige E-Mail eingeben";
    if (!isPickup) {
      if (!form.street.trim()) newErrors.street = "Bitte Adresse eingeben";
      if (!form.zip.trim()) newErrors.zip = "Bitte PLZ eingeben";
      if (!form.city.trim()) newErrors.city = "Bitte Ort eingeben";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -----------------------------------------------------------------------
  // Helper: get variant ID from product
  // -----------------------------------------------------------------------
  const getVariantId = (product: any): string | undefined => {
    return product._variantId;
  };

  // -----------------------------------------------------------------------
  // Helper: force-create a new cart and re-add all items
  // -----------------------------------------------------------------------
  const recoverCart = async (): Promise<string | null> => {
    console.warn("[Checkout] Attempting cart recovery – creating new cart...");
    clearStoredCartId();
    const newCart = await forceNewCart();
    if (!newCart) return null;
    const newCartId = newCart.id;
    console.log("[Checkout] New cart created:", newCartId);

    // Re-add all current items
    for (const item of items) {
      const variantId = getVariantId(item.product);
      if (!variantId) continue;
      try {
        await addToCart(newCartId, variantId, item.quantity);
        console.log("[Checkout] Re-added:", item.product.name, "×", item.quantity);
      } catch (err) {
        console.warn("[Checkout] Failed to re-add item:", item.product.name, err);
      }
    }
    return newCartId;
  };

  // -----------------------------------------------------------------------
  // MEDUSA CHECKOUT FLOW
  // -----------------------------------------------------------------------

  const handleMedusaCheckout = async (cartId: string) => {
    try {
      setStep("processing");
      setCheckoutError(null);

      let activeCartId = cartId;

      // 1. Update cart with email + addresses
      console.log("[Checkout] Step 1: Updating cart with customer info...");
      const shippingAddress: MedusaAddress = {
        first_name: form.firstName,
        last_name: form.lastName,
        address_1: isPickup ? "Abholung – Die Werkstatt" : form.street,
        city: isPickup ? "Innsbruck" : form.city,
        postal_code: isPickup ? "6020" : form.zip,
        country_code: form.country.toLowerCase(),
        phone: form.phone || undefined,
      };

      console.log("[Checkout] Payload:", JSON.stringify({
        email: form.email,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
      }, null, 2));

      let cartUpdate = await updateCart(activeCartId, {
        email: form.email,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
      });

      console.log("[Checkout] Cart update response:", JSON.stringify({
        email: cartUpdate?.email,
        shipping_address: cartUpdate?.shipping_address,
        billing_address: cartUpdate?.billing_address,
      }, null, 2));

      // If update failed (404 – stale/completed cart), recover with a new cart
      if (!cartUpdate) {
        console.warn("[Checkout] Cart update failed (404?), attempting recovery...");
        const recoveredCartId = await recoverCart();
        if (!recoveredCartId) {
          throw new Error("Kundendaten konnten nicht gespeichert werden. Bitte laden Sie die Seite neu.");
        }
        activeCartId = recoveredCartId;
        // Retry update with fresh cart
        cartUpdate = await updateCart(activeCartId, {
          email: form.email,
          shipping_address: shippingAddress,
          billing_address: shippingAddress,
        });
        if (!cartUpdate) {
          throw new Error("Kundendaten konnten nicht gespeichert werden.");
        }
        console.log("[Checkout] Recovery successful, continuing with cart:", activeCartId);
      }

      // 2. Fetch shipping options and select one
      console.log("[Checkout] Step 2: Fetching shipping options...");
      const shippingOptions = await fetchShippingOptions(activeCartId);
      console.log("[Checkout] Shipping options:", shippingOptions);

      if (shippingOptions && shippingOptions.length > 0) {
        // Try to find the right shipping option
        let selectedOption = shippingOptions[0]; // fallback to first

        if (isPickup) {
          // Look for pickup/Abholung option
          const pickup = shippingOptions.find(
            (o) =>
              o.name.toLowerCase().includes("abhol") ||
              o.name.toLowerCase().includes("pickup") ||
              o.amount === 0
          );
          if (pickup) selectedOption = pickup;
        } else {
          // Look for delivery option
          const delivery = shippingOptions.find(
            (o) =>
              o.name.toLowerCase().includes("versand") ||
              o.name.toLowerCase().includes("shipping") ||
              o.name.toLowerCase().includes("flatrate") ||
              o.name.toLowerCase().includes("standard")
          );
          if (delivery) selectedOption = delivery;
        }

        console.log("[Checkout] Selected shipping:", selectedOption.name, selectedOption.id);
        const cartWithShipping = await addShippingMethod(activeCartId, selectedOption.id);

        if (!cartWithShipping) {
          throw new Error("Versandart konnte nicht ausgewählt werden.");
        }

        // 3. Initialize payment session
        // In Medusa v2, the addShippingMethod response may not include payment_collection.
        // We need to re-fetch the cart with expanded fields to get it.
        console.log("[Checkout] Step 3: Initializing payment...");

        // First check if it's already on the response
        let paymentCollectionId = (cartWithShipping as any).payment_collection?.id;

        // If not, fetch the cart again with payment_collection fields
        if (!paymentCollectionId) {
          console.log("[Checkout] Re-fetching cart to get payment_collection...");
          const fullCart = await fetchCartForCheckoutWithRetry(activeCartId);
          console.log("[Checkout] Full cart payment_collection:", fullCart?.payment_collection);
          paymentCollectionId = fullCart?.payment_collection?.id;
        }

        if (paymentCollectionId) {
          const paymentSession = await initPaymentSession(
            paymentCollectionId,
            "pp_system_default",
            {
              payment_method: payment,
              notes: form.notes || undefined,
            }
          );
          console.log("[Checkout] Payment session:", paymentSession);

          if (!paymentSession) {
            throw new Error("Zahlungssitzung konnte nicht erstellt werden. Bitte versuchen Sie es erneut.");
          }
        } else {
          // payment_collection is REQUIRED for completeCart to succeed.
          // If we can't find it, something is wrong with the backend config.
          console.error(
            "[Checkout] CRITICAL: No payment_collection found after retries.",
            "Check backend: Region DACH must have pp_system_default linked as payment provider."
          );
          throw new Error(
            "Zahlung konnte nicht initialisiert werden. " +
            "Bitte kontaktiere uns unter info@girardi-oil.at – " +
            "wir kümmern uns sofort darum."
          );
        }
      } else {
        // No shipping options = backend misconfiguration
        console.error(
          "[Checkout] CRITICAL: No shipping options found for cart.",
          "Check backend: Region DACH must have shipping options (Flatrate, Gratis ab 50€, Abholung) linked."
        );
        throw new Error(
          "Keine Versandoptionen verfügbar. " +
          "Bitte kontaktiere uns unter info@girardi-oil.at – " +
          "wir kümmern uns sofort darum."
        );
      }

      // 4. Complete the cart → creates order
      console.log("[Checkout] Step 4: Completing cart...");
      const order = await completeCart(activeCartId);

      if (order) {
        console.log("[Checkout] Order created:", order);
        clearCart();
        navigate("/bestellung-bestaetigt", {
          state: {
            orderNumber: `TGO-${order.display_id || order.id.slice(-8).toUpperCase()}`,
            orderId: order.id,
            displayId: order.display_id,
            payment,
            total: (order.total || grandTotal * 100) / 100,
            email: form.email,
            isPickup,
            firstName: form.firstName,
            fromMedusa: true,
          },
        });
      } else {
        throw new Error(
          "Die Bestellung konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut."
        );
      }
    } catch (err: any) {
      console.error("[Checkout] Error:", err);
      setStep("error");
      setCheckoutError(
        err?.message || "Es ist ein Fehler bei der Bestellung aufgetreten."
      );
    }
  };

  // -----------------------------------------------------------------------
  // FALLBACK: Local-only checkout (when backend unavailable)
  // -----------------------------------------------------------------------

  const handleLocalCheckout = () => {
    setStep("processing");
    setTimeout(() => {
      clearCart();
      navigate("/bestellung-bestaetigt", {
        state: {
          orderNumber: `TGO-${Date.now().toString(36).toUpperCase()}`,
          payment,
          total: grandTotal,
          email: form.email,
          isPickup,
          firstName: form.firstName,
          fromMedusa: false,
        },
      });
    }, 1500);
  };

  // -----------------------------------------------------------------------
  // SUBMIT
  // -----------------------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (IS_BACKEND_ENABLED) {
      // Always go through ensureMedusaCart – it validates existing carts
      // and recreates + re-syncs items if the old cart is gone (404)
      const cartId = await ensureMedusaCart();
      if (cartId) {
        await handleMedusaCheckout(cartId);
      } else {
        // Backend enabled but cart creation failed – fallback
        console.warn("[Checkout] No Medusa cart available, using local fallback");
        handleLocalCheckout();
      }
    } else {
      handleLocalCheckout();
    }
  };

  if (items.length === 0 && step !== "processing") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-cream">
        <SEOHead title="Kasse" canonical="/checkout" />
        <div className="text-center px-4">
          <h1
            className="text-2xl mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Dein Warenkorb ist leer
          </h1>
          <p className="text-muted-foreground mb-6">
            Füge Produkte hinzu, bevor du zur Kasse gehst.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-olive-500 text-white px-6 py-3 rounded-lg hover:bg-olive-600 transition-colors"
          >
            Zum Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen">
      <SEOHead title="Kasse" canonical="/checkout" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-olive-500 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Weiter einkaufen
        </Link>

        <h1
          className="text-3xl sm:text-4xl mb-8"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Kasse
        </h1>

        {/* Error banner */}
        {checkoutError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800">{checkoutError}</p>
              <button
                onClick={() => {
                  setStep("form");
                  setCheckoutError(null);
                }}
                className="text-sm text-red-600 underline hover:text-red-800 mt-1"
              >
                Nochmal versuchen
              </button>
            </div>
          </motion.div>
        )}

        {/* Syncing indicator */}
        {syncing && (
          <div className="bg-olive-50 border border-olive-200 rounded-lg px-4 py-2 mb-4 flex items-center gap-2 text-sm text-olive-700">
            <Loader2 className="w-4 h-4 animate-spin" />
            Warenkorb wird synchronisiert...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact */}
              <section className="bg-white rounded-xl p-6 shadow-sm">
                <h2
                  className="text-lg mb-4"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Kontaktdaten
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1.5 text-muted-foreground">
                      Vorname *
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      disabled={step === "processing"}
                      className={`w-full px-4 py-3 rounded-lg border bg-cream text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-colors disabled:opacity-50 ${
                        errors.firstName ? "border-destructive" : "border-border"
                      }`}
                      placeholder="Maria"
                    />
                    {errors.firstName && (
                      <p className="text-xs text-destructive mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5 text-muted-foreground">
                      Nachname *
                    </label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      disabled={step === "processing"}
                      className={`w-full px-4 py-3 rounded-lg border bg-cream text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-colors disabled:opacity-50 ${
                        errors.lastName ? "border-destructive" : "border-border"
                      }`}
                      placeholder="Muster"
                    />
                    {errors.lastName && (
                      <p className="text-xs text-destructive mt-1">{errors.lastName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5 text-muted-foreground">
                      E-Mail-Adresse *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      disabled={step === "processing"}
                      className={`w-full px-4 py-3 rounded-lg border bg-cream text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-colors disabled:opacity-50 ${
                        errors.email ? "border-destructive" : "border-border"
                      }`}
                      placeholder="maria@beispiel.at"
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5 text-muted-foreground">
                      Telefon (optional)
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      disabled={step === "processing"}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-cream text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-colors disabled:opacity-50"
                      placeholder="+43 664 ..."
                    />
                  </div>
                </div>
              </section>

              {/* Shipping Address */}
              <section className="bg-white rounded-xl p-6 shadow-sm">
                <h2
                  className="text-lg mb-4"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {isPickup ? "Abholadresse" : "Lieferadresse"}
                </h2>

                {isPickup ? (
                  <div className="bg-olive-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Store className="w-5 h-5 text-olive-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm">
                          <strong>Die Werkstatt – Direktverkauf Innsbruck</strong>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Baeckerbuehelgasse 14, 6020 Innsbruck
                          <br />
                          Bitte rufen Sie uns vorher unter{" "}
                          <a
                            href="tel:+4366455555577"
                            className="text-olive-500 hover:underline"
                          >
                            +43 664 55555 77
                          </a>{" "}
                          an, um einen Abholtermin zu vereinbaren.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-1.5 text-muted-foreground">
                        Straße & Hausnummer *
                      </label>
                      <input
                        type="text"
                        value={form.street}
                        onChange={(e) => updateField("street", e.target.value)}
                        disabled={step === "processing"}
                        className={`w-full px-4 py-3 rounded-lg border bg-cream text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-colors disabled:opacity-50 ${
                          errors.street ? "border-destructive" : "border-border"
                        }`}
                        placeholder="Musterstraße 1"
                      />
                      {errors.street && (
                        <p className="text-xs text-destructive mt-1">{errors.street}</p>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm mb-1.5 text-muted-foreground">
                          PLZ *
                        </label>
                        <input
                          type="text"
                          value={form.zip}
                          onChange={(e) => updateField("zip", e.target.value)}
                          disabled={step === "processing"}
                          className={`w-full px-4 py-3 rounded-lg border bg-cream text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-colors disabled:opacity-50 ${
                            errors.zip ? "border-destructive" : "border-border"
                          }`}
                          placeholder="6020"
                        />
                        {errors.zip && (
                          <p className="text-xs text-destructive mt-1">{errors.zip}</p>
                        )}
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm mb-1.5 text-muted-foreground">
                          Ort *
                        </label>
                        <input
                          type="text"
                          value={form.city}
                          onChange={(e) => updateField("city", e.target.value)}
                          disabled={step === "processing"}
                          className={`w-full px-4 py-3 rounded-lg border bg-cream text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-colors disabled:opacity-50 ${
                            errors.city ? "border-destructive" : "border-border"
                          }`}
                          placeholder="Innsbruck"
                        />
                        {errors.city && (
                          <p className="text-xs text-destructive mt-1">{errors.city}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-1.5 text-muted-foreground">
                        Land
                      </label>
                      <select
                        value={form.country}
                        onChange={(e) => updateField("country", e.target.value)}
                        disabled={step === "processing"}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-cream text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-colors disabled:opacity-50"
                      >
                        <option value="AT">Österreich</option>
                        <option value="DE">Deutschland</option>
                        <option value="CH">Schweiz</option>
                        <option value="IT">Italien</option>
                      </select>
                    </div>
                  </div>
                )}
              </section>

              {/* Payment */}
              <section className="bg-white rounded-xl p-6 shadow-sm">
                <h2
                  className="text-lg mb-4"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Zahlungsart
                </h2>
                <div className="space-y-3">
                  {paymentMethods.map((pm) => {
                    const Icon = pm.icon;
                    const isActive = payment === pm.id;
                    return (
                      <label
                        key={pm.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          isActive
                            ? "border-olive-500 bg-olive-50"
                            : "border-border hover:border-olive-300"
                        } ${step === "processing" ? "opacity-50 pointer-events-none" : ""}`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={pm.id}
                          checked={isActive}
                          onChange={() => setPayment(pm.id)}
                          disabled={step === "processing"}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isActive ? "border-olive-500" : "border-border"
                          }`}
                        >
                          {isActive && (
                            <div className="w-2.5 h-2.5 rounded-full bg-olive-500" />
                          )}
                        </div>
                        <Icon
                          className={`w-5 h-5 shrink-0 ${
                            isActive ? "text-olive-500" : "text-muted-foreground"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{pm.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {pm.desc}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {payment === "vorkasse" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 p-4 bg-gold-50 rounded-lg border border-gold-200"
                  >
                    <p className="text-sm">
                      <strong>Bankverbindung:</strong>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Monika Girardi & Mitgesellschafter
                      <br />
                      IBAN: AT00 0000 0000 0000 0000
                      <br />
                      BIC: XXXXATAXX
                      <br />
                      Verwendungszweck: Ihre Bestellnummer
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Die Ware wird nach Zahlungseingang versandt (2–3 Werktage).
                    </p>
                  </motion.div>
                )}
              </section>

              {/* Notes */}
              <section className="bg-white rounded-xl p-6 shadow-sm">
                <h2
                  className="text-lg mb-4"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Anmerkungen (optional)
                </h2>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  disabled={step === "processing"}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-cream text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-colors resize-none disabled:opacity-50"
                  placeholder="Lieferhinweise, Geschenkverpackung, etc."
                />
              </section>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm sticky top-24">
                {/* Mobile toggle */}
                <button
                  type="button"
                  onClick={() => setShowSummary(!showSummary)}
                  className="w-full flex items-center justify-between p-5 lg:hidden"
                >
                  <span
                    className="text-base"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Bestellübersicht ({items.length})
                  </span>
                  {showSummary ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>

                <div
                  className={`${showSummary ? "block" : "hidden"} lg:block`}
                >
                  <div className="p-5 pt-0 lg:pt-5">
                    <h2
                      className="text-lg mb-4 hidden lg:block"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      Bestellübersicht
                    </h2>

                    {/* Items */}
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {items.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex gap-3 items-center"
                        >
                          <div className="relative shrink-0">
                            <ImageWithFallback
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-14 h-14 rounded-lg object-cover"
                            />
                            <span className="absolute -top-1.5 -right-1.5 bg-olive-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.product.size}
                            </p>
                          </div>
                          <p className="text-sm shrink-0">
                            {(item.product.price * item.quantity)
                              .toFixed(2)
                              .replace(".", ",")}{" "}
                            €
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border mt-4 pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Zwischensumme
                        </span>
                        <span>{totalPrice.toFixed(2).replace(".", ",")} €</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Versand</span>
                        <span>
                          {shippingCost === 0 ? (
                            <span className="text-olive-500">Kostenlos</span>
                          ) : (
                            `${shippingCost.toFixed(2).replace(".", ",")} €`
                          )}
                        </span>
                      </div>
                      {!isPickup && totalPrice < SHIPPING_FREE_THRESHOLD && (
                        <p className="text-xs text-muted-foreground">
                          Noch{" "}
                          {(SHIPPING_FREE_THRESHOLD - totalPrice)
                            .toFixed(2)
                            .replace(".", ",")}{" "}
                          € bis zum kostenlosen Versand
                        </p>
                      )}
                    </div>

                    <div className="border-t border-border mt-4 pt-4">
                      <div className="flex justify-between items-baseline">
                        <span
                          className="text-base"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          Gesamt
                        </span>
                        <div className="text-right">
                          <span
                            className="text-xl text-olive-500"
                            style={{ fontFamily: "var(--font-heading)" }}
                          >
                            {grandTotal.toFixed(2).replace(".", ",")} €
                          </span>
                          <p className="text-xs text-muted-foreground">
                            inkl. MwSt.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="p-5 border-t border-border">
                  <button
                    type="submit"
                    disabled={step === "processing" || syncing}
                    className="w-full bg-olive-500 text-white py-3.5 rounded-lg hover:bg-olive-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {step === "processing" ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        <span>Bestellung wird verarbeitet...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        {payment === "vorkasse"
                          ? "Zahlungspflichtig bestellen"
                          : "Bestellung abschließen"}
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      SSL-verschlüsselt
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Truck className="w-3.5 h-3.5" />
                      {isPickup ? "Abholung" : "2–3 Tage"}
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground text-center mt-3 leading-relaxed">
                    Mit Ihrer Bestellung akzeptieren Sie unsere{" "}
                    <Link to="/agb" className="underline hover:text-olive-500">
                      AGB
                    </Link>{" "}
                    und{" "}
                    <Link
                      to="/datenschutz"
                      className="underline hover:text-olive-500"
                    >
                      Datenschutzerklärung
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}