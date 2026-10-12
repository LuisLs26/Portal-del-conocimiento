import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, RotateCcw, ArrowRight, Home } from 'lucide-react';
import { sound } from '../utils/sound';

interface SuccessModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  weekNumber: number;
  scoreText?: string;
  onRetry: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  title = '¡Excelente trabajo!',
  subtitle = 'Has completado con éxito la actividad.',
  weekNumber,
  scoreText,
  onRetry
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = new URLSearchParams(location.search).get('modo') === 'actividad' ? '?modo=actividad' : '';
  const retryTouch = useRef<{ x: number; y: number; pointer: number } | null>(null);
  const retryHandled = useRef(false);

  useEffect(() => {
    if (isOpen) {
      sound.fanfare();
      try { localStorage.setItem(`week_${weekNumber}_completed`, 'true'); } catch { /* Completion still works without storage. */ }

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          disableForReducedMotion: true,
          colors: ['#007AFF', '#5856D6', '#FF9500']
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isOpen, weekNumber]);

  if (!isOpen) return null;

  const nextWeek = weekNumber < 5 ? weekNumber + 1 : null;

  return (
    <div role="dialog" aria-modal="true" aria-label={title} style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.4)',
      animation: 'fadeIn 220ms var(--ease-ios)'
    }}>
      <div
        className="ios-card ios-animate-enter"
        style={{
          width: '100%',
          maxWidth: '430px',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          padding: '28px 20px 36px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-floating)',
          background: '#FFFFFF'
        }}
      >
        {/* Apple iOS Pull indicator bar */}
        <div style={{
          width: '36px',
          height: '4px',
          borderRadius: '2px',
          background: 'var(--separator)',
          margin: '-12px auto 20px'
        }} />

        {/* Apple Green Success Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          margin: '0 auto 14px',
          borderRadius: '50%',
          background: 'var(--apple-green-tint)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--apple-green)'
        }}>
          <CheckCircle2 size={32} strokeWidth={2.2} />
        </div>

        {/* Title & Subtitle */}
        <h2 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.25,
          marginBottom: '6px'
        }}>
          {title}
        </h2>

        <p style={{
          fontSize: '13.5px',
          color: 'var(--text-secondary)',
          lineHeight: 1.45,
          marginBottom: '16px'
        }}>
          {subtitle}
        </p>

        {scoreText && (
          <div style={{
            display: 'inline-block',
            padding: '6px 14px',
            marginBottom: '20px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--surface-secondary)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-primary)'
          }}>
            {scoreText}
          </div>
        )}

        {/* iOS Native Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {nextWeek ? (
            <button
              onClick={() => {
                sound.click();
                navigate(`/semana/${nextWeek}${mode}`);
              }}
              className="ios-button ios-button-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}
            >
              <span>Continuar a Semana {nextWeek}</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => {
                sound.click();
                navigate('/');
              }}
              className="ios-button ios-button-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}
            >
              <Home size={16} />
              <span>Volver a la Portada</span>
            </button>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onPointerDown={event => {
                retryHandled.current = false;
                if (event.pointerType === 'touch') retryTouch.current = { x: event.clientX, y: event.clientY, pointer: event.pointerId };
              }}
              onPointerCancel={() => { retryTouch.current = null; }}
              onPointerUp={event => {
                const start = retryTouch.current;
                retryTouch.current = null;
                if (!start || start.pointer !== event.pointerId || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 12) return;
                event.preventDefault();
                retryHandled.current = true;
                sound.click(); onRetry();
              }}
              onClick={() => {
                if (retryHandled.current) { retryHandled.current = false; return; }
                sound.click();
                onRetry();
              }}
              className="ios-button ios-button-secondary"
              style={{ flex: 1, padding: '12px', fontSize: '14px' }}
            >
              <RotateCcw size={15} />
              <span>Volver a jugar</span>
            </button>

            <button
              onClick={() => {
                sound.click();
                navigate('/');
              }}
              className="ios-button ios-button-secondary"
              style={{ flex: 1, padding: '12px', fontSize: '14px' }}
            >
              <Home size={15} />
              <span>Inicio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
