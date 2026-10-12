import type { RefObject } from 'react';
import { formatPrice, products } from '../products';
import type { CartItem } from '../useCart';

interface ProductListProps {
  headingRef: RefObject<HTMLHeadingElement>;
  onAdd: (productId: string) => void;
  onDecrease: (productId: string) => void;
  onRemove: (productId: string) => void;
  cartQuantities: CartItem[];
}

export function ProductList({ headingRef, onAdd, onDecrease, onRemove, cartQuantities }: ProductListProps) {
  const quantityOf = (id: string) => cartQuantities.find((i) => i.product.id === id)?.quantity ?? 0;

  // Kui toode kaob ostukorvist, kaovad ka vähendamise ja eemaldamise nupud –
  // vii fookus sama kaardi lisamisnupule.
  const focusAddButton = (productId: string) =>
    requestAnimationFrame(() => document.getElementById(`lisa-${productId}`)?.focus());

  const handleDecrease = (productId: string, inCart: number) => {
    onDecrease(productId);
    if (inCart === 1) focusAddButton(productId);
  };

  const handleRemove = (productId: string) => {
    onRemove(productId);
    focusAddButton(productId);
  };

  return (
    <section aria-labelledby="pood-pealkiri">
      <div className="intro">
        <h1 id="pood-pealkiri" ref={headingRef} tabIndex={-1}>
          Kõrvaklapid igaks päevaks
        </h1>
        <p>Vali endale sobivad klapid — rongisõiduks, trenniks, stuudiosse või lastele.</p>
      </div>
      <ul className="product-grid">
        {products.map((product) => {
          const inCart = quantityOf(product.id);
          return (
            <li key={product.id} className="product-card">
              <img src={product.image} alt={product.imageAlt} width={240} height={180} loading="lazy" />
              <div className="product-body">
                <h2>{product.name}</h2>
                <p className="product-description">{product.description}</p>
                <div className="product-footer">
                  <span className="price">{formatPrice(product.priceCents)}</span>
                  <button
                    id={`lisa-${product.id}`}
                    type="button"
                    className="btn btn-primary"
                    onClick={() => onAdd(product.id)}
                    aria-label={`Lisa ostukorvi: ${product.name}`}
                  >
                    Lisa ostukorvi
                  </button>
                </div>
                {inCart > 0 && (
                  <div className="in-cart-row">
                    <p className="in-cart-note">Ostukorvis: {inCart} tk</p>
                    <div className="in-cart-actions">
                      <button
                        type="button"
                        className="qty-btn in-cart-decrease"
                        onClick={() => handleDecrease(product.id, inCart)}
                        aria-label={`Vähenda kogust: ${product.name}`}
                      >
                        −
                      </button>
                      <button
                        type="button"
                        className="btn btn-link"
                        onClick={() => handleRemove(product.id)}
                        aria-label={`Eemalda ostukorvist: ${product.name}`}
                      >
                        Eemalda
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
