import { useRef, type RefObject } from 'react';
import { formatPrice } from '../products';
import { MAX_QUANTITY, type CartItem } from '../useCart';

interface CartProps {
  headingRef: RefObject<HTMLHeadingElement>;
  items: CartItem[];
  totalCents: number;
  onSetQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
}

export function Cart({ headingRef, items, totalCents, onSetQuantity, onRemove, onClear }: CartProps) {
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

  // Tühjendamisel kaob nupp koos ridadega – vii fookus pealkirjale.
  const handleClear = () => {
    onClear();
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  return (
    <section aria-labelledby="ostukorv-pealkiri">
      <div className="cart-heading">
        <h1 id="ostukorv-pealkiri" ref={headingRef} tabIndex={-1}>
          Ostukorv
        </h1>
        {items.length > 0 && (
          <button type="button" className="btn btn-secondary clear-cart-button" onClick={handleClear}>
            Tühjenda<span className="visually-hidden"> ostukorv</span>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

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
