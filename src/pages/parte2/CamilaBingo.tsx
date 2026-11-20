import React, { useState } from 'react';
import { GameHeading } from '../../components/GameHeading';
import { GameProgress } from '../../components/GameProgress';
import { SuccessModal } from '../../components/SuccessModal';
import { sound } from '../../utils/sound';
import { CAMILA_BINGO_TERMS, type BingoCardItem } from '../../data/parte2Data';
import { Target, CheckCircle2, Volume2, Sparkles, RotateCcw } from 'lucide-react';

export const CamilaBingo: React.FC = () => {
  // 9 items picked for 3x3 grid
  const [boardItems] = useState<BingoCardItem[]>(() => CAMILA_BINGO_TERMS.slice(0, 9));
  const [markedIds, setMarkedIds] = useState<number[]>([]);
  const [calledDefinitionIdx, setCalledDefinitionIdx] = useState(0);
  const [wrongMark, setWrongMark] = useState(false);
  const [isBingoWon, setIsBingoWon] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const currentCalled = boardItems[calledDefinitionIdx];

  const handleToggleCell = (item: BingoCardItem) => {
    if (isBingoWon) return;
    if (!markedIds.includes(item.id) && item.id !== currentCalled.id) { sound.error(); setWrongMark(true); return; }
    setWrongMark(false);
    sound.pop();
    if (markedIds.includes(item.id)) {
      setMarkedIds(prev => prev.filter(id => id !== item.id));
    } else {
      const next = [...markedIds, item.id];
      setMarkedIds(next);
      checkBingoWin(next);
    }
  };

  const checkBingoWin = (marked: number[]) => {
    // 3x3 winning lines: rows, cols, diagonals
    const winCombos = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    const hasWonLine = winCombos.some(combo => 
      combo.every(idx => marked.includes(boardItems[idx].id))
    );

    if (hasWonLine && !isBingoWon) {
      sound.fanfare();
      setIsBingoWon(true);
      setIsSuccessOpen(true);
    }
  };

  const handleNextDefinition = () => {
    setWrongMark(false);
    sound.click();
    setCalledDefinitionIdx(prev => (prev + 1) % boardItems.length);
  };

  const handleReset = () => {
    setWrongMark(false);
    sound.click();
    setMarkedIds([]);
    setCalledDefinitionIdx(0);
    setIsBingoWon(false);
    setIsSuccessOpen(false);
  };

  return (
    <div className="part-two-game ios-animate-enter">
      <GameHeading 
        title="Bingo virtual de conceptos"
        hint="Escucha o lee las definiciones y marca los conceptos correspondientes en tu cartón 3×3." 
      />

      {wrongMark && <p role="status" className="part-two-error">Esa casilla no corresponde a la pista actual.</p>}
      <GameProgress value={markedIds.length} total={9} label="Conceptos marcados" />

      {/* Caller / Definition announcer banner */}
      <div className="ios-card" style={{
        padding: '16px',
        background: 'linear-gradient(135deg, #007AFF 0%, #0051B3 100%)',
        color: '#FFFFFF',
        borderRadius: '18px',
        marginBottom: '16px',
        boxShadow: '0 8px 20px rgba(0, 122, 255, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Volume2 size={16} />
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Definición Cantada #{calledDefinitionIdx + 1}
            </span>
          </div>
          <button
            onClick={handleNextDefinition}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-pill)',
              background: 'rgba(255, 255, 255, 0.25)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Siguiente definición ➜
          </button>
        </div>

        <p style={{ fontSize: '15px', fontWeight: 500, lineHeight: 1.4, margin: '6px 0 10px' }}>
          «{currentCalled.definition}»
        </p>

        <span style={{ fontSize: '11px', opacity: 0.85 }}>
          Busca en tu cartón el concepto que corresponde a esta definición.
        </span>
      </div>

      {/* 3x3 Bingo Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '8px',
        marginBottom: '16px'
      }}>
        {boardItems.map((item) => {
          const isMarked = markedIds.includes(item.id);

          return (
            <button
              key={item.id}
              onClick={() => handleToggleCell(item)}
              className="ios-card"
              style={{
                minWidth: 0,
                minHeight: '86px',
                overflowWrap: 'anywhere',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                background: isMarked ? 'var(--apple-blue)' : '#FFFFFF',
                color: isMarked ? '#FFFFFF' : 'var(--text-primary)',
                border: isMarked ? '2px solid var(--apple-blue)' : '1px solid var(--separator)',
                borderRadius: '14px',
                cursor: 'pointer',
                touchAction: 'manipulation',
                transition: 'all 160ms var(--ease-ios)',
                position: 'relative'
              }}
            >
              {isMarked && (
                <div style={{ position: 'absolute', top: '4px', right: '4px' }}>
                  <CheckCircle2 size={14} color="#FFFFFF" />
                </div>
              )}
              <Target size={18} style={{ marginBottom: '4px', opacity: isMarked ? 1 : 0.4 }} />
              <span style={{ fontSize: '12.5px', fontWeight: 700, lineHeight: 1.2 }}>
                {item.term}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bingo Win Button */}
      {isBingoWon && (
        <div className="ios-animate-enter" style={{
          padding: '14px',
          background: 'var(--apple-green-tint)',
          border: '1.5px solid var(--apple-green)',
          borderRadius: '16px',
          textAlign: 'center',
          marginBottom: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--apple-green)', fontWeight: 800, fontSize: '18px' }}>
            <Sparkles size={20} />
            <span>¡BINGO COMPLETADO!</span>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', marginTop: '4px' }}>
            Has completado una línea ganadora con conceptos fundamentales de evaluación.
          </p>
        </div>
      )}

      {/* Action Toolbar */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleNextDefinition}
          className="ios-button ios-button-primary"
          style={{ flex: 1, padding: '12px' }}
        >
          <span>Siguiente definición</span>
        </button>

        <button
          onClick={handleReset}
          className="ios-button ios-button-secondary"
          style={{ padding: '12px 16px' }}
          title="Reiniciar cartón"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        title="¡BINGO! Eres un maestro en conceptos"
        subtitle="Identificas con precisión criterios, evidencias, descriptores y rúbricas."
        returnTo="/parte-2"
        scoreText={`${markedIds.length} casillas marcadas con éxito`}
        onRetry={handleReset}
      />
    </div>
  );
};
