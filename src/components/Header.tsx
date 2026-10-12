interface HeaderProps {
  cartCount: number;
  cartHref: string;
  isCartView: boolean;
}

export function Header({ cartCount, cartHref, isCartView }: HeaderProps) {
  const countLabel = cartCount === 1 ? '1 toode' : `${cartCount} toodet`;

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="logo" href="#/" aria-label="Klapipood, avalehele">
          <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="currentColor" />
            <path d="M8 19v-3a8 8 0 0 1 16 0v3" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="6" y="17" width="5" height="8" rx="2" fill="#f2c14e" />
            <rect x="21" y="17" width="5" height="8" rx="2" fill="#f2c14e" />
          </svg>
          <span>Klapipood</span>
        </a>
        <a
          className="cart-button"
          href={cartHref}
          aria-current={isCartView ? 'page' : undefined}
          aria-label={`Ostukorv, ${countLabel}`}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="9.5" cy="20" r="1.5" fill="currentColor" />
            <circle cx="17.5" cy="20" r="1.5" fill="currentColor" />
          </svg>
          <span className="cart-button-text">Ostukorv</span>
          <span className="cart-count" aria-hidden="true">
            {cartCount}
          </span>
        </a>
      </div>
    </header>
  );
}
