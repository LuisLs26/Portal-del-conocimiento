import React, { useState } from 'react';
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

interface ActivityItem {
  id: string;
  name: string;
  purpose: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  tag: string;
  author: 'camila' | 'leidi';
}

export const Parte2Hub: React.FC<Parte2HubProps> = ({ onSwitchToPart1 }) => {
  const [filterAuthor, setFilterAuthor] = useState<'all' | 'camila' | 'leidi'>('all');

  const leidiActivities: ActivityItem[] = [
    {
      id: 'leidi-bingo',
      name: 'Leidi. El bingo de los instrumentos 🎯',
      purpose: 'Semana 9: Identificar y marcar en el cartón digital los 5 instrumentos y propiedades cantadas.',
      icon: <Target size={20} color="#FF2D55" strokeWidth={2.2} />,
      path: '/parte-2/leidi/bingo',
      color: '#FF2D55',
      tag: 'Bingo 3×3',
      author: 'leidi'
    },
    {
      id: 'leidi-detectives',
      name: 'Leidi. Detectives de errores! 🔎',
      purpose: 'Semana 9: Auditar pericialmente listas de cotejo, escalas, guías y rúbricas defectuosas.',
      icon: <Search size={20} color="#007AFF" strokeWidth={2.2} />,
      path: '/parte-2/leidi/detectives',
      color: '#007AFF',
      tag: 'Auditoría Pericial',
      author: 'leidi'
    }
  ];

  const camilaActivities: ActivityItem[] = [
    {
      id: 'ruleta',
      name: 'Camila. La ruleta del saber 🎡',
      purpose: 'Semana 10: Reconocer criterios, descriptores y niveles de logro (C, B, A, AD).',
      icon: <RotateCw size={20} color="#007AFF" strokeWidth={2.2} />,
      path: '/parte-2/camila/ruleta',
      color: '#007AFF',
      tag: 'Ruleta Interactiva',
      author: 'camila'
    },
    {
      id: 'desafio',
      name: 'Camila. ¡Desafío de conocimientos! 🏆',
      purpose: 'Semana 10: Reforzar conceptos de construcción de instrumentos contra el reloj.',
      icon: <Trophy size={20} color="#FF9500" strokeWidth={2.2} />,
      path: '/parte-2/camila/desafio',
      color: '#FF9500',
      tag: 'Estilo Kahoot',
      author: 'camila'
    },
    {
      id: 'detectives',
      name: 'Camila. Detectives digitales 🔎',
      purpose: 'Semana 10: Auditar e identificar errores pedagógicos en rúbricas defectuosas.',
      icon: <Search size={20} color="#AF52DE" strokeWidth={2.2} />,
      path: '/parte-2/camila/detectives',
      color: '#AF52DE',
      tag: 'Caso de Peritaje',
      author: 'camila'
    },
    {
      id: 'bingo',
      name: 'Camila. Bingo virtual de conceptos 🎯',
      purpose: 'Semana 10: Identificar y marcar en el cartón digital los conceptos clave cantados.',
      icon: <Target size={20} color="#FF2D55" strokeWidth={2.2} />,
      path: '/parte-2/camila/bingo',
      color: '#FF2D55',
      tag: 'Bingo 3×3',
      author: 'camila'
    },
    {
      id: 'carrera',
      name: 'Camila. Carrera contra el tiempo ⏱️',
      purpose: 'Semana 10: Diferenciar con agilidad rúbricas analíticas y holísticas en situaciones de aula.',
      icon: <Clock size={20} color="#34C759" strokeWidth={2.2} />,
      path: '/parte-2/camila/carrera',
      color: '#34C759',
      tag: 'Rápido 45s',
      author: 'camila'
    },
    {
      id: 'experto',
      name: 'Camila. ¿Quién quiere ser un experto en evaluación? 🎤',
      purpose: 'Semana 10: Preguntas de dificultad progresiva con 3 comodines hasta el nivel final.',
      icon: <Mic size={20} color="#5856D6" strokeWidth={2.2} />,
      path: '/parte-2/camila/experto',
      color: '#5856D6',
      tag: 'Nivel Experto',
      author: 'camila'
    },
    {
      id: 'batalla',
      name: 'Camila. Batalla de equipos: construye la rúbrica ⚔️',
      purpose: 'Semana 10: Construir colaborativamente una rúbrica analítica contra el acoso escolar.',
      icon: <Swords size={20} color="#FF9500" strokeWidth={2.2} />,
      path: '/parte-2/camila/batalla',
      color: '#FF9500',
      tag: 'Construcción',
      author: 'camila'
    },
    {
      id: 'semaforo',
      name: 'Camila. El semáforo virtual 🚦',
      purpose: 'Semana 10: Autoevaluación formativa con semáforo (Verde, Amarillo, Rojo) y ruta de refuerzo.',
      icon: <Compass size={20} color="#007AFF" strokeWidth={2.2} />,
      path: '/parte-2/camila/semaforo',
      color: '#007AFF',
      tag: 'Autoevaluación',
      author: 'camila'
    }
  ];

  return (
    <div className="ios-animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Banner with Parte 1 Back Button */}
      <div className="ios-card" style={{
        padding: '14px 14px',
        background: 'linear-gradient(135deg, #F8FAFE 0%, #EFF4FE 100%)',
        border: '1px solid rgba(0, 122, 255, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Parte 2: Nuevas Actividades
            </span>
            <span className="part-badge-tag primary">10 juegos</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Basadas en los Módulos del libro digital
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

      {/* Author Filter Segmented Pill Control */}
      <div style={{
        display: 'flex',
        background: '#E5E5EA',
        padding: '3px',
        borderRadius: 'var(--radius-pill)',
        gap: '2px'
      }}>
        <button
          onClick={() => {
            sound.click();
            setFilterAuthor('all');
          }}
          style={{
            flex: 1,
            padding: '7px 8px',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            background: filterAuthor === 'all' ? '#FFFFFF' : 'transparent',
            color: filterAuthor === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontSize: '12.5px',
            fontWeight: filterAuthor === 'all' ? 700 : 500,
            cursor: 'pointer',
            boxShadow: filterAuthor === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          Todos (10)
        </button>

        <button
          onClick={() => {
            sound.click();
            setFilterAuthor('leidi');
          }}
          style={{
            flex: 1,
            padding: '7px 8px',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            background: filterAuthor === 'leidi' ? '#FFFFFF' : 'transparent',
            color: filterAuthor === 'leidi' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontSize: '12.5px',
            fontWeight: filterAuthor === 'leidi' ? 700 : 500,
            cursor: 'pointer',
            boxShadow: filterAuthor === 'leidi' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          🔎 Leidi (2)
        </button>

        <button
          onClick={() => {
            sound.click();
            setFilterAuthor('camila');
          }}
          style={{
            flex: 1,
            padding: '7px 8px',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            background: filterAuthor === 'camila' ? '#FFFFFF' : 'transparent',
            color: filterAuthor === 'camila' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontSize: '12.5px',
            fontWeight: filterAuthor === 'camila' ? 700 : 500,
            cursor: 'pointer',
            boxShadow: filterAuthor === 'camila' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          👩‍🏫 Camila (8)
        </button>
      </div>

      {/* SECTION: LEIDI */}
      {(filterAuthor === 'all' || filterAuthor === 'leidi') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '4px' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: '#FF2D55',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 800
            }}>
              L
            </div>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Leidi
              </span>
              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                Semana 9: Técnicas e Instrumentos de Evaluación (Págs. 84-93)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {leidiActivities.map((act) => (
              <Link
                key={act.id}
                to={act.path}
                onClick={() => sound.click()}
                className="ios-card activity-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px 14px',
                  textDecoration: 'none',
                  color: 'inherit',
                  gap: '14px',
                  borderLeftColor: act.color
                }}
              >
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

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{
                      fontSize: '10px',
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
                    fontSize: '15.5px',
                    lineHeight: 1.3,
                    fontWeight: 650,
                    color: 'var(--text-primary)',
                    marginBottom: '2px'
                  }}>
                    {act.name}
                  </div>

                  <div style={{
                    fontSize: '12px',
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
        </div>
      )}

      {/* SECTION: CAMILA */}
      {(filterAuthor === 'all' || filterAuthor === 'camila') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: filterAuthor === 'all' ? '10px' : '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '4px' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'var(--apple-blue)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 800
            }}>
              C
            </div>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Camila
              </span>
              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                Semana 10: Construcción de Instrumentos y Rúbricas (Págs. 95-125)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {camilaActivities.map((act) => (
              <Link
                key={act.id}
                to={act.path}
                onClick={() => sound.click()}
                className="ios-card activity-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px 14px',
                  textDecoration: 'none',
                  color: 'inherit',
                  gap: '14px',
                  borderLeftColor: act.color
                }}
              >
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

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{
                      fontSize: '10px',
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
                    fontSize: '15.5px',
                    lineHeight: 1.3,
                    fontWeight: 650,
                    color: 'var(--text-primary)',
                    marginBottom: '2px'
                  }}>
                    {act.name}
                  </div>

                  <div style={{
                    fontSize: '12px',
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
        </div>
      )}

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
          <strong style={{ fontSize: '13px' }}>Más autores en camino</strong>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
          Este módulo está preparado para recibir más actividades pedagógicas de tus compañeros.
        </p>
      </div>
    </div>
  );
};
