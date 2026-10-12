import React, { useState, useEffect } from 'react';
import { CLOZE_BLANKS, WORD_BANK, type ClozeBlank } from '../data/clozeData';
import { SuccessModal } from '../components/SuccessModal';
import { sound } from '../utils/sound';
import { Check, RotateCcw, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';

export const Semana4Cloze: React.FC = () => {
  const [slots, setSlots] = useState<{ [blankId: number]: string | null }>({
    0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null
  });

  const [selectedBankWord, setSelectedBankWord] = useState<string | null>(null);
  const [selectedBlankId, setSelectedBlankId] = useState<number | null>(null);
  const [shuffledBank, setShuffledBank] = useState<string[]>([]);
  const [checkedState, setCheckedState] = useState<{ [blankId: number]: boolean } | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    setShuffledBank([...WORD_BANK].sort(() => Math.random() - 0.5));
  }, []);

  const placedWords = Object.values(slots).filter(Boolean) as string[];
  const availableBankWords = shuffledBank.filter((w) => !placedWords.includes(w));
  const remainingCount = CLOZE_BLANKS.filter((b) => !slots[b.id]).length;

  const handleBankWordClick = (word: string) => {
    sound.pop();
    if (selectedBlankId !== null) {
      placeWordInBlank(word, selectedBlankId);
      setSelectedBlankId(null);
      setSelectedBankWord(null);
    } else {
      setSelectedBankWord((prev) => (prev === word ? null : word));
    }
  };

  const handleBlankClick = (blankId: number) => {
    sound.pop();
    const currentPlaced = slots[blankId];

    if (selectedBankWord !== null) {
      placeWordInBlank(selectedBankWord, blankId);
      setSelectedBankWord(null);
      setSelectedBlankId(null);
    } else if (currentPlaced !== null) {
      setSlots((prev) => ({ ...prev, [blankId]: null }));
      setCheckedState(null);
    } else {
      setSelectedBlankId((prev) => (prev === blankId ? null : blankId));
    }
  };

  const placeWordInBlank = (word: string, blankId: number) => {
    setSlots((prev) => ({ ...prev, [blankId]: word }));
    setCheckedState(null);
  };

  const handleCheck = () => {
    const results: { [blankId: number]: boolean } = {};
    let allRight = true;

    CLOZE_BLANKS.forEach((blank) => {
      const placed = slots[blank.id];
      if (placed === blank.correctWord) {
        results[blank.id] = true;
      } else {
        results[blank.id] = false;
        allRight = false;
      }
    });

    setCheckedState(results);

    if (allRight) {
      sound.success();
      setIsSuccessModalOpen(true);
    } else {
      sound.error();
    }
  };

  const handleReset = () => {
    sound.click();
    setSlots({ 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null });
    setCheckedState(null);
    setSelectedBankWord(null);
    setSelectedBlankId(null);
    setIsSuccessModalOpen(false);
    setShuffledBank([...WORD_BANK].sort(() => Math.random() - 0.5));
  };

  const renderBlankSlot = (blank: ClozeBlank) => {
    const placed = slots[blank.id];
    const isTarget = selectedBlankId === blank.id;
    const isChecked = checkedState !== null;
    const isCorrect = isChecked && checkedState[blank.id] === true;
    const isWrong = isChecked && checkedState[blank.id] === false;

    let border = '1px dashed var(--text-tertiary)';
    let bg = 'var(--surface-secondary)';
    let textColor = 'var(--text-primary)';

    if (isCorrect) {
      border = '1px solid var(--apple-green)';
      bg = 'var(--apple-green-tint)';
      textColor = 'var(--apple-green)';
    } else if (isWrong) {
      border = '1px solid var(--apple-red)';
      bg = 'var(--apple-red-tint)';
      textColor = 'var(--apple-red)';
    } else if (isTarget) {
      border = '1.5px solid var(--apple-blue)';
      bg = 'var(--apple-blue-tint)';
    } else if (placed) {
      border = '1px solid var(--separator-dark)';
      bg = '#FFFFFF';
    }

    return (
      <span
        key={blank.id}
        onClick={() => handleBlankClick(blank.id)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          minWidth: '94px',
          height: '28px',
          padding: '2px 8px',
          margin: '2px 3px',
          verticalAlign: 'middle',
          borderRadius: 'var(--radius-pill)',
          background: bg,
          border,
          color: textColor,
          fontWeight: 600,
          fontSize: '13px',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        {placed ? (
          <>
            <span>{placed}</span>
            {isCorrect && <CheckCircle2 size={12} color="var(--apple-green)" />}
            {isWrong && <XCircle size={12} color="var(--apple-red)" />}
          </>
        ) : (
          <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>
            [{blank.id + 1}]
          </span>
        )}
      </span>
    );
  };

  return (
    <div className="ios-animate-enter" style={{ padding: '12px 14px 40px' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--apple-blue)', textTransform: 'uppercase' }}>
          Repaso Integrador
        </span>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {remainingCount === 0 ? 'Completo' : `${remainingCount} pendientes`}
        </span>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
        Toca una palabra del banco inferior y luego el espacio correspondiente.
      </p>

      {/* Main Paragraph Card */}
      <div 
        className="ios-card"
        style={{
          padding: '16px 14px',
          marginBottom: '14px',
          lineHeight: 1.85,
          fontSize: '14px',
          color: 'var(--text-primary)'
        }}
      >
        <p style={{ marginBottom: '10px' }}>
          En el enfoque por {renderBlankSlot(CLOZE_BLANKS[0])}, el docente plantea una {renderBlankSlot(CLOZE_BLANKS[1])} significativa, define el {renderBlankSlot(CLOZE_BLANKS[2])} de aprendizaje y establece los {renderBlankSlot(CLOZE_BLANKS[3])} de evaluación.
        </p>

        <p style={{ marginBottom: '10px' }}>
          Durante la actividad recoge {renderBlankSlot(CLOZE_BLANKS[4])} sobre las actuaciones del estudiante y brinda {renderBlankSlot(CLOZE_BLANKS[5])} para mejorar.
        </p>

        <p>
          Puede utilizar una {renderBlankSlot(CLOZE_BLANKS[6])} para valorar los niveles de logro y una {renderBlankSlot(CLOZE_BLANKS[7])} para verificar aspectos específicos.
        </p>
      </div>

      {/* Word Bank */}
      <div className="ios-card" style={{ padding: '14px 12px', marginBottom: '14px' }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '8px'
        }}>
          Banco de Palabras ({availableBankWords.length})
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {availableBankWords.length === 0 ? (
            <span style={{ fontSize: '12px', color: 'var(--apple-green)', fontWeight: 500 }}>
              ✓ Todas las palabras han sido colocadas. Comprueba tus respuestas.
            </span>
          ) : (
            availableBankWords.map((word) => {
              const isSelected = selectedBankWord === word;
              return (
                <button
                  key={word}
                  onClick={() => handleBankWordClick(word)}
                  className="ios-button"
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-pill)',
                    background: isSelected ? 'var(--apple-blue)' : 'var(--surface-secondary)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    border: '1px solid transparent'
                  }}
                >
                  {word}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <button
          onClick={handleCheck}
          className="ios-button ios-button-primary"
          style={{ flex: 1, padding: '12px' }}
        >
          <Check size={16} strokeWidth={2.5} />
          <span>Comprobar</span>
        </button>

        <button
          onClick={handleReset}
          className="ios-button ios-button-secondary"
          style={{ padding: '12px 16px' }}
          title="Reiniciar"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Explanations List if checked */}
      {checkedState && (
        <div className="ios-card ios-animate-enter" style={{ padding: '14px 12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            <HelpCircle size={14} color="var(--apple-blue)" />
            <span>Fundamentos pedagógicos</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {CLOZE_BLANKS.map((blank) => {
              const isRight = checkedState[blank.id];
              return (
                <div
                  key={blank.id}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: isRight ? 'var(--apple-green-tint)' : 'var(--apple-red-tint)',
                    fontSize: '11.5px',
                    lineHeight: 1.35
                  }}
                >
                  <div style={{ fontWeight: 700, color: isRight ? 'var(--apple-green)' : 'var(--apple-red)', marginBottom: '2px' }}>
                    {isRight ? '✓ ' : '✗ '} [{blank.id + 1}] {blank.correctWord}
                  </div>
                  <div style={{ color: 'var(--text-primary)' }}>
                    {blank.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <SuccessModal
        isOpen={isSuccessModalOpen}
        title="¡Excelente!"
        subtitle="Has completado el texto integrador de evaluación por competencias."
        weekNumber={4}
        scoreText="8 de 8 términos correctos"
        onRetry={handleReset}
      />
    </div>
  );
};
