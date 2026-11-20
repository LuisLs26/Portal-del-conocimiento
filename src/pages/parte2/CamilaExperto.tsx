import React, { useState } from 'react';
import { GameHeading } from '../../components/GameHeading';
import { GameProgress } from '../../components/GameProgress';
import { SuccessModal } from '../../components/SuccessModal';
import { sound } from '../../utils/sound';
import { CAMILA_MILLIONAIRE_LEVELS, type MillionaireLevel } from '../../data/parte2Data';
import { Users, Sparkles, ArrowRight } from 'lucide-react';

export const CamilaExperto: React.FC = () => {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [usedFiftyFifty, setUsedFiftyFifty] = useState(false);
  const [usedAudience, setUsedAudience] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);

  const totalLevels = CAMILA_MILLIONAIRE_LEVELS.length;
  const currentLvl: MillionaireLevel = CAMILA_MILLIONAIRE_LEVELS[currentLevelIdx];

  const handleSelectOption = (idx: number) => {
    if (showFeedback || hiddenOptions.includes(idx)) return;
    sound.pop();
    setSelectedOption(idx);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null || showFeedback) return;
    setShowFeedback(true);

    const isCorrect = selectedOption === currentLvl.correctIndex;
    if (isCorrect) {
      sound.success();
      if (currentLevelIdx === totalLevels - 1) {
        sound.fanfare();
        setIsGameWon(true);
      }
    } else {
      sound.error();
    }
  };

  const handleNextLevel = () => {
    if (!showFeedback || selectedOption !== currentLvl.correctIndex) return;
    sound.click();
    if (currentLevelIdx < totalLevels - 1) {
      setCurrentLevelIdx(currentLevelIdx + 1);
      setSelectedOption(null);
      setShowFeedback(false);
      setHiddenOptions([]);
    }
  };

  const useFiftyFiftyLifeline = () => {
    if (usedFiftyFifty || showFeedback) return;
    sound.click();
    setUsedFiftyFifty(true);
    setHiddenOptions(currentLvl.fiftyFiftyRemove);
    if (selectedOption !== null && currentLvl.fiftyFiftyRemove.includes(selectedOption)) setSelectedOption(null);
  };

  const useAudienceLifeline = () => {
    if (usedAudience || showFeedback) return;
    sound.click();
    setUsedAudience(true);
    setShowAudienceModal(true);
  };

  const useHintLifeline = () => {
    if (usedHint || showFeedback) return;
    sound.click();
    setUsedHint(true);
    setShowHintModal(true);
  };

  const handleRestart = () => {
    sound.click();
    setCurrentLevelIdx(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setUsedFiftyFifty(false);
    setUsedAudience(false);
    setUsedHint(false);
    setHiddenOptions([]);
    setShowAudienceModal(false);
    setShowHintModal(false);
    setIsGameWon(false);
  };

  return (
    <div className="part-two-game ios-animate-enter">
      <GameHeading 
        title="¿Quién quiere ser un experto en evaluación?"
        hint="Responde retos de dificultad progresiva y utiliza comodines para alcanzar el Nivel Experto." 
      />

      {/* Lifelines Toolbar */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '14px',
        background: '#FFFFFF',
        padding: '8px 12px',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-subtle)',
        justifyContent: 'space-around'
      }}>
        <button
          onClick={useFiftyFiftyLifeline}
          disabled={usedFiftyFifty || showFeedback}
          className="ios-button"
          style={{
            padding: '8px 12px',
            fontSize: '12.5px',
            fontWeight: 700,
            background: usedFiftyFifty ? 'var(--surface-tertiary)' : 'var(--apple-blue-tint)',
            color: usedFiftyFifty ? 'var(--text-tertiary)' : 'var(--apple-blue)',
            borderRadius: '10px'
          }}
        >
          <span>50:50</span>
        </button>

        <button
          onClick={useAudienceLifeline}
          disabled={usedAudience || showFeedback}
          className="ios-button"
          style={{
            padding: '8px 12px',
            fontSize: '12.5px',
            fontWeight: 700,
            background: usedAudience ? 'var(--surface-tertiary)' : 'rgba(175, 82, 222, 0.12)',
            color: usedAudience ? 'var(--text-tertiary)' : '#AF52DE',
            borderRadius: '10px'
          }}
        >
          <Users size={14} />
          <span>Consultar grupo</span>
        </button>

        <button
          onClick={useHintLifeline}
          disabled={usedHint || showFeedback}
          className="ios-button"
          style={{
            padding: '8px 12px',
            fontSize: '12.5px',
            fontWeight: 700,
            background: usedHint ? 'var(--surface-tertiary)' : 'rgba(255, 149, 0, 0.12)',
            color: usedHint ? 'var(--text-tertiary)' : '#FF9500',
            borderRadius: '10px'
          }}
        >
          <Sparkles size={14} />
          <span>Pista libro</span>
        </button>
      </div>

      <GameProgress value={currentLevelIdx + (showFeedback && selectedOption === currentLvl.correctIndex ? 1 : 0)} total={totalLevels} label="Niveles de experiencia" />

      {/* Level Ladder Pill */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: 'var(--surface-secondary)',
        borderRadius: '10px',
        marginBottom: '12px'
      }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--apple-blue)' }}>
          {currentLvl.prizeText}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          Nivel {currentLevelIdx + 1} de {totalLevels}
        </span>
      </div>

      {/* Question Box */}
      <div className="ios-card" style={{
        padding: '20px 16px',
        background: '#FFFFFF',
        marginBottom: '14px',
        borderLeft: '4px solid var(--apple-blue)'
      }}>
        <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35 }}>
          {currentLvl.question}
        </h2>
      </div>

      {/* 4 Alternative Diamonds */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {currentLvl.options.map((opt, idx) => {
          if (hiddenOptions.includes(idx)) {
            return (
              <div key={idx} style={{ height: '48px', borderRadius: '12px', background: 'transparent' }} />
            );
          }

          const isSelected = selectedOption === idx;
          const isCorrect = idx === currentLvl.correctIndex;
          let bg = 'var(--surface-secondary)';
          let border = '1px solid var(--separator)';
          let color = 'var(--text-primary)';

          if (showFeedback) {
            if (isCorrect) {
              bg = 'var(--apple-green-tint)';
              border = '1.5px solid var(--apple-green)';
              color = 'var(--apple-green)';
            } else if (isSelected) {
              bg = 'var(--apple-red-tint)';
              border = '1.5px solid var(--apple-red)';
              color = 'var(--apple-red)';
            }
          } else if (isSelected) {
            bg = 'var(--apple-blue-tint)';
            border = '1.5px solid var(--apple-blue)';
            color = 'var(--apple-blue)';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              disabled={showFeedback}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '12px',
                background: bg,
                border,
                color,
                fontSize: '13.5px',
                fontWeight: 500,
                textAlign: 'left',
                cursor: showFeedback ? 'default' : 'pointer',
                transition: 'all 140ms ease'
              }}
            >
              <span style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                flexShrink: 0
              }}>
                {['A', 'B', 'C', 'D'][idx]}
              </span>
              <span style={{ flex: 1 }}>{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback / Progression */}
      {!showFeedback ? (
        <button
          onClick={handleConfirmAnswer}
          disabled={selectedOption === null}
          className="ios-button ios-button-primary"
          style={{ width: '100%', padding: '13px', fontSize: '15px' }}
        >
          <span>Confirmar respuesta definitiva</span>
        </button>
      ) : (
        <div className="ios-card ios-animate-enter" style={{
          padding: '16px',
          background: selectedOption === currentLvl.correctIndex ? 'var(--apple-green-tint)' : 'var(--apple-red-tint)',
          border: selectedOption === currentLvl.correctIndex ? '1px solid var(--apple-green)' : '1px solid var(--apple-red)',
          marginBottom: '16px'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: 700,
            color: selectedOption === currentLvl.correctIndex ? 'var(--apple-green)' : 'var(--apple-red)',
            marginBottom: '4px'
          }}>
            {selectedOption === currentLvl.correctIndex ? '¡Respuesta de Experto Correcta!' : 'Esta opción no era la correcta.'}
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.45, marginBottom: '12px' }}>
            {currentLvl.explanation}
          </p>

          {selectedOption === currentLvl.correctIndex && currentLevelIdx < totalLevels - 1 && (
            <button
              onClick={handleNextLevel}
              className="ios-button ios-button-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              <span>Avanzar al siguiente nivel</span>
              <ArrowRight size={15} />
            </button>
          )}

          {selectedOption !== currentLvl.correctIndex && (
            <button
              onClick={handleRestart}
              className="ios-button ios-button-secondary"
              style={{ width: '100%', padding: '12px' }}
            >
              <span>Volver a intentar desde el inicio</span>
            </button>
          )}
        </div>
      )}

      {/* Audience Poll Modal */}
      {showAudienceModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 99,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div className="ios-card" style={{ padding: '20px', width: '100%', maxWidth: '320px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Consulta simulada a la clase</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '120px', marginBottom: '16px' }}>
              {currentLvl.audienceStats.map((pct, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700 }}>{pct}%</span>
                  <div style={{
                    width: '32px',
                    height: `${pct}px`,
                    background: i === currentLvl.correctIndex ? 'var(--apple-blue)' : 'var(--surface-tertiary)',
                    borderRadius: '6px'
                  }} />
                  <span style={{ fontSize: '12px', fontWeight: 700 }}>{['A', 'B', 'C', 'D'][i]}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowAudienceModal(false)}
              className="ios-button ios-button-primary"
              style={{ width: '100%', padding: '10px' }}
            >
              Cerrar consulta
            </button>
          </div>
        </div>
      )}

      {/* Hint Modal */}
      {showHintModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 99,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div className="ios-card" style={{ padding: '20px', width: '100%', maxWidth: '320px', textAlign: 'center' }}>
            <Sparkles size={28} color="#FF9500" style={{ margin: '0 auto 8px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Pista Pedagógica del Libro</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '16px' }}>
              «{currentLvl.hint}»
            </p>
            <button
              onClick={() => setShowHintModal(false)}
              className="ios-button ios-button-primary"
              style={{ width: '100%', padding: '10px' }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={isGameWon}
        title="¡Felicidades, Experto en Evaluación!"
        subtitle="Alcanzaste el último nivel respondiendo con éxito la pregunta final sobre construcción de rúbricas."
        returnTo="/parte-2"
        scoreText="Nivel Máximo de Experto Alcanzado"
        onRetry={handleRestart}
      />
    </div>
  );
};
