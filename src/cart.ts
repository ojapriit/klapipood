import type { Product } from './products';

/** Ostukorvi rida localStorage'is: ainult toote id ja kogus, hinnad tulevad alati tooteandmetest. */
export interface CartLine {
  productId: string;
  quantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export const MAX_QUANTITY = 99;

function clampQuantity(quantity: number): number {
  return Math.min(Math.max(Math.trunc(quantity), 0), MAX_QUANTITY);
}

/** Lisab toote; olemasoleva toote korral suurendab rea kogust. */
export function addLine(lines: CartLine[], productId: string): CartLine[] {
  const existing = lines.find((l) => l.productId === productId);
  if (!existing) return [...lines, { productId, quantity: 1 }];
  return lines.map((l) =>
    l.productId === productId ? { ...l, quantity: clampQuantity(l.quantity + 1) } : l,
  );
}

/** Määrab rea koguse. Kogus 0 või vähem eemaldab rea; mittearvuline väärtus ei muuda midagi. */
export function setLineQuantity(lines: CartLine[], productId: string, quantity: number): CartLine[] {
  if (!Number.isFinite(quantity)) return lines;
  const next = clampQuantity(quantity);
  if (next === 0) return removeLine(lines, productId);
  return lines.map((l) => (l.productId === productId ? { ...l, quantity: next } : l));
}

export function removeLine(lines: CartLine[], productId: string): CartLine[] {
  return lines.filter((l) => l.productId !== productId);
}

export function toItems(lines: CartLine[], productById: Map<string, Product>): CartItem[] {
  return lines.flatMap((l) => {
    const product = productById.get(l.productId);
    return product ? [{ product, quantity: l.quantity }] : [];
  });
}

export function totalCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}

/** Kogusumma täisarvulistes sentides. */
export function totalCents(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.product.priceCents * i.quantity, 0);
}

/**
 * Loeb localStorage'i sisu. Vigane JSON, vale kuju, tundmatud tooted, kehtetud kogused ja
 * topeltread ei tohi rakendust lõhkuda – need jäetakse vahele või ühendatakse.
 */
export function parseStoredCart(raw: string | null, knownIds: ReadonlySet<string>): CartLine[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const result: CartLine[] = [];
  for (const entry of parsed) {
    if (typeof entry !== 'object' || entry === null) continue;
    const { productId, quantity } = entry as Record<string, unknown>;
    if (typeof productId !== 'string' || !knownIds.has(productId)) continue;
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) continue;
    const existing = result.find((l) => l.productId === productId);
    if (existing) existing.quantity = clampQuantity(existing.quantity + quantity);
    else result.push({ productId, quantity: clampQuantity(quantity) });
  }
  return result;
}
