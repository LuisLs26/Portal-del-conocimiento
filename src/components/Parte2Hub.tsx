import React from 'react';
import { Sparkles, Layers, ArrowLeft, CheckCircle2, PlusCircle, Compass } from 'lucide-react';
import { sound } from '../utils/sound';

interface Parte2HubProps {
  onSwitchToPart1: () => void;
}

export const Parte2Hub: React.FC<Parte2HubProps> = ({ onSwitchToPart1 }) => {
  return (
    <div className="ios-animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* iOS Section Title */}
      <div style={{
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        paddingLeft: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>Parte 2 · Segunda Fase</span>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--apple-blue)',
          background: 'var(--apple-blue-tint)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-pill)'
        }}>
          Nueva Sección
        </span>
      </div>

      {/* Main Status Apple Card */}
      <div className="ios-card" style={{
        padding: '22px 18px',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFE 100%)',
        border: '1px solid rgba(0, 122, 255, 0.15)',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--apple-blue-tint)',
          color: 'var(--apple-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '14px'
        }}>
          <Sparkles size={24} strokeWidth={2.2} />
        </div>

        <h2 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
          marginBottom: '6px'
        }}>
          Parte 2 preparada e independizada
        </h2>

        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: '16px'
        }}>
          La <strong>Parte 1</strong> (las 5 actividades semanales, Maratón multijugador y sus códigos QR) ha quedado 
          completamente protegida y aislada. Esta sección está lista para comenzar a construir las nuevas actividades y dinámicas.
        </p>

        {/* Feature bullets */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '12px 14px',
          background: 'var(--surface-secondary)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '13px',
          color: 'var(--text-primary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="var(--apple-green)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
            <span>Parte 1 resguardada en su propio espacio sin alteraciones.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} color="var(--apple-blue)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
            <span>Espacio limpio y modular para las actividades de la Parte 2.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={16} color="#7a52de" strokeWidth={2.5} style={{ flexShrink: 0 }} />
            <span>Navegación instantánea entre Parte 1 y Parte 2 desde el inicio.</span>
          </div>
        </div>
      </div>

      {/* Workshop / Next Activities Placeholder Card */}
      <div className="ios-card" style={{
        padding: '20px 16px',
        border: '1.5px dashed rgba(0, 122, 255, 0.35)',
        background: '#FFFFFF',
        textAlign: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          margin: '0 auto 10px',
          borderRadius: '50%',
          background: 'var(--apple-blue-tint)',
          color: 'var(--apple-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <PlusCircle size={22} strokeWidth={2.2} />
        </div>

        <h3 style={{
          fontSize: '16px',
          fontWeight: 650,
          color: 'var(--text-primary)',
          marginBottom: '4px'
        }}>
          Listo para tus instrucciones
        </h3>

        <p style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          lineHeight: 1.45,
          maxWidth: '320px',
          margin: '0 auto 16px'
        }}>
          Dime qué actividades, temas, juegos o formatos deseas agregar a esta <strong>Parte 2</strong> y los programamos de inmediato.
        </p>

        <button
          onClick={() => {
            sound.click();
            onSwitchToPart1();
          }}
          className="ios-button ios-button-secondary"
          style={{ width: '100%', padding: '12px', fontSize: '14px' }}
        >
          <ArrowLeft size={16} />
          <span>Volver a las actividades de la Parte 1</span>
        </button>
      </div>
    </div>
  );
};
