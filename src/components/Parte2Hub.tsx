import React from 'react';
import { Link } from 'react-router-dom';
import { 
  RotateCw, 
  Trophy, 
  Search, 
  Target, 
  Clock, 
  Mic, 
  Swords, 
  Compass, 
  ChevronRight,
  ArrowLeft,
  Users
} from 'lucide-react';
import { sound } from '../utils/sound';

interface Parte2HubProps {
  onSwitchToPart1: () => void;
}

interface CamilaActivity {
  id: string;
  name: string;
  purpose: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  tag: string;
}

export const Parte2Hub: React.FC<Parte2HubProps> = ({ onSwitchToPart1 }) => {
  const camilaActivities: CamilaActivity[] = [
    {
      id: 'ruleta',
      name: 'Camila. La ruleta del saber 🎡',
      purpose: 'Reconocer criterios, descriptores y niveles de logro (C, B, A, AD).',
      icon: <RotateCw size={20} color="#007AFF" strokeWidth={2.2} />,
      path: '/parte-2/camila/ruleta',
      color: '#007AFF',
      tag: 'Ruleta Interactiva'
    },
    {
      id: 'desafio',
      name: 'Camila. ¡Desafío de conocimientos! 🏆',
      purpose: 'Reforzar conceptos de construcción de instrumentos contra el reloj.',
      icon: <Trophy size={20} color="#FF9500" strokeWidth={2.2} />,
      path: '/parte-2/camila/desafio',
      color: '#FF9500',
      tag: 'Estilo Kahoot'
    },
    {
      id: 'detectives',
      name: 'Camila. Detectives digitales 🔎',
      purpose: 'Auditar e identificar errores pedagógicos en rúbricas defectuosas.',
      icon: <Search size={20} color="#AF52DE" strokeWidth={2.2} />,
      path: '/parte-2/camila/detectives',
      color: '#AF52DE',
      tag: 'Caso de Peritaje'
    },
    {
      id: 'bingo',
      name: 'Camila. Bingo virtual de conceptos 🎯',
      purpose: 'Identificar y marcar en el cartón digital los conceptos clave cantados.',
      icon: <Target size={20} color="#FF2D55" strokeWidth={2.2} />,
      path: '/parte-2/camila/bingo',
      color: '#FF2D55',
      tag: 'Bingo 3×3'
    },
    {
      id: 'carrera',
      name: 'Camila. Carrera contra el tiempo ⏱️',
      purpose: 'Diferenciar con agilidad rúbricas analíticas y holísticas en situaciones de aula.',
      icon: <Clock size={20} color="#34C759" strokeWidth={2.2} />,
      path: '/parte-2/camila/carrera',
      color: '#34C759',
      tag: 'Rápido 45s'
    },
    {
      id: 'experto',
      name: 'Camila. ¿Quién quiere ser un experto en evaluación? 🎤',
      purpose: 'Preguntas de dificultad progresiva con 3 comodines hasta el nivel final.',
      icon: <Mic size={20} color="#5856D6" strokeWidth={2.2} />,
      path: '/parte-2/camila/experto',
      color: '#5856D6',
      tag: 'Nivel Experto'
    },
    {
      id: 'batalla',
      name: 'Camila. Batalla de equipos: construye la rúbrica ⚔️',
      purpose: 'Construir colaborativamente una rúbrica analítica contra el acoso escolar.',
      icon: <Swords size={20} color="#FF9500" strokeWidth={2.2} />,
      path: '/parte-2/camila/batalla',
      color: '#FF9500',
      tag: 'Construcción'
    },
    {
      id: 'semaforo',
      name: 'Camila. El semáforo virtual 🚦',
      purpose: 'Autoevaluación formativa con semáforo (Verde, Amarillo, Rojo) y ruta de refuerzo.',
      icon: <Compass size={20} color="#007AFF" strokeWidth={2.2} />,
      path: '/parte-2/camila/semaforo',
      color: '#007AFF',
      tag: 'Autoevaluación'
    }
  ];

  return (
    <div className="ios-animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Contributor Section Banner */}
      <div className="ios-card" style={{
        padding: '16px 14px',
        background: 'linear-gradient(135deg, #F8FAFE 0%, #EFF4FE 100%)',
        border: '1px solid rgba(0, 122, 255, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--apple-blue)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 800,
            flexShrink: 0
          }}>
            C
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Camila
              </span>
              <span className="part-badge-tag primary">8 actividades</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Actividades lúdicas virtuales de evaluación
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            sound.click();
            onSwitchToPart1();
          }}
          className="ios-button ios-button-secondary"
          style={{ padding: '6px 10px', fontSize: '12px' }}
        >
          <ArrowLeft size={13} />
          <span>Parte 1</span>
        </button>
      </div>

      {/* Activities List */}
      <div style={{
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        paddingLeft: '4px'
      }}>
        Juegos Interactivos de Camila
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {camilaActivities.map((act) => (
          <Link
            key={act.id}
            to={act.path}
            onClick={() => sound.click()}
            className="ios-card activity-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 14px',
              textDecoration: 'none',
              color: 'inherit',
              gap: '14px',
              borderLeftColor: act.color
            }}
          >
            {/* Badge Icon */}
            <div className="activity-badge" style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {act.icon}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: act.color,
                  textTransform: 'uppercase',
                  background: 'var(--surface-secondary)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-pill)'
                }}>
                  {act.tag}
                </span>
              </div>

              <div style={{
                fontSize: '16px',
                lineHeight: 1.3,
                fontWeight: 650,
                color: 'var(--text-primary)',
                marginBottom: '2px'
              }}>
                {act.name}
              </div>

              <div style={{
                fontSize: '12.5px',
                color: 'var(--text-secondary)',
                lineHeight: 1.35
              }}>
                {act.purpose}
              </div>
            </div>

            <ChevronRight size={18} color="var(--text-tertiary)" strokeWidth={2.2} style={{ flexShrink: 0 }} />
          </Link>
        ))}
      </div>

      {/* Ready for more contributors placeholder */}
      <div className="ios-card" style={{
        padding: '16px',
        border: '1.5px dashed var(--separator-dark)',
        background: '#FFFFFF',
        borderRadius: '16px',
        textAlign: 'center',
        marginTop: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          <Users size={16} />
          <strong style={{ fontSize: '13px' }}>Más actividades en camino</strong>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
          Este módulo está listo para recibir las actividades de los siguientes autores en cuanto las compartas.
        </p>
      </div>
    </div>
  );
};
