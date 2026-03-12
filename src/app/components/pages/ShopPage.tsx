import { useState } from "react";
import { useSearchParams } from "react-router";
import { motion } from "motion/react";
import { categories } from "../productData";
import { useMedusaProducts } from "../hooks/useMedusaProducts";
import { ProductCard } from "../ProductCard";
import { SEOHead } from "../SEOHead";
import { Loader2 } from "lucide-react";

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get("cat") || "all";
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const { products, loading, error, isFromBackend } = useMedusaProducts();

  const filtered =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const handleCategory = (catId: string) => {
    setActiveCategory(catId);
    if (catId === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ cat: catId });
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      <SEOHead
        title="Shop"
        description="BIO Olivenöl Extra Nativ, aromatisierte Olivenöle und Balsamessig – direkt vom Familienbetrieb Girardi online bestellen."
        canonical="/shop"
      />
      {/* Header */}
      <div className="bg-olive-500 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-gold-300 text-sm tracking-[0.2em] uppercase">
              Unser Sortiment
            </span>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl text-white mt-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Online Shop
            </h1>
            <p className="text-white/70 mt-3 max-w-md mx-auto">
              Hier finden Sie unsere frisch gepressten, hochwertigen Oliven&ouml;le
              aus Griechenland. Qualit&auml;t von der Ernte bis zur Abf&uuml;llung &ndash;
              daf&uuml;r stehen wir mit unserem Namen.
            </p>
            {isFromBackend && (
              <p className="text-emerald-300 text-xs mt-2">
                ✓ {products.length} Produkte live vom Backend
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm transition-all shadow-sm ${
                activeCategory === cat.id
                  ? "bg-olive-500 text-white shadow-md"
                  : "bg-white text-foreground hover:bg-olive-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-olive-500 animate-spin" />
            <p className="text-sm text-muted-foreground">Produkte werden geladen...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            Keine Produkte in dieser Kategorie gefunden.
          </div>
        )}
      </div>

      {/* Info banner */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-sm text-olive-500" style={{ fontFamily: "var(--font-heading)" }}>
                Versand
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                2–3 Tage Lieferzeit · Gratis ab 50 €
              </p>
            </div>
            <div>
              <p className="text-sm text-olive-500" style={{ fontFamily: "var(--font-heading)" }}>
                Zahlung
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PayPal · Vorkasse · Barzahlung
              </p>
            </div>
            <div>
              <p className="text-sm text-olive-500" style={{ fontFamily: "var(--font-heading)" }}>
                Qualität
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                EU-BIO zertifiziert · Erste Kaltpressung
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}