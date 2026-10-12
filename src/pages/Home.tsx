import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  QrCode,
  BookMarked
} from 'lucide-react';
import { sound } from '../utils/sound';

interface ActivityCardData {
  week: number;
  title: string;
  topic: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
}

export const Home: React.FC = () => {
  const [completedWeeks, setCompletedWeeks] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    // Read completed weeks from local storage
    const completed: { [key: number]: boolean } = {};
    for (let i = 1; i <= 5; i++) {
      completed[i] = localStorage.getItem(`week_${i}_completed`) === 'true';
    }
    setCompletedWeeks(completed);
  }, []);

  const activities: ActivityCardData[] = [
    {
      week: 1,
      title: 'Crucigrama',
      topic: 'Fundamentos de la evaluación de los aprendizajes',
      description: 'Resuelve la cuadrícula auténtica identificando los tipos y agentes de la evaluación formativa.',
      accentColor: 'var(--verde-oscuro)',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="4" y="4" width="32" height="32" rx="8" fill="rgba(18, 61, 50, 0.08)" stroke="var(--verde-oscuro)" strokeWidth="1.8" />
          <path d="M4 14.5H36M4 25.5H36M14.5 4V36M25.5 4V36" stroke="var(--verde-oscuro)" strokeWidth="1.2" strokeOpacity="0.4" />
          <rect x="14.5" y="14.5" width="11" height="11" fill="var(--verde-oscuro)" rx="2" />
          <text x="9.5" y="11" fill="var(--verde-oscuro)" fontSize="8" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">E</text>
          <text x="31" y="20" fill="var(--verde-oscuro)" fontSize="8" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">V</text>
          <text x="20" y="31" fill="var(--dorado-elegante)" fontSize="8" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">A</text>
        </svg>
      )
    },
    {
      week: 2,
      title: 'Pon a prueba tus conocimientos',
      topic: 'Evaluación desde el enfoque por competencias',
      description: '10 preguntas de aplicación crítica sobre capacidades, estándares, evidencias y retroalimentación.',
      accentColor: 'var(--dorado-elegante)',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="5" y="6" width="30" height="28" rx="8" fill="rgba(197, 161, 90, 0.1)" stroke="var(--dorado-elegante)" strokeWidth="1.8" />
          <circle cx="13" cy="14" r="3.5" fill="var(--dorado-elegante)" />
          <line x1="20" y1="14" x2="29" y2="14" stroke="var(--gris-oscuro)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="13" cy="22" r="3.5" stroke="var(--gris-neutro)" strokeWidth="1.5" />
          <line x1="20" y1="22" x2="27" y2="22" stroke="var(--gris-neutro)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="13" cy="29" r="2.5" stroke="var(--gris-neutro)" strokeWidth="1.5" />
          <line x1="20" y1="29" x2="25" y2="29" stroke="var(--gris-neutro)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    },
    {
      week: 3,
      title: 'Relaciona los conceptos',
      topic: 'Propósitos y criterios de evaluación',
      description: 'Conecta conceptos fundamentales con sus definiciones correctas a lo largo de dos rondas dinámicas.',
      accentColor: 'var(--verde-esmeralda)',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="4" y="8" width="13" height="10" rx="4" fill="rgba(40, 92, 74, 0.12)" stroke="var(--verde-esmeralda)" strokeWidth="1.6" />
          <rect x="23" y="22" width="13" height="10" rx="4" fill="rgba(40, 92, 74, 0.12)" stroke="var(--verde-esmeralda)" strokeWidth="1.6" />
          <path d="M17 13C22 13 18 27 23 27" stroke="var(--dorado-elegante)" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="3 3" />
          <circle cx="17" cy="13" r="2.5" fill="var(--dorado-elegante)" />
          <circle cx="23" cy="27" r="2.5" fill="var(--dorado-elegante)" />
        </svg>
      )
    },
    {
      week: 4,
      title: 'Completa el aprendizaje',
      topic: 'Repaso integrador por competencias',
      description: 'Inserta los términos pedagógicos en el párrafo clave arrastrando o seleccionando fichas interactivas.',
      accentColor: 'var(--borgona)',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="6" y="5" width="28" height="30" rx="7" fill="rgba(120, 47, 67, 0.08)" stroke="var(--borgona)" strokeWidth="1.8" />
          <line x1="12" y1="12" x2="28" y2="12" stroke="var(--gris-oscuro)" strokeWidth="2" strokeLinecap="round" />
          <rect x="12" y="17" width="16" height="6" rx="3" fill="rgba(120, 47, 67, 0.18)" stroke="var(--borgona)" strokeWidth="1.2" strokeDasharray="2 2" />
          <line x1="12" y1="28" x2="24" y2="28" stroke="var(--gris-oscuro)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      week: 5,
      title: 'Sopa de letras',
      topic: 'Situaciones significativas, criterios y evidencias',
      description: 'Localiza las 12 palabras clave mediante arrastre fluido continuo en una cuadrícula de 16x16.',
      accentColor: 'var(--verde-oscuro)',
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="18" cy="18" r="11" fill="rgba(18, 61, 50, 0.08)" stroke="var(--verde-oscuro)" strokeWidth="1.8" />
          <line x1="26" y1="26" x2="34" y2="34" stroke="var(--dorado-elegante)" strokeWidth="3" strokeLinecap="round" />
          <text x="14" y="15" fill="var(--verde-oscuro)" fontSize="7" fontWeight="bold">A</text>
          <text x="21" y="15" fill="var(--verde-oscuro)" fontSize="7" fontWeight="bold">B</text>
          <text x="14" y="22" fill="var(--verde-oscuro)" fontSize="7" fontWeight="bold">C</text>
          <text x="21" y="22" fill="var(--dorado-elegante)" fontSize="7" fontWeight="bold">D</text>
        </svg>
      )
    }
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 20px 60px' }}>
      {/* Hero Book Presentation */}
      <section 
        className="liquid-glass animate-fade-in"
        style={{
          padding: '48px 36px',
          marginBottom: '40px',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.85)'
        }}
      >
        {/* Subtle Decorative Golden Gradient Glow */}
        <div style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(197, 161, 90, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '720px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: 'rgba(18, 61, 50, 0.07)',
            border: '1px solid rgba(197, 161, 90, 0.35)',
            borderRadius: 'var(--radius-pill)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--verde-oscuro)',
            marginBottom: '18px'
          }}>
            <BookMarked size={14} color="var(--dorado-elegante)" />
            <span>Extensión Digital del Libro Físico</span>
          </div>

          <h1 
            className="font-editorial"
            style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 700,
              color: 'var(--verde-oscuro)',
              lineHeight: 1.15,
              marginBottom: '12px'
            }}
          >
            Evaluación de los aprendizajes
          </h1>

          <p style={{
            fontSize: 'clamp(17px, 2.5vw, 20px)',
            fontStyle: 'italic',
            color: 'var(--dorado-elegante)',
            fontFamily: 'var(--font-editorial)',
            marginBottom: '18px'
          }}>
            Aprende, practica y demuestra tus conocimientos.
          </p>

          <p style={{
            fontSize: '15px',
            color: 'var(--gris-neutro)',
            lineHeight: 1.6,
            maxWidth: '620px',
            marginBottom: '26px'
          }}>
            Bienvenido al portal complementario e interactivo del libro. Selecciona la actividad de tu semana o accede directamente escaneando el código QR impreso en tus páginas de estudio.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              to="/semana/1"
              onClick={() => sound.click()}
              className="apple-button apple-button-primary"
            >
              <span>Comenzar con Semana 1</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/qr"
              onClick={() => sound.click()}
              className="apple-button apple-button-secondary"
            >
              <QrCode size={16} />
              <span>Ver Códigos QR para el libro</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5 Activities Grid Header */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <div>
          <h2 className="font-editorial" style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--verde-oscuro)'
          }}>
            Actividades Semanales
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--gris-neutro)' }}>
            Cinco retos formativos diseñados para consolidar tu aprendizaje
          </p>
        </div>
      </div>

      {/* 5 Activities Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {activities.map((act) => {
          const isDone = completedWeeks[act.week];
          return (
            <Link
              key={act.week}
              to={`/semana/${act.week}`}
              onClick={() => sound.click()}
              className="liquid-glass"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '26px 24px',
                textDecoration: 'none',
                color: 'inherit',
                border: isDone ? '1px solid rgba(45, 138, 91, 0.4)' : '1px solid var(--glass-border)',
                position: 'relative'
              }}
            >
              {/* Card Top: Week Badge & Icon */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'rgba(18, 61, 50, 0.06)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--verde-oscuro)'
                  }}>
                    <Sparkles size={12} color="var(--dorado-elegante)" />
                    <span>Semana {act.week}</span>
                  </div>

                  {isDone && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--verde-exito)',
                      background: 'rgba(45, 138, 91, 0.1)',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-pill)'
                    }}>
                      <CheckCircle2 size={13} />
                      <span>Completado</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
                  <div style={{ flexShrink: 0 }}>
                    {act.icon}
                  </div>
                  <div>
                    <h3 style={{
                      fontFamily: 'var(--font-editorial)',
                      fontSize: '20px',
                      fontWeight: 700,
                      color: 'var(--verde-oscuro)',
                      lineHeight: 1.2
                    }}>
                      {act.title}
                    </h3>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--dorado-elegante)'
                    }}>
                      {act.topic}
                    </span>
                  </div>
                </div>

                <p style={{
                  fontSize: '13px',
                  color: 'var(--gris-neutro)',
                  lineHeight: 1.5,
                  marginBottom: '20px'
                }}>
                  {act.description}
                </p>
              </div>

              {/* Card Action Link */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '14px',
                borderTop: '1px solid rgba(18, 61, 50, 0.07)'
              }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--verde-oscuro)'
                }}>
                  {isDone ? 'Volver a practicar' : 'Iniciar actividad'}
                </span>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(18, 61, 50, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--verde-oscuro)'
                }}>
                  <ArrowRight size={15} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
