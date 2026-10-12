import React, { useState, useEffect } from 'react';
import { CLOZE_BLANKS, WORD_BANK, type ClozeBlank } from '../data/clozeData';
import { SuccessModal } from '../components/SuccessModal';
import { sound } from '../utils/sound';
import { 
  Sparkles, 
  Check, 
  RotateCcw, 
  HelpCircle, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

export const Semana4Cloze: React.FC = () => {
  // Slots: mapping from blank index (0..7) to placed word string or null
  const [slots, setSlots] = useState<{ [blankId: number]: string | null }>({
    0: null,
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    7: null
  });

  // Selected word in bank waiting to be placed
  const [selectedBankWord, setSelectedBankWord] = useState<string | null>(null);

  // Active target blank if clicked first
  const [selectedBlankId, setSelectedBlankId] = useState<number | null>(null);

  // Shuffled bank order
  const [shuffledBank, setShuffledBank] = useState<string[]>([]);

  // Validation results
  const [checkedState, setCheckedState] = useState<{ [blankId: number]: boolean } | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    // Shuffle words initially
    setShuffledBank([...WORD_BANK].sort(() => Math.random() - 0.5));
  }, []);

  // Words currently placed in slots
  const placedWords = Object.values(slots).filter(Boolean) as string[];

  // Words still available in bank
  const availableBankWords = shuffledBank.filter((w) => !placedWords.includes(w));

  // Count unfilled blanks
  const remainingCount = CLOZE_BLANKS.filter((b) => !slots[b.id]).length;

  // Click a word in bank
  const handleBankWordClick = (word: string) => {
    sound.pop();
    if (selectedBlankId !== null) {
      // Place directly in selected blank
      placeWordInBlank(word, selectedBlankId);
      setSelectedBlankId(null);
      setSelectedBankWord(null);
    } else {
      // Toggle selection in bank
      setSelectedBankWord((prev) => (prev === word ? null : word));
    }
  };

  // Click a blank slot in text
  const handleBlankClick = (blankId: number) => {
    sound.pop();
    const currentPlaced = slots[blankId];

    if (selectedBankWord !== null) {
      // Place currently selected bank word into this slot
      placeWordInBlank(selectedBankWord, blankId);
      setSelectedBankWord(null);
      setSelectedBlankId(null);
    } else if (currentPlaced !== null) {
      // Return word to bank
      setSlots((prev) => ({ ...prev, [blankId]: null }));
      setCheckedState(null);
    } else {
      // Select this blank to wait for bank tap
      setSelectedBlankId((prev) => (prev === blankId ? null : blankId));
    }
  };

  const placeWordInBlank = (word: string, blankId: number) => {
    setSlots((prev) => ({ ...prev, [blankId]: word }));
    setCheckedState(null);
  };

  // Drag and Drop support
  const handleDragStart = (e: React.DragEvent, word: string) => {
    e.dataTransfer.setData('text/plain', word);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnBlank = (e: React.DragEvent, blankId: number) => {
    e.preventDefault();
    const word = e.dataTransfer.getData('text/plain');
    if (word && WORD_BANK.includes(word)) {
      sound.pop();
      placeWordInBlank(word, blankId);
    }
  };

  // Check answers
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

  // Reset activity
  const handleReset = () => {
    sound.click();
    setSlots({ 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null });
    setCheckedState(null);
    setSelectedBankWord(null);
    setSelectedBlankId(null);
    setIsSuccessModalOpen(false);
    setShuffledBank([...WORD_BANK].sort(() => Math.random() - 0.5));
  };

  // Render an interactive slot inside paragraph
  const renderBlankSlot = (blank: ClozeBlank) => {
    const placed = slots[blank.id];
    const isTarget = selectedBlankId === blank.id;
    const isChecked = checkedState !== null;
    const isCorrect = isChecked && checkedState[blank.id] === true;
    const isWrong = isChecked && checkedState[blank.id] === false;

    let border = '1.5px dashed rgba(18, 61, 50, 0.3)';
    let bg = 'rgba(255, 255, 255, 0.6)';
    let textColor = 'var(--verde-oscuro)';

    if (isCorrect) {
      border = '1.5px solid var(--verde-exito)';
      bg = 'rgba(45, 138, 91, 0.15)';
      textColor = 'var(--verde-exito)';
    } else if (isWrong) {
      border = '1.5px solid var(--rojo-error)';
      bg = 'rgba(184, 58, 75, 0.12)';
      textColor = 'var(--rojo-error)';
    } else if (isTarget) {
      border = '2px solid var(--dorado-elegante)';
      bg = 'rgba(197, 161, 90, 0.2)';
    } else if (placed) {
      border = '1px solid var(--dorado-elegante)';
      bg = 'rgba(197, 161, 90, 0.15)';
    }

    return (
      <span
        key={blank.id}
        onClick={() => handleBlankClick(blank.id)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDropOnBlank(e, blank.id)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          minWidth: '120px',
          height: '34px',
          padding: '2px 12px',
          margin: '0 4px',
          verticalAlign: 'middle',
          borderRadius: 'var(--radius-pill)',
          background: bg,
          border,
          color: textColor,
          fontWeight: 700,
          fontSize: '14.5px',
          cursor: 'pointer',
          userSelect: 'none',
          boxShadow: isTarget ? '0 0 0 3px rgba(197, 161, 90, 0.25)' : 'none',
          transition: 'all 0.16s var(--ease-apple)'
        }}
        title={placed ? 'Toca para devolver la palabra al banco' : 'Toca para insertar una palabra'}
      >
        {placed ? (
          <>
            <span>{placed}</span>
            {isCorrect && <CheckCircle2 size={14} color="var(--verde-exito)" />}
            {isWrong && <XCircle size={14} color="var(--rojo-error)" />}
          </>
        ) : (
          <span style={{ color: 'var(--gris-neutro)', fontSize: '12px', fontStyle: 'italic' }}>
            [ Espacio {blank.id + 1} ]
          </span>
        )}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '16px 16px 60px' }}>
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
          <span>Semana 4 • Repaso Integrador</span>
        </div>

        <h1 className="font-editorial" style={{
          fontSize: 'clamp(26px, 4vw, 36px)',
          fontWeight: 700,
          color: 'var(--verde-oscuro)',
          lineHeight: 1.2,
          marginBottom: '6px'
        }}>
          Completa el Aprendizaje
        </h1>

        <p style={{ fontSize: '14px', color: 'var(--gris-neutro)', maxWidth: '640px', margin: '0 auto' }}>
          Ubica los términos pedagógicos en los espacios correspondientes del texto articulador.
        </p>

        {/* Status Pill */}
        <div style={{
          marginTop: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'rgba(255, 255, 255, 0.75)',
          border: '1px solid rgba(197, 161, 90, 0.3)',
          borderRadius: 'var(--radius-pill)',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--verde-oscuro)'
        }}>
          <span>Espacios por completar:</span>
          <span style={{ color: remainingCount === 0 ? 'var(--verde-exito)' : 'var(--dorado-elegante)' }}>
            {remainingCount === 0 ? '¡Todos completados!' : `${remainingCount} de 8 pendientes`}
          </span>
        </div>
      </div>

      {/* Main Cloze Paragraph Card */}
      <div 
        className="liquid-glass animate-fade-in"
        style={{
          padding: '36px 32px',
          marginBottom: '28px',
          lineHeight: 2.2,
          fontSize: '16.5px',
          color: 'var(--gris-oscuro)'
        }}
      >
        <p style={{ marginBottom: '16px' }}>
          En el enfoque por {renderBlankSlot(CLOZE_BLANKS[0])}, el docente plantea una {renderBlankSlot(CLOZE_BLANKS[1])} significativa, define el {renderBlankSlot(CLOZE_BLANKS[2])} de aprendizaje y establece los {renderBlankSlot(CLOZE_BLANKS[3])} de evaluación.
        </p>

        <p style={{ marginBottom: '16px' }}>
          Durante la actividad recoge {renderBlankSlot(CLOZE_BLANKS[4])} sobre las actuaciones del estudiante y brinda {renderBlankSlot(CLOZE_BLANKS[5])} para mejorar.
        </p>

        <p>
          Puede utilizar una {renderBlankSlot(CLOZE_BLANKS[6])} para valorar los niveles de logro y una {renderBlankSlot(CLOZE_BLANKS[7])} para verificar aspectos específicos.
        </p>
      </div>

      {/* Word Bank Cards */}
      <div className="liquid-glass" style={{ padding: '24px 28px', marginBottom: '24px' }}>
        <div style={{
          fontSize: '13px',
          fontWeight: 700,
          color: 'var(--verde-oscuro)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Banco de Términos ({availableBankWords.length} disponibles)</span>
          <span style={{ fontSize: '12px', color: 'var(--gris-neutro)', textTransform: 'none', fontWeight: 500 }}>
            Toca o arrastra una palabra hacia un espacio
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {availableBankWords.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--verde-exito)', fontStyle: 'italic', padding: '10px 0' }}>
              ✓ Has insertado todas las palabras en el párrafo. Haz clic en "Comprobar respuestas".
            </div>
          ) : (
            availableBankWords.map((word) => {
              const isSelected = selectedBankWord === word;
              return (
                <div
                  key={word}
                  draggable
                  onDragStart={(e) => handleDragStart(e, word)}
                  onClick={() => handleBankWordClick(word)}
                  className="apple-button"
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-pill)',
                    background: isSelected ? 'var(--dorado-elegante)' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : 'var(--verde-oscuro)',
                    border: isSelected ? '1px solid var(--dorado-elegante)' : '1px solid rgba(18, 61, 50, 0.12)',
                    boxShadow: isSelected
                      ? '0 6px 16px rgba(197, 161, 90, 0.35)'
                      : '0 2px 6px rgba(0, 0, 0, 0.04)',
                    cursor: 'grab',
                    fontWeight: 600,
                    fontSize: '14px',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.16s var(--ease-apple)'
                  }}
                >
                  {word}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Explanations Section if checked */}
      {checkedState && (
        <div className="liquid-glass animate-fade-in" style={{ padding: '22px 26px', marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--verde-oscuro)',
            marginBottom: '12px',
            fontFamily: 'var(--font-editorial)'
          }}>
            <HelpCircle size={18} color="var(--dorado-elegante)" />
            <span>Fundamentos y explicaciones pedagógicas</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            {CLOZE_BLANKS.map((blank) => {
              const isRight = checkedState[blank.id];
              return (
                <div
                  key={blank.id}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: isRight ? 'rgba(45, 138, 91, 0.08)' : 'rgba(184, 58, 75, 0.08)',
                    border: `1px solid ${isRight ? 'rgba(45, 138, 91, 0.2)' : 'rgba(184, 58, 75, 0.2)'}`,
                    fontSize: '12.5px',
                    lineHeight: 1.4
                  }}
                >
                  <div style={{ fontWeight: 700, color: isRight ? 'var(--verde-exito)' : 'var(--rojo-error)', marginBottom: '2px' }}>
                    {isRight ? '✓ ' : '✗ '} Espacio {blank.id + 1}: {blank.correctWord}
                  </div>
                  <div style={{ color: 'var(--gris-oscuro)' }}>
                    {blank.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={handleCheck}
          className="apple-button apple-button-primary"
          style={{ padding: '12px 26px', fontSize: '15px' }}
        >
          <Check size={16} strokeWidth={2.5} />
          <span>Comprobar respuestas</span>
        </button>

        <button
          onClick={handleReset}
          className="apple-button apple-button-secondary"
          style={{ padding: '12px 20px', fontSize: '14px' }}
        >
          <RotateCcw size={15} />
          <span>Reiniciar texto</span>
        </button>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        title="¡Excelente! Has completado el texto."
        subtitle="Articulas con precisión la secuencia de evaluación por competencias, criterios y retroalimentación."
        weekNumber={4}
        scoreText="8 de 8 términos insertados correctamente"
        onRetry={handleReset}
      />
    </div>
  );
};
