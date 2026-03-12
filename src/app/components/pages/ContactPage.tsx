import { motion } from "motion/react";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { IK } from "../productData";
import { SEOHead } from "../SEOHead";

const IMG_INNSBRUCK = IK.werkstatt;

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-cream min-h-screen">
      <SEOHead
        title="Kontakt"
        description="Kontaktieren Sie uns – Direktverkauf in Innsbruck, Bestellungen und Fragen rund um unser griechisches Olivenöl. Telefon: +43 664 55555 77"
        canonical="/kontakt"
      />
      {/* Header */}
      <div className="bg-olive-500 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-gold-300 text-sm tracking-[0.2em] uppercase">
              Wir freuen uns auf Sie
            </span>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl text-white mt-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Kontakt
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2
              className="text-2xl sm:text-3xl mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Die „Werkstatt"
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              In Innsbruck bieten wir einen Direktverkauf unserer breiten
              Produktpalette an mit der Möglichkeit unsere Produkte zu
              verkosten. Wir freuen uns über jeden Besuch!
            </p>

            <div className="space-y-5 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-olive-50 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-olive-500" />
                </div>
                <div>
                  <p className="text-sm mb-0.5" style={{ fontFamily: "var(--font-heading)" }}>Adresse</p>
                  <p className="text-sm text-muted-foreground">
                    Innsbruck, Tirol
                  </p>
                  <a
                    href="https://maps.app.goo.gl/y3ZhkDwwvE7yL1sZ7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-olive-500 hover:text-olive-600 transition-colors"
                  >
                    Wegbeschreibung öffnen →
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-olive-50 rounded-full flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-olive-500" />
                </div>
                <div>
                  <p className="text-sm mb-0.5" style={{ fontFamily: "var(--font-heading)" }}>Telefon</p>
                  <a
                    href="tel:+4366455555577"
                    className="text-sm text-muted-foreground hover:text-olive-500 transition-colors"
                  >
                    +43 664 55555 77
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-olive-50 rounded-full flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-olive-500" />
                </div>
                <div>
                  <p className="text-sm mb-0.5" style={{ fontFamily: "var(--font-heading)" }}>E-Mail</p>
                  <a
                    href="mailto:info@1000horia.at"
                    className="text-sm text-muted-foreground hover:text-olive-500 transition-colors"
                  >
                    info@1000horia.at
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-olive-50 rounded-full flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-olive-500" />
                </div>
                <div>
                  <p className="text-sm mb-0.5" style={{ fontFamily: "var(--font-heading)" }}>Öffnungszeiten</p>
                  <p className="text-sm text-muted-foreground">
                    Nach telefonischer Vereinbarung
                  </p>
                </div>
              </div>
            </div>

            <ImageWithFallback
              src={IMG_INNSBRUCK}
              alt="Innsbruck, Tirol"
              className="w-full rounded-xl object-cover aspect-[16/9]"
            />
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3
                className="text-xl mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Schreiben Sie uns
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Haben Sie Fragen zu unseren Produkten oder möchten eine
                Verkostung vereinbaren? Wir melden uns zeitnah.
              </p>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-olive-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-7 h-7 text-olive-500" />
                  </div>
                  <h3 className="text-xl mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                    Vielen Dank!
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Ihre Nachricht wurde gesendet. Wir melden uns in Kürze bei
                    Ihnen.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm mb-1.5">Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-all"
                      placeholder="Ihr Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5">E-Mail *</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-all"
                      placeholder="Ihre E-Mail-Adresse"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5">Betreff</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-all"
                      placeholder="Worum geht es?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5">Nachricht *</label>
                    <textarea
                      required
                      rows={5}
                      className="w-full px-4 py-3 bg-cream border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-all resize-none"
                      placeholder="Ihre Nachricht..."
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Es gilt unsere{" "}
                    <a href="/datenschutz" className="text-olive-500 hover:underline">
                      Datenschutzerklärung
                    </a>
                    .
                  </p>
                  <button
                    type="submit"
                    className="w-full bg-olive-500 text-white py-3.5 rounded-lg hover:bg-olive-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Absenden
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}