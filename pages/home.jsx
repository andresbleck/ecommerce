// Home page with 3 Hero variations (controlled by Tweaks)
function HomePage({ heroVariant = 'editorial' }) {
  const { products } = useProducts();
  const featured = products.filter(p => ['mate-imperial', 'mate-ranchero', 'bombilla-pico-loro', 'termo-media-manija'].includes(p.id));
  return (
    <>
      {heroVariant === 'editorial' && <HeroEditorial/>}
      {heroVariant === 'split' && <HeroSplit/>}
      {heroVariant === 'fullbleed' && <HeroFullbleed/>}

      {/* Featured products */}
      <section className="lg-sec" style={{position:'relative', overflow:'hidden', color:'var(--cream)'}}>
        <img src="./images/destacados.jpg" alt="" aria-hidden="true" style={{
          position:'absolute', inset:0, width:'100%', height:'100%',
          objectFit:'cover', filter:'blur(6px)', transform:'scale(1.05)',
          zIndex:0
        }}/>
        <div style={{position:'absolute', inset:0, background:'rgba(22,30,21,0.72)', zIndex:1}}/>
        <div className="lg-sec__inner" style={{position:'relative', zIndex:2}}>
          <div className="lg-fh">
            <div>
              <Eyebrow light>Lo más buscado</Eyebrow>
              <h2 className="lg-h2 lg-h2--light" style={{color:'var(--cream)'}}>Productos destacados</h2>
            </div>
            <Link to="/productos" className="lg-link-arrow lg-link-arrow--light">
              Ver todo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </Link>
          </div>
          <div className="lg-grid lg-grid--4">
            {featured.map(p => <ProductCard key={p.id} p={p}/>)}
          </div>
        </div>
      </section>

      {/* Categories */}
      <Section tone="dark">
        <div className="lg-cats">
          {CATEGORIES.map((c, i) => (
            <Link key={c.id} to={`/productos?cat=${c.id}`} className="lg-cat">
              <div className="lg-cat__num">0{i + 1}</div>
              <div className="lg-cat__title">{c.label}</div>
              <div className="lg-cat__desc">{c.desc}</div>
              <div className="lg-cat__arrow">→</div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Story strip */}
      <Section tone="cream">
        <div className="lg-story">
          <div className="lg-story__copy">
            <Eyebrow>El oficio</Eyebrow>
            <h2 className="lg-h2">Hecho como se hacía antes,<br/><em>pensado para hoy.</em></h2>
            <p className="lg-lead">Trabajamos con artesanos del norte argentino. Cuero curtido al tanino, calabazas seleccionadas a mano, alpaca cincelada pieza por pieza. Nada de moldes, nada de apuro.</p>
            <Link to="/nosotros" className="lg-btn lg-btn--dark">Conocé el taller</Link>
          </div>
          <div className="lg-story__img">
            <img src="images/antes.jpg" alt="Foto de mate" style={{width:"100%", height:"100%", objectFit:"cover"}} />

            <div className="lg-story__cap">
              <span className="lg-caveat">"Del campo a tu mesa"</span>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

// ───── Hero A: Editorial (dark, asymmetric, ornamental serif)
function HeroEditorial() {
  return (
    <section className="lg-hero lg-hero--editorial">
      <div className="lg-hero__bg"/>
      <div className="lg-hero__grain"/>
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
            Mates, bombillas y termos hechos a mano. Piezas pensadas para durar décadas, no temporadas.
          </p>
          <div className="lg-hero__cta">
            <Link to="/productos" className="lg-btn lg-btn--gold">Ver la colección</Link>
            <Link to="/nosotros" className="lg-btn lg-btn--ghost-light">Nuestra historia</Link>
          </div>
          <div className="lg-hero__pills">
            <span>Todos los medios de pago</span>
            <span className="lg-sep"/>
            <span>Envíos a todo el país</span>
            <span className="lg-sep"/>
            <span>Pago en cuotas</span>
          </div>
        </div>
        <div className="lg-hero__art">
          <div className="lg-hero__imgwrap">
            <img src="./images/variante.jpg" alt="Foto de mate" style={{width:"100%", height:"100%", objectFit:"cover"}} />

          </div>
          {/* 
          <div className="lg-hero__tag">
            <div className="lg-hero__tag-l">Pieza del mes</div>
            <div className="lg-hero__tag-n">Mate Imperial</div>
            <div className="lg-hero__tag-p">{formatPrice(42000)}</div>
          </div>*/}
          <svg className="lg-hero__orn" viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="100" cy="100" r="98" fill="none" stroke="currentColor" strokeWidth=".6"/>
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth=".4" strokeDasharray="2 4"/>
          </svg>
        </div>
      </div>
      <div className="lg-marquee">
        <div className="lg-marquee__track">
          {Array(2).fill(0).map((_,i) => (
            <span key={i}>
              <em>Mate Imperial</em> · Bombilla Pico de Loro · <em>Termo Media Manija</em> · Mate de Algarrobo · <em>Bombillón de Alpaca</em> · Mate Ranchero ·&nbsp;
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ───── Hero B: Split (50/50, balanced, calmer)
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
          <image-slot id="hero-split-img" placeholder="Foto principal (composición con mate, termo y bombilla)" shape="rounded" radius="2"></image-slot>
          <div className="lg-hero-split__stat">
            <div className="lg-hero-split__statn">+1.200</div>
            <div className="lg-hero-split__statl">mateadas felices</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ───── Hero C: Full-bleed image with centered overlay
function HeroFullbleed() {
  return (
    <section className="lg-hero lg-hero--full">
      <div className="lg-hero-full__img">
        <image-slot id="hero-full-img" placeholder="Foto a sangrada (paisaje, fogón, mate)" shape="rect"></image-slot>
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

window.HomePage = HomePage;
