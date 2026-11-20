import React, { useState } from 'react';
import { GameHeading } from '../../components/GameHeading';
import { GameProgress } from '../../components/GameProgress';
import { SuccessModal } from '../../components/SuccessModal';
import { sound } from '../../utils/sound';
import { 
  LEIDI_BINGO_TILES, 
  LEIDI_BINGO_CALLS, 
  type LeidiBingoCardTile 
} from '../../data/parte2Data';
import { 
  Volume2, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const LeidiBingo: React.FC = () => {
  // 9 items picked for 3x3 card
  const [boardTiles] = useState<LeidiBingoCardTile[]>(() => {
    return LEIDI_BINGO_TILES.slice(0, 9);
  });

  const [markedIds, setMarkedIds] = useState<string[]>([]);
  const [callIndex, setCallIndex] = useState(0);
  const [calledHistory, setCalledHistory] = useState<number[]>([0]);
  const [isBingoWon, setIsBingoWon] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const currentCall = LEIDI_BINGO_CALLS[callIndex];

  // Check 3x3 winning patterns (rows, cols, diagonals)
  const checkWinCondition = (currentMarked: string[]) => {
    const winCombos = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Filas
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columnas
      [0, 4, 8], [2, 4, 6]             // Diagonales
    ];

    const hasWon = winCombos.some(combo =>
      combo.every(idx => currentMarked.includes(boardTiles[idx].id))
    );

    if (hasWon && !isBingoWon) {
      setIsBingoWon(true);
      sound.fanfare();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Fallback if canvas-confetti is not rendered
      }
      setTimeout(() => {
        setIsSuccessOpen(true);
      }, 900);
    }
  };

  const handleTileClick = (tile: LeidiBingoCardTile) => {
    sound.pop();
    if (markedIds.includes(tile.id)) {
      setMarkedIds(prev => prev.filter(id => id !== tile.id));
    } else {
      const next = [...markedIds, tile.id];
      setMarkedIds(next);
      checkWinCondition(next);
    }
  };

  const handleNextCall = () => {
    sound.click();
    const nextIdx = (callIndex + 1) % LEIDI_BINGO_CALLS.length;
    setCallIndex(nextIdx);
    if (!calledHistory.includes(nextIdx)) {
      setCalledHistory(h => [...h, nextIdx]);
    }
  };

  const handleReset = () => {
    sound.click();
    setMarkedIds([]);
    setCallIndex(0);
    setCalledHistory([0]);
    setIsBingoWon(false);
    setIsSuccessOpen(false);
  };

  return (
    <div className="ios-animate-enter" style={{ padding: '20px 16px 80px', maxWidth: '440px', margin: '0 auto' }}>
      <GameHeading 
        title="Leidi. El bingo de los instrumentos 🎯" 
        hint="Semana 9: Escucha la balota cantada y marca los instrumentos y propiedades en tu cartón 3×3." 
      />

      <GameProgress value={markedIds.length} total={9} label="Casillas marcadas en cartón" />

      {/* Caller (Balotero de Instrumentos) */}
      <div className="ios-card" style={{
        padding: '16px',
        background: 'linear-gradient(135deg, #007AFF 0%, #0051B3 100%)',
        color: '#FFFFFF',
        borderRadius: '20px',
        marginBottom: '16px',
        boxShadow: '0 8px 24px rgba(0, 122, 255, 0.28)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Volume2 size={18} />
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Balota #{callIndex + 1} de {LEIDI_BINGO_CALLS.length}
            </span>
          </div>

          <button
            onClick={handleNextCall}
            style={{
              padding: '5px 12px',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(255, 255, 255, 0.22)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>Siguiente balota</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <p style={{ fontSize: '15px', fontWeight: 550, lineHeight: 1.45, margin: '6px 0 10px' }}>
          {currentCall.announcement}
        </p>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          fontSize: '11.5px', 
          background: 'rgba(0, 0, 0, 0.15)', 
          padding: '6px 10px', 
          borderRadius: '10px' 
        }}>
          <span style={{ opacity: 0.9 }}>
            📖 Fuente: {currentCall.sourceCitation}
          </span>
        </div>
      </div>

      {/* 3x3 Interactive Bingo Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '9px',
        marginBottom: '16px'
      }}>
        {boardTiles.map((tile) => {
          const isMarked = markedIds.includes(tile.id);
          return (
            <button
              key={tile.id}
              onClick={() => handleTileClick(tile)}
              className="ios-scale-press"
              style={{
                aspectRatio: '1 / 1',
                borderRadius: '16px',
                border: isMarked ? '2px solid #34C759' : '1px solid var(--separator-dark)',
                background: isMarked ? '#34C759' : '#FFFFFF',
                color: isMarked ? '#FFFFFF' : 'var(--text-primary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 6px',
                cursor: 'pointer',
                textAlign: 'center',
                position: 'relative',
                boxShadow: isMarked 
                  ? '0 6px 14px rgba(52, 199, 89, 0.35)' 
                  : '0 2px 6px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {isMarked && (
                <div style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px'
                }}>
                  <CheckCircle2 size={14} color="#FFFFFF" strokeWidth={2.5} />
                </div>
              )}

              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                lineHeight: 1.25,
                marginBottom: '4px'
              }}>
                {tile.name}
              </span>

              <span style={{
                fontSize: '9.5px',
                lineHeight: 1.2,
                opacity: isMarked ? 0.92 : 0.65
              }}>
                {tile.shortDesc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Winning Indicator Banner */}
      {isBingoWon && (
        <div className="ios-card ios-animate-enter" style={{
          padding: '14px',
          background: 'rgba(52, 199, 89, 0.12)',
          border: '1.5px solid #34C759',
          color: '#1D1D1F',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <Sparkles size={24} color="#34C759" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#34C759' }}>
              ¡BINGO DE INSTRUMENTOS! 🏆
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Has completado una línea válida con los conceptos de la Semana 9.
            </div>
          </div>
          <button
            onClick={() => setIsSuccessOpen(true)}
            className="ios-button ios-button-primary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            Ver reporte
          </button>
        </div>
      )}

      {/* Control Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleReset}
          className="ios-button ios-button-secondary"
          style={{ flex: 1, padding: '12px', gap: '6px' }}
        >
          <RotateCcw size={16} />
          <span>Reiniciar cartón</span>
        </button>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        title="¡BINGO! Experta en instrumentos"
        subtitle="Identificas con precisión los 5 instrumentos de evaluación y sus propiedades de la Semana 9."
        weekNumber={9}
        scoreText={`${markedIds.length} casillas marcadas con éxito`}
        onRetry={handleReset}
      />
    </div>
  );
};

export default LeidiBingo;
