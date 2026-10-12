import React, { useState, useEffect } from 'react';
import { MATCHING_PAIRS, type ConceptPair } from '../data/matchingData';
import { SuccessModal } from '../components/SuccessModal';
import { sound } from '../utils/sound';
import { Check, RotateCcw, AlertCircle } from 'lucide-react';

interface MatchedLink {
  conceptId: number;
  definitionId: number;
}

export const Semana3Matching: React.FC = () => {
  const [currentRound, setCurrentRound] = useState<1 | 2>(1);
  const [selectedConcept, setSelectedConcept] = useState<number | null>(null);
  const [selectedDefinition, setSelectedDefinition] = useState<number | null>(null);
  
  const [matches, setMatches] = useState<MatchedLink[]>([]);
  const [shuffledDefs, setShuffledDefs] = useState<ConceptPair[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const roundPairs = MATCHING_PAIRS.filter((p) => p.round === currentRound);

  useEffect(() => {
    const list = MATCHING_PAIRS.filter((p) => p.round === currentRound);
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    setShuffledDefs(shuffled);
    setMatches([]);
    setSelectedConcept(null);
    setSelectedDefinition(null);
    setErrorMessage(null);
  }, [currentRound]);

  const handleSelectConcept = (id: number) => {
    sound.pop();
    setErrorMessage(null);
    if (matches.some((m) => m.conceptId === id)) return;

    if (selectedConcept === id) {
      setSelectedConcept(null);
      return;
    }

    setSelectedConcept(id);

    if (selectedDefinition !== null) {
      evaluatePair(id, selectedDefinition);
    }
  };

  const handleSelectDefinition = (id: number) => {
    sound.pop();
    setErrorMessage(null);
    if (matches.some((m) => m.definitionId === id)) return;

    if (selectedDefinition === id) {
      setSelectedDefinition(null);
      return;
    }

    setSelectedDefinition(id);

    if (selectedConcept !== null) {
      evaluatePair(selectedConcept, id);
    }
  };

  const evaluatePair = (cId: number, dId: number) => {
    if (cId === dId) {
      sound.success();
      const nextMatches = [...matches, { conceptId: cId, definitionId: dId }];
      setMatches(nextMatches);
      setSelectedConcept(null);
      setSelectedDefinition(null);
      setErrorMessage(null);

      if (nextMatches.length === roundPairs.length) {
        if (currentRound === 1) {
          setTimeout(() => {
            setCurrentRound(2);
          }, 600);
        } else {
          setTimeout(() => {
            setIsSuccessModalOpen(true);
          }, 500);
        }
      }
    } else {
      sound.error();
      const conceptObj = roundPairs.find((p) => p.id === cId);
      setErrorMessage(
        `Esa no es la definición de "${conceptObj?.concept}". Intenta con otra.`
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

  return (
    <div className="ios-animate-enter" style={{ padding: '12px 14px 40px' }}>
      {/* Round & Progress Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{
          display: 'inline-flex',
          padding: '3px 10px',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--apple-blue-tint)',
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--apple-blue)',
          textTransform: 'uppercase'
        }}>
          Ronda {currentRound} de 2
        </div>

        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {matches.length} de {roundPairs.length} parejas
        </span>
      </div>

      {/* Instructions */}
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
        Toca un concepto y luego su definición correspondiente para unirlos.
      </p>

      {/* Error alert */}
      {errorMessage && (
        <div 
          className="ios-animate-enter"
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--apple-red-tint)',
            border: '1px solid var(--apple-red)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--apple-red)',
            fontSize: '12.5px',
            marginBottom: '12px'
          }}
        >
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Conceptos */}
      <div style={{
        fontSize: '12px',
        fontWeight: 700,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        marginBottom: '6px'
      }}>
        1. Conceptos
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
        {roundPairs.map((pair) => {
          const isMatched = matches.some((m) => m.conceptId === pair.id);
          const isSelected = selectedConcept === pair.id;

          let bg = '#FFFFFF';
          let border = '1px solid var(--separator)';
          let color = 'var(--text-primary)';

          if (isMatched) {
            bg = 'var(--apple-green-tint)';
            border = '1px solid var(--apple-green)';
            color = 'var(--apple-green)';
          } else if (isSelected) {
            bg = 'var(--apple-blue)';
            border = '1px solid var(--apple-blue)';
            color = '#FFFFFF';
          }

          return (
            <button
              key={pair.id}
              onClick={() => handleSelectConcept(pair.id)}
              disabled={isMatched}
              className="ios-button"
              style={{
                padding: '9px 14px',
                borderRadius: 'var(--radius-pill)',
                background: bg,
                border,
                color,
                fontSize: '13px',
                fontWeight: 600,
                opacity: isMatched ? 0.6 : 1,
                cursor: isMatched ? 'default' : 'pointer'
              }}
            >
              <span>{pair.concept}</span>
              {isMatched && <Check size={13} strokeWidth={2.8} />}
            </button>
          );
        })}
      </div>

      {/* Step 2: Definiciones */}
      <div style={{
        fontSize: '12px',
        fontWeight: 700,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        marginBottom: '6px'
      }}>
        2. Definiciones
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        {shuffledDefs.map((pair) => {
          const isMatched = matches.some((m) => m.definitionId === pair.id);
          const isSelected = selectedDefinition === pair.id;

          let bg = '#FFFFFF';
          let border = '1px solid var(--separator)';
          let color = 'var(--text-primary)';

          if (isMatched) {
            bg = 'var(--apple-green-tint)';
            border = '1px solid var(--apple-green)';
            color = 'var(--apple-green)';
          } else if (isSelected) {
            bg = 'var(--apple-blue-tint)';
            border = '1.5px solid var(--apple-blue)';
            color = 'var(--apple-blue)';
          }

          return (
            <div
              key={pair.id}
              onClick={() => handleSelectDefinition(pair.id)}
              className="ios-card"
              style={{
                padding: '12px 14px',
                background: bg,
                border,
                cursor: isMatched ? 'default' : 'pointer',
                opacity: isMatched ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
              }}
            >
              <div style={{ fontSize: '13px', color, lineHeight: 1.35, fontWeight: isMatched ? 600 : 400 }}>
                {pair.definition}
              </div>

              {isMatched && (
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'var(--apple-green)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleRestart}
        className="ios-button ios-button-secondary"
        style={{ width: '100%', padding: '12px', fontSize: '13.5px' }}
      >
        <RotateCcw size={14} />
        <span>Reiniciar</span>
      </button>

      <SuccessModal
        isOpen={isSuccessModalOpen}
        title="¡Excelente!"
        subtitle="Has relacionado correctamente los 10 conceptos y definiciones."
        weekNumber={3}
        scoreText="10 de 10 relaciones completadas"
        onRetry={handleRestart}
      />
    </div>
  );
};
