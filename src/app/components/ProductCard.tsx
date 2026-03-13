import { motion } from "motion/react";
import { ShoppingBag, Plus } from "lucide-react";
import type { Product } from "./productData";
import { useCart } from "./CartContext";
import { SmartImage } from "./SmartImage";
import { Link } from "react-router";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
    >
      <Link to={`/shop/${product.id}`} className="block">
        <div className="relative overflow-hidden aspect-[4/5] bg-white">
          <SmartImage
            src={product.image}
            alt={product.name}
            className="w-full h-full group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          {product.badge && (
            <span className="absolute top-3 left-3 bg-gold-400 text-white text-xs px-3 py-1 rounded-full tracking-wide uppercase">
              {product.badge}
            </span>
          )}
          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs px-2.5 py-1 rounded-full text-foreground">
            {product.size}
          </span>
        </div>
      </Link>

      <div className="p-5">
        <p className="text-xs text-gold-500 uppercase tracking-widest mb-1">
          {product.categoryLabel}
        </p>
        <Link to={`/shop/${product.id}`}>
          <h3
            className="text-base mb-0.5 group-hover:text-olive-500 transition-colors"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-3">{product.subtitle}</p>

        <div className="flex items-center justify-between">
          <span
            className="text-lg text-olive-500"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {product.price.toFixed(2).replace(".", ",")} €
          </span>
          <button
            onClick={() => addItem(product)}
            className="flex items-center gap-2 bg-olive-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-olive-600 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}