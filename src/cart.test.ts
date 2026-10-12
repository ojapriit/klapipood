import { describe, expect, it } from 'vitest';
import {
  MAX_QUANTITY,
  addLine,
  parseStoredCart,
  removeLine,
  setLineQuantity,
  toItems,
  totalCents,
  totalCount,
  type CartLine,
} from './cart';
import { formatPrice, productById, products, type Product } from './products';

const knownIds = new Set(productById.keys());
const itemsOf = (lines: CartLine[]) => toItems(lines, productById);

describe('addLine', () => {
  it('lisab uue toote kogusega 1', () => {
    expect(addLine([], 'sadu')).toEqual([{ productId: 'sadu', quantity: 1 }]);
  });

  it('sama toote kaks lisamist annab ühe rea kogusega 2', () => {
    const lines = addLine(addLine([], 'sadu'), 'sadu');
    expect(lines).toEqual([{ productId: 'sadu', quantity: 2 }]);
  });

  it('ei muuda algset massiivi', () => {
    const original: CartLine[] = [{ productId: 'sadu', quantity: 1 }];
    addLine(original, 'sadu');
    expect(original).toEqual([{ productId: 'sadu', quantity: 1 }]);
  });

  it('ei ületa maksimaalset kogust', () => {
    const lines = addLine([{ productId: 'sadu', quantity: MAX_QUANTITY }], 'sadu');
    expect(lines[0].quantity).toBe(MAX_QUANTITY);
  });
});

describe('totalCents', () => {
  it('kahe erineva toote kogusumma on õige', () => {
    // Põhjala 189,00 € + Sadu 79,00 € = 268,00 €
    const lines = addLine(addLine([], 'pohjala'), 'sadu');
    expect(totalCents(itemsOf(lines))).toBe(26800);
    expect(totalCount(lines)).toBe(2);
  });

  it('arvutab täisarvulistes sentides ilma ujukomavigadeta', () => {
    const cheap: Product = { ...products[0], id: 'x', priceCents: 10 };
    const odd: Product = { ...products[0], id: 'y', priceCents: 20 };
    const total = totalCents([
      { product: cheap, quantity: 1 },
      { product: odd, quantity: 1 },
    ]);
    // Eurodes 0.1 + 0.2 annaks 0.30000000000000004.
    expect(total).toBe(30);
    expect(Number.isInteger(total)).toBe(true);
  });

  it('tühja ostukorvi summa on 0', () => {
    expect(totalCents([])).toBe(0);
  });
});

describe('setLineQuantity', () => {
  const start: CartLine[] = [
    { productId: 'pohjala', quantity: 1 },
    { productId: 'sadu', quantity: 1 },
  ];

  it('koguse muutmine uuendab kogusummat', () => {
    const lines = setLineQuantity(start, 'sadu', 3);
    expect(lines).toEqual([
      { productId: 'pohjala', quantity: 1 },
      { productId: 'sadu', quantity: 3 },
    ]);
    expect(totalCents(itemsOf(lines))).toBe(18900 + 3 * 7900);
  });

  it('kogus 0 eemaldab rea', () => {
    expect(setLineQuantity(start, 'sadu', 0)).toEqual([{ productId: 'pohjala', quantity: 1 }]);
  });

  it('piirab koguse maksimumiga ja ümardab murdarvu alla', () => {
    expect(setLineQuantity(start, 'sadu', 1000)[1].quantity).toBe(MAX_QUANTITY);
    expect(setLineQuantity(start, 'sadu', 2.7)[1].quantity).toBe(2);
  });

  it('NaN ei muuda ostukorvi', () => {
    expect(setLineQuantity(start, 'sadu', Number.NaN)).toBe(start);
  });
});

describe('removeLine', () => {
  it('eemaldab ainult valitud toote', () => {
    const lines: CartLine[] = [
      { productId: 'pohjala', quantity: 2 },
      { productId: 'sadu', quantity: 1 },
    ];
    expect(removeLine(lines, 'pohjala')).toEqual([{ productId: 'sadu', quantity: 1 }]);
  });

  it('viimase toote eemaldamine jätab tühja ostukorvi', () => {
    expect(removeLine([{ productId: 'sadu', quantity: 1 }], 'sadu')).toEqual([]);
  });
});

describe('parseStoredCart', () => {
  it('loeb kehtiva sisu', () => {
    const raw = JSON.stringify([{ productId: 'sadu', quantity: 2 }]);
    expect(parseStoredCart(raw, knownIds)).toEqual([{ productId: 'sadu', quantity: 2 }]);
  });

  it.each([
    ['null', null],
    ['tühi string', ''],
    ['vigane JSON', '{ei ole json'],
    ['objekt massiivi asemel', '{"productId":"sadu","quantity":1}'],
    ['number', '42'],
    ['JSON null', 'null'],
  ])('vigane sisu (%s) annab tühja ostukorvi', (_, raw) => {
    expect(parseStoredCart(raw, knownIds)).toEqual([]);
  });

  it('jätab vahele vigased read ja säilitab kehtivad', () => {
    const raw = JSON.stringify([
      null,
      'sadu',
      { productId: 'olematu', quantity: 1 },
      { productId: 'sadu', quantity: '2' },
      { productId: 'sadu', quantity: 0 },
      { productId: 'sadu', quantity: -1 },
      { productId: 'sadu', quantity: 1.5 },
      { productId: 42, quantity: 1 },
      { productId: 'pohjala', quantity: 2 },
    ]);
    expect(parseStoredCart(raw, knownIds)).toEqual([{ productId: 'pohjala', quantity: 2 }]);
  });

  it('ühendab topeltread ja piirab liiga suure koguse', () => {
    const raw = JSON.stringify([
      { productId: 'sadu', quantity: 1 },
      { productId: 'sadu', quantity: 2 },
      { productId: 'pohjala', quantity: 5000 },
    ]);
    expect(parseStoredCart(raw, knownIds)).toEqual([
      { productId: 'sadu', quantity: 3 },
      { productId: 'pohjala', quantity: MAX_QUANTITY },
    ]);
  });
});

describe('tooteandmed', () => {
  it('kuus toodet unikaalsete id-dega ja täisarvuliste hindadega sentides', () => {
    expect(products).toHaveLength(6);
    expect(new Set(products.map((p) => p.id)).size).toBe(6);
    for (const p of products) {
      expect(Number.isInteger(p.priceCents)).toBe(true);
      expect(p.priceCents).toBeGreaterThan(0);
      expect(p.image).toMatch(/^\/images\/.+\.svg$/);
    }
  });

  it('vormindab hinna eesti keeles eurodes', () => {
    // Intl kasutab tühikuna NBSP-d, seega normaliseeri.
    expect(formatPrice(18900).replace(/\s/g, ' ')).toBe('189,00 €');
    expect(formatPrice(5).replace(/\s/g, ' ')).toBe('0,05 €');
  });
});
