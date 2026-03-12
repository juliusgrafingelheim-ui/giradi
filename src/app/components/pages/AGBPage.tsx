import { SEOHead } from "../SEOHead";

export function AGBPage() {
  return (
    <div className="bg-cream min-h-screen py-16">
      <SEOHead title="Allgemeine Geschäftsbedingungen" canonical="/agb" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1
          className="text-3xl sm:text-4xl mb-8"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Allgemeine Geschäftsbedingungen
        </h1>
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
          <div>
            <h3 style={{ fontFamily: "var(--font-heading)" }} className="text-foreground">
              1. Geltungsbereich
            </h3>
            <p>
              Diese Allgemeinen Geschäftsbedingungen gelten für alle
              Bestellungen, die über unseren Online-Shop getätigt werden.
            </p>
          </div>
          <div>
            <h3 style={{ fontFamily: "var(--font-heading)" }} className="text-foreground">
              2. Preise und Versand
            </h3>
            <p>
              Alle angegebenen Preise verstehen sich inklusive der gesetzlichen
              Mehrwertsteuer. Ab einem Bestellwert von 50 € liefern wir
              innerhalb Österreichs versandkostenfrei. Die Lieferzeit beträgt
              in der Regel 2–3 Werktage.
            </p>
          </div>
          <div>
            <h3 style={{ fontFamily: "var(--font-heading)" }} className="text-foreground">
              3. Widerrufsrecht
            </h3>
            <p>
              Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von
              Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt
              vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter
              Dritter die Waren in Besitz genommen haben.
            </p>
          </div>
          <div>
            <h3 style={{ fontFamily: "var(--font-heading)" }} className="text-foreground">
              4. Zahlung
            </h3>
            <p>
              Wir akzeptieren folgende Zahlungsarten: PayPal, Vorkasse
              (Banküberweisung) und Barzahlung bei Abholung in unserer
              Werkstatt in Innsbruck.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}