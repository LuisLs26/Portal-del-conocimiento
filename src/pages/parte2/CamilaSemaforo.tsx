import React, { useState } from 'react';
import { GameHeading } from '../../components/GameHeading';
import { GameProgress } from '../../components/GameProgress';
import { sound } from '../../utils/sound';
import { CAMILA_SEMAFORO_DIMENSIONS, type SemaforoDimension } from '../../data/parte2Data';
import { RotateCcw } from 'lucide-react';

export const CamilaSemaforo: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selections, setSelections] = useState<{ [dimId: number]: 'green' | 'yellow' | 'red' }>({});
  const [notes, setNotes] = useState<{ [dimId: number]: string }>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const total = CAMILA_SEMAFORO_DIMENSIONS.length;
  const currentDim: SemaforoDimension = CAMILA_SEMAFORO_DIMENSIONS[currentIdx];
  const currentSelection = selections[currentDim.id];

  const handleSelectColor = (color: 'green' | 'yellow' | 'red') => {
    sound.pop();
    setSelections(prev => ({ ...prev, [currentDim.id]: color }));
  };

  const handleNext = () => {
    if (!currentSelection || isCompleted) return;
    sound.click();
    if (currentIdx < total - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsCompleted(true);
      sound.fanfare();
    }
  };

  const handleRestart = () => {
    sound.click();
    setCurrentIdx(0);
    setSelections({});
    setNotes({});
    setIsCompleted(false);
  };

  const greenCount = Object.values(selections).filter(c => c === 'green').length;
  const yellowCount = Object.values(selections).filter(c => c === 'yellow').length;
  const redCount = Object.values(selections).filter(c => c === 'red').length;

  return (
    <div className="part-two-game ios-animate-enter">
      <GameHeading 
        title="El semáforo virtual"
        hint="Autoevalúa honestamente tu comprensión para identificar qué temas dominas y cuáles reforzar." 
      />

      <GameProgress value={Object.keys(selections).length} total={total} label="Dimensiones autoevaluadas" />

      {!isCompleted ? (
        <div>
          {/* Dimension Question Card */}
          <div className="ios-card" style={{
            padding: '20px 16px',
            background: '#FFFFFF',
            marginBottom: '16px',
            borderLeft: '4px solid var(--apple-blue)'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--apple-blue)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Dimensión {currentIdx + 1} de {total}: {currentDim.category}
            </span>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35, marginTop: '4px' }}>
              {currentDim.question}
            </h2>
          </div>

          {/* Traffic Light 3 Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {/* Green */}
            <button
              onClick={() => handleSelectColor('green')}
              className="ios-card"
              style={{
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
                background: currentSelection === 'green' ? 'var(--apple-green-tint)' : '#FFFFFF',
                border: currentSelection === 'green' ? '2px solid var(--apple-green)' : '1px solid var(--separator)',
                cursor: 'pointer',
                touchAction: 'manipulation'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--apple-green)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0
              }}>
                🟢
              </div>
              <div>
                <strong style={{ fontSize: '14px', color: 'var(--apple-green)', display: 'block' }}>
                  Verde: Comprendí el tema
                </strong>
                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  {currentDim.greenText}
                </span>
              </div>
            </button>

            {/* Yellow */}
            <button
              onClick={() => handleSelectColor('yellow')}
              className="ios-card"
              style={{
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
                background: currentSelection === 'yellow' ? 'rgba(255, 149, 0, 0.12)' : '#FFFFFF',
                border: currentSelection === 'yellow' ? '2px solid #FF9500' : '1px solid var(--separator)',
                cursor: 'pointer',
                touchAction: 'manipulation'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#FF9500',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0
              }}>
                🟡
              </div>
              <div>
                <strong style={{ fontSize: '14px', color: '#D48800', display: 'block' }}>
                  Amarillo: Tengo algunas dudas
                </strong>
                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  {currentDim.yellowText}
                </span>
              </div>
            </button>

            {/* Red */}
            <button
              onClick={() => handleSelectColor('red')}
              className="ios-card"
              style={{
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
                background: currentSelection === 'red' ? 'var(--apple-red-tint)' : '#FFFFFF',
                border: currentSelection === 'red' ? '2px solid var(--apple-red)' : '1px solid var(--separator)',
                cursor: 'pointer',
                touchAction: 'manipulation'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--apple-red)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0
              }}>
                🔴
              </div>
              <div>
                <strong style={{ fontSize: '14px', color: 'var(--apple-red)', display: 'block' }}>
                  Rojo: Necesito reforzar
                </strong>
                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  {currentDim.redText}
                </span>
              </div>
            </button>
          </div>

          {/* Reflection input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Explica brevemente tu elección (opcional):
            </label>
            <input
              type="text"
              placeholder="¿Qué dudas o certezas tienes en este punto?"
              value={notes[currentDim.id] || ''}
              onChange={e => setNotes(prev => ({ ...prev, [currentDim.id]: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid var(--separator-dark)',
                background: '#FFFFFF',
                fontSize: '13.5px',
                outline: 'none'
              }}
            />
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={!currentSelection}
            className="ios-button ios-button-primary"
            style={{ width: '100%', padding: '13px', fontSize: '15px' }}
          >
            <span>{currentIdx < total - 1 ? 'Siguiente Dimensión' : 'Ver Diagnóstico del Semáforo'}</span>
          </button>
        </div>
      ) : (
        /* Results & Action Plan */
        <div className="ios-animate-enter">
          {/* Summary Card */}
          <div className="ios-card" style={{
            padding: '20px',
            background: '#FFFFFF',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
              Diagnóstico de Autoevaluación
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Mapa formativo de tu preparación pedagógica:
            </p>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '18px' }}>
              <div style={{ flex: 1, padding: '10px', background: 'var(--apple-green-tint)', borderRadius: '12px' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--apple-green)' }}>{greenCount}</div>
                <div style={{ fontSize: '11px', color: 'var(--apple-green)', fontWeight: 600 }}>Dominados</div>
              </div>

              <div style={{ flex: 1, padding: '10px', background: 'rgba(255, 149, 0, 0.12)', borderRadius: '12px' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#FF9500' }}>{yellowCount}</div>
                <div style={{ fontSize: '11px', color: '#FF9500', fontWeight: 600 }}>Por afianzar</div>
              </div>

              <div style={{ flex: 1, padding: '10px', background: 'var(--apple-red-tint)', borderRadius: '12px' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--apple-red)' }}>{redCount}</div>
                <div style={{ fontSize: '11px', color: 'var(--apple-red)', fontWeight: 600 }}>Por reforzar</div>
              </div>
            </div>
          </div>

          {/* Recommendations per dimension */}
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px' }}>
            Ruta de Refuerzo Personalizada:
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {CAMILA_SEMAFORO_DIMENSIONS.map(dim => {
              const sel = selections[dim.id] || 'green';
              const rec = dim.recommendations[sel];
              const colorHex = sel === 'green' ? 'var(--apple-green)' : sel === 'yellow' ? '#FF9500' : 'var(--apple-red)';

              return (
                <div key={dim.id} className="ios-card" style={{ padding: '14px', background: '#FFFFFF', borderLeft: `4px solid ${colorHex}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {dim.category}
                    </span>
                    <span style={{ fontSize: '14px' }}>
                      {sel === 'green' ? '🟢' : sel === 'yellow' ? '🟡' : '🔴'}
                    </span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '2px 0 6px' }}>
                    {rec}
                  </p>
                  {notes[dim.id] && (
                    <div style={{ fontSize: '11.5px', fontStyle: 'italic', color: 'var(--text-tertiary)', background: 'var(--surface-secondary)', padding: '4px 8px', borderRadius: '6px' }}>
                      Tu nota: «{notes[dim.id]}»
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleRestart}
            className="ios-button ios-button-secondary"
            style={{ width: '100%', padding: '12px', fontSize: '14px' }}
          >
            <RotateCcw size={15} />
            <span>Repetir Autoevaluación</span>
          </button>
        </div>
      )}
    </div>
  );
};
