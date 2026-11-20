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
  ChevronRight
} from 'lucide-react';
import { sound } from '../utils/sound';

interface ActivityItem {
  id: string;
  name: string;
  purpose: string;
  icon: React.ReactNode;
  path: string;

}

export const Parte2Hub: React.FC = () => {
  const [filterAuthor, setFilterAuthor] = useState<'all' | 'camila' | 'leidi'>('all');

  const leidiActivities: ActivityItem[] = [
    {
      id: 'leidi-bingo',
      name: 'El bingo de los instrumentos',
      purpose: 'Identificar y marcar en el cartón digital los 5 instrumentos y propiedades cantadas.',
      icon: <Target size={20} color="#FF2D55" strokeWidth={2.2} />,
      path: '/parte-2/leidi/bingo',
    },
    {
      id: 'leidi-detectives',
      name: 'Detectives de errores',
      purpose: 'Encuentra errores en instrumentos de evaluación.',
      icon: <Search size={20} color="#007AFF" strokeWidth={2.2} />,
      path: '/parte-2/leidi/detectives',
    }
  ];

  const camilaActivities: ActivityItem[] = [
    {
      id: 'ruleta',
      name: 'La ruleta del saber',
      purpose: 'Reconocer criterios, descriptores y niveles de logro (C, B, A, AD).',
      icon: <RotateCw size={20} color="#007AFF" strokeWidth={2.2} />,
      path: '/parte-2/camila/ruleta',
    },
    {
      id: 'desafio',
      name: '¡Desafío de conocimientos!',
      purpose: 'Reforzar conceptos de construcción de instrumentos contra el reloj.',
      icon: <Trophy size={20} color="#FF9500" strokeWidth={2.2} />,
      path: '/parte-2/camila/desafio',
    },
    {
      id: 'detectives',
      name: 'Detectives digitales',
      purpose: 'Detecta errores en una rúbrica.',
      icon: <Search size={20} color="#AF52DE" strokeWidth={2.2} />,
      path: '/parte-2/camila/detectives',
    },
    {
      id: 'bingo',
      name: 'Bingo virtual de conceptos',
      purpose: 'Identificar y marcar en el cartón digital los conceptos clave cantados.',
      icon: <Target size={20} color="#FF2D55" strokeWidth={2.2} />,
      path: '/parte-2/camila/bingo',
    },
    {
      id: 'carrera',
      name: 'Carrera contra el tiempo',
      purpose: 'Diferenciar con agilidad rúbricas analíticas y holísticas en situaciones de aula.',
      icon: <Clock size={20} color="#34C759" strokeWidth={2.2} />,
      path: '/parte-2/camila/carrera',
    },
    {
      id: 'experto',
      name: '¿Quién quiere ser un experto en evaluación?',
      purpose: 'Preguntas de dificultad progresiva con 3 comodines hasta el nivel final.',
      icon: <Mic size={20} color="#5856D6" strokeWidth={2.2} />,
      path: '/parte-2/camila/experto',
    },
    {
      id: 'batalla',
      name: 'Batalla de equipos: construye la rúbrica',
      purpose: 'Construir colaborativamente una rúbrica analítica contra el acoso escolar.',
      icon: <Swords size={20} color="#FF9500" strokeWidth={2.2} />,
      path: '/parte-2/camila/batalla',
    },
    {
      id: 'semaforo',
      name: 'El semáforo virtual',
      purpose: 'Autoevaluación formativa con semáforo (Verde, Amarillo, Rojo) y ruta de refuerzo.',
      icon: <Compass size={20} color="#007AFF" strokeWidth={2.2} />,
      path: '/parte-2/camila/semaforo',
    }
  ];

  const groups = [
    { author: 'leidi', name: 'Leidi', week: 9, title: 'Técnicas e instrumentos', activities: leidiActivities },
    { author: 'camila', name: 'Camila', week: 10, title: 'Construcción de instrumentos y rúbricas', activities: camilaActivities },
  ] as const;

  return (
    <section className="part-two" aria-labelledby="part-two-title">
      <header className="part-two-cover">
        <Compass size={36} aria-hidden="true" />
        <h2 id="part-two-title">Evalúa en la práctica</h2>
        <p>10 actividades de las semanas 9 y 10</p>
      </header>
      <div className="part-two-filters" role="group" aria-label="Filtrar por autora">
        {(['all', 'leidi', 'camila'] as const).map(author => (
          <button key={author} type="button" aria-pressed={filterAuthor === author} onClick={() => { sound.click(); setFilterAuthor(author); }}>
            {{ all: 'Todas', leidi: 'Leidi', camila: 'Camila' }[author]}
          </button>
        ))}
      </div>
      {groups.filter(group => filterAuthor === 'all' || filterAuthor === group.author).map(group => (
        <section key={group.author} className="part-two-group" aria-labelledby={group.author + '-title'}>
          <p className="part-two-week">Semana {group.week} · {group.name}</p>
          <h3 id={group.author + '-title'}>{group.title}</h3>
          <div className="part-two-list">
            {group.activities.map(activity => (
              <Link key={activity.id} className="part-two-card ios-card" to={activity.path} onClick={() => sound.click()}>
                <span className="part-two-icon" aria-hidden="true">{activity.icon}</span>
                <div>
                  <strong>{activity.name}</strong>
                  <p>{activity.purpose}</p>
                </div>
                <ChevronRight size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
};
