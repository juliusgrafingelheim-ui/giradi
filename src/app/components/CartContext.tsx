import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import type { Product } from "./productData";
import { IS_BACKEND_ENABLED } from "./api/config";
import {
  getOrCreateCart,
  addToCart,
  updateLineItem,
  removeLineItem,
  clearStoredCartId,
  validateCart,
  type MedusaCart,
} from "./api/medusa-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CartItem {
  product: Product;
  quantity: number;
  /** Medusa line-item ID (set when synced with backend) */
  _lineItemId?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  /** Medusa cart ID (null if backend not available) */
  medusaCartId: string | null;
  /** Whether the cart is currently syncing with Medusa */
  syncing: boolean;
  /** Ensure Medusa cart exists and is synced – call before checkout */
  ensureMedusaCart: () => Promise<string | null>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Helper: get variant ID from product (stored by useMedusaProducts)
// ---------------------------------------------------------------------------

function getVariantId(product: Product): string | undefined {
  return (product as Product & { _variantId?: string })._variantId;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [medusaCartId, setMedusaCartId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Queue for pending Medusa operations to prevent race conditions
  const opQueue = useRef<Promise<void>>(Promise.resolve());

  // Enqueue a Medusa operation
  const enqueue = useCallback((fn: () => Promise<void>) => {
    opQueue.current = opQueue.current.then(fn).catch((err) => {
      console.warn("[Cart] Medusa sync error:", err);
    });
  }, []);

  // Ensure we have a Medusa cart (lazy-create on first add)
  const ensureMedusaCart = useCallback(async (): Promise<string | null> => {
    if (!IS_BACKEND_ENABLED) return null;

    setSyncing(true);
    try {
      // 1. If we have an existing cart ID, validate it's still alive
      if (medusaCartId) {
        const existingCart = await validateCart(medusaCartId);
        if (existingCart) {
          console.log("[Cart] Existing Medusa cart validated:", medusaCartId);
          setSyncing(false);
          return medusaCartId;
        }
        // Cart is gone (404/completed/expired) – clear and recreate
        console.warn("[Cart] Cart", medusaCartId, "is stale (404). Recreating...");
        clearStoredCartId();
        setMedusaCartId(null);
      }

      // 2. Create a fresh cart
      const newCart = await getOrCreateCart();
      if (!newCart) {
        console.warn("[Cart] Failed to create new Medusa cart");
        return null;
      }

      const newCartId = newCart.id;
      setMedusaCartId(newCartId);
      console.log("[Cart] New Medusa cart created:", newCartId);

      // 3. Re-add all local items to the new cart
      // We need to read items from the current state snapshot
      const currentItems = items;
      if (currentItems.length > 0) {
        console.log("[Cart] Re-syncing", currentItems.length, "item(s) to new cart...");
        for (const item of currentItems) {
          const variantId = getVariantId(item.product);
          if (!variantId) continue;
          try {
            const updatedCart = await addToCart(newCartId, variantId, item.quantity);
            if (updatedCart) {
              // Update line item ID for this product
              const lineItem = updatedCart.items?.find(
                (li: any) => li.variant_id === variantId || li.variant?.id === variantId
              );
              if (lineItem) {
                setItems((prev) =>
                  prev.map((i) =>
                    i.product.id === item.product.id
                      ? { ...i, _lineItemId: lineItem.id }
                      : i
                  )
                );
              }
              console.log("[Cart] Re-synced:", item.product.name, "×", item.quantity);
            }
          } catch (err) {
            console.warn("[Cart] Failed to re-sync item:", item.product.name, err);
          }
        }
      }

      return newCartId;
    } catch (err) {
      console.warn("[Cart] Failed to ensure Medusa cart:", err);
      return null;
    } finally {
      setSyncing(false);
    }
  }, [medusaCartId, items]);

  // On mount: restore cart from localStorage if backend is enabled
  useEffect(() => {
    if (!IS_BACKEND_ENABLED) return;

    const stored = localStorage.getItem("tgo_medusa_cart_id");
    if (stored) {
      setMedusaCartId(stored);
      // We don't fetch cart items here – the local state is the source of truth
      // until we implement full server-side cart restoration
    }
  }, []);

  // --- ADD ITEM ---
  const addItem = useCallback(
    (product: Product) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.product.id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prev, { product, quantity: 1 }];
      });
      setIsOpen(true);

      // Sync with Medusa
      const variantId = getVariantId(product);
      if (IS_BACKEND_ENABLED && variantId) {
        enqueue(async () => {
          setSyncing(true);
          try {
            let cartId = medusaCartId;
            if (!cartId) {
              const cart = await getOrCreateCart();
              if (cart) {
                cartId = cart.id;
                setMedusaCartId(cart.id);
              }
            }
            if (!cartId) return;

            const updatedCart = await addToCart(cartId, variantId, 1);
            if (updatedCart) {
              // Find the line item for this variant and store its ID
              const lineItem = updatedCart.items?.find(
                (li: any) => li.variant_id === variantId || li.variant?.id === variantId
              );
              if (lineItem) {
                setItems((prev) =>
                  prev.map((i) =>
                    i.product.id === product.id
                      ? { ...i, _lineItemId: lineItem.id }
                      : i
                  )
                );
              }
              console.log("[Cart] Added to Medusa cart:", product.name);
            }
          } catch (err) {
            console.warn("[Cart] Failed to add to Medusa:", err);
          } finally {
            setSyncing(false);
          }
        });
      }
    },
    [medusaCartId, enqueue]
  );

  // --- REMOVE ITEM ---
  const removeItem = useCallback(
    (productId: string) => {
      const item = items.find((i) => i.product.id === productId);
      setItems((prev) => prev.filter((i) => i.product.id !== productId));

      if (IS_BACKEND_ENABLED && medusaCartId && item?._lineItemId) {
        enqueue(async () => {
          try {
            await removeLineItem(medusaCartId!, item._lineItemId!);
            console.log("[Cart] Removed from Medusa cart:", productId);
          } catch (err) {
            console.warn("[Cart] Failed to remove from Medusa:", err);
          }
        });
      }
    },
    [items, medusaCartId, enqueue]
  );

  // --- UPDATE QUANTITY ---
  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      const item = items.find((i) => i.product.id === productId);

      if (quantity <= 0) {
        setItems((prev) => prev.filter((i) => i.product.id !== productId));
        if (IS_BACKEND_ENABLED && medusaCartId && item?._lineItemId) {
          enqueue(async () => {
            try {
              await removeLineItem(medusaCartId!, item._lineItemId!);
            } catch (err) {
              console.warn("[Cart] Failed to remove from Medusa:", err);
            }
          });
        }
      } else {
        setItems((prev) =>
          prev.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          )
        );
        if (IS_BACKEND_ENABLED && medusaCartId && item?._lineItemId) {
          enqueue(async () => {
            try {
              await updateLineItem(medusaCartId!, item._lineItemId!, quantity);
              console.log("[Cart] Updated quantity in Medusa:", productId, quantity);
            } catch (err) {
              console.warn("[Cart] Failed to update Medusa:", err);
            }
          });
        }
      }
    },
    [items, medusaCartId, enqueue]
  );

  // --- CLEAR CART ---
  const clearCart = useCallback(() => {
    setItems([]);
    setMedusaCartId(null);
    clearStoredCartId();
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
        setIsOpen,
        medusaCartId,
        syncing,
        ensureMedusaCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}