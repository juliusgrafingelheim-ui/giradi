import { useState, useEffect } from "react";
import { fetchProducts, type MedusaProduct } from "../api/medusa-client";
import { IS_BACKEND_ENABLED } from "../api/config";
import { products as localProducts, type Product, IK } from "../productData";

// ---------------------------------------------------------------------------
// Map Medusa handle → local product ID for enriching with local metadata
// ---------------------------------------------------------------------------

function normalizeTitle(t: string): string {
  return t
    .toLowerCase()
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/[ß]/g, "ss")
    .replace(/[^a-z0-9]/g, "");
}

function findLocalMatch(medusa: MedusaProduct): Product | undefined {
  // Try matching by handle first (e.g. "bio-1000")
  const byId = localProducts.find((lp) => lp.id === medusa.handle);
  if (byId) return byId;

  // Try matching by normalized title
  const mTitle = normalizeTitle(medusa.title);
  return localProducts.find((lp) => {
    const lTitle = normalizeTitle(lp.name);
    return lTitle === mTitle || mTitle.includes(lTitle) || lTitle.includes(mTitle);
  });
}

// ---------------------------------------------------------------------------
// Infer category from Medusa product
// ---------------------------------------------------------------------------

function inferCategory(
  medusa: MedusaProduct
): { category: Product["category"]; categoryLabel: string } {
  const title = medusa.title.toLowerCase();
  const tags = (medusa.metadata?.tags || "").toLowerCase();
  const combined = `${title} ${tags}`;

  if (combined.includes("bio"))
    return { category: "bio", categoryLabel: "BIO Olivenöl" };
  if (combined.includes("balsam"))
    return { category: "balsamessig", categoryLabel: "Balsamessig" };
  if (
    combined.includes("aroma") ||
    combined.includes("basilikum") ||
    combined.includes("chili") ||
    combined.includes("knoblauch") ||
    combined.includes("trueffel") ||
    combined.includes("trüffel") ||
    combined.includes("zitrone") ||
    combined.includes("rosmarin") ||
    combined.includes("oregano") ||
    combined.includes("limette") ||
    combined.includes("orange") ||
    combined.includes("blutorange") ||
    combined.includes("pesto") ||
    combined.includes("thymian") ||
    combined.includes("kräuter") ||
    combined.includes("krauter")
  )
    return { category: "aroma", categoryLabel: "Olivenöl mit Aroma" };

  return { category: "extra-nativ", categoryLabel: "Olivenöl Extra Nativ" };
}

// ---------------------------------------------------------------------------
// Convert a Medusa product to our local Product interface
// ---------------------------------------------------------------------------

function medusaToProduct(medusa: MedusaProduct): Product {
  const localMatch = findLocalMatch(medusa);

  // Price: Medusa v2 stores amount in smallest currency unit (cents for EUR)
  const variant = medusa.variants?.[0];
  let price = localMatch?.price ?? 0;
  if (variant) {
    if (variant.calculated_price?.calculated_amount != null) {
      price = variant.calculated_price.calculated_amount / 100;
    } else if (variant.prices?.length) {
      const eurPrice = variant.prices.find((p) => p.currency_code === "eur");
      const raw = eurPrice?.amount ?? variant.prices[0]?.amount ?? 0;
      price = raw / 100;
    } else if ((variant as any).price != null) {
      price = (variant as any).price / 100;
    }
  }

  const { category, categoryLabel } = localMatch
    ? { category: localMatch.category, categoryLabel: localMatch.categoryLabel }
    : inferCategory(medusa);

  // Size from variant title or metadata
  const size =
    localMatch?.size ||
    variant?.title ||
    medusa.metadata?.size ||
    "";

  return {
    id: medusa.handle || medusa.id,
    name: medusa.title,
    subtitle: localMatch?.subtitle || size,
    description: medusa.description || localMatch?.description || "",
    price,
    size,
    category,
    categoryLabel,
    image: medusa.thumbnail || localMatch?.image || IK.girardiOil,
    badge: localMatch?.badge,
    inStock:
      variant?.inventory_quantity !== undefined
        ? variant.inventory_quantity > 0
        : true,
    details: localMatch?.details || [],
    // Store medusa IDs for cart operations
    _medusaId: medusa.id,
    _variantId: variant?.id,
  } as Product & { _medusaId?: string; _variantId?: string };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

interface UseMedusaProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  isFromBackend: boolean;
}

export function useMedusaProducts(): UseMedusaProductsResult {
  const [products, setProducts] = useState<Product[]>(localProducts);
  const [loading, setLoading] = useState(IS_BACKEND_ENABLED);
  const [error, setError] = useState<string | null>(null);
  const [isFromBackend, setIsFromBackend] = useState(false);

  useEffect(() => {
    if (!IS_BACKEND_ENABLED) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const medusaProducts = await fetchProducts();

        if (cancelled) return;

        if (medusaProducts && medusaProducts.length > 0) {
          const mapped = medusaProducts.map(medusaToProduct);
          setProducts(mapped);
          setIsFromBackend(true);
          setError(null);
        } else {
          // Backend returned empty or null – use local fallback
          setProducts(localProducts);
          setIsFromBackend(false);
          setError("Backend erreichbar, aber keine Produkte gefunden.");
        }
      } catch (err) {
        if (cancelled) return;
        console.warn("[useMedusaProducts] Fallback to local data:", err);
        setProducts(localProducts);
        setIsFromBackend(false);
        setError("Backend nicht erreichbar – lokale Daten werden angezeigt.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading, error, isFromBackend };
}