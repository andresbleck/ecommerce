import { useState } from 'react';
import { useCart, Section, Link } from '../components/Components';
import { formatPrice } from '../data';
import { sb } from '../lib/supabase';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '5491100000000';

function buildWhatsAppMessage({ form, items, total, shipping, finalTotal }) {
  const lines = [];
  lines.push('🧉 *Nuevo pedido — La Gauchada*');
  lines.push('');
  lines.push(`*Cliente:* ${form.nombre}`);
  if (form.email) lines.push(`*Email:* ${form.email}`);
  lines.push('');
  lines.push('*Productos:*');
  items.forEach(it => { lines.push(`• ${it.qty}x ${it.name} — ${formatPrice(it.price * it.qty)}`); });
  lines.push('');
  lines.push(`*Subtotal:* ${formatPrice(total)}`);
  if (form.entrega === 'envio') {
    lines.push(`*Envío:* ${shipping === 0 ? 'Gratis' : formatPrice(shipping)}`);
    lines.push(`*Total:* ${formatPrice(finalTotal)}`);
    lines.push('');
    lines.push('*Envío a domicilio*');
    lines.push(`📍 ${form.direccion}, ${form.ciudad} (CP ${form.cp})`);
    lines.push(`Provincia: ${form.provincia}`);
  } else {
    lines.push(`*Total:* ${formatPrice(total)}`);
    lines.push('');
    lines.push('*Retiro en taller* (Salta)');
  }
  lines.push('');
  lines.push(`*Forma de pago preferida:* ${form.pago === 'transferencia' ? 'Transferencia (10% off)' : form.pago === 'efectivo' ? 'Efectivo al retirar' : 'MercadoPago / Tarjeta'}`);
  if (form.notas) { lines.push(''); lines.push(`*Notas:* ${form.notas}`); }
  lines.push('');
  lines.push('¡Gracias!');
  return lines.join('\n');
}

function buildWhatsAppLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function CartPage() {
  const cart = useCart();

  if (cart.items.length === 0) {
    return (
      <Section tone="cream">
        <div className="lg-empty">
          <div className="lg-empty__icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M3 4h2l2.4 12.3a2 2 0 0 0 2 1.7h8.2a2 2 0 0 0 2-1.5L21 8H6"/><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/></svg>
          </div>
          <h2 className="lg-h2">Tu carrito está vacío</h2>
          <p className="lg-lead">No hay mateadas planeadas todavía. Pasá al catálogo.</p>
          <Link to="/productos" className="lg-btn lg-btn--gold">Ver productos</Link>
        </div>
      </Section>
    );
  }

  const shipping = cart.total > 60000 ? 0 : 4500;
  const finalTotal = cart.total + shipping;

  return (
    <Section tone="cream">
      <h1 className="lg-h1 lg-h1--left">Tu carrito</h1>
      <div className="lg-cartpage">
        <div className="lg-cartpage__list">
          <div className="lg-cartrow lg-cartrow--head">
            <span>Producto</span><span>Cantidad</span><span>Precio</span><span>Subtotal</span><span></span>
          </div>
          {cart.items.map(it => (
            <div key={it.id} className="lg-cartrow">
              <div className="lg-cartrow__prod">
                <div className="lg-drawer__thumb lg-drawer__thumb--big" style={{ background: it.accent, overflow: 'hidden', padding: 0 }}>
                  {it.image_url ? <img src={it.image_url} alt={it.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <span>{it.monogram}</span>}
                </div>
                <Link to={`/producto/${it.id}`} className="lg-cartrow__name">{it.name}</Link>
              </div>
              <div className="lg-qty">
                <button onClick={() => cart.setQty(it.id, it.qty - 1)}>−</button>
                <span>{it.qty}</span>
                <button onClick={() => cart.setQty(it.id, it.qty + 1)}>+</button>
              </div>
              <span className="lg-cartrow__price">{formatPrice(it.price)}</span>
              <span className="lg-cartrow__price"><strong>{formatPrice(it.price * it.qty)}</strong></span>
              <button className="lg-iconbtn" onClick={() => cart.remove(it.id)} aria-label="Eliminar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
              </button>
            </div>
          ))}
          <div className="lg-cartrow__actions">
            <Link to="/productos" className="lg-link-arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M11 5L4 12l7 7"/></svg> Seguir comprando</Link>
            <button className="lg-link-arrow" onClick={() => cart.clear()}>Vaciar carrito</button>
          </div>
        </div>
        <aside className="lg-summary">
          <h3 className="lg-summary__h">Resumen</h3>
          <div className="lg-summary__row"><span>Subtotal ({cart.count} ítems)</span><span>{formatPrice(cart.total)}</span></div>
          <div className="lg-summary__row"><span>Envío estimado</span><span>{shipping === 0 ? <em>Gratis</em> : formatPrice(shipping)}</span></div>
          {shipping > 0 && <div className="lg-summary__hint">Sumá {formatPrice(60000 - cart.total)} más y el envío es gratis.</div>}
          <div className="lg-summary__sep"/>
          <div className="lg-summary__row lg-summary__row--big"><span>Total</span><span>{formatPrice(finalTotal)}</span></div>
          <Link to="/checkout" className="lg-btn lg-btn--wa lg-btn--block lg-btn--big">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.3L3 21z"/></svg>
            Pedir por WhatsApp
          </Link>
          <div className="lg-summary__safe">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.3L3 21z"/></svg>
            Coordinamos pago y envío por WhatsApp
          </div>
        </aside>
      </div>
    </Section>
  );
}

export function CheckoutPage() {
  const cart = useCart();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nombre: '', email: '', entrega: 'envio',
    direccion: '', ciudad: '', cp: '', provincia: 'Buenos Aires',
    pago: 'mp', notas: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const shipping = form.entrega === 'envio' ? (cart.total > 60000 ? 0 : 4500) : 0;
  const finalTotal = cart.total + shipping;

  if (cart.items.length === 0 && step < 3) {
    return (
      <Section tone="cream">
        <div className="lg-empty">
          <h2 className="lg-h2">No hay nada para pedir</h2>
          <Link to="/productos" className="lg-btn lg-btn--gold">Volver al catálogo</Link>
        </div>
      </Section>
    );
  }

  const message = buildWhatsAppMessage({ form, items: cart.items, total: cart.total, shipping, finalTotal });
  const waLink = buildWhatsAppLink(message);

  const sendOrder = async () => {
    const orderNumber = 'LG' + String(Math.floor(Math.random() * 90000 + 10000));
    const { error } = await sb.from('orders').insert({
      order_number: orderNumber,
      customer_name: form.nombre,
      total: finalTotal,
      delivery_method: form.entrega,
      payment_method: form.pago,
      status: 'pending',
      items: cart.items.map(it => ({ id: it.id, name: it.name, qty: it.qty, price: it.price })),
      paid: false,
    });
    if (error) console.error('Error guardando pedido:', error.message);
    window.open(waLink, '_blank');
    setStep(3);
    setTimeout(() => cart.clear(), 500);
  };

  return (
    <Section tone="cream">
      <h1 className="lg-h1 lg-h1--left">Finalizar pedido</h1>
      <p className="lg-lead" style={{marginBottom:32}}>Completá tus datos y mandamos el pedido por WhatsApp.</p>
      <div className="lg-steps">
        {['Tus datos', 'Revisar', 'Listo'].map((s, i) => (
          <div key={i} className={'lg-step' + (step > i ? ' is-done' : '') + (step === i + 1 ? ' is-active' : '')}>
            <span className="lg-step__n">{step > i ? '✓' : i + 1}</span>
            <span className="lg-step__l">{s}</span>
          </div>
        ))}
      </div>
      <div className={step === 3 ? '' : 'lg-checkout'}>
        <div className="lg-checkout__main" style={step === 3 ? {maxWidth:640, margin:'0 auto'} : {}}>
          {step === 1 && (
            <form className="lg-form" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
              <div className="lg-fs">
                <div className="lg-fs__legend">Tus datos</div>
                <div className="lg-fs__grid">
                  <label className="lg-fs__wide">Nombre y apellido<input required value={form.nombre} onChange={e => set('nombre', e.target.value)}/></label>
                  <label className="lg-fs__wide">Email (opcional)<input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="por si te tenemos que escribir"/></label>
                </div>
              </div>
              <div className="lg-fs" style={{marginTop:20}}>
                <div className="lg-fs__legend">¿Cómo lo recibís?</div>
                <div className="lg-pay">
                  <label className={'lg-pay__opt' + (form.entrega === 'envio' ? ' is-active' : '')}>
                    <input type="radio" name="entrega" checked={form.entrega === 'envio'} onChange={() => set('entrega', 'envio')}/>
                    <div><div className="lg-pay__l">Envío a domicilio</div><div className="lg-pay__s">OCA o Andreani · 2 a 5 días hábiles · {cart.total > 60000 ? 'gratis' : formatPrice(4500)}</div></div>
                    <span className="lg-pay__radio"/>
                  </label>
                  <label className={'lg-pay__opt' + (form.entrega === 'retiro' ? ' is-active' : '')}>
                    <input type="radio" name="entrega" checked={form.entrega === 'retiro'} onChange={() => set('entrega', 'retiro')}/>
                    <div><div className="lg-pay__l">Retiro en taller</div><div className="lg-pay__s">Salta · sábados de 10 a 14h · sin costo</div></div>
                    <span className="lg-pay__radio"/>
                  </label>
                </div>
                {form.entrega === 'envio' && (
                  <div className="lg-fs__grid" style={{marginTop:16}}>
                    <label className="lg-fs__wide">Dirección<input required value={form.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Calle, número, piso/depto"/></label>
                    <label>Ciudad<input required value={form.ciudad} onChange={e => set('ciudad', e.target.value)}/></label>
                    <label>Código postal<input required value={form.cp} onChange={e => set('cp', e.target.value)}/></label>
                    <label className="lg-fs__wide">Provincia
                      <select value={form.provincia} onChange={e => set('provincia', e.target.value)}>
                        {['Buenos Aires','CABA','Córdoba','Santa Fe','Mendoza','Salta','Tucumán','Entre Ríos','Neuquén','Misiones','Otra'].map(p => <option key={p}>{p}</option>)}
                      </select>
                    </label>
                  </div>
                )}
              </div>
              <div className="lg-fs" style={{marginTop:20}}>
                <div className="lg-fs__legend">¿Cómo querés pagar?</div>
                <p className="lg-fs__note">Te pasamos los datos por WhatsApp.</p>
                <div className="lg-pay">
                  {[
                    {id:'mp', label:'MercadoPago / Tarjeta', sub:'Hasta 6 cuotas · te mandamos el link'},
                    {id:'transferencia', label:'Transferencia bancaria', sub:'10% off · te pasamos CBU/alias'},
                    {id:'efectivo', label:'Efectivo', sub: form.entrega === 'retiro' ? 'Al retirar en el taller' : 'Al recibir (solo CABA y GBA)'},
                  ].map(opt => (
                    <label key={opt.id} className={'lg-pay__opt' + (form.pago === opt.id ? ' is-active' : '')}>
                      <input type="radio" name="pago" checked={form.pago === opt.id} onChange={() => set('pago', opt.id)}/>
                      <div><div className="lg-pay__l">{opt.label}</div><div className="lg-pay__s">{opt.sub}</div></div>
                      <span className="lg-pay__radio"/>
                    </label>
                  ))}
                </div>
                <label style={{marginTop:16}}>Notas adicionales (opcional)
                  <textarea rows="3" value={form.notas} onChange={e => set('notas', e.target.value)} placeholder="Ej: grabar iniciales, regalo, horario de entrega..."/>
                </label>
              </div>
              <div className="lg-form__actions">
                <Link to="/carrito" className="lg-btn lg-btn--ghost-dark">← Volver al carrito</Link>
                <button className="lg-btn lg-btn--gold">Revisar pedido →</button>
              </div>
            </form>
          )}
          {step === 2 && (
            <div className="lg-fs">
              <div className="lg-review-head">
                <div style={{fontFamily:'var(--serif)', fontSize:26, marginBottom:6}}>Listo para enviar</div>
                <p className="lg-fs__note">Revisá el mensaje. Cuando toques el botón se va a abrir WhatsApp con todo cargado.</p>
              </div>
              <div className="lg-wa-preview">
                <div className="lg-wa-preview__top">
                  <div className="lg-wa-preview__avatar">LG</div>
                  <div>
                    <div className="lg-wa-preview__name">La Gauchada</div>
                    <div className="lg-wa-preview__sub">online · responde en minutos</div>
                  </div>
                  <div className="lg-wa-preview__icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366" stroke="none"><path d="M20 4A11 11 0 0 0 3 18l-1 4 4-1A11 11 0 1 0 20 4zM8.5 9c.3 1.5 1.8 4.2 5 5l1.2-1.5 2.3 1c0 .8-.5 2-2 2.2-1.8.3-5-1-6.7-4.7-.4-1 .5-2 1.2-2z"/></svg>
                  </div>
                </div>
                <div className="lg-wa-preview__body">
                  <div className="lg-wa-bubble">
                    {message.split('\n').map((line, i) => {
                      const formatted = line.replace(/\*(.+?)\*/g, '<strong>$1</strong>');
                      return <div key={i} dangerouslySetInnerHTML={{ __html: formatted || '&nbsp;' }}/>;
                    })}
                    <div className="lg-wa-bubble__time">12:34 ✓</div>
                  </div>
                </div>
              </div>
              <div className="lg-form__actions">
                <button type="button" className="lg-btn lg-btn--ghost-dark" onClick={() => setStep(1)}>← Editar datos</button>
                <button type="button" className="lg-btn lg-btn--wa lg-btn--big" onClick={sendOrder}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4A11 11 0 0 0 3 18l-1 4 4-1A11 11 0 1 0 20 4zM8.5 9c.3 1.5 1.8 4.2 5 5l1.2-1.5 2.3 1c0 .8-.5 2-2 2.2-1.8.3-5-1-6.7-4.7-.4-1 .5-2 1.2-2z"/></svg>
                  Enviar pedido por WhatsApp
                </button>
              </div>
              <div className="lg-wa-disclaimer">
                Se abrirá WhatsApp en una pestaña nueva. Si no te abre, podés escribirnos directo al <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank">+{WHATSAPP_NUMBER}</a>.
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="lg-done">
              <div className="lg-done__check">
                <svg viewBox="0 0 64 64" width="72" height="72"><circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M20 33l8 8 16-18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h2 className="lg-h2">¡Pedido enviado, {form.nombre.split(' ')[0] || 'che'}!</h2>
              <p className="lg-lead">Te respondemos por WhatsApp en los próximos minutos con la forma de pago y el detalle del envío.</p>
              <div className="lg-form__actions lg-form__actions--center">
                <a href={waLink} target="_blank" className="lg-btn lg-btn--wa lg-btn--big">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4A11 11 0 0 0 3 18l-1 4 4-1A11 11 0 1 0 20 4zM8.5 9c.3 1.5 1.8 4.2 5 5l1.2-1.5 2.3 1c0 .8-.5 2-2 2.2-1.8.3-5-1-6.7-4.7-.4-1 .5-2 1.2-2z"/></svg>
                  Reenviar por WhatsApp
                </a>
                <Link to="/productos" className="lg-btn lg-btn--ghost-dark">Seguir comprando</Link>
              </div>
              <div className="lg-done__num">Mientras tanto, cebá uno 🧉</div>
            </div>
          )}
        </div>
        {step < 3 && (
          <aside className="lg-summary">
            <h3 className="lg-summary__h">Tu pedido</h3>
            <ul className="lg-summary__list">
              {cart.items.map(it => (
                <li key={it.id}>
                  <div className="lg-drawer__thumb" style={{ background: it.accent, overflow:'hidden', padding:0 }}>
                  {it.image_url ? <img src={it.image_url} alt={it.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <span>{it.monogram}</span>}
                </div>
                  <div><div className="lg-summary__name">{it.name}</div><div className="lg-summary__qty">x{it.qty}</div></div>
                  <div>{formatPrice(it.price * it.qty)}</div>
                </li>
              ))}
            </ul>
            <div className="lg-summary__sep"/>
            <div className="lg-summary__row"><span>Subtotal</span><span>{formatPrice(cart.total)}</span></div>
            {form.entrega === 'envio' && (
              <div className="lg-summary__row"><span>Envío</span><span>{shipping === 0 ? <em>Gratis</em> : formatPrice(shipping)}</span></div>
            )}
            <div className="lg-summary__row lg-summary__row--big"><span>Total</span><span>{formatPrice(finalTotal)}</span></div>
          </aside>
        )}
      </div>
    </Section>
  );
}
