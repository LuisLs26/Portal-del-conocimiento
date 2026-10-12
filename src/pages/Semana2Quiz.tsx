import { GameHeading } from '../components/GameHeading';
import { GameProgress } from '../components/GameProgress';
import { quizScore } from '../data/gameRules';
import React, { useState } from 'react';
import { QUIZ_QUESTIONS, type Question } from '../data/quizData';
import { sound } from '../utils/sound';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  HelpCircle,
  BookOpen
} from 'lucide-react';

export const Semana2Quiz: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qIndex: number]: number }>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  const currentQ: Question = QUIZ_QUESTIONS[currentIndex];
  const totalQuestions = QUIZ_QUESTIONS.length;

  const handleSelectOption = (index: number) => {
    if (showExplanation) return;
    sound.pop();
    setSelectedOption(index);
  };

  const handleConfirm = () => {
    if (showExplanation || selectedOption === null) return;
    const index = selectedOption;
    setShowExplanation(true);
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: index }));

    const isCorrect = index === currentQ.correctIndex;
    if (isCorrect) {
      sound.success();
    } else {
      sound.error();
    }
  };

  const handleNext = () => {
    if (!showExplanation) return;
    sound.click();
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
      sound.fanfare();
      try { localStorage.setItem('week_2_completed', 'true'); } catch { /* Session result remains visible. */ }
    }
  };

  const calculateScore = () => quizScore(QUIZ_QUESTIONS, userAnswers);

  const handleRestart = () => {
    sound.click();
    setCurrentIndex(0);
    setUserAnswers({});
    setSelectedOption(null);
    setShowExplanation(false);
    setIsFinished(false);
    setReviewMode(false);
  };

  const letters = ['A', 'B', 'C', 'D'];

  // Final Results Screen
  if (isFinished && !reviewMode) {
    const { correct, percentage } = calculateScore();
    let feedback = '';
    if (percentage >= 90) {
      feedback = 'Excelente comprensión de los principios de evaluación por competencias.';
    } else if (percentage >= 70) {
      feedback = 'Buen trabajo. Tienes claros los fundamentos y su aplicación formativa.';
    } else {
      feedback = 'Te recomendamos repasar los conceptos de evidencias y estándares.';
    }

    return (
      <div className="ios-animate-enter" style={{ padding: '20px 16px 40px' }}>
      <GameHeading title="Cuestionario" />
        <div className="ios-card" style={{ padding: '28px 20px', textAlign: 'center' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            margin: '0 auto 14px',
            background: 'var(--apple-blue-tint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--apple-blue)'
          }}>
            <CheckCircle2 size={30} strokeWidth={2.2} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Resultados
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Enfoque por competencias
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{
              flex: 1,
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-secondary)'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {correct}/{totalQuestions}
              </div>
              <div style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
                Aciertos
              </div>
            </div>

            <div style={{
              flex: 1,
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--apple-blue-tint)'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--apple-blue)' }}>
                {percentage}%
              </div>
              <div style={{ fontSize: '15px', color: 'var(--apple-blue)' }}>
                Precisión
              </div>
            </div>
          </div>

          <p style={{
            fontSize: '15px',
            color: 'var(--text-secondary)',
            lineHeight: 1.45,
            marginBottom: '24px'
          }}>
            {feedback}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => {
                sound.click();
                setReviewMode(true);
              }}
              className="ios-button ios-button-primary"
              style={{ width: '100%', padding: '13px' }}
            >
              <BookOpen size={16} />
              <span>Revisar respuestas</span>
            </button>

            <button
              onClick={handleRestart}
              className="ios-button ios-button-secondary"
              style={{ width: '100%', padding: '12px' }}
            >
              <RotateCcw size={15} />
              <span>Volver a intentar</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Review Mode Screen
  if (reviewMode) {
    return (
      <div className="ios-animate-enter" style={{ padding: '16px 14px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Revisión de Respuestas
            </h2>
            <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
              {totalQuestions} preguntas respondidas
            </span>
          </div>
          <button
            onClick={() => {
              sound.click();
              setReviewMode(false);
            }}
            className="ios-button ios-button-secondary"
            style={{ padding: '6px 12px', fontSize: '16px' }}
          >
            Cerrar
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {QUIZ_QUESTIONS.map((q, idx) => {
            const chosen = userAnswers[idx];
            const isRight = chosen === q.correctIndex;

            return (
              <div key={q.id} className="ios-card" style={{ padding: '16px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  {isRight ? (
                    <CheckCircle2 size={16} color="var(--apple-green)" strokeWidth={2.5} />
                  ) : (
                    <XCircle size={16} color="var(--apple-red)" strokeWidth={2.5} />
                  )}
                  <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Pregunta {idx + 1} • {q.topic}
                  </span>
                </div>

                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px', lineHeight: 1.5 }}>
                  {q.question}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                  {q.options.map((opt, oIdx) => {
                    const isTarget = oIdx === q.correctIndex;
                    const isChosen = oIdx === chosen;

                    let bg = 'var(--surface-secondary)';
                    let color = 'var(--text-primary)';
                    let border = '1px solid transparent';

                    if (isTarget) {
                      bg = 'var(--apple-green-tint)';
                      color = 'var(--apple-green)';
                      border = '1px solid var(--apple-green)';
                    } else if (isChosen && !isTarget) {
                      bg = 'var(--apple-red-tint)';
                      color = 'var(--apple-red)';
                      border = '1px solid var(--apple-red)';
                    }

                    return (
                      <div
                        key={oIdx}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: bg,
                          border,
                          fontSize: '16px',
                          fontWeight: isTarget ? 600 : 400,
                          color,
                          display: 'flex',
                          gap: '6px'
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>{letters[oIdx]}.</span>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                <div style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-secondary)',
                  fontSize: '16px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.4
                }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Explicación: </span>
                  {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Active Quiz View (1 question per screen)
  return (
    <div className="ios-animate-enter" style={{ padding: '24px 20px 80px' }}>
      <GameHeading title="Cuestionario" />
      <GameProgress value={Object.keys(userAnswers).length} total={10} label="Preguntas respondidas" />

      {/* Question Counter & Topic */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--apple-blue)', textTransform: 'uppercase' }}>
          {currentQ.topic}
        </span>
        <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {currentIndex + 1} de {totalQuestions}
        </span>
      </div>

      {/* Main Question Card */}
      <div key={currentQ.id} className="ios-card ios-animate-enter" style={{ padding: '20px 16px', marginBottom: '16px' }}>
        <h2 style={{
          fontSize: '16.5px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: 1.4,
          marginBottom: '20px'
        }}>
          {currentQ.question}
        </h2>

        {/* 4 Options in Apple List Cell Style */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentQ.options.map((opt, idx) => {
            const isChosen = selectedOption === idx;
            const isTarget = idx === currentQ.correctIndex;

            let bg = 'var(--surface-secondary)';
            let border = '1px solid transparent';
            let textColor = 'var(--text-primary)';
            let pillBg = '#FFFFFF';
            let pillColor = 'var(--text-secondary)';

            if (showExplanation) {
              if (isTarget) {
                bg = 'var(--apple-green-tint)';
                border = '1px solid var(--apple-green)';
                textColor = 'var(--text-primary)';
                pillBg = 'var(--apple-green)';
                pillColor = '#FFFFFF';
              } else if (isChosen && !isTarget) {
                bg = 'var(--apple-red-tint)';
                border = '1px solid var(--apple-red)';
                textColor = 'var(--text-primary)';
                pillBg = 'var(--apple-red)';
                pillColor = '#FFFFFF';
              }
            } else if (isChosen) {
              bg = 'var(--apple-blue-tint)';
              border = '1px solid var(--apple-blue)';
              pillBg = 'var(--apple-blue)';
              pillColor = '#FFFFFF';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={showExplanation}
                className="ios-button"
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: bg,
                  border,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  gap: '12px',
                  cursor: showExplanation ? 'default' : 'pointer'
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: pillBg,
                  color: pillColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '16px',
                  flexShrink: 0
                }}>
                  {letters[idx]}
                </div>

                <div style={{
                  flex: 1,
                  fontSize: '16px',
                  fontWeight: 500,
                  color: textColor,
                  lineHeight: 1.5
                }}>
                  {opt}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation Box */}
      {showExplanation && (
        <div
          className="ios-card ios-animate-enter"
          style={{
            padding: '14px 16px',
            marginBottom: '16px',
            background: selectedOption === currentQ.correctIndex ? 'var(--apple-green-tint)' : 'var(--apple-red-tint)',
            border: `1px solid ${selectedOption === currentQ.correctIndex ? 'var(--apple-green)' : 'var(--apple-red)'}`
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '15px',
            fontWeight: 700,
            color: selectedOption === currentQ.correctIndex ? 'var(--apple-green)' : 'var(--apple-red)',
            marginBottom: '4px'
          }}>
            <HelpCircle size={14} />
            <span>{selectedOption === currentQ.correctIndex ? '¡Correcto!' : 'Explicación:'}</span>
          </div>
          <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
            {`Respuesta correcta: ${letters[currentQ.correctIndex]}. ${currentQ.options[currentQ.correctIndex]}`}<br />{currentQ.explanation}
          </p>
        </div>
      )}

      {!showExplanation && <button className="ios-button ios-button-primary" disabled={selectedOption === null} onClick={handleConfirm}>Comprobar respuesta</button>}
      {/* Continue Button */}
      {showExplanation && (
        <button
          onClick={handleNext}
          className="ios-button ios-button-primary"
          style={{ width: '100%', padding: '14px', fontSize: '15px' }}
        >
          <span>{currentIndex < totalQuestions - 1 ? 'Siguiente pregunta' : 'Ver resultados'}</span>
          <ArrowRight size={16} />
        </button>
      )}


    </div>
  );
};
