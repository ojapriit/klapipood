import { useRef, type RefObject } from 'react';
import { formatPrice } from '../products';
import { MAX_QUANTITY, type CartItem } from '../useCart';

interface CartProps {
  headingRef: RefObject<HTMLHeadingElement>;
  items: CartItem[];
  totalCents: number;
  onSetQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function Cart({ headingRef, items, totalCents, onSetQuantity, onRemove }: CartProps) {
  const listRef = useRef<HTMLUListElement>(null);

  // Rea eemaldamisel kaoks fookus koos nupuga – vii see järgmisele mõistlikule kohale.
  const handleRemove = (productId: string, index: number) => {
    onRemove(productId);
    requestAnimationFrame(() => {
      const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('.remove-button');
      const next = buttons?.[Math.min(index, buttons.length - 1)];
      (next ?? headingRef.current)?.focus();
    });
  };

  return (
    <section aria-labelledby="ostukorv-pealkiri">
      <h1 id="ostukorv-pealkiri" ref={headingRef} tabIndex={-1}>
        Ostukorv
      </h1>

      {items.length === 0 ? (
        <div className="empty-cart">
          <p className="empty-title">Sinu ostukorv on tühi.</p>
          <p>Lisa avalehelt mõni toode ja see ilmub siia.</p>
          <a className="btn btn-primary" href="#/">
            Vaata tooteid
          </a>
        </div>
      ) : (
        <>
          <ul className="cart-list" ref={listRef}>
            {items.map(({ product, quantity }, index) => (
              <li key={product.id} className="cart-line">
                <img src={product.image} alt="" width={96} height={72} />
                <div className="cart-line-info">
                  <h2>{product.name}</h2>
                  <p className="unit-price">{formatPrice(product.priceCents)} / tk</p>
                </div>
                <div className="quantity" role="group" aria-label={`${product.name} kogus`}>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => onSetQuantity(product.id, quantity - 1)}
                    disabled={quantity <= 1}
                    aria-label={`Vähenda toote ${product.name} kogust`}
                  >
                    −
                  </button>
                  <label className="visually-hidden" htmlFor={`kogus-${product.id}`}>
                    {product.name} kogus
                  </label>
                  <input
                    id={`kogus-${product.id}`}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={MAX_QUANTITY}
                    value={quantity}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value, 10);
                      if (Number.isFinite(value) && value >= 1) onSetQuantity(product.id, value);
                    }}
                  />
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => onSetQuantity(product.id, quantity + 1)}
                    disabled={quantity >= MAX_QUANTITY}
                    aria-label={`Suurenda toote ${product.name} kogust`}
                  >
                    +
                  </button>
                </div>
                <p className="line-total">
                  <span className="visually-hidden">Rea summa: </span>
                  {formatPrice(product.priceCents * quantity)}
                </p>
                <button
                  type="button"
                  className="btn btn-link remove-button"
                  onClick={() => handleRemove(product.id, index)}
                >
                  Eemalda<span className="visually-hidden"> toode {product.name}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="cart-summary">
            <p className="total" aria-live="polite">
              <span>Kokku</span>
              <strong>{formatPrice(totalCents)}</strong>
            </p>
            <p className="summary-note">Demopood — tellimusi ei vormistata ja makset ei toimu.</p>
            <div className="summary-actions">
              <a className="btn btn-secondary" href="#/">
                Jätka ostlemist
              </a>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
