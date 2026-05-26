// About (Nosotros) and Contact pages
function AboutPage() {
  return (
    <>
      <Section tone="dark" className="lg-about-hero">
        <div className="lg-eyebrow lg-eyebrow--light">
          <span className="lg-eyebrow__line"/>El origen<span className="lg-eyebrow__line"/>
        </div>
        <h1 className="lg-h1">
          Una <em>gauchada</em> es ayudar<br/>sin que te lo pidan.
        </h1>
        <p className="lg-lead lg-lead--center">
          Así arrancó esto: con un mate bien cebado para un amigo en un mal día. Hoy somos un emprendimiento chico en el norte argentino, obsesionados con hacer las cosas como se hacían antes.
        </p>
      </Section>

      <Section tone="cream">
        <div className="lg-story lg-story--reverse">
          <div className="lg-story__img">
             <img src="./images/op3.jpg" alt="Foto de mate" style={{width:"100%", height:"100%", objectFit:"cover"}} />

          </div>
          <div className="lg-story__copy">
            <Eyebrow>Cómo empezamos</Eyebrow>
            <h2 className="lg-h2">Tres manos, una mesa, mucha yerba.</h2>
            <p className="lg-lead">
              Empezamos en 2021 con la idea de hacer un emprendimiento, curando calabazas a la noche después del trabajo. Las primeras 50 piezas las vendimos a amigos y familia. Hoy trabajan con nosotros cinco artesanos del oficio y seguimos haciendo cada pieza a mano.
            </p>
            <p className="lg-lead">
              No queremos ser una marca grande. Queremos hacer mates que duren décadas y que vos puedas pasarle a tus hijos.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="cream" className="lg-values-sec">
        <div className="lg-fh lg-fh--center">
          <div>
            <Eyebrow>Lo que creemos</Eyebrow>
            <h2 className="lg-h2">Tres reglas, sin chamuyo.</h2>
          </div>
        </div>
        <div className="lg-values">
          <div className="lg-value">
            <div className="lg-value__num">01</div>
            <h3 className="lg-value__h">Hecho a mano, siempre.</h3>
            <p>Nada de máquinas, nada de moldes. Si no lo puede hacer una persona, no lo hacemos.</p>
          </div>
          <div className="lg-value">
            <div className="lg-value__num">02</div>
            <h3 className="lg-value__h">Materiales que envejecen lindo.</h3>
            <p>Cuero curtido al tanino, alpaca, calabaza. Materiales que el tiempo mejora, no arruina.</p>
          </div>
          <div className="lg-value">
            <div className="lg-value__num">03</div>
            <h3 className="lg-value__h">Precio justo, en serio.</h3>
            <p>Pagamos bien al artesano y vendemos directo. Sin intermediarios, sin marketing inflado.</p>
          </div>
        </div>
      </Section>

      <Section tone="dark">
        <div className="lg-numbers">
          <div className="lg-number">
            <div className="lg-number__n">2021</div>
            <div className="lg-number__l">Empezamos en Tucuman</div>
          </div>
          <div className="lg-number">
            <div className="lg-number__n">2</div>
            <div className="lg-number__l">Jovenes estudiantes</div>
          </div>
          <div className="lg-number">
            <div className="lg-number__n">+1.200</div>
            <div className="lg-number__l">Mates en mesas argentinas</div>
          </div>
          <div className="lg-number">
            <div className="lg-number__n">+4</div>
            <div className="lg-number__l">Años de aprendizaje</div>
          </div>
        </div>
      </Section>

      <Section tone="cream">
        <div className="lg-cta-box">
          <div>
            <Eyebrow>Pasá a vernos</Eyebrow>
            <h2 className="lg-h2">¿Queres visitarnos?</h2>
            <p className="lg-lead">Si pasás por Tucuman, el local está abierto los sábados de 10 a 14.</p>
          </div>
          <Link to="/contacto" className="lg-btn lg-btn--dark lg-btn--big">Escribinos</Link>
        </div>
      </Section>
    </>
  );
}

// ──────────────────────────────────────────────────────────────
const { useState: useState_ct } = React;

function ContactPage() {
  const [form, setForm] = useState_ct({ nombre: '', email: '', tema: 'consulta', mensaje: '' });
  const [sent, setSent] = useState_ct(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      <Section tone="dark" className="lg-contact-hero">
        <div className="lg-eyebrow lg-eyebrow--light">
          <span className="lg-eyebrow__line"/>Hablemos<span className="lg-eyebrow__line"/>
        </div>
        <h1 className="lg-h1">¿En qué te damos una mano?</h1>
        <p className="lg-lead lg-lead--center">Respondemos en menos de 24hs. WhatsApp, Instagram o mail, lo que te quede más cómodo.</p>
      </Section>

      <Section tone="cream">
        <div className="lg-contact">
          <div className="lg-contact__channels">
            <a href="https://wa.me/5491100000000" target="_blank" className="lg-channel lg-channel--wa">
              <div className="lg-channel__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.3L3 21z"/>
                  <path d="M8.5 9.5c.3 1.5 1.8 4.2 5 5l1.2-1.5 2.3 1c0 .8-.5 2-2 2.2-1.8.3-5-1-6.7-4.7-.4-1 .5-2 1.2-2z" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <div className="lg-channel__l">WhatsApp</div>
                <div className="lg-channel__v">+54 9 3815699499 </div>
                <div className="lg-channel__s">Lun a Vie · 10 a 19h</div>
              </div>
              <div className="lg-channel__arrow">→</div>
            </a>

            <a href="https://instagram.com/lagauchada" target="_blank" className="lg-channel lg-channel--ig">
              <div className="lg-channel__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <div className="lg-channel__l">Instagram</div>
                <div className="lg-channel__v">@lagauchada</div>
                <div className="lg-channel__s">Fotos, historias y novedades</div>
              </div>
              <div className="lg-channel__arrow">→</div>
            </a>

            <div className="lg-channel lg-channel--info">
              <div className="lg-channel__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div>
                <div className="lg-channel__l">Taller</div>
                <div className="lg-channel__v">Salta, Argentina</div>
                <div className="lg-channel__s">Visitas con cita previa los sábados</div>
              </div>
            </div>

            <div className="lg-faq">
              <h3 className="lg-faq__h">Lo más preguntado</h3>
              <details><summary>¿Cuánto tarda el envío?</summary><p>De 2 a 5 días hábiles a todo el país por OCA o Andreani.</p></details>
              <details><summary>¿Hacen envíos al exterior?</summary><p>Sí, escribinos por WhatsApp y te cotizamos.</p></details>
              <details><summary>¿Puedo cambiar el producto?</summary><p>Tenés 15 días para cambios sin vueltas. Solo escribinos.</p></details>
              <details><summary>¿Hacen piezas a medida?</summary><p>Sí. Si querés grabado o un mate único, contanos qué necesitás.</p></details>
            </div>
          </div>

          <div className="lg-contact__form">
            <h3 className="lg-form__h">O dejanos un mensaje</h3>
            {sent ? (
              <div className="lg-form__done">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg>
                <h4>¡Llegó tu mensaje!</h4>
                <p>Te respondemos en menos de 24hs. Cebá un mate mientras tanto.</p>
                <button className="lg-btn lg-btn--ghost-dark" onClick={() => { setSent(false); setForm({nombre:'',email:'',tema:'consulta',mensaje:''});}}>Enviar otro</button>
              </div>
            ) : (
              <form className="lg-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                <label>Nombre<input required value={form.nombre} onChange={e => set('nombre', e.target.value)}/></label>
                <label>Email<input required type="email" value={form.email} onChange={e => set('email', e.target.value)}/></label>
                <label>Asunto
                  <select value={form.tema} onChange={e => set('tema', e.target.value)}>
                    <option value="consulta">Consulta general</option>
                    <option value="pedido">Sobre mi pedido</option>
                    <option value="mayorista">Compra mayorista</option>
                    <option value="encargo">Pieza a medida</option>
                  </select>
                </label>
                <label>Mensaje<textarea rows="5" required value={form.mensaje} onChange={e => set('mensaje', e.target.value)}/></label>
                <button className="lg-btn lg-btn--gold lg-btn--big">Enviar mensaje</button>
              </form>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}

window.AboutPage = AboutPage;
window.ContactPage = ContactPage;
