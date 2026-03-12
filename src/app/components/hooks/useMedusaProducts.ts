import { useState, useEffect } from "react";
import { fetchProducts, type MedusaProduct } from "../api/medusa-client";
import { IS_BACKEND_ENABLED } from "../api/config";
import { confirmBackendOnline } from "../api/use-backend-status";
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

// ---------------------------------------------------------------------------
// Extract size hint from a string (e.g. "5L" → 5000, "750ml" → 750, "1 Liter" → 1000)
// ---------------------------------------------------------------------------

function extractSizeMl(text: string): number | null {
  const s = text.toLowerCase().replace(/,/g, ".");

  // Match patterns like "5l", "5 liter", "0.75l", "1l"
  const literMatch = s.match(/([\d.]+)\s*(?:l(?:iter)?)\b/);
  if (literMatch) return Math.round(parseFloat(literMatch[1]) * 1000);

  // Match patterns like "500ml", "250 ml"
  const mlMatch = s.match(/([\d.]+)\s*ml\b/);
  if (mlMatch) return Math.round(parseFloat(mlMatch[1]));

  return null;
}

function findLocalMatch(medusa: MedusaProduct): Product | undefined {
  // Try matching by handle first (e.g. "bio-1000")
  const byId = localProducts.find((lp) => lp.id === medusa.handle);
  if (byId) return byId;

  // Try matching by normalized title
  const mTitle = normalizeTitle(medusa.title);
  const candidates = localProducts.filter((lp) => {
    const lTitle = normalizeTitle(lp.name);
    return lTitle === mTitle || mTitle.includes(lTitle) || lTitle.includes(mTitle);
  });

  // If only one match, return it
  if (candidates.length === 1) return candidates[0];

  // Multiple matches (e.g. same product name, different sizes) → compare sizes
  if (candidates.length > 1) {
    const medusaSizeMl = extractSizeMl(medusa.title);
    if (medusaSizeMl) {
      const sizeMatch = candidates.find((lp) => {
        const localSizeMl = extractSizeMl(lp.size) || extractSizeMl(lp.subtitle);
        return localSizeMl === medusaSizeMl;
      });
      if (sizeMatch) return sizeMatch;
    }

    // Also try variant title for size info
    const variantTitle = medusa.variants?.[0]?.title;
    if (variantTitle) {
      const variantSizeMl = extractSizeMl(variantTitle);
      if (variantSizeMl) {
        const sizeMatch = candidates.find((lp) => {
          const localSizeMl = extractSizeMl(lp.size) || extractSizeMl(lp.subtitle);
          return localSizeMl === variantSizeMl;
        });
        if (sizeMatch) return sizeMatch;
      }
    }

    // Fallback: return first candidate (better than nothing)
    return candidates[0];
  }

  return undefined;
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
// Validate thumbnail URL – skip localhost / unreachable origins
// ---------------------------------------------------------------------------

function isUsableThumbnail(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const u = new URL(url);
    // Reject localhost / 127.0.0.1 – those are dev-only uploads
    if (
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1" ||
      u.hostname === "0.0.0.0"
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Convert a Medusa product to our local Product interface
// ---------------------------------------------------------------------------

function medusaToProduct(medusa: MedusaProduct): Product {
  const localMatch = findLocalMatch(medusa);
  const meta = medusa.metadata || {};

  // Price: Medusa v2 stores amount in smallest currency unit (cents for EUR)
  const variant = medusa.variants?.[0];
  let price = 0;
  let priceFromMedusa = false;
  if (variant) {
    if (variant.calculated_price?.calculated_amount != null) {
      const p = variant.calculated_price.calculated_amount / 100;
      if (p > 0) {
        price = p;
        priceFromMedusa = true;
      }
    } else if (variant.prices?.length) {
      const eurPrice = variant.prices.find((p) => p.currency_code === "eur");
      const raw = eurPrice?.amount ?? variant.prices[0]?.amount ?? 0;
      const p = raw / 100;
      if (p > 0) {
        price = p;
        priceFromMedusa = true;
      }
    } else if ((variant as any).price != null) {
      const p = (variant as any).price / 100;
      if (p > 0) {
        price = p;
        priceFromMedusa = true;
      }
    }
  }

  // Fallback to local price if Medusa has no valid price
  if (!priceFromMedusa && localMatch?.price) {
    price = localMatch.price;
  }

  // Category: prefer metadata from Medusa, then local match, then infer
  let category: Product["category"];
  let categoryLabel: string;
  if (meta.category && meta.categoryLabel) {
    category = meta.category as Product["category"];
    categoryLabel = meta.categoryLabel as string;
  } else if (localMatch) {
    category = localMatch.category;
    categoryLabel = localMatch.categoryLabel;
  } else {
    const inferred = inferCategory(medusa);
    category = inferred.category;
    categoryLabel = inferred.categoryLabel;
  }

  // Subtitle: prefer Medusa metadata, then local, then size
  const subtitle =
    (meta.subtitle as string) ||
    localMatch?.subtitle ||
    variant?.title ||
    (meta.size as string) ||
    "";

  // Size: prefer Medusa metadata, then local, then variant title
  const size =
    (meta.size as string) ||
    localMatch?.size ||
    variant?.title ||
    "";

  // Badge: prefer Medusa metadata, then local
  const badge = (meta.badge as string) || localMatch?.badge || undefined;

  // Details: prefer Medusa metadata (JSON string), then local
  let details: string[] = localMatch?.details || [];
  if (meta.details) {
    try {
      const parsed = JSON.parse(meta.details as string);
      if (Array.isArray(parsed) && parsed.length > 0) details = parsed;
    } catch {
      // Not valid JSON, ignore
    }
  }

  // Description: prefer Medusa, then local
  const description = medusa.description || localMatch?.description || "";

  return {
    id: medusa.handle || medusa.id,
    name: medusa.title,
    subtitle,
    description,
    price,
    size,
    category,
    categoryLabel,
    image: isUsableThumbnail(medusa.thumbnail)
      ? medusa.thumbnail
      : localMatch?.image || IK.girardiOil,
    badge,
    inStock:
      variant?.inventory_quantity !== undefined
        ? variant.inventory_quantity > 0
        : true,
    details,
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
          confirmBackendOnline(); // Signal to status badge
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