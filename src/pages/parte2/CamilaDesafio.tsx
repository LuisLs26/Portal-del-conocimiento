import React, { useState, useEffect } from 'react';
import { GameHeading } from '../../components/GameHeading';
import { GameProgress } from '../../components/GameProgress';
import { SuccessModal } from '../../components/SuccessModal';
import { sound } from '../../utils/sound';
import { CAMILA_DESAFIO_QUESTIONS } from '../../data/parte2Data';
import { Trophy, CheckCircle2, XCircle, ArrowRight, Zap } from 'lucide-react';

const SHAPE_COLORS = [
  '#FF3B30', // Red Triangle
  '#007AFF', // Blue Rhombus
  '#FF9500', // Orange Circle
  '#34C759'  // Green Square
];

const SHAPE_SYMBOLS = ['▲', '◆', '●', '■'];

export const CamilaDesafio: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isFinished, setIsFinished] = useState(false);

  const totalQuestions = CAMILA_DESAFIO_QUESTIONS.length;
  const currentQ = CAMILA_DESAFIO_QUESTIONS[currentIdx];

  useEffect(() => {
    if (showFeedback || isFinished) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIdx, showFeedback, isFinished]);

  const handleTimeOut = () => {
    sound.error();
    setShowFeedback(true);
    setStreak(0);
  };

  const handleSelectOption = (idx: number) => {
    if (showFeedback) return;
    sound.pop();
    setSelectedIdx(idx);
    setShowFeedback(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      sound.success();
      const speedBonus = timeLeft * 10;
      setScore(s => s + 500 + speedBonus);
      setStreak(st => st + 1);
    } else {
      sound.error();
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    sound.click();
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(i => i + 1);
      setSelectedIdx(null);
      setShowFeedback(false);
      setTimeLeft(20);
    } else {
      setIsFinished(true);
      sound.fanfare();
    }
  };

  const handleRestart = () => {
    sound.click();
    setCurrentIdx(0);
    setSelectedIdx(null);
    setShowFeedback(false);
    setScore(0);
    setStreak(0);
    setTimeLeft(20);
    setIsFinished(false);
  };

  return (
    <div className="ios-animate-enter" style={{ padding: '20px 16px 80px', maxWidth: '440px', margin: '0 auto' }}>
      <GameHeading 
        title="Camila. ¡Desafío de conocimientos! 🏆" 
        hint="Responde contra el reloj y demuestra tu dominio en construcción de instrumentos." 
      />

      {/* Top Kahoot Status Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '12px',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Trophy size={16} color="#FF9500" />
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{score} pts</span>
        </div>

        {streak > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: 800,
            color: '#FF9500',
            background: 'rgba(255, 149, 0, 0.12)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)'
          }}>
            <Zap size={13} fill="#FF9500" />
            <span>Racha ×{streak}</span>
          </div>
        )}

        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: timeLeft <= 5 ? 'var(--apple-red-tint)' : 'var(--apple-blue-tint)',
          color: timeLeft <= 5 ? 'var(--apple-red)' : 'var(--apple-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 800
        }}>
          {timeLeft}
        </div>
      </div>

      <GameProgress value={currentIdx + (showFeedback ? 1 : 0)} total={totalQuestions} label="Preguntas superadas" />

      {/* Question Card */}
      <div className="ios-card" style={{
        padding: '20px 16px',
        background: '#FFFFFF',
        marginBottom: '14px',
        minHeight: '110px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--apple-blue)', textTransform: 'uppercase', marginBottom: '6px' }}>
          Pregunta {currentIdx + 1} de {totalQuestions}
        </span>
        <h2 style={{ fontSize: '17.5px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35 }}>
          {currentQ.question}
        </h2>
      </div>

      {/* Kahoot 4-Grid Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        {currentQ.options.map((opt, idx) => {
          const isSelected = selectedIdx === idx;
          const isCorrect = idx === currentQ.correctIndex;
          let opacity = 1;

          if (showFeedback && !isCorrect && !isSelected) {
            opacity = 0.35;
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              disabled={showFeedback}
              style={{
                minHeight: '90px',
                padding: '12px',
                borderRadius: '16px',
                background: SHAPE_COLORS[idx % 4],
                color: '#FFFFFF',
                border: isSelected ? '3px solid #1D1D1F' : 'none',
                boxShadow: isSelected ? '0 0 0 2px #FFFFFF, 0 4px 12px rgba(0,0,0,0.2)' : 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textAlign: 'left',
                cursor: showFeedback ? 'default' : 'pointer',
                opacity,
                transition: 'transform 120ms ease, opacity 200ms ease',
                position: 'relative',
                touchAction: 'manipulation'
              }}
            >
              <span style={{ fontSize: '18px', lineHeight: 1 }}>{SHAPE_SYMBOLS[idx % 4]}</span>
              <span style={{ fontSize: '13.5px', fontWeight: 600, lineHeight: 1.3 }}>{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback Panel */}
      {showFeedback && (
        <div className="ios-card ios-animate-enter" style={{
          padding: '16px',
          background: selectedIdx === currentQ.correctIndex ? 'var(--apple-green-tint)' : 'var(--surface-secondary)',
          border: selectedIdx === currentQ.correctIndex ? '1px solid var(--apple-green)' : '1px solid var(--separator)',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            {selectedIdx === currentQ.correctIndex ? (
              <>
                <CheckCircle2 size={18} color="var(--apple-green)" />
                <strong style={{ fontSize: '14px', color: 'var(--apple-green)' }}>¡Respuesta Correcta!</strong>
              </>
            ) : (
              <>
                <XCircle size={18} color="var(--apple-red)" />
                <strong style={{ fontSize: '14px', color: 'var(--apple-red)' }}>
                  {selectedIdx === null ? '¡Tiempo agotado!' : 'Respuesta Incorrecta'}
                </strong>
              </>
            )}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.45, marginBottom: '14px' }}>
            {currentQ.explanation}
          </p>
          <button
            onClick={handleNextQuestion}
            className="ios-button ios-button-primary"
            style={{ width: '100%', padding: '12px', fontSize: '14px' }}
          >
            <span>{currentIdx < totalQuestions - 1 ? 'Siguiente Desafío' : 'Ver Puntuación Final'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={isFinished}
        title="¡Completaste el Desafío de Conocimientos!"
        subtitle="Demostraste tu rapidez y solidez en conceptos de construcción de instrumentos."
        returnTo="/parte-2"
        scoreText={`Puntaje final: ${score} puntos`}
        onRetry={handleRestart}
      />
    </div>
  );
};
