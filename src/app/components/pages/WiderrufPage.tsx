import { SEOHead } from "../SEOHead";

export function WiderrufPage() {
  return (
    <div className="bg-cream min-h-screen py-16">
      <SEOHead title="Widerrufsbelehrung" canonical="/widerruf" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1
          className="text-3xl sm:text-4xl mb-8"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Widerrufsbelehrung
        </h1>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2
              className="text-lg text-foreground mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Widerrufsrecht
            </h2>
            <p>
              Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen
              diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn
              Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter,
              der nicht der Beförderer ist, die Waren in Besitz genommen haben
              bzw. hat.
            </p>
            <p>
              Um Ihr Widerrufsrecht auszuüben, müssen Sie uns mittels einer
              eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder
              E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen,
              informieren.
            </p>
          </section>

          <section className="bg-white rounded-lg p-5 border border-border">
            <p className="text-foreground">
              <strong>Monika Girardi & Mitgesellschafter</strong>
              <br />
              1000 Horia – The Girardi Oil
              <br />
              Innsbruck, Tirol
              <br />
              E-Mail: info@1000horia.at
              <br />
              Telefon: +43 664 55555 77
            </p>
          </section>

          <section>
            <h2
              className="text-lg text-foreground mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Folgen des Widerrufs
            </h2>
            <p>
              Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle
              Zahlungen, die wir von Ihnen erhalten haben, einschließlich der
              Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich
              daraus ergeben, dass Sie eine andere Art der Lieferung als die von
              uns angebotene, günstigste Standardlieferung gewählt haben),
              unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag
              zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses
              Vertrags bei uns eingegangen ist.
            </p>
            <p>
              Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das
              Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei
              denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in
              keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte
              berechnet.
            </p>
          </section>

          <section>
            <h2
              className="text-lg text-foreground mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Ausnahmen vom Widerrufsrecht
            </h2>
            <p>
              Das Widerrufsrecht besteht nicht bei Verträgen zur Lieferung von
              Waren, die schnell verderben können oder deren Verfallsdatum
              schnell überschritten würde, sowie bei versiegelten Waren, die aus
              Gründen des Gesundheitsschutzes oder der Hygiene nicht zur
              Rückgabe geeignet sind, wenn ihre Versiegelung nach der Lieferung
              entfernt wurde.
            </p>
          </section>

          <section>
            <h2
              className="text-lg text-foreground mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Muster-Widerrufsformular
            </h2>
            <div className="bg-white rounded-lg p-5 border border-border">
              <p className="text-sm">
                An: Monika Girardi & Mitgesellschafter, 1000 Horia – The Girardi
                Oil, info@1000horia.at
              </p>
              <p className="text-sm mt-2">
                Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*)
                abgeschlossenen Vertrag über den Kauf der folgenden Waren (*):
              </p>
              <p className="text-sm mt-2">
                Bestellt am (*) / erhalten am (*):
                <br />
                Name des/der Verbraucher(s):
                <br />
                Anschrift des/der Verbraucher(s):
                <br />
                Datum:
                <br />
                Unterschrift (nur bei Mitteilung auf Papier):
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                (*) Unzutreffendes streichen.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
