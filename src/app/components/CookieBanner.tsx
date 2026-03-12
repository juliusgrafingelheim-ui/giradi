import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cookie, X } from "lucide-react";

const COOKIE_KEY = "tgo_cookie_consent";

type ConsentLevel = "all" | "essential" | null;

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = (level: ConsentLevel) => {
    if (level) {
      localStorage.setItem(COOKIE_KEY, level);
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 inset-x-0 z-[100] p-4 sm:p-6"
        >
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
            <div className="p-5 sm:p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2.5">
                  <Cookie className="w-5 h-5 text-gold-400 shrink-0" />
                  <h3
                    className="text-base"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Cookie-Einstellungen
                  </h3>
                </div>
                <button
                  onClick={() => accept("essential")}
                  className="p-1 hover:bg-cream-dark rounded-full transition-colors shrink-0"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf
                unserer Website zu bieten. Essentielle Cookies sind für die
                Grundfunktionen erforderlich. Optionale Cookies helfen uns, die
                Website zu verbessern.
              </p>

              {/* Details toggle */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="space-y-3 pt-3 border-t border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">Essentielle Cookies</p>
                          <p className="text-xs text-muted-foreground">
                            Warenkorb, Spracheinstellungen, Cookie-Präferenzen
                          </p>
                        </div>
                        <span className="text-xs text-olive-500 bg-olive-50 px-2 py-1 rounded">
                          Immer aktiv
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">Analyse-Cookies</p>
                          <p className="text-xs text-muted-foreground">
                            Anonyme Nutzungsstatistiken zur Verbesserung
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground bg-cream-dark px-2 py-1 rounded">
                          Optional
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <button
                  onClick={() => accept("all")}
                  className="bg-olive-500 text-white px-5 py-2.5 rounded-lg hover:bg-olive-600 transition-colors text-sm"
                >
                  Alle akzeptieren
                </button>
                <button
                  onClick={() => accept("essential")}
                  className="border border-border px-5 py-2.5 rounded-lg hover:bg-cream-dark transition-colors text-sm"
                >
                  Nur essentielle
                </button>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-2.5"
                >
                  {showDetails ? "Weniger anzeigen" : "Details anzeigen"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
