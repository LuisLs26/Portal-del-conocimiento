import React, { useState, useEffect, useRef } from 'react';
import { MATCHING_PAIRS, type ConceptPair } from '../data/matchingData';
import { SuccessModal } from '../components/SuccessModal';
import { sound } from '../utils/sound';
import { Sparkles, ArrowRight, RotateCcw, Check, AlertCircle } from 'lucide-react';

interface MatchedLink {
  conceptId: number;
  definitionId: number;
}

export const Semana3Matching: React.FC = () => {
  const [currentRound, setCurrentRound] = useState<1 | 2>(1);
  const [selectedConcept, setSelectedConcept] = useState<number | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<number | null>(null);
  
  // Confirmed matches in current round
  const [matches, setMatches] = useState<MatchedLink[]>([]);
  // Shuffled definitions for current round
  const [shuffledDefs, setShuffledDefs] = useState<ConceptPair[]>([]);
  
  // Feedback message when wrong
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const conceptRefs = useRef<{ [id: number]: HTMLDivElement | null }>({});
  const defRefs = useRef<{ [id: number]: HTMLDivElement | null }>({});

  const roundPairs = MATCHING_PAIRS.filter((p) => p.round === currentRound);

  // Initialize round and shuffle definitions
  useEffect(() => {
    const list = MATCHING_PAIRS.filter((p) => p.round === currentRound);
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    setShuffledDefs(shuffled);
    setMatches([]);
    setSelectedConcept(null);
    setSelectedDefinition(null);
    setErrorMessage(null);
  }, [currentRound]);

  // Handle concept card click
  const handleSelectConcept = (id: number) => {
    sound.pop();
    setErrorMessage(null);
    if (matches.some((m) => m.conceptId === id)) return; // Already paired

    if (selectedConcept === id) {
      setSelectedConcept(null);
      return;
    }

    setSelectedConcept(id);

    // If definition was already selected, evaluate match
    if (selectedDefinition !== null) {
      evaluatePair(id, selectedDefinition);
    }
  };

  // Handle definition card click
  const handleSelectDefinition = (id: number) => {
    sound.pop();
    setErrorMessage(null);
    if (matches.some((m) => m.definitionId === id)) return; // Already paired

    if (selectedDefinition === id) {
      setSelectedDefinition(null);
      return;
    }

    setSelectedDefinition(id);

    // If concept was already selected, evaluate match
    if (selectedConcept !== null) {
      evaluatePair(selectedConcept, id);
    }
  };

  // Evaluate if paired concept and definition match
  const evaluatePair = (cId: number, dId: number) => {
    if (cId === dId) {
      // Correct match!
      sound.success();
      const nextMatches = [...matches, { conceptId: cId, definitionId: dId }];
      setMatches(nextMatches);
      setSelectedConcept(null);
      setSelectedDefinition(null);
      setErrorMessage(null);

      // Check if current round completed
      if (nextMatches.length === roundPairs.length) {
        if (currentRound === 1) {
          // Transition to round 2 after brief pause
          setTimeout(() => {
            setCurrentRound(2);
          }, 800);
        } else {
          // Both rounds completed!
          setTimeout(() => {
            setIsSuccessModalOpen(true);
          }, 600);
        }
      }
    } else {
      // Mismatch
      sound.error();
      const conceptObj = roundPairs.find((p) => p.id === cId);
      setErrorMessage(
        `Esa no es la definición exacta de "${conceptObj?.concept}". ¡Intenta relacionarlo con otra opción!`
      );
      setSelectedConcept(null);
      setSelectedDefinition(null);
    }
  };

  const handleRestart = () => {
    sound.click();
    setCurrentRound(1);
    setIsSuccessModalOpen(false);
  };

  // Compute total progress across both rounds
  const totalCompleted = (currentRound === 1 ? matches.length : 5 + matches.length);

  return (
    <div 
      ref={containerRef}
      style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px 16px 60px' }}
    >
      {/* Activity Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 14px',
          background: 'rgba(18, 61, 50, 0.08)',
          borderRadius: 'var(--radius-pill)',
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--verde-oscuro)',
          marginBottom: '10px'
        }}>
          <Sparkles size={13} color="var(--dorado-elegante)" />
          <span>Semana 3 • Ronda {currentRound} de 2</span>
        </div>

        <h1 className="font-editorial" style={{
          fontSize: 'clamp(26px, 4vw, 36px)',
          fontWeight: 700,
          color: 'var(--verde-oscuro)',
          lineHeight: 1.2,
          marginBottom: '6px'
        }}>
          Relaciona Conceptos y Definiciones
        </h1>

        <p style={{ fontSize: '14px', color: 'var(--gris-neutro)', maxWidth: '640px', margin: '0 auto' }}>
          Toca un concepto de la izquierda y luego su definición correspondiente de la derecha para conectarlos.
        </p>

        {/* Real-time Progress Indicator */}
        <div style={{
          marginTop: '14px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 20px',
          background: 'rgba(255, 255, 255, 0.75)',
          border: '1px solid rgba(197, 161, 90, 0.35)',
          borderRadius: 'var(--radius-pill)',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--verde-oscuro)'
        }}>
          <span>Progreso Total:</span>
          <span style={{ color: 'var(--dorado-elegante)' }}>
            {totalCompleted} de 10 relaciones completadas ({matches.length}/5 en esta ronda)
          </span>
        </div>
      </div>

      {/* Error feedback banner if wrong relation */}
      {errorMessage && (
        <div 
          className="animate-fade-in"
          style={{
            maxWidth: '680px',
            margin: '0 auto 20px',
            padding: '12px 18px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(184, 58, 75, 0.1)',
            border: '1px solid rgba(184, 58, 75, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--rojo-error)',
            fontSize: '13px',
            fontWeight: 500
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Round 1 / 2 Transition Pill */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '20px'
      }}>
        <div style={{
          padding: '6px 14px',
          borderRadius: 'var(--radius-pill)',
          background: currentRound === 1 ? 'var(--verde-oscuro)' : 'rgba(18, 61, 50, 0.08)',
          color: currentRound === 1 ? '#FFFFFF' : 'var(--verde-oscuro)',
          fontSize: '12px',
          fontWeight: 700,
          border: currentRound === 1 ? '1px solid var(--dorado-elegante)' : 'none'
        }}>
          Ronda 1: Conceptos Clave (1-5)
        </div>
        <div style={{
          padding: '6px 14px',
          borderRadius: 'var(--radius-pill)',
          background: currentRound === 2 ? 'var(--verde-oscuro)' : 'rgba(18, 61, 50, 0.08)',
          color: currentRound === 2 ? '#FFFFFF' : 'var(--verde-oscuro)',
          fontSize: '12px',
          fontWeight: 700,
          border: currentRound === 2 ? '1px solid var(--dorado-elegante)' : 'none'
        }}>
          Ronda 2: Instrumentos y Evidencias (6-10)
        </div>
      </div>

      {/* Two Interactive Columns Layout */}
      <div style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {/* Left Column: Conceptos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--verde-oscuro)',
            paddingLeft: '6px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            Conceptos ({roundPairs.length})
          </div>

          {roundPairs.map((pair) => {
            const isMatched = matches.some((m) => m.conceptId === pair.id);
            const isSelected = selectedConcept === pair.id;

            let border = '1px solid var(--glass-border)';
            let bg = 'rgba(255, 255, 255, 0.78)';
            let shadow = 'var(--glass-shadow)';

            if (isMatched) {
              border = '1.5px solid var(--verde-exito)';
              bg = 'rgba(45, 138, 91, 0.12)';
            } else if (isSelected) {
              border = '2px solid var(--dorado-elegante)';
              bg = 'rgba(197, 161, 90, 0.22)';
              shadow = '0 0 0 4px rgba(197, 161, 90, 0.2)';
            }

            return (
              <div
                key={pair.id}
                ref={(el) => { conceptRefs.current[pair.id] = el; }}
                onClick={() => handleSelectConcept(pair.id)}
                className="liquid-glass"
                style={{
                  padding: '18px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: bg,
                  border,
                  boxShadow: shadow,
                  cursor: isMatched ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  opacity: isMatched ? 0.88 : 1,
                  transform: isSelected ? 'scale(1.015)' : 'scale(1)',
                  transition: 'all 0.18s var(--ease-apple)'
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-editorial)',
                  fontSize: '16.5px',
                  fontWeight: 700,
                  color: isMatched ? 'var(--verde-exito)' : 'var(--verde-oscuro)',
                  lineHeight: 1.3
                }}>
                  {pair.concept}
                </div>

                {isMatched ? (
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'var(--verde-exito)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Check size={16} strokeWidth={2.8} />
                  </div>
                ) : (
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: isSelected ? '3px solid var(--dorado-elegante)' : '2px solid var(--gris-neutro)',
                    background: isSelected ? 'var(--dorado-elegante)' : 'transparent',
                    flexShrink: 0
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Definiciones (Shuffled) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--verde-oscuro)',
            paddingLeft: '6px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            Definiciones Desordenadas ({shuffledDefs.length})
          </div>

          {shuffledDefs.map((pair) => {
            const isMatched = matches.some((m) => m.definitionId === pair.id);
            const isSelected = selectedDefinition === pair.id;

            let border = '1px solid var(--glass-border)';
            let bg = 'rgba(255, 255, 255, 0.78)';
            let shadow = 'var(--glass-shadow)';

            if (isMatched) {
              border = '1.5px solid var(--verde-exito)';
              bg = 'rgba(45, 138, 91, 0.12)';
            } else if (isSelected) {
              border = '2px solid var(--dorado-elegante)';
              bg = 'rgba(197, 161, 90, 0.22)';
              shadow = '0 0 0 4px rgba(197, 161, 90, 0.2)';
            }

            return (
              <div
                key={pair.id}
                ref={(el) => { defRefs.current[pair.id] = el; }}
                onClick={() => handleSelectDefinition(pair.id)}
                className="liquid-glass"
                style={{
                  padding: '18px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: bg,
                  border,
                  boxShadow: shadow,
                  cursor: isMatched ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  opacity: isMatched ? 0.88 : 1,
                  transform: isSelected ? 'scale(1.015)' : 'scale(1)',
                  transition: 'all 0.18s var(--ease-apple)'
                }}
              >
                <div style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: isMatched ? 'var(--verde-exito)' : 'var(--gris-oscuro)',
                  lineHeight: 1.45
                }}>
                  {pair.definition}
                </div>

                {isMatched ? (
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'var(--verde-exito)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Check size={16} strokeWidth={2.8} />
                  </div>
                ) : (
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: isSelected ? '3px solid var(--dorado-elegante)' : '2px solid var(--gris-neutro)',
                    background: isSelected ? 'var(--dorado-elegante)' : 'transparent',
                    flexShrink: 0
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Round Transition / Reset Controls */}
      <div style={{
        marginTop: '32px',
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {currentRound === 1 && matches.length === roundPairs.length && (
          <button
            onClick={() => {
              sound.click();
              setCurrentRound(2);
            }}
            className="apple-button apple-button-primary"
            style={{ padding: '12px 24px' }}
          >
            <span>Avanzar a Ronda 2</span>
            <ArrowRight size={16} />
          </button>
        )}

        <button
          onClick={handleRestart}
          className="apple-button apple-button-secondary"
          style={{ padding: '12px 20px', fontSize: '14px' }}
        >
          <RotateCcw size={15} />
          <span>Reiniciar actividad</span>
        </button>
      </div>

      {/* Completion Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        title="¡Excelente! Has relacionado todos los conceptos."
        subtitle="Comprendes con claridad los propósitos, criterios, evidencias y los instrumentos de evaluación formativa."
        weekNumber={3}
        scoreText="10 de 10 relaciones correctas en 2 rondas"
        onRetry={handleRestart}
      />
    </div>
  );
};
