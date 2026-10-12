import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, ChevronLeft, Volume2, VolumeX, QrCode, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [soundActive, setSoundActive] = useState<boolean>(sound.isEnabled());

  useEffect(() => {
    setSoundActive(sound.isEnabled());
  }, []);

  const toggleSound = () => {
    const next = !soundActive;
    sound.setEnabled(next);
    setSoundActive(next);
    if (next) sound.click();
  };

  const isHome = location.pathname === '/';
  const isQR = location.pathname === '/qr';
  
  // Extract week number if in /semana/:id
  const matchWeek = location.pathname.match(/\/semana\/(\d+)/);
  const currentWeek = matchWeek ? matchWeek[1] : null;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '12px 16px',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%'
    }}>
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 18px',
        background: 'rgba(255, 252, 247, 0.82)',
        backdropFilter: 'blur(24px) saturate(190%)',
        WebkitBackdropFilter: 'blur(24px) saturate(190%)',
        border: '1px solid rgba(255, 255, 255, 0.75)',
        boxShadow: '0 8px 30px -4px rgba(18, 61, 50, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.95)',
        borderRadius: 'var(--radius-pill)',
        transition: 'all 0.2s var(--ease-apple)'
      }}>
        {/* Left side: Back button or Book brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!isHome ? (
            <button
              onClick={() => {
                sound.click();
                navigate('/');
              }}
              className="apple-button"
              style={{
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: 600,
                background: 'rgba(18, 61, 50, 0.06)',
                color: 'var(--verde-oscuro)',
                border: '1px solid rgba(18, 61, 50, 0.08)',
                gap: '4px'
              }}
              title="Volver a la página principal"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
              <span>Inicio</span>
            </button>
          ) : (
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                color: 'inherit'
              }}
              onClick={() => sound.click()}
            >
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--verde-oscuro), var(--verde-esmeralda))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--dorado-brillo)',
                boxShadow: '0 3px 8px rgba(18, 61, 50, 0.25)'
              }}>
                <BookOpen size={18} strokeWidth={2.2} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{
                  fontFamily: 'var(--font-editorial)',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--verde-oscuro)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15
                }}>
                  Evaluación de los aprendizajes
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  color: 'var(--dorado-elegante)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}>
                  Actividades Interactivas
                </span>
              </div>
            </Link>
          )}
        </div>

        {/* Center: Week badge if on week route */}
        {currentWeek && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            background: 'linear-gradient(135deg, rgba(197, 161, 90, 0.15), rgba(40, 92, 74, 0.1))',
            border: '1px solid rgba(197, 161, 90, 0.3)',
            borderRadius: 'var(--radius-pill)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--verde-oscuro)'
          }}>
            <Sparkles size={13} color="var(--dorado-elegante)" />
            <span>Semana {currentWeek}</span>
          </div>
        )}

        {/* Right side: Sound toggle & QR generator link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={toggleSound}
            className="apple-button"
            style={{
              width: '36px',
              height: '36px',
              padding: 0,
              borderRadius: '50%',
              background: soundActive ? 'rgba(197, 161, 90, 0.16)' : 'rgba(0, 0, 0, 0.04)',
              color: soundActive ? 'var(--dorado-elegante)' : 'var(--gris-neutro)',
              border: soundActive ? '1px solid rgba(197, 161, 90, 0.3)' : '1px solid transparent'
            }}
            title={soundActive ? 'Desactivar efectos de sonido' : 'Activar efectos de sonido'}
          >
            {soundActive ? <Volume2 size={16} strokeWidth={2.2} /> : <VolumeX size={16} strokeWidth={2.2} />}
          </button>

          <Link
            to="/qr"
            className="apple-button"
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 600,
              background: isQR ? 'var(--verde-oscuro)' : 'rgba(18, 61, 50, 0.08)',
              color: isQR ? 'var(--blanco-calido)' : 'var(--verde-oscuro)',
              border: isQR ? '1px solid var(--dorado-elegante)' : '1px solid rgba(18, 61, 50, 0.1)',
              gap: '6px'
            }}
            onClick={() => sound.click()}
            title="Códigos QR para el libro impreso"
          >
            <QrCode size={15} strokeWidth={2.2} />
            <span style={{ display: 'inline' }}>Códigos QR</span>
          </Link>
        </div>
      </nav>
    </header>
  );
};
