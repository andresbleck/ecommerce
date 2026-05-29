import { useState } from 'react';
import { Section, Eyebrow, Link } from '../components/Components';

export function CurarPage() {
  const [tipo, setTipo] = useState('calabaza');

  return (
    <>
      <Section tone="dark" className="lg-curar-hero">
        <div className="lg-eyebrow lg-eyebrow--light">
          <span className="lg-eyebrow__line"/>El ritual<span className="lg-eyebrow__line"/>
        </div>
        <h1 className="lg-h1">Cómo curar<br/>tu <em>mate</em>.</h1>
        <p className="lg-lead lg-lead--center">
          El curado es el primer mate que vas a tomar con tu pieza. No te lo apures: es lo que define el sabor de los próximos años.
        </p>
        <div className="lg-curar-meta">
          <div><strong>Tiempo:</strong> 3 días</div>
          <span className="lg-sep"/>
          <div><strong>Que Necesitás:</strong> Yerba, agua caliente y una cuchara</div>
        </div>
      </Section>

      <Section tone="cream">
        <div className="lg-curar-pick">
          <Eyebrow>Empezá por acá</Eyebrow>
          <h2 className="lg-h2">¿Qué tipo de mate tenés?</h2>
          <p className="lg-lead">Cada material se cura distinto. Elegí el tuyo:</p>
          <div className="lg-curar-tabs">
            {[
              { id: 'calabaza', label: 'Calabaza', sub: 'El clásico criollo', icon: 'gourd' },
              { id: 'madera', label: 'Madera', sub: 'Algarrobo, palo santo', icon: 'wood' },
              { id: 'otros', label: 'Otros', sub: 'Acero, vidrio, cerámica', icon: 'metal' },
            ].map(t => (
              <button key={t.id} className={'lg-curar-tab' + (tipo === t.id ? ' is-active' : '')} onClick={() => setTipo(t.id)}>
                <CurarIcon name={t.icon}/>
                <div>
                  <div className="lg-curar-tab__l">{t.label}</div>
                  <div className="lg-curar-tab__s">{t.sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        {tipo === 'calabaza' && <CuradoCalabaza/>}
        {tipo === 'madera' && <CuradoMadera/>}
        {tipo === 'otros' && <CuradoOtros/>}
      </Section>

      <Section tone="dark">
        <div className="lg-fh lg-fh--center">
          <div>
            <Eyebrow>Lo que nadie te dice</Eyebrow>
            <h2 className="lg-h2 lg-h2--light">Errores comunes</h2>
          </div>
        </div>
        <div className="lg-mistakes">
          {[
            { t: 'Agua hirviendo', d: 'Mata el mate. Siempre entre 70 y 80°C: cuando empieza a hacer ojitos en el fondo, está.' },
            { t: 'Yerba nueva el primer día', d: 'Usá yerba ya cebada (la del día anterior). La nueva tiene polvo que tapa los poros.' },
            { t: 'Detergente o jabón', d: 'Jamás. El mate se enjuaga solo con agua. El sabor se construye con el uso.' },
            { t: 'Dejarlo con yerba mojada', d: 'Después de matear, vaciá la yerba y dejá secar boca abajo al aire. Si no, se pone feo.' },
            { t: 'Apurar el curado', d: 'Tres días son tres días. Si lo apurás, después agarra gusto a calabaza cruda.' },
            { t: 'Microondas o estufa', d: 'Nunca. El cambio brusco de temperatura raja la calabaza y arruina la madera.' },
          ].map((m, i) => (
            <div key={i} className="lg-mistake">
              <div className="lg-mistake__x">×</div>
              <div>
                <h4 className="lg-mistake__t">{m.t}</h4>
                <p className="lg-mistake__d">{m.d}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="cream">
        <div className="lg-cta-box">
          <div>
            <Eyebrow>Mantenimiento</Eyebrow>
            <h2 className="lg-h2">El mate se cuida todos los días.</h2>
            <p className="lg-lead">Después de cada ronda: vaciar la yerba, enjuagar con agua tibia, secar al aire. Una vez al mes, raspá el interior con la bombilla para sacar la película amarga.</p>
            <p className="lg-caveat" style={{color:'var(--gold-deep)'}}>"Un mate bien cuidado dura una vida."</p>
          </div>
          <Link to="/productos" className="lg-btn lg-btn--dark lg-btn--big">Ver mates</Link>
        </div>
      </Section>
    </>
  );
}

function CuradoStep({ n, titulo, children }) {
  return (
    <div className="lg-cstep">
      <div className="lg-cstep__n">{n}</div>
      <div className="lg-cstep__body">
        <h3 className="lg-cstep__t">{titulo}</h3>
        {children}
      </div>
    </div>
  );
}

function CuradoCalabaza() {
  return (
    <div className="lg-steps-wrap">
      <div className="lg-curar-intro">
        <span className="lg-caveat">Calabaza</span>
        <p>El método tradicional. Tres días de paciencia que te van a dar décadas de buen mate.</p>
      </div>
      <CuradoStep n="01" titulo="Llenalo de yerba usada">
        <p>Llená el mate hasta el borde con yerba <em>ya usada</em>. Si no tenés, podés usar yerba nueva, pero con la usada queda mejor.</p>
        <p>Por arriba, sumale agua caliente (no hirviendo, 70–80°C) hasta que la yerba quede sumergida.</p>
        <div className="lg-step-tip"><strong>Tip del taller:</strong> Mientras se cura, podés ir cebando ahí mismo despacito.</div>
      </CuradoStep>
      <CuradoStep n="02" titulo="Esperá 24 horas">
        <p>Dejalo reposar tapado con un repasador limpio. Al otro día vaciá toda la yerba y, con el filo de una cuchara, <strong>raspá suavemente las paredes internas</strong>.</p>
      </CuradoStep>
      <CuradoStep n="03" titulo="Repetí dos veces más">
        <p>Volvé a llenar con yerba y agua caliente. Esperá otras 24 horas y raspá de nuevo.</p>
        <p>Una tercera vez para terminar. En total son <strong>tres ciclos de 24 horas</strong>.</p>
      </CuradoStep>
      <CuradoStep n="04" titulo="Listo para mateadas">
        <p>Enjuagalo bien con agua caliente, dejalo secar boca abajo sobre un repasador, y ya está.</p>
        <div className="lg-step-tip"><strong>Importante:</strong> Los primeros 10 mates, cambiá el agua del termo varias veces.</div>
      </CuradoStep>
    </div>
  );
}

function CuradoMadera() {
  return (
    <div className="lg-steps-wrap">
      <div className="lg-curar-intro">
        <span className="lg-caveat">Madera</span>
        <p>Los mates de algarrobo, palo santo o quebracho son más rápidos de curar. Un día y andando.</p>
      </div>
      <CuradoStep n="01" titulo="Untalo con grasa por dentro">
        <p>Usá una pizca de <strong>grasa vacuna sin sal</strong> (también sirve manteca) y untá todo el interior. La madera la va absorbiendo.</p>
      </CuradoStep>
      <CuradoStep n="02" titulo="Llenalo con yerba y agua tibia">
        <p>Llenalo con yerba usada y agua <em>tibia</em> (50–60°C). Dejá reposar 4 a 6 horas.</p>
        <div className="lg-step-tip"><strong>Ojo:</strong> con la madera, agua muy caliente al principio puede agrietar la pieza.</div>
      </CuradoStep>
      <CuradoStep n="03" titulo="Vacialo y secalo bien">
        <p>Vaciá la yerba, enjuagá con agua tibia y dejá secar boca abajo <strong>al menos 24 horas</strong>. No lo pongas al sol directo.</p>
      </CuradoStep>
      <CuradoStep n="04" titulo="Primer mate, suave">
        <p>El primer mate, hacelo con agua tibia y yerba suave. A partir del tercer o cuarto uso ya podés subir la temperatura.</p>
      </CuradoStep>
    </div>
  );
}

function CuradoOtros() {
  return (
    <div className="lg-steps-wrap">
      <div className="lg-curar-intro">
        <span className="lg-caveat">Acero, vidrio, cerámica</span>
        <p>La buena noticia: <strong>estos no se curan</strong>. Son materiales inertes que no absorben sabor.</p>
      </div>
      <CuradoStep n="01" titulo="Enjuagalo bien">
        <p>Antes del primer uso, enjuagá con agua caliente y un poquito de bicarbonato. Después, solo agua. Listo.</p>
      </CuradoStep>
      <CuradoStep n="02" titulo="Tomá mate">
        <p>Sí, ya está. No te va a aportar sabor propio, pero tampoco se arruina con yerbas fuertes.</p>
        <div className="lg-step-tip"><strong>Ventaja:</strong> los podés lavar con detergente sin problema.</div>
      </CuradoStep>
    </div>
  );
}

function CurarIcon({ name }) {
  if (name === 'gourd') return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
      <ellipse cx="20" cy="24" rx="12" ry="13"/><ellipse cx="20" cy="12" rx="7" ry="2"/><line x1="20" y1="6" x2="20" y2="11"/>
    </svg>
  );
  if (name === 'wood') return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="10" y="10" width="20" height="22" rx="2"/><path d="M14 14 Q20 22 26 14 M14 22 Q20 30 26 22"/>
    </svg>
  );
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="10" y="8" width="20" height="26" rx="3"/><line x1="10" y1="14" x2="30" y2="14"/>
    </svg>
  );
}
