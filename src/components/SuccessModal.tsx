import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Award, RotateCcw, ArrowRight, Home } from 'lucide-react';
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
  subtitle = 'Has completado con éxito la actividad formativa.',
  weekNumber,
  scoreText,
  onRetry
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      sound.fanfare();
      // Record completion in LocalStorage
      localStorage.setItem(`week_${weekNumber}_completed`, 'true');

      // Trigger Apple-refined confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C5A15A', '#285C4A', '#123D32', '#F8F4E9', '#DFBE76']
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isOpen, weekNumber]);

  if (!isOpen) return null;

  const nextWeek = weekNumber < 5 ? weekNumber + 1 : null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'rgba(18, 61, 50, 0.45)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      animation: 'fadeIn 0.25s var(--ease-apple)'
    }}>
      <div
        className="liquid-glass"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '36px 30px',
          textAlign: 'center',
          boxShadow: '0 24px 64px -8px rgba(18, 61, 50, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.95)',
          background: 'rgba(255, 252, 247, 0.92)'
        }}
      >
        {/* Golden Laurel Icon Badge */}
        <div style={{
          width: '72px',
          height: '72px',
          margin: '0 auto 20px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(197, 161, 90, 0.2), rgba(40, 92, 74, 0.15))',
          border: '1.5px solid var(--dorado-elegante)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--dorado-elegante)',
          boxShadow: '0 8px 24px rgba(197, 161, 90, 0.25)'
        }}>
          <Award size={36} strokeWidth={2} />
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: 'var(--font-editorial)',
          fontSize: '26px',
          fontWeight: 700,
          color: 'var(--verde-oscuro)',
          lineHeight: 1.25,
          marginBottom: '8px'
        }}>
          {title}
        </h2>

        {/* Subtitle */}
        <p style={{
          fontSize: '14px',
          color: 'var(--gris-neutro)',
          lineHeight: 1.5,
          marginBottom: '20px'
        }}>
          {subtitle}
        </p>

        {/* Optional Score / Feedback Pill */}
        {scoreText && (
          <div style={{
            display: 'inline-block',
            padding: '8px 18px',
            marginBottom: '24px',
            borderRadius: 'var(--radius-pill)',
            background: 'rgba(40, 92, 74, 0.08)',
            border: '1px solid rgba(40, 92, 74, 0.2)',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--verde-esmeralda)'
          }}>
            {scoreText}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {nextWeek ? (
            <button
              onClick={() => {
                sound.click();
                navigate(`/semana/${nextWeek}`);
              }}
              className="apple-button apple-button-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}
            >
              <span>Continuar a Semana {nextWeek}</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={() => {
                sound.click();
                navigate('/');
              }}
              className="apple-button apple-button-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}
            >
              <Home size={18} />
              <span>Volver a la Portada</span>
            </button>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                sound.click();
                onRetry();
              }}
              className="apple-button apple-button-secondary"
              style={{ flex: 1, padding: '12px', fontSize: '14px' }}
            >
              <RotateCcw size={16} />
              <span>Volver a intentar</span>
            </button>

            <button
              onClick={() => {
                sound.click();
                navigate('/');
              }}
              className="apple-button apple-button-secondary"
              style={{ flex: 1, padding: '12px', fontSize: '14px' }}
            >
              <Home size={16} />
              <span>Inicio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
