import { useState, useEffect, useRef, useCallback } from 'react';
import { sb } from '../lib/supabase';
import { navigate, Link, ProductCard } from '../components/Components';
import { useProducts, CATEGORIES, formatPrice } from '../data';

// ---------------------------------------------------------------------------
// Seguridad del panel
// La protección REAL está en Supabase (RLS + public.is_admin()). Estas
// comprobaciones del frontend son defensa en profundidad y UX.
// ---------------------------------------------------------------------------

const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 horas sin actividad → logout
const ACTIVITY_KEY = 'lg_admin_last_activity';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const storage = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* sin storage */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* sin storage */ } },
};

// Muestra un mensaje genérico al usuario y deja el detalle solo en consola.
function fail(userMsg, error) {
  if (error) console.error(userMsg, error);
  alert(userMsg);
}

// El link de recuperación vuelve a /?reset=1#/admin
const isRecovery = () => new URLSearchParams(window.location.search).get('reset') === '1';
const clearRecovery = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete('reset');
  window.history.replaceState(window.history.state, '', url.toString());
};

// Determina en qué paso del acceso está el usuario.
async function resolveStage(session) {
  if (!session) return 'login';

  const { data: aal, error: aalErr } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aalErr) { console.error(aalErr); return 'login'; }
  if (aal.currentLevel !== 'aal2') {
    // Con MFA activo, Supabase exige aal2 también para cambiar la contraseña.
    if (aal.nextLevel === 'aal2') return 'mfa-verify';
    return isRecovery() ? 'reset-password' : 'mfa-enroll';
  }
  if (isRecovery()) return 'reset-password';

  const { data: isAdmin, error } = await sb.rpc('is_admin');
  if (error || !isAdmin) {
    if (error) console.error(error);
    return 'forbidden';
  }
  return 'ok';
}

export function AdminPage() {
  const [stage, setStage] = useState('loading');
  const [notice, setNotice] = useState('');
  const runId = useRef(0);

  const evaluate = useCallback(async (session) => {
    const id = ++runId.current;
    const next = await resolveStage(session);
    if (id !== runId.current) return; // llegó una evaluación más nueva

    if (next === 'forbidden') {
      setNotice('Esta cuenta no tiene permisos de administrador.');
      storage.del(ACTIVITY_KEY);
      await sb.auth.signOut();
      setStage('login');
      return;
    }
    setStage(next);
  }, []);

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => evaluate(data.session));
    const { data: { subscription } } = sb.auth.onAuthStateChange((event, s) => {
      if (event === 'INITIAL_SESSION') return; // ya cubierto por getSession
      // No llamar a Supabase dentro del callback (puede bloquearse): diferir.
      setTimeout(() => evaluate(s), 0);
    });
    return () => subscription.unsubscribe();
  }, [evaluate]);

  const logout = async (reason) => {
    storage.del(ACTIVITY_KEY);
    await sb.auth.signOut();
    if (reason === 'idle') {
      setNotice('Tu sesión se cerró por inactividad. Ingresá de nuevo.');
      setStage('login');
    } else {
      navigate('/');
    }
  };

  const recheck = async () => {
    const { data } = await sb.auth.getSession();
    evaluate(data.session);
  };

  if (stage === 'loading') return <div className="lg-empty"><h3>Cargando...</h3></div>;
  if (stage === 'login') return <AdminLogin notice={notice} onNotice={setNotice}/>;
  if (stage === 'mfa-enroll') return <MfaEnroll onDone={recheck} onCancel={() => logout()}/>;
  if (stage === 'mfa-verify') return <MfaVerify onDone={recheck} onCancel={() => logout()}/>;
  if (stage === 'reset-password') return (
    <ResetPassword
      onDone={() => { clearRecovery(); setNotice(''); recheck(); }}
      onCancel={() => { clearRecovery(); logout(); }}
    />
  );
  return <AdminDashboard onLogout={() => logout()} onIdle={() => logout('idle')}/>;
}

function AuthShell({ pre, title, children }) {
  return (
    <section className="lg-login">
      <div className="lg-login__inner">
        <div className="lg-login__art">
          <div className="lg-login__brand">
            <span className="lg-brand__small">La</span>
            <span className="lg-brand__big">Gauchada</span>
          </div>
          <div className="lg-login__quote">
            <span className="lg-caveat">"El que no tiene mate,<br/>tiene que conseguir mate."</span>
          </div>
          <div className="lg-login__deco">
            <svg viewBox="0 0 300 300" width="300" height="300" aria-hidden="true">
              <circle cx="150" cy="150" r="120" fill="none" stroke="currentColor" strokeWidth=".4" opacity=".4"/>
              <circle cx="150" cy="150" r="80" fill="none" stroke="currentColor" strokeWidth=".4" opacity=".4" strokeDasharray="3 6"/>
              <circle cx="150" cy="150" r="40" fill="none" stroke="currentColor" strokeWidth=".4" opacity=".6"/>
            </svg>
          </div>
        </div>
        <div className="lg-login__form">
          <div className="lg-login__pre">{pre}</div>
          <h1 className="lg-h2">{title}</h1>
          {children}
        </div>
      </div>
    </section>
  );
}

function AdminLogin({ notice, onNotice }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);

  if (forgot) return <ForgotPassword initialEmail={email} onBack={() => setForgot(false)}/>;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr(''); onNotice('');
    const { error } = await sb.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (error) { setErr('Usuario o contraseña incorrectos.'); return; }
    setPass('');
    storage.set(ACTIVITY_KEY, String(Date.now()));
  };

  return (
    <AuthShell pre="Panel de administración" title="Ingresá al taller digital">
      <p className="lg-lead">Solo administradores. Para volver a la tienda <Link to="/">hacé clic acá</Link>.</p>
      <form onSubmit={submit} className="lg-form">
        {notice && <div className="lg-form__err">{notice}</div>}
        <label>Usuario<input required type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@lagauchada.com"/></label>
        <label>Contraseña<input required type="password" autoComplete="current-password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••"/></label>
        {err && <div className="lg-form__err">{err}</div>}
        <button className="lg-btn lg-btn--gold lg-btn--big lg-btn--block" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar →'}
        </button>
        <button type="button" onClick={() => { setErr(''); onNotice(''); setForgot(true); }}
          style={{ alignSelf: 'flex-start', fontSize: 14, color: 'var(--gold-deep)', borderBottom: '1px solid currentColor' }}>
          ¿Olvidaste tu contraseña?
        </button>
      </form>
    </AuthShell>
  );
}

function ForgotPassword({ initialEmail, onBack }) {
  const [email, setEmail] = useState(initialEmail || '');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/?reset=1#/admin`,
    });
    setLoading(false);
    if (error) console.error(error);
    // Mismo mensaje exista o no la cuenta (no revelar qué emails están registrados).
    setSent(true);
  };

  return (
    <AuthShell pre="Panel de administración" title="Recuperar contraseña">
      {sent ? (
        <div className="lg-form">
          <p className="lg-lead">
            Si el email corresponde a una cuenta, te enviamos un link para elegir una contraseña nueva.
            Abrilo <strong>en este mismo navegador</strong> y usá solo el último email que recibas.
          </p>
          <button type="button" className="lg-btn lg-btn--ghost-dark lg-btn--block" onClick={onBack}>← Volver al ingreso</button>
        </div>
      ) : (
        <form onSubmit={submit} className="lg-form">
          <p className="lg-lead">Ingresá tu email y te mandamos un link para restablecerla.</p>
          <label>Email<input required type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)}/></label>
          <button className="lg-btn lg-btn--gold lg-btn--big lg-btn--block" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar link →'}
          </button>
          <button type="button" className="lg-btn lg-btn--ghost-dark lg-btn--block" onClick={onBack}>← Volver</button>
        </form>
      )}
    </AuthShell>
  );
}

const PASSWORD_RULES = [
  { test: p => p.length >= 12, label: 'Al menos 12 caracteres' },
  { test: p => /[a-z]/.test(p), label: 'Una minúscula' },
  { test: p => /[A-Z]/.test(p), label: 'Una mayúscula' },
  { test: p => /[0-9]/.test(p), label: 'Un número' },
];

function ResetPassword({ onDone, onCancel }) {
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const valid = PASSWORD_RULES.every(r => r.test(pass)) && pass === pass2;

  const submit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    setLoading(true); setErr('');
    const { error } = await sb.auth.updateUser({ password: pass });
    setLoading(false);
    if (error) {
      console.error(error);
      setErr(
        error.code === 'same_password' ? 'La contraseña nueva tiene que ser distinta de la anterior.' :
        error.code === 'weak_password' ? 'La contraseña no cumple los requisitos de seguridad.' :
        'No se pudo cambiar la contraseña. Pedí un link nuevo e intentá otra vez.'
      );
      return;
    }
    setPass(''); setPass2('');
    storage.set(ACTIVITY_KEY, String(Date.now()));
    onDone();
  };

  return (
    <AuthShell pre="Panel de administración" title="Elegí una contraseña nueva">
      <form onSubmit={submit} className="lg-form">
        <label>Contraseña nueva<input required type="password" autoComplete="new-password" value={pass} onChange={e => setPass(e.target.value)}/></label>
        <label>Repetila<input required type="password" autoComplete="new-password" value={pass2} onChange={e => setPass2(e.target.value)}/></label>
        <ul style={{ fontSize: 13, listStyle: 'none', padding: 0, margin: 0 }}>
          {PASSWORD_RULES.map(r => (
            <li key={r.label} style={{ color: r.test(pass) ? 'var(--gold-deep)' : 'var(--ink-mute)' }}>
              {r.test(pass) ? '✓' : '·'} {r.label}
            </li>
          ))}
          <li style={{ color: pass && pass === pass2 ? 'var(--gold-deep)' : 'var(--ink-mute)' }}>
            {pass && pass === pass2 ? '✓' : '·'} Coinciden
          </li>
        </ul>
        {err && <div className="lg-form__err">{err}</div>}
        <button className="lg-btn lg-btn--gold lg-btn--big lg-btn--block" disabled={loading || !valid}>
          {loading ? 'Guardando...' : 'Guardar contraseña →'}
        </button>
        <button type="button" className="lg-btn lg-btn--ghost-dark lg-btn--block" onClick={onCancel}>Cancelar</button>
      </form>
    </AuthShell>
  );
}

function CodeInput({ value, onChange }) {
  return (
    <label>Código de 6 dígitos
      <input
        required autoFocus inputMode="numeric" autoComplete="one-time-code"
        pattern="[0-9]{6}" maxLength="6" placeholder="123456"
        value={value} onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        style={{ letterSpacing: '.4em', fontSize: 20 }}
      />
    </label>
  );
}

// Primer ingreso: registrar la app autenticadora (Google Authenticator, Authy, etc.)
function MfaEnroll({ onDone, onCancel }) {
  const [factor, setFactor] = useState(null);
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      // Limpia intentos de enrolamiento previos que no se completaron.
      const { data: list } = await sb.auth.mfa.listFactors();
      for (const f of (list?.all || [])) {
        if (f.status === 'unverified') await sb.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error } = await sb.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Admin La Gauchada ' + new Date().toISOString().slice(0, 10),
      });
      if (error) { console.error(error); setErr('No se pudo iniciar la configuración de seguridad.'); return; }
      setFactor({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    })();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!factor) return;
    setLoading(true); setErr('');
    const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
    setLoading(false);
    if (error) { console.error(error); setErr('Código incorrecto. Probá de nuevo.'); setCode(''); return; }
    onDone();
  };

  return (
    <AuthShell pre="Verificación en dos pasos" title="Configurá tu código de seguridad">
      <p className="lg-lead">
        Escaneá el QR con una app autenticadora (Google Authenticator, Authy, 1Password…) y cargá el código que te muestra.
        Solo se pide al iniciar sesión.
      </p>
      <form onSubmit={submit} className="lg-form">
        {factor ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
            <img src={factor.qr} alt="Código QR para la app autenticadora" width="180" height="180" style={{ background: '#fff', padding: 8, borderRadius: 4 }}/>
            <small style={{ color: 'var(--ink-mute)' }}>¿No podés escanear? Clave manual:</small>
            <code style={{ wordBreak: 'break-all', fontSize: 13 }}>{factor.secret}</code>
          </div>
        ) : !err && <p>Generando código QR...</p>}
        <CodeInput value={code} onChange={setCode}/>
        {err && <div className="lg-form__err">{err}</div>}
        <button className="lg-btn lg-btn--gold lg-btn--big lg-btn--block" disabled={loading || !factor || code.length !== 6}>
          {loading ? 'Verificando...' : 'Activar y entrar →'}
        </button>
        <button type="button" className="lg-btn lg-btn--ghost-dark lg-btn--block" onClick={onCancel}>Cancelar</button>
      </form>
    </AuthShell>
  );
}

// Ingresos siguientes: pedir el código de la app.
function MfaVerify({ onDone, onCancel }) {
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    const { data: list, error: listErr } = await sb.auth.mfa.listFactors();
    const factor = list?.totp?.[0];
    if (listErr || !factor) {
      setLoading(false);
      console.error(listErr);
      setErr('No se encontró el método de verificación.');
      return;
    }
    const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
    setLoading(false);
    if (error) { console.error(error); setErr('Código incorrecto o vencido. Probá con el actual.'); setCode(''); return; }
    onDone();
  };

  return (
    <AuthShell pre="Verificación en dos pasos" title="Ingresá tu código">
      <p className="lg-lead">Abrí tu app autenticadora y cargá el código de 6 dígitos de La Gauchada.</p>
      <form onSubmit={submit} className="lg-form">
        <CodeInput value={code} onChange={setCode}/>
        {err && <div className="lg-form__err">{err}</div>}
        <button className="lg-btn lg-btn--gold lg-btn--big lg-btn--block" disabled={loading || code.length !== 6}>
          {loading ? 'Verificando...' : 'Verificar →'}
        </button>
        <button type="button" className="lg-btn lg-btn--ghost-dark lg-btn--block" onClick={onCancel}>Cancelar</button>
      </form>
    </AuthShell>
  );
}

// Cierra la sesión tras IDLE_TIMEOUT_MS sin actividad (compartido entre pestañas).
function useIdleLogout(onIdle) {
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    const now = Date.now();
    const stored = Number(storage.get(ACTIVITY_KEY)) || 0;
    if (stored && now - stored > IDLE_TIMEOUT_MS) { onIdleRef.current(); return; }

    let lastWrite = 0;
    let expired = false;
    const isExpired = () => {
      const last = Math.max(lastWrite, Number(storage.get(ACTIVITY_KEY)) || 0);
      return last > 0 && Date.now() - last > IDLE_TIMEOUT_MS;
    };
    const check = () => {
      if (expired || !isExpired()) return;
      expired = true;
      onIdleRef.current();
    };
    const touch = () => {
      const t = Date.now();
      if (t - lastWrite < 15000) return; // no escribir en cada mousemove
      check(); // ej.: volvés tras suspender la PC → primero vence, no renueva
      if (expired) return;
      lastWrite = t;
      storage.set(ACTIVITY_KEY, String(t));
    };
    storage.set(ACTIVITY_KEY, String(now));
    lastWrite = now;

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(ev => window.addEventListener(ev, touch, { passive: true }));
    const timer = setInterval(check, 60 * 1000);
    document.addEventListener('visibilitychange', check);

    return () => {
      events.forEach(ev => window.removeEventListener(ev, touch));
      clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);
}

function AdminDashboard({ onLogout, onIdle }) {
  useIdleLogout(onIdle);
  const [tab, setTab] = useState('productos');
  const { products, loading, reload } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [ordersCount, setOrdersCount] = useState(null);

  useEffect(() => {
    sb.from('orders').select('id', { count: 'exact', head: true })
      .then(({ count }) => setOrdersCount(count));
  }, [tab]);

  const filtered = products.filter(p => {
    if (catFilter !== 'all' && p.category !== catFilter) return false;
    if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const saveProduct = async (data) => {
    const payload = {
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: data.name, category: data.category, price: Number(data.price),
      stock: Number(data.stock), short_description: data.long.slice(0, 120),
      long_description: data.long, badge: data.badge || null, monogram: data.monogram,
      accent_color: data.accent, image_url: data.image_url || null,
      image_url_2: data.image_url_2 || null, image_url_3: data.image_url_3 || null,
    };
    if (editing?._dbId) {
      const { error } = await sb.from('products').update(payload).eq('id', editing._dbId);
      if (error) { fail('No se pudo guardar el producto.', error); return; }
    } else {
      const { error } = await sb.from('products').insert(payload);
      if (error) { fail('No se pudo crear el producto.', error); return; }
    }
    await reload();
    setShowForm(false);
    setEditing(null);
  };

  const remove = async (dbId) => {
    if (!confirm('¿Eliminar este producto?')) return;
    const { error } = await sb.from('products').delete().eq('id', dbId);
    if (error) { fail('No se pudo eliminar el producto.', error); return; }
    await reload();
  };

  const stats = {
    total: products.length,
    valor: products.reduce((s, p) => s + p.price * (p.stock || 0), 0),
    stock: products.reduce((s, p) => s + (p.stock || 0), 0),
    ...Object.fromEntries(CATEGORIES.map(c => [c.id, products.filter(p => p.category === c.id).length])),
  };

  return (
    <div className="lg-admin">
      <aside className="lg-admin__side">
        <Link to="/" className="lg-admin__brand">
          <span className="lg-brand__small">La</span>
          <span className="lg-brand__big">Gauchada</span>
        </Link>
        <div className="lg-admin__role">Panel admin</div>
        <nav className="lg-admin__nav">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
            { id: 'productos', label: 'Productos', icon: 'box' },
            { id: 'pedidos', label: 'Pedidos', icon: 'cart' },
            { id: 'clientes', label: 'Clientes', icon: 'users' },
            { id: 'config', label: 'Configuración', icon: 'cog' },
          ].map(t => (
            <button key={t.id} className={'lg-admin__navlink' + (tab === t.id ? ' is-active' : '')} onClick={() => setTab(t.id)}>
              <AdminIcon name={t.icon}/>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="lg-admin__sidefoot">
          <button onClick={onLogout} className="lg-admin__logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M15 17l5-5-5-5M20 12H9M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="lg-admin__main">
        <header className="lg-admin__top">
          <div>
            <div className="lg-admin__crumb">Admin / {tab}</div>
            <h1 className="lg-admin__h">
              {tab === 'productos' && 'Productos'}
              {tab === 'dashboard' && 'Dashboard'}
              {tab === 'pedidos' && 'Pedidos'}
              {tab === 'clientes' && 'Clientes'}
              {tab === 'config' && 'Configuración'}
            </h1>
          </div>
          <div className="lg-admin__topright">
            <div className="lg-admin__avatar">AD</div>
          </div>
        </header>

        {tab === 'dashboard' && (
          <div className="lg-admin__body">
            <div className="lg-admin__stats">
              <div className="lg-stat"><div className="lg-stat__l">Productos</div><div className="lg-stat__n">{stats.total}</div><div className="lg-stat__d">en la base</div></div>
              <div className="lg-stat"><div className="lg-stat__l">Stock total</div><div className="lg-stat__n">{stats.stock}</div><div className="lg-stat__d">unidades</div></div>
              <div className="lg-stat"><div className="lg-stat__l">Valor inventario</div><div className="lg-stat__n">{formatPrice(stats.valor)}</div><div className="lg-stat__d">a precio de venta</div></div>
              <div className="lg-stat"><div className="lg-stat__l">Total de pedidos</div><div className="lg-stat__n">{ordersCount ?? '—'}</div><div className="lg-stat__d">histórico</div></div>
            </div>
            <div className="lg-admin__cards">
              <div className="lg-acard">
                <div className="lg-acard__h">Stock por categoría</div>
                <div className="lg-bars">
                  {CATEGORIES.map(c => {
                    const n = stats[c.id] || 0;
                    return (
                      <div key={c.id} className="lg-bar">
                        <div className="lg-bar__l">{c.label}</div>
                        <div className="lg-bar__track"><div className="lg-bar__fill" style={{ width: stats.total ? (n / stats.total * 100) + '%' : '0%' }}/></div>
                        <div className="lg-bar__n">{n}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="lg-acard">
                <div className="lg-acard__h">Pedidos recientes</div>
                <AdminOrdersList/>
              </div>
            </div>
          </div>
        )}

        {tab === 'productos' && (
          <div className="lg-admin__body">
            <div className="lg-admin__toolbar">
              <div className="lg-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
                <input placeholder="Buscar producto..." value={query} onChange={e => setQuery(e.target.value)}/>
              </div>
              <select className="lg-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                <option value="all">Todas las categorías</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <button className="lg-btn lg-btn--gold" onClick={() => { setEditing(null); setShowForm(true); }}>
                + Nuevo producto
              </button>
            </div>
            {loading ? (
              <div className="lg-empty"><p>Cargando productos...</p></div>
            ) : (
              <div className="lg-table-wrap">
                <table className="lg-table">
                  <thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th className="lg-prod-col-stock">Stock</th><th></th></tr></thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div className="lg-table__prod">
                            <div className="lg-drawer__thumb" style={{ background: p.accent, overflow: 'hidden', padding: 0 }}>
                              {p.image_url ? <img src={p.image_url} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <span>{p.monogram}</span>}
                            </div>
                            <div>
                              <div className="lg-table__name">{p.name}</div>
                              <div className="lg-table__sub">{(p.short || p.long || '').slice(0, 50)}...</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="lg-tag lg-tag--cat">{p.category}</span></td>
                        <td><strong>{formatPrice(p.price)}</strong></td>
                        <td className="lg-prod-col-stock">{p.stock}</td>
                        <td>
                          <div className="lg-row-actions">
                            <button onClick={() => { setEditing(p); setShowForm(true); }} title="Editar">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
                            </button>
                            <button onClick={() => remove(p._dbId)} title="Eliminar">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'pedidos' && <AdminOrdersTab/>}
        {tab === 'clientes' && <EmptyTab label="clientes"/>}
        {tab === 'config' && <EmptyTab label="configuración"/>}
      </main>

      {showForm && <ProductForm initial={editing} onSave={saveProduct} onClose={() => { setShowForm(false); setEditing(null); }}/>}
    </div>
  );
}

function AdminOrdersList() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    sb.from('orders').select('order_number, customer_name, total, status, created_at')
      .order('created_at', { ascending: false }).limit(4)
      .then(({ data }) => setOrders(data || []));
  }, []);
  if (orders.length === 0) return <p style={{color:'var(--ink-mute)', fontSize:14}}>No hay pedidos todavía.</p>;
  return (
    <ul className="lg-orders">
      {orders.map(o => (
        <li key={o.order_number} className="lg-order">
          <div><div className="lg-order__id">#{o.order_number}</div><div className="lg-order__name">{o.customer_name}</div></div>
          <div className="lg-order__t">{formatPrice(o.total)}</div>
          <span className={'lg-tag lg-tag--' + o.status}>{o.status}</span>
        </li>
      ))}
    </ul>
  );
}

const STATUS_LABELS = {
  pending: 'Pendiente',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

function AdminOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const loadOrders = async () => {
    const { data } = await sb.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { loadOrders(); }, []);

  const updateStatus = async (order, newStatus) => {
    if (order.status === newStatus) return;
    setUpdating(order.id);

    // Estado + ajuste de stock en una sola transacción del lado del servidor.
    const { error } = await sb.rpc('apply_order_status', { p_order_id: order.id, p_new_status: newStatus });
    if (error) fail('No se pudo actualizar el pedido.', error);

    setUpdating(null);
    await loadOrders();
  };

  const deleteOrder = async (order) => {
    if (!confirm(`¿Seguro que querés eliminar el pedido #${order.order_number}?`)) return;
    setUpdating(order.id);
    const { error } = await sb.from('orders').delete().eq('id', order.id);
    if (error) fail('No se pudo eliminar el pedido.', error);
    setUpdating(null);
    await loadOrders();
  };

  const togglePaid = async (order) => {
    setUpdating(order.id);
    const { error } = await sb.from('orders').update({ paid: !order.paid }).eq('id', order.id);
    if (error) fail('No se pudo actualizar el pago.', error);
    setUpdating(null);
    await loadOrders();
  };

  return (
    <div className="lg-admin__body">
      {loading ? (
        <div className="lg-empty"><p>Cargando pedidos...</p></div>
      ) : orders.length === 0 ? (
        <div className="lg-empty lg-empty--admin"><h3>Sin pedidos todavía</h3><p>Los pedidos de WhatsApp aparecerán acá cuando se completen.</p></div>
      ) : (
        <div className="lg-table-wrap">
          <table className="lg-table">
            <thead><tr><th>#</th><th>Cliente</th><th>Total</th><th className="lg-orders-col-delivery">Entrega</th><th className="lg-orders-col-payment">Pago</th><th>Pagado</th><th>Estado</th><th className="lg-orders-col-date">Fecha</th><th></th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td><strong>{o.order_number}</strong></td>
                  <td>{o.customer_name}</td>
                  <td>{formatPrice(o.total)}</td>
                  <td className="lg-orders-col-delivery">{o.delivery_method}</td>
                  <td className="lg-orders-col-payment">{o.payment_method}</td>
                  <td>
                    <button
                      disabled={updating === o.id}
                      onClick={() => togglePaid(o)}
                      className={'lg-paid-btn' + (o.paid ? ' lg-paid-btn--yes' : '')}
                    >
                      {o.paid ? 'Sí' : 'No'}
                    </button>
                  </td>
                  <td>
                    <select
                      value={o.status || 'pending'}
                      disabled={updating === o.id}
                      onChange={(e) => updateStatus(o, e.target.value)}
                      className={'lg-status-select lg-status-select--' + (o.status || 'pending')}
                    >
                      {Object.entries(STATUS_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="lg-orders-col-date" style={{fontSize:12,color:'var(--ink-mute)'}}>{new Date(o.created_at).toLocaleDateString('es-AR')}</td>
                  <td>
                    <button
                      className="lg-iconbtn"
                      disabled={updating === o.id}
                      onClick={() => deleteOrder(o)}
                      title="Eliminar pedido"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EmptyTab({ label }) {
  return (
    <div className="lg-admin__body">
      <div className="lg-empty lg-empty--admin"><h3>Sección {label}</h3><p>Próximamente.</p></div>
    </div>
  );
}

function ProductForm({ initial, onSave, onClose }) {
  const [data, setData] = useState(initial || {
    name: '', category: 'mates', price: 0, short: '', long: '',
    stock: 0, monogram: 'XX', accent: '#8a5a2e', badge: '', image_url: '', image_url_2: '', image_url_3: '',
  });
  const [uploading, setUploading] = useState(null);
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  const handleImageUpload = async (file, key) => {
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) { fail('Formato no permitido. Usá JPG, PNG o WebP.'); return; }
    if (file.size > MAX_IMAGE_BYTES) { fail('La imagen supera los 5 MB.'); return; }
    setUploading(key);
    const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type];
    const base = file.name.replace(/\.[^.]*$/, '').replace(/[^a-z0-9]+/gi, '-').slice(0, 60) || 'imagen';
    const fileName = `${Date.now()}-${base}.${ext}`;
    const { error } = await sb.storage.from('product-images').upload(fileName, file, { contentType: file.type });
    if (error) { fail('No se pudo subir la imagen.', error); setUploading(false); return; }
    const { data: { publicUrl } } = sb.storage.from('product-images').getPublicUrl(fileName);
    set(key, publicUrl);
    setUploading(false);
  };

  return (
    <div className="lg-modal-wrap" onClick={onClose}>
      <div className="lg-modal" onClick={e => e.stopPropagation()}>
        <header className="lg-modal__h">
          <h2>{initial ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button onClick={onClose} className="lg-iconbtn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </header>
        <form className="lg-form" onSubmit={e => { e.preventDefault(); onSave({ ...data, price: Number(data.price), stock: Number(data.stock) }); }}>
          <div className="lg-modal__grid">
            <div className="lg-modal__col">
              <label>Nombre del producto<input required value={data.name} onChange={e => set('name', e.target.value)}/></label>
              <label>Categoría
                <select value={data.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </label>
              <div className="lg-modal__row">
                <label>Precio (ARS)<input required type="number" min="0" value={data.price} onChange={e => set('price', e.target.value)}/></label>
                <label>Stock<input required type="number" min="0" value={data.stock} onChange={e => set('stock', e.target.value)}/></label>
              </div>
              <label>Descripción<textarea rows="5" required value={data.long} onChange={e => set('long', e.target.value)}/></label>
              <div className="lg-modal__row">
                <label>Monograma<input value={data.monogram} onChange={e => set('monogram', e.target.value)} maxLength="2" placeholder="ej. Im"/></label>
                <label>Color de acento<input type="color" value={data.accent} onChange={e => set('accent', e.target.value)}/></label>
              </div>
              <label>Badge (opcional)<input value={data.badge || ''} onChange={e => set('badge', e.target.value)} placeholder="ej. Nuevo, Top, Edición limitada"/></label>
              {[
                { key: 'image_url', label: 'Foto 1 (principal)' },
                { key: 'image_url_2', label: 'Foto 2 (opcional)' },
                { key: 'image_url_3', label: 'Foto 3 (opcional)' },
              ].map(({ key, label }) => (
                <label key={key}>{label}
                  <input type="file" accept="image/jpeg,image/png,image/webp"onChange={e => handleImageUpload(e.target.files[0], key)} disabled={uploading === key}/>
                  {uploading === key && <span style={{fontSize:12,color:'var(--ink-mute)'}}>Subiendo...</span>}
                  {data[key] && (
                    <div style={{position:'relative',display:'inline-block',marginTop:8}}>
                      <img src={data[key]} alt="" style={{maxWidth:160,display:'block',borderRadius:4}}/>
                      <button type="button" onClick={() => set(key, '')} style={{position:'absolute',top:4,right:4,background:'rgba(0,0,0,.55)',color:'#fff',borderRadius:'50%',width:20,height:20,fontSize:12,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
                    </div>
                  )}
                </label>
              ))}
            </div>
            <div className="lg-modal__col lg-modal__col--preview">
              <div className="lg-modal__preview-l">Vista previa</div>
              <div className="lg-modal__preview">
                <ProductCard p={{...data, id: 'preview'}}/>
              </div>
            </div>
          </div>
          <footer className="lg-modal__f">
            <button type="button" className="lg-btn lg-btn--ghost-dark" onClick={onClose}>Cancelar</button>
            <button type="submit" className="lg-btn lg-btn--gold" disabled={!!uploading}>{initial ? 'Guardar cambios' : 'Crear producto'}</button>
          </footer>
        </form>
      </div>
    </div>
  );
}

function AdminIcon({ name }) {
  const icons = {
    grid: <g><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></g>,
    box: <g><path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/></g>,
    cart: <g><path d="M3 4h2l2.4 12.3a2 2 0 0 0 2 1.7h8.2a2 2 0 0 0 2-1.5L21 8H6"/><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/></g>,
    users: <g><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></g>,
    cog: <g><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1-.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></g>,
  };
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>;
}
