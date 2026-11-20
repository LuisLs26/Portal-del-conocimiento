import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, QrCode } from 'lucide-react';
import { sound } from '../utils/sound';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const isQR = location.pathname === '/qr';
  const isParte1 = location.pathname === '/parte-1';
  const isParte2 = location.pathname === '/parte-2';
  
  const matchWeek = location.pathname.match(/\/semana\/(\d+)/);
  const currentWeek = matchWeek ? matchWeek[1] : null;

  const weekTitles: { [key: string]: string } = {
    '1': 'Crucigrama',
    '2': 'Cuestionario',
    '3': 'Relacionar',
    '4': 'Completar',
    '5': 'Sopa de letras',
    '6': 'Maratón'
  };

  const isParte2Activity = location.pathname.startsWith('/parte-2/');
  
  const parte2Info: { [key: string]: { author: string; title: string } } = {
    '/parte-2/camila/ruleta': { author: 'Camila', title: 'La ruleta del saber' },
    '/parte-2/camila/desafio': { author: 'Camila', title: '¡Desafío de conocimientos!' },
    '/parte-2/camila/detectives': { author: 'Camila', title: 'Detectives digitales' },
    '/parte-2/camila/bingo': { author: 'Camila', title: 'Bingo virtual de conceptos' },
    '/parte-2/camila/carrera': { author: 'Camila', title: 'Carrera contra el tiempo' },
    '/parte-2/camila/experto': { author: 'Camila', title: 'Experto en evaluación' },
    '/parte-2/camila/batalla': { author: 'Camila', title: 'Construye la rúbrica' },
    '/parte-2/camila/semaforo': { author: 'Camila', title: 'El semáforo virtual' },
    '/parte-2/leidi/bingo': { author: 'Leidi', title: 'El bingo de los instrumentos' },
    '/parte-2/leidi/detectives': { author: 'Leidi', title: 'Detectives de errores!' }
  };

  const currentParte2Activity = parte2Info[location.pathname];

  const handleBack = () => {
    sound.click();
    if (isParte2Activity) {
      navigate('/?parte=2');
    } else {
      navigate('/');
    }
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
        {(!isHome && !isParte1) ? (
          <button
            onClick={handleBack}
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
            <span style={{ whiteSpace: 'nowrap' }}>{isParte2Activity ? 'Parte 2' : 'Inicio'}</span>
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
        ) : isParte2Activity && currentParte2Activity ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {currentParte2Activity.author}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {currentParte2Activity.title}
            </span>
          </div>
        ) : location.pathname === '/maraton' ? (
          <span style={{ fontSize: '15px', fontWeight: 600 }}>Maratón</span>
        ) : isQR ? (
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Códigos QR
          </span>
        ) : isParte2 ? (
          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Parte 2
          </span>
        ) : isParte1 ? (
          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Parte 1
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
