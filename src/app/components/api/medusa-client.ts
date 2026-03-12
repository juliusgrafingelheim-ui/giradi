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
  HEALTH_ENDPOINT,
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

    const res = await fetch(`${STORE_API}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string>) },
      credentials: "include", // Medusa uses cookies for cart sessions
    });

    if (!res.ok) {
      console.warn(`[Medusa] ${res.status} ${res.statusText} – ${path}`);
      return null;
    }

    return (await res.json()) as T;
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
  try {
    const res = await fetch(HEALTH_ENDPOINT, {
      method: "GET",
      signal: AbortSignal.timeout(8000), // Render cold start can take a few sec
    });
    return { online: res.ok, latency: Date.now() - start };
  } catch {
    return { online: false, latency: Date.now() - start };
  }
}

// ---------------------------------------------------------------------------
// PRODUCTS
// ---------------------------------------------------------------------------

export async function fetchProducts(): Promise<MedusaProduct[] | null> {
  const data = await medusaFetch<{ products: MedusaProduct[] }>(
    "/products?limit=100"
  );
  return data?.products || null;
}

export async function fetchProduct(
  handle: string
): Promise<MedusaProduct | null> {
  const data = await medusaFetch<{ products: MedusaProduct[] }>(
    `/products?handle=${handle}`
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
    clearStoredCartId();
  }

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
  return data?.cart || null;
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
  const data = await medusaFetch<{ type: string; data: MedusaOrder }>(
    `/carts/${cartId}/complete`,
    { method: "POST" }
  );
  if (data?.type === "order") {
    clearStoredCartId();
    return data.data;
  }
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
): Promise<{ id: string; name: string; amount: number }[] | null> {
  const data = await medusaFetch<{
    shipping_options: { id: string; name: string; amount: number }[];
  }>(`/shipping-options/${cartId}`);
  return data?.shipping_options || null;
}