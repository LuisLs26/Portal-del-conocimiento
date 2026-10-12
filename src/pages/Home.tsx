import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  ChevronRight, 
  QrCode,
  Grid3X3,
  ListChecks,
  Network,
  FileEdit,
  Search,
  Flag
} from 'lucide-react';
import { sound } from '../utils/sound';

interface ActivityItem {
  week: number;
  title: string;
  topic: string;
  description: string;
  icon: React.ReactNode;
  path?: string;
}

export const Home: React.FC = () => {
  const [completedWeeks, setCompletedWeeks] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const completed: { [key: number]: boolean } = {};
    for (let i = 1; i <= 5; i++) {
      completed[i] = localStorage.getItem(`week_${i}_completed`) === 'true';
    }
    setCompletedWeeks(completed);
  }, []);

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
    { week: 6, title: 'Maratón', topic: 'Carrera de la clase · Multijugador', description: 'Lanza el dado, supera retos del libro y compite con hasta 30 estudiantes.', path: '/maraton', icon: <Flag size={20} color="#7a52de" /> }
  ];

  return (
    <div className="ios-animate-enter" style={{ padding: '20px 16px 40px' }}>
      {/* iOS App Header */}
      <div style={{ marginBottom: '24px' }}>
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

      {/* iOS Section Title */}
      <div style={{
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        paddingLeft: '4px',
        marginBottom: '10px'
      }}>
        Actividades Semanales
      </div>

      {/* 5 Activities Vertical List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {activities.map((act) => {
          const isDone = completedWeeks[act.week];

          return (
            <Link
              key={act.week}
              to={act.path || `/semana/${act.week}`}
              onClick={() => sound.click()}
              className="ios-card"
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
              <div style={{
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
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {act.title}
                </div>

                <div style={{
                  fontSize: '12.5px',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
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

      {/* Footer Link to QR Generator */}
      <div style={{ marginTop: '28px', textAlign: 'center' }}>
        <Link
          to="/qr"
          onClick={() => sound.click()}
          className="ios-button ios-button-secondary"
          style={{ width: '100%', padding: '12px', fontSize: '14px' }}
        >
          <QrCode size={16} />
          <span>Ver Códigos QR para el Libro</span>
        </Link>
      </div>
    </div>
  );
};
