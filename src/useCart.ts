import { useCallback, useEffect, useMemo, useState } from 'react';
import { productById } from './products';
import {
  addLine,
  parseStoredCart,
  removeLine,
  setLineQuantity,
  toItems,
  totalCents,
  totalCount,
  type CartLine,
} from './cart';

export { MAX_QUANTITY, type CartItem } from './cart';

export const STORAGE_KEY = 'klapipood:ostukorv';

const knownIds = new Set(productById.keys());

function loadCart(): CartLine[] {
  try {
    return parseStoredCart(localStorage.getItem(STORAGE_KEY), knownIds);
  } catch {
    // localStorage võib olla keelatud (nt mõne brauseri privaatrežiim).
    return [];
  }
}

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Privaatrežiimis vms võib salvestamine ebaõnnestuda – ostukorv töötab siis mälus edasi.
    }
  }, [lines]);

  // Sünkrooni teiste avatud vahelehtedega.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setLines(loadCart());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addItem = useCallback((productId: string) => setLines((prev) => addLine(prev, productId)), []);
  const setQuantity = useCallback(
    (productId: string, quantity: number) => setLines((prev) => setLineQuantity(prev, productId, quantity)),
    [],
  );
  const removeItem = useCallback((productId: string) => setLines((prev) => removeLine(prev, productId)), []);

  const items = useMemo(() => toItems(lines, productById), [lines]);

  return {
    items,
    totalCount: totalCount(lines),
    totalCents: totalCents(items),
    addItem,
    setQuantity,
    removeItem,
  };
}
