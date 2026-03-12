import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="bg-cream min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl text-olive-200 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
          404
        </p>
        <h1 className="text-2xl mb-3" style={{ fontFamily: "var(--font-heading)" }}>
          Seite nicht gefunden
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Die gewünschte Seite existiert leider nicht. Vielleicht finden Sie
          was Sie suchen in unserem Shop.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-olive-500 text-white px-6 py-3 rounded-lg hover:bg-olive-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
