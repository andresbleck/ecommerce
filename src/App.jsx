import { useState } from 'react';
import { useRoute, Header, Footer, CartDrawer, Link, navigate } from './components/Components';
import { TweaksPanel, TweakSection, TweakRadio, useTweaks } from './components/TweaksPanel';
import { HomePage } from './pages/Home';
import { ProductsPage, ProductDetailPage } from './products';
import { CartPage, CheckoutPage } from './pages/CartCheckout';
import { AboutPage, ContactPage } from './pages/AboutContact';
import { CurarPage } from './pages/Curar';
import { AdminPage } from './admin/AdminPage';

const TWEAK_DEFAULTS = {
  heroVariant: 'editorial',
  showAdminHint: true,
};

export default function App() {
  const hash = useRoute();
  const path = hash.split('?')[0];
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

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
      <div className="lg-marquee lg-marquee--slim lg-marquee--cream">
        <div className="lg-marquee__track">
          {Array(2).fill(0).map((_,i) => (
            <span key={i}>
              <em> Envíos a todo el país en menos de 48 horas </em> ·  Aceptamos todos los medios de pago  · <em> Devoluciones gratis dentro de los 15 días por defectos de fábrica </em>  ·  10% de descuento pagando en efectivo  · &nbsp;
            </span>
          ))}
        </div>
      </div>
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
    <section className="lg-sec lg-sec--cream">
      <div className="lg-sec__inner">
        <div className="lg-empty">
          <h2 className="lg-h2">404 · Por acá no va la cosa</h2>
          <p className="lg-lead">No encontramos esta página. Volvé al inicio.</p>
          <Link to="/" className="lg-btn lg-btn--gold">Volver al inicio</Link>
        </div>
      </div>
    </section>
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
      </TweakSection>
      <TweakSection label="Atajos">
        <button className="lg-btn lg-btn--ghost-dark" style={{width:'100%'}} onClick={() => navigate('/admin')}>
          → Ir al admin
        </button>
        <button className="lg-btn lg-btn--ghost-dark" style={{width:'100%', marginTop:8}} onClick={() => { localStorage.removeItem('lg_cart'); location.reload(); }}>
          Reset (carrito)
        </button>
      </TweakSection>
    </TweaksPanel>
  );
}
