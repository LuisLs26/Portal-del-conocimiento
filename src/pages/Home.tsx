import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  CheckCircle2, 
  ChevronRight, 
  QrCode,
  Grid3X3,
  ListChecks,
  Network,
  FileEdit,
  Search,
  Flag,
  BookOpen,
  Gamepad2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { sound } from '../utils/sound';
import { Parte2Hub } from '../components/Parte2Hub';

interface ActivityItem {
  week: number;
  title: string;
  topic: string;
  description: string;
  icon: React.ReactNode;
  path?: string;
}

interface HomeProps {
  defaultPart?: 1 | 2;
}

export const Home: React.FC<HomeProps> = ({ defaultPart }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryPart = searchParams.get('parte');

  const [activePart, setActivePart] = useState<1 | 2>(() => {
    if (defaultPart) return defaultPart;
    if (queryPart === '2') return 2;
    if (queryPart === '1') return 1;
    const saved = localStorage.getItem('portal_active_part');
    return saved === '2' ? 2 : 1;
  });

  const [completedWeeks, setCompletedWeeks] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const completed: { [key: number]: boolean } = {};
    for (let i = 1; i <= 5; i++) {
      completed[i] = localStorage.getItem(`week_${i}_completed`) === 'true';
    }
    setCompletedWeeks(completed);
  }, []);

  const selectPart = (part: 1 | 2) => {
    sound.pop();
    setActivePart(part);
    try {
      localStorage.setItem('portal_active_part', String(part));
    } catch {
      // LocalStorage fallback
    }
    setSearchParams({ parte: String(part) }, { replace: true });
  };

  const activities: ActivityItem[] = [
    {
      week: 1,
      title: 'Crucigrama',
      topic: 'Fundamentos de la evaluación',
      description: '9 conceptos clave sobre tipos y agentes de evaluación.',
      icon: <Grid3X3 size={20} color="var(--apple-blue)" strokeWidth={2} />
    },
    {
      week: 2,
      title: 'Pon a prueba tus conocimientos',
      topic: 'Enfoque por competencias',
      description: '10 preguntas de aplicación y razonamiento crítico.',
      icon: <ListChecks size={20} color="var(--apple-blue)" strokeWidth={2} />
    },
    {
      week: 3,
      title: 'Relaciona los conceptos',
      topic: 'Propósitos y criterios',
      description: '10 parejas organizadas en dos rondas interactivas.',
      icon: <Network size={20} color="var(--apple-blue)" strokeWidth={2} />
    },
    {
      week: 4,
      title: 'Completa el aprendizaje',
      topic: 'Repaso integrador',
      description: '8 términos para insertar en el párrafo clave.',
      icon: <FileEdit size={20} color="var(--apple-blue)" strokeWidth={2} />
    },
    {
      week: 5,
      title: 'Sopa de letras',
      topic: 'Situaciones y evidencias',
      description: '12 palabras para encontrar mediante selección táctil.',
      icon: <Search size={20} color="var(--apple-blue)" strokeWidth={2} />
    },
    {
      week: 6,
      title: 'Maratón',
      topic: 'Carrera de la clase · Multijugador',
      description: 'Lanza el dado, supera retos del libro y compite con hasta 30 estudiantes.',
      path: '/maraton',
      icon: <Flag size={20} color="#7a52de" />
    }
  ];

  return (
    <div className="ios-animate-enter" style={{ padding: '20px 16px 40px' }}>
      {/* iOS App Header */}
      <div style={{ marginBottom: '20px' }}>
        <span style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--apple-blue)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          Libro de Actividades
        </span>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          marginTop: '2px',
          marginBottom: '4px'
        }}>
          Evaluación de los aprendizajes
        </h1>
        <p style={{
          fontSize: '15px',
          color: 'var(--text-secondary)',
          lineHeight: 1.4
        }}>
          Aprende, practica y demuestra tus conocimientos.
        </p>
      </div>

      {/* Botones de Navegación al Inicio: Parte 1 y Parte 2 */}
      <div className="part-switcher-container">
        <div className="part-switcher" role="tablist" aria-label="Secciones del Libro">
          <button
            type="button"
            role="tab"
            aria-selected={activePart === 1}
            onClick={() => selectPart(1)}
            className={`part-switcher-btn ${activePart === 1 ? 'active' : ''}`}
          >
            <BookOpen size={18} strokeWidth={2.2} />
            <span>Parte 1</span>
            <span className="part-badge-tag primary">6 act.</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activePart === 2}
            onClick={() => selectPart(2)}
            className={`part-switcher-btn ${activePart === 2 ? 'active' : ''}`}
          >
            <Sparkles size={18} strokeWidth={2.2} />
            <span>Parte 2</span>
          </button>
        </div>
      </div>

      {activePart === 1 ? (
        <div className="ios-animate-enter">
          {/* iOS Section Title */}
          <div style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            paddingLeft: '4px',
            marginBottom: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Parte 1 · Actividades Semanales</span>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-tertiary)' }}>
              1 a 5 + Maratón
            </span>
          </div>

          {/* 6 Activities Vertical List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activities.map((act) => {
              const isDone = completedWeeks[act.week];

              return (
                <Link
                  key={act.week}
                  to={act.path || `/semana/${act.week}`}
                  onClick={() => sound.click()}
                  className="ios-card activity-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 14px',
                    textDecoration: 'none',
                    color: 'inherit',
                    gap: '14px'
                  }}
                >
                  {/* Left Apple Symbol Badge */}
                  <div className="activity-badge" style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--apple-blue-tint)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {act.icon}
                  </div>

                  {/* Middle Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--apple-blue)',
                        textTransform: 'uppercase'
                      }}>
                        Semana {act.week}
                      </span>
                      {isDone && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          fontSize: '10.5px',
                          fontWeight: 600,
                          color: 'var(--apple-green)',
                          background: 'var(--apple-green-tint)',
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-pill)'
                        }}>
                          <CheckCircle2 size={10} />
                          Hecho
                        </span>
                      )}
                    </div>

                    <div style={{
                      fontSize: '17px',
                      lineHeight: 1.3,
                      fontWeight: 650,
                      color: 'var(--text-primary)',
                      whiteSpace: 'normal',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {act.title}
                    </div>

                    <div style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'normal',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginTop: '1px'
                    }}>
                      {act.topic}
                    </div>
                  </div>

                  {/* Chevron Right */}
                  <ChevronRight size={18} color="var(--text-tertiary)" strokeWidth={2.2} style={{ flexShrink: 0 }} />
                </Link>
              );
            })}
          </div>

          {/* Quick Switcher Callout to Parte 2 */}
          <div style={{ marginTop: '16px' }}>
            <button
              onClick={() => selectPart(2)}
              className="ios-card"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F7FD 100%)',
                border: '1px solid rgba(0, 122, 255, 0.18)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--apple-blue-tint)',
                  color: 'var(--apple-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '14.5px', fontWeight: 650, color: 'var(--text-primary)' }}>
                    Explorar la Parte 2
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    Segunda fase del libro y nuevos contenidos
                  </div>
                </div>
              </div>
              <ArrowRight size={18} color="var(--apple-blue)" />
            </button>
          </div>

          {/* Footer Link to QR Generator */}
          <div style={{ marginTop: '28px', textAlign: 'center' }}>
            <Link
              to="/qr"
              onClick={() => sound.click()}
              className="ios-button ios-button-secondary"
              style={{ width: '100%', padding: '12px', fontSize: '14px' }}
            >
              <QrCode size={16} />
              <span>Ver Códigos QR (Parte 1)</span>
            </Link>
          </div>
        </div>
      ) : (
        <Parte2Hub />
      )}
      <section className="resource-links" aria-labelledby="resource-links-title">
        <h2 id="resource-links-title">Webs educativas</h2>
        {[
          { title: 'Portal del conocimiento', description: 'Actividades interactivas del libro', url: 'https://portal-del-conocimiento.pages.dev/', icon: Grid3X3, theme: 'portal' },
          { title: 'Mario · Aula Aventura', description: 'Aprende jugando', url: 'https://marioluixgame.pages.dev/', icon: Gamepad2, theme: 'adventure' },
          { title: 'Visor Libro', description: 'Lee el PDF como un libro', url: 'https://visorpdfpintado.pages.dev/', icon: BookOpen, theme: 'reader' },
        ].map(({ title, description, url, icon: Icon, theme }) => (
          <a key={url} href={url} target="_blank" rel="noopener noreferrer" className={`ios-card resource-link resource-link--${theme}`} aria-label={`${title} (abre en otra pestaña)`}>
            <span className="resource-link-icon" aria-hidden="true"><Icon size={30} /></span>
            <div><strong>{title}</strong><span>{description}</span></div>
            <span aria-hidden="true" className="resource-link-arrow">↗</span>
          </a>
        ))}
      </section>
    </div>
  );
};
