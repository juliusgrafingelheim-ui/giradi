import { SEOHead } from "../SEOHead";

export function ImpressumPage() {
  return (
    <div className="bg-cream min-h-screen py-16">
      <SEOHead title="Impressum" canonical="/impressum" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1
          className="text-3xl sm:text-4xl mb-8"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Impressum
        </h1>
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
          <div>
            <h3 style={{ fontFamily: "var(--font-heading)" }} className="text-foreground">
              Angaben gemäß § 5 ECG
            </h3>
            <p>
              Monika Girardi & Mitgesellschafter
              <br />
              Innsbruck, Tirol, Österreich
              <br />
              Tel: +43 664 55555 77
              <br />
              E-Mail: info@1000horia.at
            </p>
          </div>
          <div>
            <h3 style={{ fontFamily: "var(--font-heading)" }} className="text-foreground">
              Unternehmensgegenstand
            </h3>
            <p>
              Import und Vertrieb von griechischem Olivenöl und
              verwandten Produkten.
            </p>
          </div>
          <div>
            <h3 style={{ fontFamily: "var(--font-heading)" }} className="text-foreground">
              Haftung für Inhalte
            </h3>
            <p>
              Die Inhalte unserer Seiten wurden mit größter Sorgfalt
              erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität
              der Inhalte können wir jedoch keine Gewähr übernehmen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}