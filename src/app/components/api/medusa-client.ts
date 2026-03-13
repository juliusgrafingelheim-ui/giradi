// =============================================================================
// MEDUSA.JS STORE API CLIENT
// =============================================================================
// Wraps the Medusa Store API for cart management, products, and checkout.
// All methods gracefully fail when backend is not available.
// =============================================================================

import {
  STORE_API,
  MEDUSA_PUBLISHABLE_KEY,
  IS_BACKEND_ENABLED,
  STORE_HEALTH_ENDPOINT,
} from "./config";

// ---------------------------------------------------------------------------
// Types matching Medusa v2 Store API responses
// ---------------------------------------------------------------------------

export interface MedusaProduct {
  id: string;
  title: string;
  description: string;
  handle: string;
  thumbnail: string;
  variants: MedusaVariant[];
  metadata?: Record<string, string>;
  collection?: { id: string; title: string; handle: string };
  tags?: { id: string; value: string }[];
  images?: { id: string; url: string }[];
}

export interface MedusaVariant {
  id: string;
  title: string;
  prices: { amount: number; currency_code: string }[];
  calculated_price?: {
    calculated_amount: number;
    currency_code: string;
  };
  inventory_quantity?: number;
  manage_inventory?: boolean;
  metadata?: Record<string, string>;
}

export interface MedusaLineItem {
  id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  title: string;
  thumbnail: string;
  variant: MedusaVariant;
}

export interface MedusaCart {
  id: string;
  items: MedusaLineItem[];
  total: number;
  subtotal: number;
  shipping_total: number;
  tax_total: number;
  region_id: string;
  email?: string;
  shipping_address?: MedusaAddress;
  billing_address?: MedusaAddress;
  payment_sessions?: MedusaPaymentSession[];
  payment_collection?: {
    id: string;
    payment_sessions?: MedusaPaymentSession[];
  };
}

export interface MedusaAddress {
  first_name: string;
  last_name: string;
  address_1: string;
  city: string;
  postal_code: string;
  country_code: string;
  phone?: string;
}

export interface MedusaPaymentSession {
  id: string;
  provider_id: string;
  status: string;
}

export interface MedusaOrder {
  id: string;
  display_id: number;
  status: string;
  total: number;
  email: string;
}

// ---------------------------------------------------------------------------
// HTTP helper
// ---------------------------------------------------------------------------

async function medusaFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T | null> {
  if (!IS_BACKEND_ENABLED) return null;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(MEDUSA_PUBLISHABLE_KEY
        ? { "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY }
        : {}),
    };

    const url = `${STORE_API}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string>) },
    });

    if (!res.ok) {
      // Try to read error body for better debugging
      let errorBody = "";
      try {
        const errJson = await res.json();
        errorBody = JSON.stringify(errJson);
      } catch {
        try { errorBody = await res.text(); } catch { /* ignore */ }
      }
      console.warn(`[Medusa] ${res.status} ${res.statusText} – ${path}`, errorBody);
      return null;
    }

    const json = await res.json();

    // Debug: log raw response for POST requests
    if (options.method === "POST" || options.method === "DELETE") {
      console.log(`[Medusa] Raw response – ${path}:`, JSON.stringify(json).slice(0, 1500));
    }

    return json as T;
  } catch (err) {
    console.warn(`[Medusa] Network error – ${path}`, err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Health Check (for cron-job.org and UI status indicator)
// ---------------------------------------------------------------------------

export async function checkBackendHealth(): Promise<{
  online: boolean;
  latency: number;
}> {
  if (!IS_BACKEND_ENABLED) return { online: false, latency: 0 };

  const start = Date.now();
  // Use /store/products?limit=1 instead of /health to avoid CORS issues.
  // /health is not covered by Medusa's STORE_CORS, but /store/* routes are.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(STORE_HEALTH_ENDPOINT, {
        method: "GET",
        headers: {
          "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
        },
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) return { online: true, latency: Date.now() - start };
    } catch {
      // retry
    }
    if (attempt < 1) await new Promise((r) => setTimeout(r, 2000));
  }
  return { online: false, latency: Date.now() - start };
}

// ---------------------------------------------------------------------------
// PRODUCTS
// ---------------------------------------------------------------------------

export async function fetchProducts(): Promise<MedusaProduct[] | null> {
  const data = await medusaFetch<{ products: MedusaProduct[] }>(
    "/products?limit=100&fields=+thumbnail,+metadata,*images,*variants,*variants.prices"
  );

  // Debug: log first product's image data to verify thumbnail/images are coming through
  if (data?.products?.length) {
    const sample = data.products[0];
    console.log(`[Medusa] Sample product "${sample.title}":`, {
      thumbnail: sample.thumbnail,
      images: sample.images?.map((i) => i.url),
      imageCount: sample.images?.length ?? 0,
    });
  }

  return data?.products || null;
}

export async function fetchProduct(
  handle: string
): Promise<MedusaProduct | null> {
  const data = await medusaFetch<{ products: MedusaProduct[] }>(
    `/products?handle=${handle}&fields=+thumbnail,+metadata,*images,*variants,*variants.prices`
  );
  return data?.products?.[0] || null;
}

// ---------------------------------------------------------------------------
// CART
// ---------------------------------------------------------------------------

const CART_ID_KEY = "tgo_medusa_cart_id";

function getStoredCartId(): string | null {
  return localStorage.getItem(CART_ID_KEY);
}

function storeCartId(id: string) {
  localStorage.setItem(CART_ID_KEY, id);
}

export function clearStoredCartId() {
  localStorage.removeItem(CART_ID_KEY);
}

/** Create a new cart (with AT region) */
export async function createCart(): Promise<MedusaCart | null> {
  const data = await medusaFetch<{ cart: MedusaCart }>("/carts", {
    method: "POST",
    body: JSON.stringify({}),
  });
  if (data?.cart) {
    storeCartId(data.cart.id);
  }
  return data?.cart || null;
}

/** Get or create cart */
export async function getOrCreateCart(): Promise<MedusaCart | null> {
  const existingId = getStoredCartId();

  if (existingId) {
    const data = await medusaFetch<{ cart: MedusaCart }>(
      `/carts/${existingId}`
    );
    if (data?.cart) return data.cart;
    // Cart expired or invalid – create new
    console.warn(`[Medusa] Stored cart ${existingId} is gone (404/expired), creating new cart`);
    clearStoredCartId();
  }

  return createCart();
}

/**
 * Validate that a cart still exists on the backend AND is not completed.
 * Returns the cart if valid and open, null if expired/completed/404.
 */
export async function validateCart(
  cartId: string
): Promise<MedusaCart | null> {
  if (!IS_BACKEND_ENABLED || !cartId) return null;
  const data = await medusaFetch<{ cart: MedusaCart & { completed_at?: string | null } }>(
    `/carts/${cartId}`
  );
  const cart = data?.cart;
  if (!cart) return null;
  // A completed cart still returns on GET but rejects POST updates → treat as invalid
  if ((cart as any).completed_at) {
    console.warn(`[Medusa] Cart ${cartId} is completed – treating as invalid`);
    return null;
  }
  return cart;
}

/**
 * Force-create a brand new cart, ignoring any stored ID.
 * Clears localStorage first to prevent getOrCreateCart from reusing the old one.
 */
export function forceNewCart(): Promise<MedusaCart | null> {
  clearStoredCartId();
  return createCart();
}

/** Add item to cart */
export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number = 1
): Promise<MedusaCart | null> {
  const data = await medusaFetch<{ cart: MedusaCart }>(
    `/carts/${cartId}/line-items`,
    {
      method: "POST",
      body: JSON.stringify({ variant_id: variantId, quantity }),
    }
  );
  return data?.cart || null;
}

/** Update line item quantity */
export async function updateLineItem(
  cartId: string,
  lineItemId: string,
  quantity: number
): Promise<MedusaCart | null> {
  const data = await medusaFetch<{ cart: MedusaCart }>(
    `/carts/${cartId}/line-items/${lineItemId}`,
    {
      method: "POST",
      body: JSON.stringify({ quantity }),
    }
  );
  return data?.cart || null;
}

/** Remove line item */
export async function removeLineItem(
  cartId: string,
  lineItemId: string
): Promise<MedusaCart | null> {
  const data = await medusaFetch<{ cart: MedusaCart }>(
    `/carts/${cartId}/line-items/${lineItemId}`,
    { method: "DELETE" }
  );
  return data?.cart || null;
}

// ---------------------------------------------------------------------------
// CHECKOUT
// ---------------------------------------------------------------------------

/** Update cart with customer info and shipping address */
export async function updateCart(
  cartId: string,
  payload: {
    email?: string;
    shipping_address?: MedusaAddress;
    billing_address?: MedusaAddress;
  }
): Promise<MedusaCart | null> {
  const data = await medusaFetch<{ cart: MedusaCart }>(`/carts/${cartId}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const cart = data?.cart;

  // Medusa v2 may not return addresses in the default response fields.
  // If we sent addresses but they're not in the response, verify by re-fetching.
  if (cart && (payload.shipping_address || payload.billing_address)) {
    if (!cart.shipping_address?.first_name && !cart.billing_address?.first_name) {
      console.log("[Medusa] Addresses not in update response – verifying with re-fetch...");
      const verify = await medusaFetch<{ cart: MedusaCart }>(
        `/carts/${cartId}?fields=*shipping_address,*billing_address`
      );
      if (verify?.cart) {
        console.log("[Medusa] Verified cart addresses:", {
          shipping: verify.cart.shipping_address,
          billing: verify.cart.billing_address,
        });
        // Merge address data into the response cart
        return { ...cart, ...verify.cart };
      }
    }
  }

  return cart || null;
}

/** Add shipping method to cart */
export async function addShippingMethod(
  cartId: string,
  optionId: string
): Promise<MedusaCart | null> {
  const data = await medusaFetch<{ cart: MedusaCart }>(
    `/carts/${cartId}/shipping-methods`,
    {
      method: "POST",
      body: JSON.stringify({ option_id: optionId }),
    }
  );
  return data?.cart || null;
}

/**
 * Fetch cart with payment_collection included.
 * Medusa v2 uses different field expansion syntax – try multiple approaches.
 * Includes retry with delay since payment_collection may be created asynchronously.
 */
export async function fetchCartForCheckout(
  cartId: string
): Promise<MedusaCart | null> {
  // Helper to check payment_collection on any cart-like response
  const hasPaymentCollection = (cart: any): boolean =>
    !!(cart?.payment_collection?.id);

  // Try multiple field expansion approaches
  const expansionPaths = [
    `?fields=*payment_collection,*payment_collection.payment_sessions`,
    `?fields=*payment_collection`,
    `?fields=+payment_collection.id,+payment_collection.payment_sessions`,
    ``, // plain fetch – some Medusa versions include it by default
  ];

  for (const qs of expansionPaths) {
    const data = await medusaFetch<{ cart: MedusaCart }>(
      `/carts/${cartId}${qs}`
    );
    if (hasPaymentCollection(data?.cart)) {
      console.log(`[Medusa] payment_collection found with expansion: "${qs}"`);
      return data!.cart;
    }
  }

  // Log the raw cart keys for debugging
  const rawData = await medusaFetch<{ cart: Record<string, unknown> }>(
    `/carts/${cartId}`
  );
  if (rawData?.cart) {
    console.log(
      "[Medusa] Cart keys (no payment_collection yet):",
      Object.keys(rawData.cart)
    );
    console.log(
      "[Medusa] payment_collection value:",
      (rawData.cart as any).payment_collection
    );
  }

  return (rawData?.cart as unknown as MedusaCart) || null;
}

/**
 * Fetch cart for checkout WITH retries.
 * After adding a shipping method, Medusa v2 may take a moment to create
 * the payment_collection. This function retries up to `maxRetries` times
 * with increasing delay.
 */
export async function fetchCartForCheckoutWithRetry(
  cartId: string,
  maxRetries: number = 4,
  baseDelayMs: number = 800
): Promise<MedusaCart | null> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = baseDelayMs * attempt;
      console.log(
        `[Medusa] Retry ${attempt}/${maxRetries} – waiting ${delay}ms for payment_collection...`
      );
      await new Promise((r) => setTimeout(r, delay));
    }

    const cart = await fetchCartForCheckout(cartId);
    if (cart?.payment_collection?.id) {
      console.log(
        `[Medusa] payment_collection found on attempt ${attempt + 1}:`,
        cart.payment_collection.id
      );
      return cart;
    }
  }

  console.warn(
    `[Medusa] payment_collection NOT found after ${maxRetries + 1} attempts`
  );
  return await fetchCartForCheckout(cartId); // return last attempt anyway
}

/** Initialize payment sessions */
export async function initPaymentSessions(
  cartId: string
): Promise<MedusaCart | null> {
  const data = await medusaFetch<{ cart: MedusaCart }>(
    `/carts/${cartId}/payment-sessions`,
    { method: "POST" }
  );
  return data?.cart || null;
}

/** Select payment session provider */
export async function selectPaymentSession(
  cartId: string,
  providerId: string
): Promise<MedusaCart | null> {
  const data = await medusaFetch<{ cart: MedusaCart }>(
    `/carts/${cartId}/payment-sessions/${providerId}`,
    { method: "POST" }
  );
  return data?.cart || null;
}

/** Complete checkout – creates the order */
export async function completeCart(
  cartId: string
): Promise<MedusaOrder | null> {
  if (!IS_BACKEND_ENABLED) return null;

  const url = `${STORE_API}/carts/${cartId}/complete`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(MEDUSA_PUBLISHABLE_KEY
      ? { "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY }
      : {}),
  };

  const res = await fetch(url, { method: "POST", headers });
  let json: any;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  console.log(
    "[Medusa] completeCart status:", res.status,
    "raw:", JSON.stringify(json).slice(0, 2000)
  );

  // Success: 200 OK
  if (res.ok && json) {
    const order = json.order || json.data;
    if (order?.id) {
      clearStoredCartId();
      return order as MedusaOrder;
    }
  }

  // 409 Conflict: cart was already completed (double-submit).
  // The order exists — we can still treat this as success.
  if (res.status === 409) {
    console.warn(
      "[Medusa] completeCart got 409 – cart already completed. Treating as success."
    );
    clearStoredCartId();
    // Return a minimal order object so the checkout flow can proceed
    return {
      id: cartId,
      display_id: 0,
      status: "pending",
      total: 0,
      email: "",
    } as MedusaOrder;
  }

  // Any other error
  console.error("[Medusa] completeCart failed:", res.status, json);
  return null;
}

// ---------------------------------------------------------------------------
// REGIONS (for shipping options)
// ---------------------------------------------------------------------------

export interface MedusaRegion {
  id: string;
  name: string;
  currency_code: string;
  countries: { iso_2: string; name: string }[];
}

export async function fetchRegions(): Promise<MedusaRegion[] | null> {
  const data = await medusaFetch<{ regions: MedusaRegion[] }>("/regions");
  return data?.regions || null;
}

/** Get shipping options for a cart */
export async function fetchShippingOptions(
  cartId: string
): Promise<{ id: string; name: string; amount: number; data?: Record<string, unknown> }[] | null> {
  const data = await medusaFetch<{
    shipping_options: { id: string; name: string; amount: number; data?: Record<string, unknown> }[];
  }>(`/shipping-options?cart_id=${cartId}`);
  return data?.shipping_options || null;
}

// ---------------------------------------------------------------------------
// PAYMENT (Medusa v2 – Payment Collections)
// ---------------------------------------------------------------------------

/**
 * Create a payment collection for a cart.
 * In Medusa v2.13+, payment collections are NOT auto-created when adding
 * a shipping method. They must be explicitly created via this endpoint.
 */
export async function createPaymentCollection(
  cartId: string
): Promise<{ id: string } | null> {
  const data = await medusaFetch<{
    payment_collection: { id: string; payment_sessions?: unknown[] };
  }>(`/payment-collections`, {
    method: "POST",
    body: JSON.stringify({ cart_id: cartId }),
  });
  if (data?.payment_collection?.id) {
    console.log(
      "[Medusa] Payment collection created:",
      data.payment_collection.id
    );
    return data.payment_collection;
  }
  return null;
}

/**
 * Initialize a payment session on the cart's payment collection.
 * We create a payment session with the given provider (e.g. "pp_system_default").
 * Note: Medusa v2.13+ does NOT accept a "context" field here.
 */
export async function initPaymentSession(
  paymentCollectionId: string,
  providerId: string = "pp_system_default"
): Promise<{ id: string; provider_id: string; status: string } | null> {
  const data = await medusaFetch<{
    payment_collection: {
      payment_sessions: { id: string; provider_id: string; status: string }[];
    };
  }>(`/payment-collections/${paymentCollectionId}/payment-sessions`, {
    method: "POST",
    body: JSON.stringify({
      provider_id: providerId,
    }),
  });
  const sessions = data?.payment_collection?.payment_sessions;
  return sessions?.find((s) => s.provider_id === providerId) || sessions?.[0] || null;
}