// App: router resolution + Tweaks
const { useState: useState_app } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "heroVariant": "editorial",
  "showAdminHint": true
}/*EDITMODE-END*/;

function App() {
  const hash = useRoute();
  const path = hash.split('?')[0];
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Admin page = no header/footer
  if (path === '/admin') {
    return (
      <>
        <AdminPage/>
        <TweaksUI t={t} setTweak={setTweak}/>
      </>
    );
  }

  let page = null;
  if (path === '/' || path === '') page = <HomePage heroVariant={t.heroVariant}/>;
  else if (path === '/productos') page = <ProductsPage/>;
  else if (path.startsWith('/producto/')) page = <ProductDetailPage id={path.replace('/producto/', '')}/>;
  else if (path === '/carrito') page = <CartPage/>;
  else if (path === '/checkout') page = <CheckoutPage/>;
  else if (path === '/nosotros') page = <AboutPage/>;
  else if (path === '/contacto') page = <ContactPage/>;
  else if (path === '/curar-mate') page = <CurarPage/>;
  else page = <NotFound/>;

  return (
    <>
      <Header/>
      <main className="lg-main">{page}</main>
      <Footer/>
      <CartDrawer/>
      <TweaksUI t={t} setTweak={setTweak}/>
    </>
  );
}

function NotFound() {
  return (
    <Section tone="cream">
      <div className="lg-empty">
        <h2 className="lg-h2">404 · Por acá no va la cosa</h2>
        <p className="lg-lead">No encontramos esta página. Volvé al inicio.</p>
        <Link to="/" className="lg-btn lg-btn--gold">Volver al inicio</Link>
      </div>
    </Section>
  );
}

function TweaksUI({ t, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Hero (página de inicio)">
        <TweakRadio
          label="Variación"
          value={t.heroVariant}
          onChange={(v) => setTweak('heroVariant', v)}
          options={[
            { value: 'editorial', label: 'Editorial' },
            { value: 'split', label: 'Split' },
            { value: 'fullbleed', label: 'Full' },
          ]}
        />
        <p style={{ fontSize: 12, opacity: .65, marginTop: 6 }}>Probá los 3 tratamientos del Hero. Cada uno tiene una personalidad distinta.</p>
      </TweakSection>
      <TweakSection label="Atajos">
        <button className="lg-btn lg-btn--ghost-dark" style={{width:'100%'}} onClick={() => { navigate('/admin'); }}>
          → Ir al admin
        </button>
        <button className="lg-btn lg-btn--ghost-dark" style={{width:'100%', marginTop:8}} onClick={() => { localStorage.removeItem('lg_cart'); localStorage.removeItem('lg_admin_products'); sessionStorage.removeItem('lg_admin'); location.reload(); }}>
          Reset (carrito + productos)
        </button>
      </TweakSection>
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider>
    <CartProvider>
      <App/>
    </CartProvider>
  </RouterProvider>
);
