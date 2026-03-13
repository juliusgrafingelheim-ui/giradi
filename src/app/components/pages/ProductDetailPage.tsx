import { useParams, Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Plus, Minus, ShoppingBag, Check, Truck, Shield, Leaf, Loader2 } from "lucide-react";
import { useState } from "react";
import { useMedusaProducts } from "../hooks/useMedusaProducts";
import { useCart } from "../CartContext";
import { ProductCard } from "../ProductCard";
import { SmartImage } from "../SmartImage";
import { SEOHead } from "../SEOHead";

export function ProductDetailPage() {
  const { id } = useParams();
  const { products, loading } = useMedusaProducts();
  const product = products.find((p) => p.id === id);
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-olive-500 animate-spin" />
          <p className="text-sm text-muted-foreground">Produkt wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <h1 className="text-2xl mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Produkt nicht gefunden
          </h1>
          <Link to="/shop" className="text-olive-500 hover:text-olive-600">
            ← Zurück zum Shop
          </Link>
        </div>
      </div>
    );
  }

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    setQty(1);
  };

  return (
    <div className="bg-cream min-h-screen">
      <SEOHead
        title={product.name}
        description={product.description.slice(0, 155)}
        canonical={`/shop/${product.id}`}
        type="product"
        image={product.image}
      />
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/shop" className="hover:text-olive-500 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Shop
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>
      </div>

      {/* Product */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl overflow-hidden bg-white">
              <SmartImage
                src={product.image}
                alt={product.name}
                className="w-full h-full"
                containClassName="p-6 bg-[#F5F3EE]"
              />
            </div>
            {product.badge && (
              <span className="absolute top-4 left-4 bg-gold-400 text-white text-sm px-4 py-1.5 rounded-full">
                {product.badge}
              </span>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="text-gold-500 text-sm tracking-[0.2em] uppercase">
              {product.categoryLabel}
            </span>
            <h1
              className="text-3xl sm:text-4xl mt-1 mb-1"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {product.name}
            </h1>
            <p className="text-muted-foreground mb-4">{product.subtitle}</p>

            <div className="flex items-baseline gap-3 mb-6">
              <span
                className="text-3xl text-olive-500"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {product.price.toFixed(2).replace(".", ",")} €
              </span>
              <span className="text-sm text-muted-foreground">
                inkl. MwSt.
              </span>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Details */}
            <div className="space-y-2 mb-8">
              {product.details.map((d) => (
                <div key={d} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-olive-500 shrink-0" />
                  <span className="text-sm">{d}</span>
                </div>
              ))}
            </div>

            {/* Add to cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-border rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-cream-dark transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-11 h-11 flex items-center justify-center text-sm border-x border-border">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-11 h-11 flex items-center justify-center hover:bg-cream-dark transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAdd}
                className="flex-1 flex items-center justify-center gap-2 bg-olive-500 text-white py-3.5 rounded-lg hover:bg-olive-600 active:scale-[0.98] transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                In den Warenkorb
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <Truck className="w-5 h-5 mx-auto mb-1 text-olive-500" />
                <p className="text-xs text-muted-foreground">2–3 Tage</p>
              </div>
              <div className="text-center">
                <Shield className="w-5 h-5 mx-auto mb-1 text-olive-500" />
                <p className="text-xs text-muted-foreground">Sichere Zahlung</p>
              </div>
              <div className="text-center">
                <Leaf className="w-5 h-5 mx-auto mb-1 text-olive-500" />
                <p className="text-xs text-muted-foreground">BIO Qualität</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2
              className="text-2xl mb-8"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Das könnte Ihnen auch gefallen
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}