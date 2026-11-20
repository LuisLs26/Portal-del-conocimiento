import React, { useState, useRef, useEffect } from 'react';
import { GameHeading } from '../../components/GameHeading';
import { GameProgress } from '../../components/GameProgress';
import { SuccessModal } from '../../components/SuccessModal';
import { sound } from '../../utils/sound';
import { CAMILA_WHEEL_QUESTIONS, type WheelQuestion } from '../../data/parte2Data';
import { RotateCw, CheckCircle2, XCircle, ArrowRight, BookOpen } from 'lucide-react';

const SPIN_DURATION = 3800;

const SECTOR_COLORS = [
  '#007AFF', // Blue
  '#FF9500', // Orange
  '#34C759', // Green
  '#AF52DE', // Purple
  '#FF2D55', // Pink
  '#5856D6'  // Indigo
];

export const CamilaRuleta: React.FC = () => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<WheelQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answeredIds, setAnsweredIds] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const totalQuestions = CAMILA_WHEEL_QUESTIONS.length;
  const degreesPerSector = 360 / totalQuestions;
  const currentRotationRef = useRef(0);
  const pendingQuestion = useRef<WheelQuestion | null>(null);
  const spinTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(spinTimer.current), []);

  const finishSpin = () => {
    const question = pendingQuestion.current;
    if (!question) return;
    pendingQuestion.current = null;
    clearTimeout(spinTimer.current);
    setIsSpinning(false);
    setCurrentQuestion(question);
    sound.pop();
  };

  const spinWheel = () => {
    if (pendingQuestion.current || currentQuestion) return;
    const remaining = CAMILA_WHEEL_QUESTIONS.filter(q => !answeredIds.includes(q.id));
    if (!remaining.length) return;

    const target = remaining[Math.floor(Math.random() * remaining.length)];
    const index = CAMILA_WHEEL_QUESTIONS.indexOf(target);
    const center = (index + 0.5) * degreesPerSector;
    const current = currentRotationRef.current;
    const advance = (360 - ((current + center) % 360)) % 360;
    const nextRotation = current + 360 + advance;

    sound.pop();
    pendingQuestion.current = target;
    setIsSpinning(true);
    setRotation(nextRotation);
    currentRotationRef.current = nextRotation;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    spinTimer.current = setTimeout(finishSpin, reducedMotion ? 0 : SPIN_DURATION + 200);
  };

  const handleSelectOption = (index: number) => {
    if (showFeedback) return;
    sound.pop();
    setSelectedOption(index);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null || !currentQuestion || showFeedback) return;
    setShowFeedback(true);

    const isCorrect = selectedOption === currentQuestion.correctIndex;
    if (isCorrect) {
      sound.success();
      setScore(s => s + 100);
    } else {
      sound.error();
    }

    if (!answeredIds.includes(currentQuestion.id)) {
      const nextAnswered = [...answeredIds, currentQuestion.id];
      setAnsweredIds(nextAnswered);

    }
  };

  const handleContinue = () => {
    if (answeredIds.length === totalQuestions) {
      setIsSuccessOpen(true);
      return;
    }
    sound.click();
    setCurrentQuestion(null);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const handleReset = () => {
    clearTimeout(spinTimer.current);
    pendingQuestion.current = null;
    sound.click();
    setRotation(0);
    currentRotationRef.current = 0;
    setIsSpinning(false);
    setCurrentQuestion(null);
    setSelectedOption(null);
    setShowFeedback(false);
    setAnsweredIds([]);
    setScore(0);
    setIsSuccessOpen(false);
  };

  return (
    <div className="part-two-game ios-animate-enter">
      <GameHeading 
        title="La ruleta del saber"
        hint="Gira la ruleta y responde sobre criterios, descriptores y niveles de logro." 
      />

      <GameProgress 
        value={answeredIds.length} 
        total={totalQuestions} 
        label="Preguntas exploradas" 
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Puntaje acumulado: <strong style={{ color: 'var(--apple-blue)' }}>{score} pts</strong>
        </span>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          color: answeredIds.length === totalQuestions ? 'var(--apple-green)' : 'var(--apple-blue)',
          background: answeredIds.length === totalQuestions ? 'var(--apple-green-tint)' : 'var(--apple-blue-tint)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-pill)'
        }}>
          {answeredIds.length}/{totalQuestions} retos
        </span>
      </div>

      {/* Wheel Stage */}
      <div className="ios-card" style={{
        padding: '24px 16px',
        textAlign: 'center',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="part-two-wheel">
          <span className="part-two-wheel-pointer" aria-hidden="true" />
          <svg
            viewBox="0 0 300 300"
            className="part-two-wheel-disc"
            data-rotation={rotation}
            onTransitionEnd={event => {
              if (event.target === event.currentTarget && event.propertyName === 'transform') finishSpin();
            }}
            style={{
              width: '100%',
              height: '100%',
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? `transform ${SPIN_DURATION}ms ease-in-out` : 'none'
            }}
          >
            {CAMILA_WHEEL_QUESTIONS.map((q, idx) => {
              const startAngle = idx * degreesPerSector;
              const endAngle = (idx + 1) * degreesPerSector;
              const startRad = (startAngle - 90) * (Math.PI / 180);
              const endRad = (endAngle - 90) * (Math.PI / 180);
              
              const x1 = 150 + 140 * Math.cos(startRad);
              const y1 = 150 + 140 * Math.sin(startRad);
              const x2 = 150 + 140 * Math.cos(endRad);
              const y2 = 150 + 140 * Math.sin(endRad);

              const textAngle = startAngle + degreesPerSector / 2;
              const textRad = (textAngle - 90) * (Math.PI / 180);
              const tx = 150 + 85 * Math.cos(textRad);
              const ty = 150 + 85 * Math.sin(textRad);

              const isCompleted = answeredIds.includes(q.id);

              return (
                <g key={q.id} data-sector={q.label}>
                  <path
                    d={`M 150 150 L ${x1} ${y1} A 140 140 0 0 1 ${x2} ${y2} Z`}
                    fill={isCompleted ? '#C7C7CC' : SECTOR_COLORS[idx % SECTOR_COLORS.length]}
                    stroke={currentQuestion?.id === q.id ? '#ffe18a' : '#ffffff'}
                    strokeWidth={currentQuestion?.id === q.id ? 5 : 3}
                  />
                  <text
                    x={tx}
                    y={ty}
                    fill="#FFFFFF"
                    fontSize="13"
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textAngle > 180 ? textAngle + 90 : textAngle - 90}, ${tx}, ${ty})`}
                  >
                    {q.label}
                  </text>
                </g>
              );
            })}
            <circle cx="150" cy="150" r="28" fill="#FFFFFF" stroke="#E5E5EA" strokeWidth="3" />
            <circle cx="150" cy="150" r="14" fill="var(--apple-blue)" />
          </svg>
        </div>

        {/* Spin Button */}
        <button
          onClick={spinWheel}
          disabled={isSpinning || Boolean(currentQuestion)}
          className="ios-button ios-button-primary"
          style={{ width: '100%', maxWidth: '280px', padding: '14px', fontSize: '15px' }}
        >
          <RotateCw size={18} className={isSpinning ? 'spin' : ''} />
          <span>{isSpinning ? 'Girando la ruleta…' : 'Girar la ruleta'}</span>
        </button>
      </div>

      {/* Question Card Modal / Panel */}
      {currentQuestion && (
        <div className="ios-card ios-animate-enter" style={{
          padding: '20px 16px',
          border: '1.5px solid var(--apple-blue)',
          background: '#FFFFFF',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span className="part-badge-tag primary" data-wheel-result>{currentQuestion.label}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Reto formativo</span>
          </div>

          <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', lineHeight: 1.35 }}>
            {currentQuestion.question}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {currentQuestion.options.map((opt, oIdx) => {
              const isSelected = selectedOption === oIdx;
              const isCorrect = oIdx === currentQuestion.correctIndex;
              let bg = 'var(--surface-secondary)';
              let border = '1px solid transparent';
              let color = 'var(--text-primary)';

              if (showFeedback) {
                if (isCorrect) {
                  bg = 'var(--apple-green-tint)';
                  border = '1px solid var(--apple-green)';
                  color = 'var(--apple-green)';
                } else if (isSelected) {
                  bg = 'var(--apple-red-tint)';
                  border = '1px solid var(--apple-red)';
                  color = 'var(--apple-red)';
                }
              } else if (isSelected) {
                bg = 'var(--apple-blue-tint)';
                border = '1px solid var(--apple-blue)';
                color = 'var(--apple-blue)';
              }

              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectOption(oIdx)}
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
                    fontSize: '14px',
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
                    {['A', 'B', 'C', 'D'][oIdx]}
                  </span>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {showFeedback && isCorrect && <CheckCircle2 size={16} color="var(--apple-green)" />}
                  {showFeedback && isSelected && !isCorrect && <XCircle size={16} color="var(--apple-red)" />}
                </button>
              );
            })}
          </div>

          {!showFeedback ? (
            <button
              onClick={handleConfirmAnswer}
              disabled={selectedOption === null}
              className="ios-button ios-button-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              <span>Confirmar respuesta</span>
            </button>
          ) : (
            <div className="ios-animate-enter" style={{
              background: 'var(--surface-secondary)',
              borderRadius: '12px',
              padding: '14px',
              marginTop: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <BookOpen size={15} color="var(--apple-blue)" />
                <strong style={{ fontSize: '13px', color: 'var(--apple-blue)' }}>Retroalimentación Docente:</strong>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.45, marginBottom: '6px' }}>
                {currentQuestion.explanation}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '12px' }}>
                {currentQuestion.example}
              </p>
              <button
                onClick={handleContinue}
                className="ios-button ios-button-primary"
                style={{ width: '100%', padding: '10px', fontSize: '14px' }}
              >
                <span>{answeredIds.length === totalQuestions ? 'Ver resultados' : 'Preparar siguiente giro'}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        title="¡Completaste La Ruleta del Saber!"
        subtitle="Has explorado todos los criterios, descriptores y niveles de logro esenciales."
        returnTo="/parte-2"
        scoreText={`Puntaje final: ${score} puntos`}
        onRetry={handleReset}
      />
    </div>
  );
};
