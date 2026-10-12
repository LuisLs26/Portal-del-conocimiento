import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, QrCode } from 'lucide-react';
import { sound } from '../utils/sound';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const isQR = location.pathname === '/qr';
  
  const matchWeek = location.pathname.match(/\/semana\/(\d+)/);
  const currentWeek = matchWeek ? matchWeek[1] : null;

  const weekTitles: { [key: string]: string } = {
    '1': 'Crucigrama',
    '2': 'Cuestionario',
    '3': 'Relacionar',
    '4': 'Completar',
    '5': 'Sopa de letras'
  };

  return (
    <header className="ios-nav-blur" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
      height: '52px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px'
    }}>
      {/* Left Action: Native Back Chevron */}
      <div style={{ width: '80px', display: 'flex', alignItems: 'center' }}>
        {!isHome ? (
          <button
            onClick={() => {
              sound.click();
              navigate('/');
            }}
            className="ios-button"
            style={{
              padding: '6px 8px',
              background: 'transparent',
              color: 'var(--apple-blue)',
              fontSize: '15px',
              fontWeight: 400,
              gap: '2px'
            }}
          >
            <ChevronLeft size={22} strokeWidth={2.2} />
            <span>Inicio</span>
          </button>
        ) : (
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Libro
          </span>
        )}
      </div>

      {/* Center Title */}
      <div style={{
        flex: 1,
        textAlign: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {currentWeek ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Semana {currentWeek}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {weekTitles[currentWeek]}
            </span>
          </div>
        ) : isQR ? (
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Códigos QR
          </span>
        ) : (
          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Evaluación
          </span>
        )}
      </div>

      {/* Right Action: QR */}
      <div style={{ width: '80px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
        {!isQR && (
          <button
            onClick={() => {
              sound.click();
              navigate('/qr');
            }}
            className="ios-button"
            style={{
              width: '36px',
              height: '36px',
              padding: 0,
              background: 'transparent',
              color: 'var(--apple-blue)'
            }}
            title="Códigos QR"
          >
            <QrCode size={18} strokeWidth={2} />
          </button>
        )}
      </div>
    </header>
  );
};
