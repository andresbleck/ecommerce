import { useState, useEffect, useMemo } from 'react';
import { useRoute, Link, Section, Eyebrow, ProductCard, ProductImage, useCart } from './components/Components';
import { useProducts, CATEGORIES, formatPrice } from './data';

export function ProductsPage() {
  const route = useRoute();
  const qs = route.includes('?') ? route.split('?')[1] : '';
  const params = new URLSearchParams(qs);
  const initialCat = params.get('cat') || 'all';

  const [cat, setCat] = useState(initialCat);
  const [sort, setSort] = useState('featured');
  const [search, setSearch] = useState('');
  const { products, loading } = useProducts();

  useEffect(() => { setCat(initialCat); }, [initialCat]);

  const filtered = useMemo(() => {
    let list = products;
    if (cat !== 'all') list = list.filter(p => p.category === cat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.short.toLowerCase().includes(q));
    }
    if (sort === 'price-asc') list = [...list].sort((a,b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a,b) => b.price - a.price);
    if (sort === 'name') list = [...list].sort((a,b) => a.name.localeCompare(b.name));
    return list;
  }, [products, cat, sort, search]);

  return (
    <>
      <Section tone="dark" className="lg-products-hero">
        <div className="lg-eyebrow lg-eyebrow--light">
          <span className="lg-eyebrow__line"/>Catálogo<span className="lg-eyebrow__line"/>
        </div>
        <h1 className="lg-h1">Todos los productos</h1>
        <p className="lg-lead lg-lead--center">Cada pieza pasa por manos de artesano antes de llegar a la tuya.</p>
      </Section>

      <Section tone="cream">
        <div className="lg-toolbar">
          <div className="lg-chips">
            <button className={'lg-chip' + (cat === 'all' ? ' is-active' : '')} onClick={() => setCat('all')}>Todos <span>{products.length}</span></button>
            {CATEGORIES.map(c => (
              <button key={c.id} className={'lg-chip' + (cat === c.id ? ' is-active' : '')} onClick={() => setCat(c.id)}>
                {c.label} <span>{products.filter(p => p.category === c.id).length}</span>
              </button>
            ))}
          </div>
          <div className="lg-toolbar__right">
            <div className="lg-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
              <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
            <select className="lg-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="featured">Destacados</option>
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
              <option value="name">Nombre A–Z</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className="lg-empty"><p>Cargando productos...</p></div>
        ) : filtered.length === 0 ? (
          <div className="lg-empty">
            <h3>Sin resultados</h3>
            <p>No encontramos productos con ese criterio.</p>
            <button className="lg-btn lg-btn--dark" onClick={() => { setSearch(''); setCat('all'); }}>Limpiar filtros</button>
          </div>
        ) : (
          <div className="lg-grid lg-grid--4">
            {filtered.map(p => <ProductCard key={p.id} p={p}/>)}
          </div>
        )}
      </Section>
    </>
  );
}

export function ProductDetailPage({ id }) {
  const cart = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const { products, loading } = useProducts();
  const p = products.find(x => x.id === id);

  if (loading) return <Section tone="cream"><div className="lg-empty"><p>Cargando...</p></div></Section>;

  if (!p) return (
    <Section tone="cream">
      <div className="lg-empty">
        <h3>Producto no encontrado</h3>
        <Link to="/productos" className="lg-btn lg-btn--dark">Volver al catálogo</Link>
      </div>
    </Section>
  );

  const related = products.filter(x => x.category === p.category && x.id !== p.id).slice(0, 3);
  const images = [p.image_url, p.image_url_2, p.image_url_3].filter(Boolean);

  return (
    <>
      <Section tone="cream" className="lg-pd-sec">
        <div className="lg-crumbs">
          <Link to="/">Inicio</Link><span>/</span>
          <Link to="/productos">Productos</Link><span>/</span>
          <Link to={`/productos?cat=${p.category}`}>{p.category}</Link><span>/</span>
          <span className="is-current">{p.name}</span>
        </div>
        <div className="lg-pd">
          <div className="lg-pd__gallery">
            <div className="lg-pd__main">
              <ProductImage product={{ ...p, image_url: images[activeImg] || p.image_url }}/>
              {p.badge && <span className="lg-card__badge">{p.badge}</span>}
            </div>
            {images.length > 1 && (
              <div className="lg-pd__thumbs">
                {images.map((url, i) => (
                  <div key={i} className={'lg-pd__thumb' + (i === activeImg ? ' is-active' : '')} onClick={() => setActiveImg(i)}>
                    <img src={url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="lg-pd__info">
            <div className="lg-pd__cat">{p.category}</div>
            <h1 className="lg-pd__name">{p.name}</h1>
            <div className="lg-pd__price">{formatPrice(p.price)}</div>
            <p className="lg-pd__desc">{p.long}</p>
            <div className="lg-pd__feats">
              <div className="lg-pd__feat">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7h13l3 4v6h-3M16 17H8m-5 0h2"/><circle cx="6" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
                <span>Envíos a todo el país</span>
              </div>
              <div className="lg-pd__feat">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 12a8 8 0 1 1-3-6.2M20 4v5h-5"/></svg>
                <span>Cambios por defecto de fábrica</span>
              </div>
            </div>
            <div className="lg-pd__buy">
              <div className="lg-qty lg-qty--big">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}>+</button>
              </div>
              <button className="lg-btn lg-btn--gold lg-btn--big" onClick={() => { cart.add(p, qty); setAdded(true); setTimeout(() => setAdded(false), 2000); }}>
                {added ? '✓ Sumado' : 'Sumar al carrito'}
              </button>
            </div>
            <div className="lg-pd__stock">
              <span className="lg-dot lg-dot--ok"/> {p.stock} disponibles
            </div>
            {p.category === 'mates' && (
              <Link to="/curar-mate" className="lg-pd__guide">
                <div className="lg-pd__guide-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>
                </div>
                <div>
                  <div className="lg-pd__guide-l">Guía: Cómo curar tu mate</div>
                  <div className="lg-pd__guide-s">Antes del primer mate, leé el proceso. 3 días, paso a paso.</div>
                </div>
                <span className="lg-pd__guide-arr">→</span>
              </Link>
            )}
          </div>
        </div>
      </Section>
      {related.length > 0 && (
        <Section tone="dark">
          <div className="lg-fh">
            <div>
              <Eyebrow>Te puede gustar</Eyebrow>
              <h2 className="lg-h2 lg-h2--light">Para completar la ronda</h2>
            </div>
            <Link to={`/productos?cat=${p.category}`} className="lg-link-arrow lg-link-arrow--light">
              Ver más {p.category} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </Link>
          </div>
          <div className="lg-grid lg-grid--3">
            {related.map(r => <ProductCard key={r.id} p={r}/>)}
          </div>
        </Section>
      )}
    </>
  );
}
