import React, { useState, useRef } from 'react';
import { GameHeading } from '../../components/GameHeading';
import { GameProgress } from '../../components/GameProgress';
import { SuccessModal } from '../../components/SuccessModal';
import { sound } from '../../utils/sound';
import { CAMILA_WHEEL_QUESTIONS, type WheelQuestion } from '../../data/parte2Data';
import { RotateCw, CheckCircle2, XCircle, ArrowRight, BookOpen } from 'lucide-react';

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

  const spinWheel = () => {
    if (isSpinning || currentQuestion) return;

    sound.pop();
    setIsSpinning(true);
    setSelectedOption(null);
    setShowFeedback(false);

    // Pick an unanswered question, or any if all answered
    const pendingQuestions = CAMILA_WHEEL_QUESTIONS.filter(q => !answeredIds.includes(q.id));
    const target = pendingQuestions.length > 0 
      ? pendingQuestions[Math.floor(Math.random() * pendingQuestions.length)]
      : CAMILA_WHEEL_QUESTIONS[Math.floor(Math.random() * CAMILA_WHEEL_QUESTIONS.length)];

    const targetIndex = CAMILA_WHEEL_QUESTIONS.findIndex(q => q.id === target.id);
    // Calculate rotation so that targetIndex lands under pointer (at top: 270 deg or 90 deg offset)
    const extraSpins = (5 + Math.floor(Math.random() * 3)) * 360;
    const sectorOffset = 360 - (targetIndex * degreesPerSector) - (degreesPerSector / 2);
    const newRotation = currentRotationRef.current + extraSpins + (sectorOffset - (currentRotationRef.current % 360));
    
    currentRotationRef.current = newRotation;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      sound.fanfare();
      setCurrentQuestion(target);
    }, 3200);
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
      if (nextAnswered.length === totalQuestions) {
        setTimeout(() => {
          setIsSuccessOpen(true);
        }, 1500);
      }
    }
  };

  const handleContinue = () => {
    sound.click();
    setCurrentQuestion(null);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const handleReset = () => {
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
    <div className="ios-animate-enter" style={{ padding: '20px 16px 80px', maxWidth: '440px', margin: '0 auto' }}>
      <GameHeading 
        title="Camila. La ruleta del saber 🎡" 
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
        {/* Pointer Arrow */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          width: 0,
          height: 0,
          borderLeft: '14px solid transparent',
          borderRight: '14px solid transparent',
          borderTop: '24px solid #1D1D1F',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
        }} />

        {/* SVG Wheel */}
        <div style={{
          width: '260px',
          height: '260px',
          position: 'relative',
          margin: '10px 0 20px',
          filter: 'drop-shadow(0 8px 20px rgba(0, 0, 0, 0.12))'
        }}>
          <svg
            viewBox="0 0 300 300"
            style={{
              width: '100%',
              height: '100%',
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 3.2s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none'
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
                <g key={q.id}>
                  <path
                    d={`M 150 150 L ${x1} ${y1} A 140 140 0 0 1 ${x2} ${y2} Z`}
                    fill={isCompleted ? '#C7C7CC' : SECTOR_COLORS[idx % SECTOR_COLORS.length]}
                    stroke="#FFFFFF"
                    strokeWidth="3"
                  />
                  <text
                    x={tx}
                    y={ty}
                    fill="#FFFFFF"
                    fontSize="13"
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textAngle + 90}, ${tx}, ${ty})`}
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
            <span className="part-badge-tag primary">{currentQuestion.label}</span>
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
                <span>Girar nuevamente</span>
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
        weekNumber={1}
        scoreText={`Puntaje final: ${score} puntos`}
        onRetry={handleReset}
      />
    </div>
  );
};
