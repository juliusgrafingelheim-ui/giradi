import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Store,
  Banknote,
  ShieldCheck,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useCart } from "../CartContext";
import { SEOHead } from "../SEOHead";
import { ImageWithFallback } from "../figma/ImageWithFallback";

type PaymentMethod = "paypal" | "vorkasse" | "barzahlung";

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
  icon: typeof CreditCard;
}[] = [
  {
    id: "paypal",
    label: "PayPal",
    desc: "Sicher bezahlen mit PayPal",
    icon: CreditCard,
  },
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

export function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<PaymentMethod>("paypal");
  const [showSummary, setShowSummary] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    // Simulate order processing
    setTimeout(() => {
      clearCart();
      navigate("/bestellung-bestaetigt", {
        state: {
          orderNumber: `TGO-${Date.now().toString(36).toUpperCase()}`,
          payment,
          total: grandTotal,
          email: form.email,
          isPickup,
        },
      });
    }, 1500);
  };

  if (items.length === 0) {
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
                      className={`w-full px-4 py-3 rounded-lg border bg-cream text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-colors ${
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
                      className={`w-full px-4 py-3 rounded-lg border bg-cream text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-colors ${
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
                      className={`w-full px-4 py-3 rounded-lg border bg-cream text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-colors ${
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
                      className="w-full px-4 py-3 rounded-lg border border-border bg-cream text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-colors"
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
                        className={`w-full px-4 py-3 rounded-lg border bg-cream text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-colors ${
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
                          className={`w-full px-4 py-3 rounded-lg border bg-cream text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-colors ${
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
                          className={`w-full px-4 py-3 rounded-lg border bg-cream text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-colors ${
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
                        className="w-full px-4 py-3 rounded-lg border border-border bg-cream text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-colors"
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
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={pm.id}
                          checked={isActive}
                          onChange={() => setPayment(pm.id)}
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
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-cream text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-colors resize-none"
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
                    disabled={submitting}
                    className="w-full bg-olive-500 text-white py-3.5 rounded-lg hover:bg-olive-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        {payment === "paypal"
                          ? "Mit PayPal bezahlen"
                          : payment === "vorkasse"
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
