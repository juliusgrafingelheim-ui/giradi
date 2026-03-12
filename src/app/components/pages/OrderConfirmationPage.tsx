import { Link, useLocation } from "react-router";
import { motion } from "motion/react";
import { CheckCircle, Mail, ArrowRight, Store, Banknote, CreditCard } from "lucide-react";
import { SEOHead } from "../SEOHead";

export function OrderConfirmationPage() {
  const location = useLocation();
  const state = location.state as {
    orderNumber?: string;
    payment?: string;
    total?: number;
    email?: string;
    isPickup?: boolean;
  } | null;

  const orderNumber = state?.orderNumber || "TGO-DEMO";
  const payment = state?.payment || "paypal";
  const total = state?.total || 0;
  const email = state?.email || "ihre@email.at";
  const isPickup = state?.isPickup || false;

  return (
    <div className="bg-cream min-h-[70vh] flex items-center">
      <SEOHead title="Bestellung bestätigt" canonical="/bestellung-bestaetigt" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm text-center"
        >
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", damping: 15 }}
            className="w-20 h-20 bg-olive-50 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-olive-500" />
          </motion.div>

          <h1
            className="text-2xl sm:text-3xl mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Vielen Dank für Ihre Bestellung!
          </h1>
          <p className="text-muted-foreground mb-8">
            Ihre Bestellung wurde erfolgreich aufgenommen.
          </p>

          {/* Order details */}
          <div className="bg-cream rounded-xl p-6 text-left space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Bestellnummer
              </span>
              <span className="text-sm" style={{ fontFamily: "var(--font-heading)" }}>
                {orderNumber}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Gesamtbetrag</span>
              <span className="text-sm" style={{ fontFamily: "var(--font-heading)" }}>
                {total.toFixed(2).replace(".", ",")} €
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Zahlungsart</span>
              <div className="flex items-center gap-1.5">
                {payment === "paypal" && <CreditCard className="w-4 h-4 text-olive-500" />}
                {payment === "vorkasse" && <Banknote className="w-4 h-4 text-olive-500" />}
                {payment === "barzahlung" && <Store className="w-4 h-4 text-olive-500" />}
                <span className="text-sm">
                  {payment === "paypal"
                    ? "PayPal"
                    : payment === "vorkasse"
                    ? "Vorkasse"
                    : "Barzahlung bei Abholung"}
                </span>
              </div>
            </div>
          </div>

          {/* Payment-specific info */}
          {payment === "vorkasse" && (
            <div className="bg-gold-50 border border-gold-200 rounded-xl p-5 text-left mb-8">
              <div className="flex items-start gap-3">
                <Banknote className="w-5 h-5 text-gold-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm">
                    <strong>Bitte überweisen Sie den Betrag an:</strong>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Monika Girardi & Mitgesellschafter
                    <br />
                    IBAN: AT00 0000 0000 0000 0000
                    <br />
                    BIC: XXXXATAXX
                    <br />
                    Verwendungszweck: {orderNumber}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Wir versenden Ihre Bestellung nach Zahlungseingang.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isPickup && (
            <div className="bg-olive-50 border border-olive-200 rounded-xl p-5 text-left mb-8">
              <div className="flex items-start gap-3">
                <Store className="w-5 h-5 text-olive-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm">
                    <strong>Abholung in unserer Werkstatt</strong>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Bitte kontaktieren Sie uns unter{" "}
                    <a href="tel:+4366455555577" className="text-olive-500 hover:underline">
                      +43 664 55555 77
                    </a>{" "}
                    um einen Abholtermin zu vereinbaren.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Email notice */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
            <Mail className="w-4 h-4" />
            <span>
              Bestellbestätigung wird an <strong>{email}</strong> gesendet
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 bg-olive-500 text-white px-6 py-3 rounded-lg hover:bg-olive-600 transition-colors"
            >
              Weiter einkaufen
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 border border-border px-6 py-3 rounded-lg hover:bg-cream-dark transition-colors"
            >
              Zur Startseite
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
