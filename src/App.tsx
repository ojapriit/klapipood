import { useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { ProductList } from './components/ProductList';
import { Cart } from './components/Cart';
import { useCart } from './useCart';
import { productById } from './products';

type View = 'pood' | 'ostukorv';

const CART_HASH = '#/ostukorv';

function viewFromHash(): View {
  return window.location.hash === CART_HASH ? 'ostukorv' : 'pood';
}

export default function App() {
  const cart = useCart();
  const [view, setView] = useState<View>(viewFromHash);
  const [announcement, setAnnouncement] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isFirstRender = useRef(true);

  // Hash-põhine navigeerimine töötab staatilisel hostil ilma serveripoolsete ümbersuunamisteta
  // ning brauseri tagasi-nupp viib ostukorvist poodi.
  useEffect(() => {
    const onHashChange = () => setView(viewFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Vaate vahetusel vii fookus uue vaate pealkirjale, et klaviatuuri- ja ekraanilugeja kasutaja ei eksiks.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    headingRef.current?.focus();
    window.scrollTo(0, 0);
  }, [view]);

  const handleAdd = (productId: string) => {
    cart.addItem(productId);
    const name = productById.get(productId)?.name ?? 'Toode';
    // Koguarv muudab teadet iga lisamisega, nii loeb ekraanilugeja ka korduva lisamise ette.
    const count = cart.totalCount + 1;
    setAnnouncement(`${name} lisati ostukorvi. Ostukorvis kokku ${count} ${count === 1 ? 'toode' : 'toodet'}.`);
  };

  return (
    <>
      <a
        className="skip-link"
        href="#sisu"
        onClick={(e) => {
          // Ära muuda hash'i, sest see määrab aktiivse vaate.
          e.preventDefault();
          document.getElementById('sisu')?.focus();
        }}
      >
        Liigu sisu juurde
      </a>
      <div className="demo-banner" role="note">
        Demopood — tellimusi ei vormistata
      </div>
      <Header cartCount={cart.totalCount} cartHref={CART_HASH} isCartView={view === 'ostukorv'} />
      <main id="sisu" className="container" tabIndex={-1}>
        {view === 'pood' ? (
          <ProductList headingRef={headingRef} onAdd={handleAdd} cartQuantities={cart.items} />
        ) : (
          <Cart
            headingRef={headingRef}
            items={cart.items}
            totalCents={cart.totalCents}
            onSetQuantity={cart.setQuantity}
            onRemove={cart.removeItem}
          />
        )}
      </main>
      <footer className="site-footer">
        <div className="container">
          Klapipood on väljamõeldud demopood. Tooted, hinnad ja kaubamärgid ei ole päris.
        </div>
      </footer>
      <div className="visually-hidden" aria-live="polite" role="status">
        {announcement}
      </div>
    </>
  );
}
