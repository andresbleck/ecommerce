// Shared components: Header, Footer, ProductCard, Button, etc.
const { useState, useEffect, useContext, useRef } = React;

// ──────────────────────────────────────────────────────────────
// Cart context
// ──────────────────────────────────────────────────────────────
const CartCtx = React.createContext(null);

function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lg_cart') || '[]');
    } catch { return []; }
  });
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    localStorage.setItem('lg_cart', JSON.stringify(items));
  }, [items]);

  const add = (product, qty = 1) => {
    setItems(prev => {
      const i = prev.findIndex(x => x.id === product.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, monogram: product.monogram, accent: product.accent, qty }];
    });
    setDrawer(true);
  };
  const remove = (id) => setItems(prev => prev.filter(x => x.id !== id));
  const setQty = (id, qty) => setItems(prev =>
    prev.map(x => x.id === id ? { ...x, qty: Math.max(1, qty) } : x)
  );
  const clear = () => setItems([]);
  const count = items.reduce((s, x) => s + x.qty, 0);
  const total = items.reduce((s, x) => s + x.qty * x.price, 0);

  return (
    <CartCtx.Provider value={{ items, add, remove, setQty, clear, count, total, drawer, setDrawer }}>
      {children}
    </CartCtx.Provider>
  );
}
const useCart = () => useContext(CartCtx);

// ──────────────────────────────────────────────────────────────
// Router (hash-based, super simple)
// ──────────────────────────────────────────────────────────────
const RouterCtx = React.createContext(null);
function useRoute() { return useContext(RouterCtx); }
function navigate(path) {
  window.location.hash = path;
}
function RouterProvider({ children }) {
  const [hash, setHash] = useState(window.location.hash.slice(1) || '/');
  useEffect(() => {
    const onHash = () => {
      setHash(window.location.hash.slice(1) || '/');
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return <RouterCtx.Provider value={hash}>{children}</RouterCtx.Provider>;
}
function Link({ to, className, children, onClick, ...rest }) {
  return (
    <a
      href={'#' + to}
      className={className}
      onClick={(e) => {
        if (onClick) onClick(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

// ──────────────────────────────────────────────────────────────
// Header
// ──────────────────────────────────────────────────────────────
function Header() {
  const cart = useCart();
  const route = useRoute();
  const [open, setOpen] = useState(false);
  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/productos', label: 'Productos' },
    { to: '/curar-mate', label: 'Curá tu mate' },
    { to: '/nosotros', label: 'Nosotros' },
    { to: '/contacto', label: 'Contacto' },
  ];
  return (
    <header className="lg-header">
      <div className="lg-header__inner">
        <Link to="/" className="lg-brand">
          <span className="lg-brand__mark">
            <img src="./images/logo.png" alt="La Gauchada" style={{width:36, height:36, objectFit:'contain'}}/>
          </span>
          <span className="lg-brand__words">
            <span className="lg-brand__small">La</span>
            <span className="lg-brand__big">Gauchada</span>
          </span>
        </Link>

        <nav className="lg-nav">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={'lg-nav__link' + (route === l.to ? ' is-active' : '')}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="lg-header__actions">
          <Link to="/admin" className="lg-header__admin" title="Admin">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1l3 6 6 .9-4.5 4.4 1 6.2-5.5-3-5.5 3 1-6.2L3 7.9 9 7z"/></svg>
          </Link>
          <button className="lg-cartbtn" onClick={() => cart.setDrawer(true)} aria-label="Carrito">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4h2l2.4 12.3a2 2 0 0 0 2 1.7h8.2a2 2 0 0 0 2-1.5L21 8H6"/>
              <circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/>
            </svg>
            {cart.count > 0 && <span className="lg-cartbtn__badge">{cart.count}</span>}
          </button>
          <button className="lg-burger" onClick={() => setOpen(o => !o)} aria-label="Menú">
            <span/><span/><span/>
          </button>
        </div>
      </div>
      {open && (
        <div className="lg-mobile-menu">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="lg-mobile-menu__link">{l.label}</Link>
          ))}
          <Link to="/admin" onClick={() => setOpen(false)} className="lg-mobile-menu__link">Admin</Link>
        </div>
      )}
    </header>
  );
}

// ──────────────────────────────────────────────────────────────
// Footer
// ──────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="lg-footer">
      <div className="lg-footer__top">
        <div className="lg-footer__col lg-footer__col--brand">
          <div className="lg-footer__logo">
            <span className="lg-brand__small" style={{color:'var(--gold)'}}>La</span>
            <span className="lg-brand__big" style={{color:'var(--cream)'}}>Gauchada</span>
          </div>
          <p className="lg-footer__tag">Mates, bombillas y termos hechos con tiempo y manos del oficio.</p>
        </div>

        <div className="lg-footer__col">
          <h4 className="lg-footer__h">Tienda</h4>
          <Link to="/productos" className="lg-footer__l">Todos los productos</Link>
          <Link to="/productos?cat=mates" className="lg-footer__l">Mates</Link>
          <Link to="/productos?cat=bombillas" className="lg-footer__l">Bombillas</Link>
          <Link to="/productos?cat=termos" className="lg-footer__l">Termos</Link>
        </div>

        <div className="lg-footer__col">
          <h4 className="lg-footer__h">La casa</h4>
          <Link to="/nosotros" className="lg-footer__l">Nosotros</Link>
          <Link to="/curar-mate" className="lg-footer__l">Curá tu mate</Link>
          <Link to="/contacto" className="lg-footer__l">Contacto</Link>
          <a className="lg-footer__l" href="#/contacto">Envíos</a>
        </div>

        <div className="lg-footer__col lg-footer__col--news">
          <h4 className="lg-footer__h">Suscribite</h4>
          <p className="lg-footer__tag">Una carta breve cada mes. Producto nuevo, historias del taller, sin spam.</p>
          <form className="lg-news" onSubmit={(e) => { e.preventDefault(); e.target.reset(); alert('¡Gracias! Te sumamos a la lista.'); }}>
            <input type="email" required placeholder="tu@correo.com" className="lg-news__input"/>
            <button className="lg-news__btn" type="submit">Sumarme</button>
          </form>
        </div>
      </div>

      <div className="lg-footer__bot">
        <span>© 2026 La Gauchada · Hecho con yerba y paciencia</span>
        <div className="lg-footer__socials">
          <a href="#" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a>
          <a href="#" aria-label="WhatsApp"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.3L3 21z"/><path d="M8.5 9.5c.3 1.5 1.8 4.2 5 5l1.2-1.5 2.3 1c0 .8-.5 2-2 2.2-1.8.3-5-1-6.7-4.7-.4-1 .5-2 1.2-2z" fill="currentColor"/></svg></a>
        </div>
      </div>
    </footer>
  );
}

// ──────────────────────────────────────────────────────────────
// Product Card (used in home featured + product grid)
// ──────────────────────────────────────────────────────────────
function ProductCard({ p, variant = 'default' }) {
  const cart = useCart();
  return (
    <article className={'lg-card lg-card--' + variant}>
      <Link to={`/producto/${p.id}`} className="lg-card__media">
        <ProductImage product={p} />
        {p.badge && <span className="lg-card__badge">{p.badge}</span>}
      </Link>
      <div className="lg-card__body">
        <div className="lg-card__cat">{p.category}</div>
        <h3 className="lg-card__name">
          <Link to={`/producto/${p.id}`}>{p.name}</Link>
        </h3>
        <p className="lg-card__short">{p.short}</p>
        <div className="lg-card__foot">
          <span className="lg-card__price">{formatPrice(p.price)}</span>
          <button className="lg-card__add" onClick={() => cart.add(p)}>
            Agregar
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductImage({ product, size = 'card' }) {
  const p = product;
  return (
    <div className="lg-pimg" style={{
      '--accent': p.accent,
    }}>
      <div className="lg-pimg__bg"/>
      <div className="lg-pimg__grain"/>
      {p.image_url
        ? <img src={p.image_url} alt={p.name} className="lg-pimg__real"/>
        : <>
            <svg className="lg-pimg__art" viewBox="0 0 200 200" aria-hidden="true">
              {p.category === 'mates' && (
                <g>
                  <ellipse cx="100" cy="115" rx="56" ry="64" fill="var(--accent)" opacity=".95"/>
                  <ellipse cx="100" cy="115" rx="56" ry="64" fill="none" stroke="rgba(0,0,0,.25)" strokeWidth="1.5"/>
                  <ellipse cx="100" cy="60" rx="38" ry="9" fill="rgba(0,0,0,.35)"/>
                  <ellipse cx="100" cy="60" rx="38" ry="9" fill="none" stroke="var(--gold)" strokeWidth="1.5"/>
                  <line x1="100" y1="20" x2="100" y2="55" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="100" cy="18" r="3" fill="var(--gold)"/>
                  <path d="M70 110 Q100 100 130 110" stroke="rgba(0,0,0,.2)" strokeWidth="1" fill="none"/>
                  <path d="M70 130 Q100 120 130 130" stroke="rgba(0,0,0,.2)" strokeWidth="1" fill="none"/>
                </g>
              )}
              {p.category === 'bombillas' && (
                <g>
                  <rect x="92" y="30" width="16" height="22" rx="3" fill="var(--accent)" stroke="rgba(0,0,0,.25)"/>
                  <rect x="95" y="50" width="10" height="100" fill="var(--accent)" stroke="rgba(0,0,0,.25)"/>
                  <ellipse cx="100" cy="160" rx="14" ry="10" fill="var(--accent)" stroke="rgba(0,0,0,.25)"/>
                  <line x1="92" y1="70" x2="108" y2="70" stroke="rgba(0,0,0,.3)"/>
                  <line x1="92" y1="90" x2="108" y2="90" stroke="rgba(0,0,0,.3)"/>
                  <line x1="92" y1="110" x2="108" y2="110" stroke="rgba(0,0,0,.3)"/>
                  <circle cx="100" cy="160" r="4" fill="rgba(0,0,0,.3)"/>
                </g>
              )}
              {p.category === 'termos' && (
                <g>
                  <rect x="65" y="30" width="70" height="140" rx="8" fill="var(--accent)" stroke="rgba(0,0,0,.25)"/>
                  <rect x="75" y="20" width="50" height="18" rx="3" fill="var(--gold)" stroke="rgba(0,0,0,.25)"/>
                  <rect x="135" y="60" width="14" height="50" rx="6" fill="var(--accent)" stroke="rgba(0,0,0,.25)"/>
                  <text x="100" y="105" textAnchor="middle" fontFamily="DM Serif Display" fontSize="22" fill="var(--cream)" opacity=".5">LG</text>
                </g>
              )}
            </svg>
            <div className="lg-pimg__mono">{p.monogram}</div>
          </>
      }
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Cart Drawer
// ──────────────────────────────────────────────────────────────
function CartDrawer() {
  const cart = useCart();
  if (!cart.drawer) return null;
  return (
    <div className="lg-drawer-wrap" onClick={() => cart.setDrawer(false)}>
      <aside className="lg-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="lg-drawer__head">
          <h3>Tu mateada</h3>
          <button onClick={() => cart.setDrawer(false)} className="lg-iconbtn" aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>

        {cart.items.length === 0 ? (
          <div className="lg-drawer__empty">
            <p>El carrito está vacío.</p>
            <Link to="/productos" onClick={() => cart.setDrawer(false)} className="lg-btn lg-btn--gold">Ver productos</Link>
          </div>
        ) : (
          <>
            <ul className="lg-drawer__list">
              {cart.items.map(it => (
                <li key={it.id} className="lg-drawer__item">
                  <div className="lg-drawer__thumb" style={{ background: it.accent, overflow: 'hidden', padding: 0 }}>
                    {it.image_url
                      ? <img src={it.image_url} alt={it.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      : <span>{it.monogram}</span>}
                  </div>
                  <div className="lg-drawer__meta">
                    <div className="lg-drawer__name">{it.name}</div>
                    <div className="lg-drawer__price">{formatPrice(it.price)}</div>
                    <div className="lg-qty">
                      <button onClick={() => cart.setQty(it.id, it.qty - 1)}>−</button>
                      <span>{it.qty}</span>
                      <button onClick={() => cart.setQty(it.id, it.qty + 1)}>+</button>
                    </div>
                  </div>
                  <button className="lg-drawer__rm" onClick={() => cart.remove(it.id)} aria-label="Quitar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
                  </button>
                </li>
              ))}
            </ul>
            <div className="lg-drawer__foot">
              <div className="lg-drawer__total">
                <span>Subtotal</span>
                <span className="lg-drawer__totalv">{formatPrice(cart.total)}</span>
              </div>
              <Link to="/checkout" onClick={() => cart.setDrawer(false)} className="lg-btn lg-btn--wa lg-btn--block">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4A11 11 0 0 0 3 18l-1 4 4-1A11 11 0 1 0 20 4zM8.5 9c.3 1.5 1.8 4.2 5 5l1.2-1.5 2.3 1c0 .8-.5 2-2 2.2-1.8.3-5-1-6.7-4.7-.4-1 .5-2 1.2-2z"/></svg>
                Pedir por WhatsApp
              </Link>
              <Link to="/carrito" onClick={() => cart.setDrawer(false)} className="lg-btn lg-btn--ghost-dark lg-btn--block">Ver carrito</Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Section wrapper
// ──────────────────────────────────────────────────────────────
function Section({ children, className = '', tone = 'cream', wide = false }) {
  return (
    <section className={`lg-sec lg-sec--${tone} ${className}`}>
      <div className={'lg-sec__inner ' + (wide ? 'is-wide' : '')}>{children}</div>
    </section>
  );
}

function Eyebrow({ children }) {
  return <div className="lg-eyebrow"><span className="lg-eyebrow__line"/>{children}<span className="lg-eyebrow__line"/></div>;
}

// Expose
Object.assign(window, {
  CartProvider, useCart, RouterProvider, useRoute, navigate, Link,
  Header, Footer, ProductCard, ProductImage, CartDrawer, Section, Eyebrow,
});
