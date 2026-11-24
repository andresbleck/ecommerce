import { useState, useEffect, useRef } from 'react';
import { useProducts, CATEGORIES, formatPrice } from '../data';
import { Link, Section, Eyebrow, ProductCard, useCart } from '../components/Components';

export function HomePage({ heroVariant = 'editorial' }) {
  const { products } = useProducts();
  const recent = products.slice(0, 4);
  return (
    <>
      {heroVariant === 'editorial' && <HeroEditorial/>}
      {heroVariant === 'split' && <HeroSplit/>}
      {heroVariant === 'fullbleed' && <HeroFullbleed/>}

      <section className="lg-sec" style={{position:'relative', overflow:'hidden', color:'var(--cream)'}}>
        <img src="/images/destacados.jpg" alt="" aria-hidden="true" style={{
          position:'absolute', inset:0, width:'100%', height:'100%',
          objectFit:'cover', filter:'blur(6px)', transform:'scale(1.05)', zIndex:0
        }}/>
        <div style={{position:'absolute', inset:0, background:'rgba(22,30,21,0.72)', zIndex:1}}/>
        <div className="lg-sec__inner" style={{position:'relative', zIndex:2}}>
          <div className="lg-fh">
            <div>
              <Eyebrow>Últimos en llegar</Eyebrow>
              <h2 className="lg-h2 lg-h2--light" style={{color:'var(--cream)'}}>Recién ingresados</h2>
            </div>
            <Link to="/productos" className="lg-link-arrow lg-link-arrow--light">
              Ver todo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </Link>
          </div>
          <RecentCarousel products={recent}/>
        </div>
      </section>

      <Section tone="dark">
        <div className="lg-cats">
          {CATEGORIES.filter(c => c.home).map((c, i) => (
            <Link key={c.id} to={`/productos?cat=${c.id}`} className="lg-cat">
              <div className="lg-cat__num">0{i + 1}</div>
              <div className="lg-cat__title">{c.label}</div>
              <div className="lg-cat__desc">{c.desc}</div>
              <div className="lg-cat__arrow">→</div>
            </Link>
          ))}
        </div>
      </Section>

      <Section tone="cream">
        <div className="lg-story">
          <div className="lg-story__copy">
            <Eyebrow>Nuestro lema</Eyebrow>
            <h2 className="lg-h2">Mas que un mate, <br/><em>un momento para compartir</em></h2>
            <p className="lg-lead">Cada mate forma parte de momentos que valen la pena recordar: una ronda compartida, un viaje, una reunión familiar o un regalo especial. Nuestra propuesta es acercarte productos que combinan tradición, calidad y estilo para acompañarte en esos momentos.</p>
            <Link to="/nosotros" className="lg-btn lg-btn--dark">Conocénos</Link>
          </div>
          <div className="lg-story__img">
            <img src="/images/antes.jpg" alt="Foto de mate" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
            <div className="lg-story__cap">
              <span className="lg-caveat">"Del campo a tu mesa"</span>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

function HeroEditorial() {
  return (
    <section className="lg-hero lg-hero--editorial">
      <div className="lg-hero__bg"/>
      <div className="lg-hero__grain"/>
      {/* Solo mobile: imagen portada a sangre */}
      <div className="lg-hero__portada">
        <img src="/images/mat.jpg" alt="" aria-hidden="true" style={{width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top'}}/>
        <div className="lg-hero__portada-veil"/>
      </div>
      <div className="lg-hero__inner">
        <div className="lg-hero__copy">
          <div className="lg-hero__pre">
            <span className="lg-dot"/>
            <span>Emprendimiento de amigos</span>
          </div>
          <h1 className="lg-hero__title">
            Cebá <em>despacio.</em><br/>
            El apuro nunca <span className="lg-hero__under">fue mate.</span>
          </h1>
          <p className="lg-hero__lead">
            Una selección de mates, bombillas y termos para quienes disfrutan cada momento.
          </p>
          <div className="lg-hero__cta">
            <Link to="/productos" className="lg-btn lg-btn--gold">Ver productos</Link>
            <Link to="/nosotros" className="lg-btn lg-btn--ghost-light">Nuestra historia</Link>
          </div>
        </div>
        <div className="lg-hero__art">
          <div className="lg-hero__imgwrap">
            <img src="/images/mat.jpg" alt="Foto de mate" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
          </div>
          <svg className="lg-hero__orn" viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="100" cy="100" r="98" fill="none" stroke="currentColor" strokeWidth=".6"/>
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth=".4" strokeDasharray="2 4"/>
          </svg>
        </div>
      </div>
    </section>
  );
}

function HeroSplit() {
  return (
    <section className="lg-hero lg-hero--split">
      <div className="lg-hero-split">
        <div className="lg-hero-split__left">
          <div className="lg-hero__pre" style={{color:'var(--gold)'}}>
            <span className="lg-dot"/>
            <span>La Gauchada · Mates artesanales</span>
          </div>
          <h1 className="lg-hero__title lg-hero__title--big">
            La ronda<br/>empieza en<br/><em>las manos.</em>
          </h1>
          <p className="lg-hero__lead">Mates, bombillas y termos del oficio. Sin atajos, sin moldes industriales. Hechos para compartir momentos.</p>
          <div className="lg-hero__cta">
            <Link to="/productos" className="lg-btn lg-btn--gold">Comprar ahora</Link>
            <Link to="/productos?cat=mates" className="lg-btn lg-btn--ghost-light">Ver mates</Link>
          </div>
        </div>
        <div className="lg-hero-split__right">
          <image-slot id="hero-split-img" placeholder="Foto principal" shape="rounded" radius="2"></image-slot>
          <div className="lg-hero-split__stat">
            <div className="lg-hero-split__statn">+1.200</div>
            <div className="lg-hero-split__statl">mateadas felices</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroFullbleed() {
  return (
    <section className="lg-hero lg-hero--full">
      <div className="lg-hero-full__img">
        <image-slot id="hero-full-img" placeholder="Foto a sangrada" shape="rect"></image-slot>
        <div className="lg-hero-full__veil"/>
      </div>
      <div className="lg-hero-full__copy">
        <div className="lg-eyebrow lg-eyebrow--light">
          <span className="lg-eyebrow__line"/>Emprendimiento argentino<span className="lg-eyebrow__line"/>
        </div>
        <h1 className="lg-hero-full__title">
          La <em>gauchada</em><br/>de todos los días.
        </h1>
        <p className="lg-hero-full__lead">Mates, bombillas y termos hechos a mano. Para los que entienden que el ritual no se apura.</p>
        <div className="lg-hero__cta lg-hero__cta--center">
          <Link to="/productos" className="lg-btn lg-btn--gold">Ver productos</Link>
          <Link to="/nosotros" className="lg-btn lg-btn--ghost-light">Conocernos</Link>
        </div>
      </div>
      <div className="lg-hero-full__scroll">↓ &nbsp; Cebá despacio</div>
    </section>
  );
}

// En escritorio es una grilla de 4; en celular (≤700px) pasa a carrusel
// de a un producto que avanza solo cada 4 segundos y se puede deslizar.
const MOBILE_QUERY = '(max-width: 700px)';
const AUTOPLAY_MS = 4000;

function RecentCarousel({ products }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const goTo = (i) => {
    const track = trackRef.current;
    const slide = track?.children[i];
    if (!slide) return;
    track.scrollTo({ left: slide.offsetLeft - track.firstElementChild.offsetLeft, behavior: 'smooth' });
  };

  // Se reprograma cada vez que cambia el slide, así un deslizamiento manual reinicia los 4s
  useEffect(() => {
    if (!isMobile || paused || products.length < 2) return;
    const t = setTimeout(() => goTo((active + 1) % products.length), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [active, paused, isMobile, products.length]);

  const onScroll = () => {
    const track = trackRef.current;
    if (!track || track.children.length < 2) return;
    const step = track.children[1].offsetLeft - track.children[0].offsetLeft;
    const i = Math.round(track.scrollLeft / step);
    if (i !== active) setActive(i);
  };

  return (
    <>
      <div
        ref={trackRef}
        className="lg-grid lg-grid--4 lg-carousel"
        onScroll={isMobile ? onScroll : undefined}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {products.map(p => <GlassCard key={p.id} p={p}/>)}
      </div>
      {products.length > 1 && (
        <div className="lg-carousel__dots">
          {products.map((p, i) => (
            <button
              key={p.id}
              className={'lg-carousel__dot' + (i === active ? ' is-active' : '')}
              onClick={() => goTo(i)}
              aria-label={`Ver producto ${i + 1}`}
            />
          ))}
        </div>
      )}
    </>
  );
}

function GlassCard({ p }) {
  const cart = useCart();
  return (
    <Link to={`/producto/${p.id}`} className="lg-glass-card">
      <div className="lg-glass-card__media">
        {p.image_url
          ? <img src={p.image_url} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          : <div className="lg-pimg" style={{'--accent': p.accent}}>
              <div className="lg-pimg__bg"/>
              <div className="lg-pimg__mono">{p.monogram}</div>
            </div>
        }
        {p.badge && <span className="lg-card__badge">{p.badge}</span>}
      </div>
      <div className="lg-glass-card__body">
        <div className="lg-glass-card__cat">{p.category}</div>
        <div className="lg-glass-card__name">{p.name}</div>
        <div className="lg-glass-card__foot">
          <span className="lg-glass-card__price">{formatPrice(p.price)}</span>
          <button className="lg-glass-card__add" onClick={(e) => { e.preventDefault(); cart.add(p); }}>
            Agregar
          </button>
        </div>
      </div>
    </Link>
  );
}
