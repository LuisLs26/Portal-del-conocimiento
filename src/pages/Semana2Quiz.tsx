import React, { useState } from 'react';
import { QUIZ_QUESTIONS, type Question } from '../data/quizData';
import { SuccessModal } from '../components/SuccessModal';
import { sound } from '../utils/sound';
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  HelpCircle, 
  Sparkles,
  Award,
  BookOpen
} from 'lucide-react';

export const Semana2Quiz: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qIndex: number]: number }>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const currentQ: Question = QUIZ_QUESTIONS[currentIndex];
  const totalQuestions = QUIZ_QUESTIONS.length;
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  // Handle option selection
  const handleSelectOption = (index: number) => {
    if (showExplanation) return; // Prevent changing after confirmed
    setSelectedOption(index);
    setShowExplanation(true);
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: index }));

    const isCorrect = index === currentQ.correctIndex;
    if (isCorrect) {
      sound.success();
    } else {
      sound.error();
    }
  };

  // Continue to next question or finish
  const handleNext = () => {
    sound.click();
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
      // Open celebration modal if score is satisfactory
      const score = calculateScore();
      if (score.correct >= 7) {
        setIsSuccessModalOpen(true);
      }
    }
  };

  // Calculate results
  const calculateScore = () => {
    let correct = 0;
    QUIZ_QUESTIONS.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });
    const percentage = Math.round((correct / totalQuestions) * 100);
    return { correct, percentage };
  };

  // Restart quiz
  const handleRestart = () => {
    sound.click();
    setCurrentIndex(0);
    setUserAnswers({});
    setSelectedOption(null);
    setShowExplanation(false);
    setIsFinished(false);
    setReviewMode(false);
    setIsSuccessModalOpen(false);
  };

  const letters = ['A', 'B', 'C', 'D'];

  // Final Results Screen
  if (isFinished && !reviewMode) {
    const { correct, percentage } = calculateScore();
    let feedback = '';
    if (percentage >= 90) {
      feedback = '¡Excelente comprensión! Demuestras un dominio profundo de los principios de la evaluación por competencias.';
    } else if (percentage >= 70) {
      feedback = '¡Muy buen trabajo! Tienes claros los fundamentos de las competencias y su aplicación formativa.';
    } else {
      feedback = 'Buen esfuerzo. Te recomendamos repasar los conceptos de evidencias y estándares para afianzar tus respuestas.';
    }

    return (
      <div style={{ maxWidth: '680px', margin: '20px auto 60px', padding: '0 16px' }}>
        <div 
          className="liquid-glass animate-fade-in"
          style={{ padding: '40px 32px', textAlign: 'center' }}
        >
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            margin: '0 auto 16px',
            background: 'linear-gradient(135deg, rgba(197, 161, 90, 0.2), rgba(40, 92, 74, 0.15))',
            border: '1.5px solid var(--dorado-elegante)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--dorado-elegante)'
          }}>
            <Award size={32} />
          </div>

          <h2 className="font-editorial" style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--verde-oscuro)',
            marginBottom: '8px'
          }}>
            Resultados del Cuestionario
          </h2>

          <p style={{ fontSize: '14px', color: 'var(--gris-neutro)', marginBottom: '24px' }}>
            Evaluación desde el enfoque por competencias
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '24px'
          }}>
            <div style={{
              padding: '16px 24px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(18, 61, 50, 0.05)',
              border: '1px solid rgba(18, 61, 50, 0.08)'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--verde-oscuro)' }}>
                {correct} / {totalQuestions}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--gris-neutro)' }}>
                Respuestas correctas
              </div>
            </div>

            <div style={{
              padding: '16px 24px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(197, 161, 90, 0.12)',
              border: '1px solid rgba(197, 161, 90, 0.3)'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--dorado-elegante)' }}>
                {percentage}%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--gris-neutro)' }}>
                Eficacia lograda
              </div>
            </div>
          </div>

          <p style={{
            fontSize: '14px',
            color: 'var(--gris-oscuro)',
            lineHeight: 1.5,
            maxWidth: '520px',
            margin: '0 auto 28px',
            padding: '12px 18px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.7)'
          }}>
            {feedback}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => {
                sound.click();
                setReviewMode(true);
              }}
              className="apple-button apple-button-primary"
              style={{ width: '100%', padding: '14px' }}
            >
              <BookOpen size={16} />
              <span>Revisar respuestas y explicaciones</span>
            </button>

            <button
              onClick={handleRestart}
              className="apple-button apple-button-secondary"
              style={{ width: '100%', padding: '12px' }}
            >
              <RotateCcw size={16} />
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
      <div style={{ maxWidth: '780px', margin: '20px auto 60px', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 className="font-editorial" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--verde-oscuro)' }}>
              Revisión de Respuestas
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--gris-neutro)' }}>
              Analiza los fundamentos pedagógicos de cada pregunta
            </p>
          </div>
          <button
            onClick={() => {
              sound.click();
              setReviewMode(false);
            }}
            className="apple-button apple-button-secondary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            Volver al resumen
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {QUIZ_QUESTIONS.map((q, idx) => {
            const chosen = userAnswers[idx];
            const isRight = chosen === q.correctIndex;
            return (
              <div key={q.id} className="liquid-glass" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  {isRight ? (
                    <CheckCircle size={18} color="var(--verde-exito)" />
                  ) : (
                    <XCircle size={18} color="var(--rojo-error)" />
                  )}
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--verde-oscuro)' }}>
                    Pregunta {idx + 1} de {totalQuestions} • {q.topic}
                  </span>
                </div>

                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gris-oscuro)', marginBottom: '12px', lineHeight: 1.4 }}>
                  {q.question}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                  {q.options.map((opt, oIdx) => {
                    const isTarget = oIdx === q.correctIndex;
                    const isChosen = oIdx === chosen;
                    let border = '1px solid rgba(18, 61, 50, 0.08)';
                    let bg = 'rgba(255, 255, 255, 0.6)';

                    if (isTarget) {
                      border = '1px solid var(--verde-exito)';
                      bg = 'rgba(45, 138, 91, 0.12)';
                    } else if (isChosen && !isTarget) {
                      border = '1px solid var(--rojo-error)';
                      bg = 'rgba(184, 58, 75, 0.1)';
                    }

                    return (
                      <div
                        key={oIdx}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          border,
                          background: bg,
                          fontSize: '13px',
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'baseline'
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>{letters[oIdx]})</span>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                <div style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(197, 161, 90, 0.1)',
                  border: '1px solid rgba(197, 161, 90, 0.3)',
                  fontSize: '12px',
                  color: 'var(--verde-oscuro)',
                  lineHeight: 1.45
                }}>
                  <span style={{ fontWeight: 700 }}>Explicación: </span>
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
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '16px 16px 60px' }}>
      {/* Header Info & Progress Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            background: 'rgba(18, 61, 50, 0.06)',
            borderRadius: 'var(--radius-pill)',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--verde-oscuro)'
          }}>
            <Sparkles size={12} color="var(--dorado-elegante)" />
            <span>Semana 2 • Cuestionario Interactivo</span>
          </div>

          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dorado-elegante)' }}>
            Pregunta {currentIndex + 1} de {totalQuestions}
          </span>
        </div>

        {/* Apple Segmented Progress Bar */}
        <div style={{
          width: '100%',
          height: '6px',
          background: 'rgba(18, 61, 50, 0.1)',
          borderRadius: 'var(--radius-pill)',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--verde-oscuro), var(--dorado-elegante))',
            borderRadius: 'var(--radius-pill)',
            transition: 'width 0.3s var(--ease-apple)'
          }} />
        </div>
      </div>

      {/* Main Question Card */}
      <div 
        key={currentQ.id}
        className="liquid-glass animate-fade-in"
        style={{ padding: '32px 28px', marginBottom: '20px' }}
      >
        {/* Topic Tag */}
        <div style={{
          display: 'inline-block',
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--dorado-elegante)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '8px'
        }}>
          {currentQ.topic}
        </div>

        {/* Question Text */}
        <h2 className="font-editorial" style={{
          fontSize: 'clamp(18px, 3.2vw, 22px)',
          fontWeight: 700,
          color: 'var(--verde-oscuro)',
          lineHeight: 1.35,
          marginBottom: '24px'
        }}>
          {currentQ.question}
        </h2>

        {/* Options (A, B, C, D) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {currentQ.options.map((optionText, idx) => {
            const isChosen = selectedOption === idx;
            const isTarget = idx === currentQ.correctIndex;
            
            let bg = 'rgba(255, 255, 255, 0.8)';
            let borderColor = 'rgba(18, 61, 50, 0.12)';
            let letterBg = 'rgba(18, 61, 50, 0.08)';
            let letterColor = 'var(--verde-oscuro)';

            if (showExplanation) {
              if (isTarget) {
                bg = 'rgba(45, 138, 91, 0.15)';
                borderColor = 'var(--verde-exito)';
                letterBg = 'var(--verde-exito)';
                letterColor = '#FFFFFF';
              } else if (isChosen && !isTarget) {
                bg = 'rgba(184, 58, 75, 0.12)';
                borderColor = 'var(--rojo-error)';
                letterBg = 'var(--rojo-error)';
                letterColor = '#FFFFFF';
              }
            } else if (isChosen) {
              bg = 'rgba(197, 161, 90, 0.2)';
              borderColor = 'var(--dorado-elegante)';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={showExplanation}
                className="apple-button"
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: bg,
                  border: `1.5px solid ${borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  gap: '14px',
                  cursor: showExplanation ? 'default' : 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                  transition: 'all 0.18s var(--ease-apple)'
                }}
              >
                {/* Letter Pill (A, B, C, D) */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: letterBg,
                  color: letterColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                  flexShrink: 0,
                  transition: 'all 0.18s var(--ease-apple)'
                }}>
                  {letters[idx]}
                </div>

                {/* Option Content */}
                <div style={{
                  flex: 1,
                  fontSize: '14.5px',
                  fontWeight: 500,
                  color: 'var(--gris-oscuro)',
                  lineHeight: 1.45
                }}>
                  {optionText}
                </div>

                {/* Feedback Icons */}
                {showExplanation && isTarget && (
                  <CheckCircle size={20} color="var(--verde-exito)" style={{ flexShrink: 0 }} />
                )}
                {showExplanation && isChosen && !isTarget && (
                  <XCircle size={20} color="var(--rojo-error)" style={{ flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Pedagogical Explanation Drawer */}
        {showExplanation && (
          <div 
            className="animate-fade-in"
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-sm)',
              background: selectedOption === currentQ.correctIndex
                ? 'rgba(45, 138, 91, 0.08)'
                : 'rgba(184, 58, 75, 0.08)',
              border: `1px solid ${selectedOption === currentQ.correctIndex ? 'rgba(45, 138, 91, 0.25)' : 'rgba(184, 58, 75, 0.25)'}`,
              marginBottom: '20px'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 700,
              color: selectedOption === currentQ.correctIndex ? 'var(--verde-exito)' : 'var(--rojo-error)',
              marginBottom: '4px'
            }}>
              <HelpCircle size={15} />
              <span>
                {selectedOption === currentQ.correctIndex ? '¡Respuesta correcta!' : 'Explicación formativa'}
              </span>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--gris-oscuro)', lineHeight: 1.5 }}>
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Continue Button */}
        {showExplanation && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleNext}
              className="apple-button apple-button-primary"
              style={{ padding: '12px 28px', fontSize: '15px' }}
            >
              <span>{currentIndex < totalQuestions - 1 ? 'Siguiente pregunta' : 'Ver resultados'}</span>
              <ArrowRight size={17} />
            </button>
          </div>
        )}
      </div>

      {/* Completion Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        title="¡Felicitaciones! Has completado el cuestionario."
        subtitle="Has demostrado gran destreza en los conceptos de evaluación por competencias."
        weekNumber={2}
        scoreText={`${calculateScore().correct} de ${totalQuestions} respuestas correctas`}
        onRetry={handleRestart}
      />
    </div>
  );
};
