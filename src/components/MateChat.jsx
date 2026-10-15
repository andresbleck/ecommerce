import { useEffect, useRef, useState } from 'react';
import { createChat } from '@n8n/chat';
import '@n8n/chat/style.css';

const WEBHOOK_URL = import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL;

export function MateChat() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const chatRef = useRef(null);

  // Montar el chat de n8n una sola vez dentro del panel
  useEffect(() => {
    if (!WEBHOOK_URL || !containerRef.current || chatRef.current) return;
    chatRef.current = createChat({
      webhookUrl: WEBHOOK_URL,
      target: containerRef.current,
      mode: 'fullscreen',
      showWelcomeScreen: false,
      loadPreviousSession: false,
      defaultLanguage: 'en',
      initialMessages: ['¡Hola! 🧉 Soy el asistente de La Gauchada. ¿En qué te puedo ayudar?'],
      i18n: {
        en: {
          title: 'La Gauchada',
          subtitle: 'Te respondemos al toque',
          footer: '',
          getStarted: 'Nueva conversación',
          inputPlaceholder: 'Escribí tu consulta...',
          closeButtonTooltip: 'Cerrar',
        },
      },
    });
    return () => {
      chatRef.current?.unmount();
      chatRef.current = null;
    };
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!WEBHOOK_URL) {
    console.warn('[MateChat] Falta VITE_N8N_CHAT_WEBHOOK_URL, el chat no se muestra.');
    return null;
  }

  return (
    <>
      <div className={'lg-chat__panel' + (open ? '' : ' lg-chat__panel--hidden')} aria-hidden={!open}>
        <button className="lg-chat__close" onClick={() => setOpen(false)} aria-label="Cerrar chat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
        <div ref={containerRef} className="lg-chat__body"/>
      </div>
      <button
        className={'lg-chat__bubble' + (open ? ' lg-chat__bubble--open' : '')}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Cerrar chat' : 'Abrir chat'}
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        ) : (
          <MateIcon/>
        )}
      </button>
    </>
  );
}

function MateIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 64 64" aria-hidden="true">
      {/* bombilla */}
      <path d="M38 4 L32 30" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round"/>
      <rect x="35" y="2" width="7" height="4" rx="1.5" transform="rotate(14 38 4)" fill="var(--gold)"/>
      {/* yerba */}
      <ellipse cx="32" cy="24" rx="13" ry="3.5" fill="var(--green-mid)"/>
      {/* calabaza */}
      <path d="M19 24 C 12 30, 10 40, 14 48 C 18 56, 26 60, 32 60 C 38 60, 46 56, 50 48 C 54 40, 52 30, 45 24 Z" fill="var(--wood-mid)"/>
      {/* virola */}
      <path d="M18 22 h28 a2 2 0 0 1 2 2 v2 a2 2 0 0 1 -2 2 h-28 a2 2 0 0 1 -2 -2 v-2 a2 2 0 0 1 2 -2 z" fill="var(--gold)"/>
      {/* brillo */}
      <path d="M21 34 C 18 40, 19 47, 23 52" stroke="var(--wood-light)" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".8"/>
    </svg>
  );
}
