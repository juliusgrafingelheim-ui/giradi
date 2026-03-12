import { SEOHead } from "../SEOHead";

export function DatenschutzPage() {
  return (
    <div className="bg-cream min-h-screen py-16">
      <SEOHead title="Datenschutzerklärung" canonical="/datenschutz" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1
          className="text-3xl sm:text-4xl mb-8"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Datenschutzerklärung
        </h1>
        <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
          <div>
            <h3 style={{ fontFamily: "var(--font-heading)" }} className="text-foreground">
              1. Datenschutz auf einen Blick
            </h3>
            <p>
              Die folgenden Hinweise geben einen einfachen Überblick darüber,
              was mit Ihren personenbezogenen Daten passiert, wenn Sie unsere
              Website besuchen. Personenbezogene Daten sind alle Daten, mit
              denen Sie persönlich identifiziert werden können.
            </p>
          </div>
          <div>
            <h3 style={{ fontFamily: "var(--font-heading)" }} className="text-foreground">
              2. Verantwortliche Stelle
            </h3>
            <p>
              Monika Girardi & Mitgesellschafter
              <br />
              Innsbruck, Tirol, Österreich
              <br />
              E-Mail: info@1000horia.at
            </p>
          </div>
          <div>
            <h3 style={{ fontFamily: "var(--font-heading)" }} className="text-foreground">
              3. Datenerfassung auf unserer Website
            </h3>
            <p>
              Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden
              Ihre Angaben aus dem Formular inklusive der von Ihnen dort
              angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für
              den Fall von Anschlussfragen bei uns gespeichert.
            </p>
          </div>
          <div>
            <h3 style={{ fontFamily: "var(--font-heading)" }} className="text-foreground">
              4. Ihre Rechte
            </h3>
            <p>
              Sie haben jederzeit das Recht auf unentgeltliche Auskunft über
              Ihre gespeicherten personenbezogenen Daten, deren Herkunft und
              Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf
              Berichtigung, Sperrung oder Löschung dieser Daten.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}