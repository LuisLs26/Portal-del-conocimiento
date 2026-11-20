import React, { useState, useEffect } from 'react';
import { GameHeading } from '../../components/GameHeading';
import { SuccessModal } from '../../components/SuccessModal';
import { sound } from '../../utils/sound';
import { CAMILA_SPEED_QUESTIONS } from '../../data/parte2Data';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

export const CamilaCarrera: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isGameOver, setIsGameOver] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<{ correct: boolean; text: string } | null>(null);

  const totalQuestions = CAMILA_SPEED_QUESTIONS.length;
  const currentQ = CAMILA_SPEED_QUESTIONS[currentIdx % totalQuestions];

  useEffect(() => {
    if (isGameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsGameOver(true);
          sound.fanfare();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameOver]);

  const handleAnswer = (choice: 'Analítica' | 'Holística') => {
    if (isGameOver) return;
    const isCorrect = choice === currentQ.correctAnswer;

    if (isCorrect) {
      sound.success();
      setScore(s => s + 100 + streak * 20);
      setStreak(st => st + 1);
      setLastFeedback({ correct: true, text: `¡Correcto! ${currentQ.quickFeedback}` });
    } else {
      sound.error();
      setStreak(0);
      setLastFeedback({ correct: false, text: `Era ${currentQ.correctAnswer}. ${currentQ.quickFeedback}` });
    }

    setCurrentIdx(i => i + 1);
  };

  const handleRestart = () => {
    sound.click();
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(45);
    setIsGameOver(false);
    setLastFeedback(null);
  };

  return (
    <div className="ios-animate-enter" style={{ padding: '20px 16px 80px', maxWidth: '440px', margin: '0 auto' }}>
      <GameHeading 
        title="Camila. Carrera contra el tiempo ⏱️" 
        hint="Clasifica a contrarreloj si cada situación corresponde a una Rúbrica Analítica o Holística." 
      />

      {/* Speedometer Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: '#FFFFFF',
        borderRadius: '16px',
        marginBottom: '14px',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color={timeLeft <= 10 ? 'var(--apple-red)' : 'var(--apple-blue)'} />
          <span style={{ fontSize: '17px', fontWeight: 800, color: timeLeft <= 10 ? 'var(--apple-red)' : 'var(--text-primary)' }}>
            {timeLeft}s
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {streak > 1 && (
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#FF9500',
              background: 'rgba(255, 149, 0, 0.12)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill)'
            }}>
              🔥 ×{streak}
            </span>
          )}
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--apple-blue)' }}>
            {score} pts
          </span>
        </div>
      </div>

      {/* Progress track */}
      <div style={{
        height: '6px',
        background: 'var(--surface-tertiary)',
        borderRadius: '3px',
        overflow: 'hidden',
        marginBottom: '16px'
      }}>
        <div style={{
          height: '100%',
          width: `${(timeLeft / 45) * 100}%`,
          background: timeLeft <= 10 ? 'var(--apple-red)' : 'var(--apple-blue)',
          transition: 'width 1s linear'
        }} />
      </div>

      {/* Prompt Card */}
      <div className="ios-card" style={{
        padding: '24px 18px',
        background: '#FFFFFF',
        marginBottom: '16px',
        minHeight: '130px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
          Desafío Rápido #{currentIdx + 1}
        </span>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35 }}>
          {currentQ.question}
        </h2>
      </div>

      {/* Binary Decision Buttons: Analítica vs Holística */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <button
          onClick={() => handleAnswer('Analítica')}
          disabled={isGameOver}
          className="ios-button"
          style={{
            minHeight: '80px',
            borderRadius: '16px',
            background: 'var(--apple-blue)',
            color: '#FFFFFF',
            fontSize: '17px',
            fontWeight: 700,
            flexDirection: 'column',
            gap: '4px',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <span>Rúbrica</span>
          <span>Analítica</span>
        </button>

        <button
          onClick={() => handleAnswer('Holística')}
          disabled={isGameOver}
          className="ios-button"
          style={{
            minHeight: '80px',
            borderRadius: '16px',
            background: '#7a52de',
            color: '#FFFFFF',
            fontSize: '17px',
            fontWeight: 700,
            flexDirection: 'column',
            gap: '4px',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <span>Rúbrica</span>
          <span>Holística</span>
        </button>
      </div>

      {/* Last Answer Instant Feedback */}
      {lastFeedback && (
        <div className="ios-animate-enter" style={{
          padding: '12px 14px',
          borderRadius: '12px',
          background: lastFeedback.correct ? 'var(--apple-green-tint)' : 'var(--apple-red-tint)',
          border: lastFeedback.correct ? '1px solid var(--apple-green)' : '1px solid var(--apple-red)',
          color: lastFeedback.correct ? 'var(--apple-green)' : 'var(--apple-red)',
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {lastFeedback.correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          <span>{lastFeedback.text}</span>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={isGameOver}
        title="¡Tiempo cumplido en la Carrera!"
        subtitle="Diferenciaste con gran agilidad las rúbricas analíticas y holísticas."
        returnTo="/parte-2"
        scoreText={`Puntuación final: ${score} pts (${currentIdx} retos completados)`}
        onRetry={handleRestart}
      />
    </div>
  );
};
