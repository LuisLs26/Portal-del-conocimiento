import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, QrCode } from 'lucide-react';
import { sound } from '../utils/sound';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      maxWidth: '1200px',
      margin: '40px auto 20px',
      padding: '0 20px',
      width: '100%'
    }}>
      <div style={{
        padding: '24px 28px',
        background: 'rgba(255, 252, 247, 0.65)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.7)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 4px 20px rgba(18, 61, 50, 0.04)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--verde-oscuro)',
            color: 'var(--dorado-brillo)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BookOpen size={16} />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--verde-oscuro)'
            }}>
              Evaluación de los aprendizajes
            </div>
            <div style={{ fontSize: '12px', color: 'var(--gris-neutro)' }}>
              Recurso digital pedagógico para actividades formativas semanales
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map((w) => (
              <Link
                key={w}
                to={`/semana/${w}`}
                onClick={() => sound.click()}
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(18, 61, 50, 0.05)',
                  color: 'var(--verde-oscuro)',
                  textDecoration: 'none',
                  transition: 'background 0.15s ease'
                }}
              >
                Semana {w}
              </Link>
            ))}
          </div>

          <Link
            to="/qr"
            onClick={() => sound.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--dorado-elegante)',
              textDecoration: 'none'
            }}
          >
            <QrCode size={14} />
            <span>Centro de Códigos QR</span>
          </Link>
        </div>
      </div>
      <div style={{
        textAlign: 'center',
        fontSize: '11px',
        color: 'var(--gris-neutro)',
        marginTop: '16px',
        paddingBottom: '24px'
      }}>
        Diseñado para interacción directa y escaneo QR desde dispositivos móviles.
      </div>
    </footer>
  );
};
