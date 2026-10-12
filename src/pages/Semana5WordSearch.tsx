import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  generateWordSearchGrid, 
  type PlacedWord, 
  WORD_SEARCH_WORDS 
} from '../data/wordSearchData';
import { SuccessModal } from '../components/SuccessModal';
import { sound } from '../utils/sound';
import { Clock, RotateCcw, Check, Search } from 'lucide-react';

interface CellCoords {
  r: number;
  c: number;
}

export const Semana5WordSearch: React.FC = () => {
  const [gridSize] = useState(16);
  const [board, setBoard] = useState<{
    grid: string[][];
    placedWords: PlacedWord[];
  } | null>(null);

  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startCell, setStartCell] = useState<CellCoords | null>(null);
  const [currentCell, setCurrentCell] = useState<CellCoords | null>(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const gridContainerRef = useRef<HTMLDivElement>(null);

  const initGame = useCallback(() => {
    const generated = generateWordSearchGrid(gridSize);
    setBoard(generated);
    setFoundWords([]);
    setStartCell(null);
    setCurrentCell(null);
    setIsSelecting(false);
    setElapsedSeconds(0);
    setIsTimerRunning(true);
    setIsSuccessModalOpen(false);
  }, [gridSize]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setElapsedSeconds((sec) => sec + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getSelectedPath = useCallback((start: CellCoords, end: CellCoords): CellCoords[] => {
    const dr = end.r - start.r;
    const dc = end.c - start.c;
    const absR = Math.abs(dr);
    const absC = Math.abs(dc);

    if (absR === 0 && absC === 0) return [start];

    const isHorizontal = absR === 0;
    const isVertical = absC === 0;
    const isDiagonal = absR === absC;

    if (!isHorizontal && !isVertical && !isDiagonal) return [start];

    const steps = Math.max(absR, absC);
    const stepR = dr === 0 ? 0 : dr / absR;
    const stepC = dc === 0 ? 0 : dc / absC;

    const path: CellCoords[] = [];
    for (let i = 0; i <= steps; i++) {
      path.push({
        r: start.r + stepR * i,
        c: start.c + stepC * i
      });
    }
    return path;
  }, []);

  const activeSelectionPath = React.useMemo(() => {
    if (!isSelecting || !startCell || !currentCell) return [];
    return getSelectedPath(startCell, currentCell);
  }, [isSelecting, startCell, currentCell, getSelectedPath]);

  const getCellFromPoint = (clientX: number, clientY: number): CellCoords | null => {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return null;
    const cellEl = el.closest('[data-cell]') as HTMLElement | null;
    if (!cellEl) return null;
    const r = parseInt(cellEl.dataset.r || '-1', 10);
    const c = parseInt(cellEl.dataset.c || '-1', 10);
    if (r >= 0 && c >= 0) return { r, c };
    return null;
  };

  const handlePointerDown = (r: number, c: number, e: React.PointerEvent) => {
    e.preventDefault();
    sound.pop();
    setIsSelecting(true);
    setStartCell({ r, c });
    setCurrentCell({ r, c });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isSelecting) return;
    const cell = getCellFromPoint(e.clientX, e.clientY);
    if (cell) {
      setCurrentCell(cell);
    }
  };

  const handlePointerUp = () => {
    if (!isSelecting || !startCell || !currentCell || !board) {
      setIsSelecting(false);
      return;
    }

    const path = getSelectedPath(startCell, currentCell);
    const formedLetters = path.map((pt) => board.grid[pt.r][pt.c]).join('');
    const reversedLetters = formedLetters.split('').reverse().join('');

    const matched = board.placedWords.find(
      (pw) => (pw.word === formedLetters || pw.word === reversedLetters) && !foundWords.includes(pw.word)
    );

    if (matched) {
      sound.success();
      const updatedFound = [...foundWords, matched.word];
      setFoundWords(updatedFound);

      if (updatedFound.length === board.placedWords.length) {
        setIsTimerRunning(false);
        setTimeout(() => {
          setIsSuccessModalOpen(true);
        }, 400);
      }
    } else {
      sound.click();
    }

    setIsSelecting(false);
    setStartCell(null);
    setCurrentCell(null);
  };

  const foundCellColorMap = React.useMemo(() => {
    const map: { [key: string]: boolean } = {};
    if (!board) return map;

    board.placedWords.forEach((pw) => {
      if (foundWords.includes(pw.word)) {
        pw.path.forEach((pt) => {
          map[`${pt.r}-${pt.c}`] = true;
        });
      }
    });
    return map;
  }, [board, foundWords]);

  if (!board) return null;

  return (
    <div className="ios-animate-enter" style={{ padding: '12px 10px 40px' }}>
      {/* Top Status Indicators Pill */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 10px',
          borderRadius: 'var(--radius-pill)',
          background: 'var(--apple-blue-tint)',
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--apple-blue)',
          textTransform: 'uppercase'
        }}>
          <Search size={12} />
          <span>{foundWords.length} de {WORD_SEARCH_WORDS.length} palabras</span>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-secondary)'
        }}>
          <Clock size={13} />
          <span>{formatTime(elapsedSeconds)}</span>
        </div>
      </div>

      {/* Sopa de Letras Mobile Grid */}
      <div 
        className="ios-card"
        style={{
          padding: '8px',
          display: 'flex',
          justifyContent: 'center',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          userSelect: 'none',
          touchAction: 'none',
          marginBottom: '12px'
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div 
          ref={gridContainerRef}
          style={{
            display: 'grid',
            gridTemplateRows: `repeat(${gridSize}, 20px)`,
            gridTemplateColumns: `repeat(${gridSize}, 20px)`,
            gap: '1px',
            background: 'var(--surface-secondary)',
            padding: '4px',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          {board.grid.map((row, r) =>
            row.map((letter, c) => {
              const key = `${r}-${c}`;
              const isSelected = activeSelectionPath.some((pt) => pt.r === r && pt.c === c);
              const isFound = foundCellColorMap[key];

              let bg = '#FFFFFF';
              let color = 'var(--text-primary)';

              if (isSelected) {
                bg = 'var(--apple-blue)';
                color = '#FFFFFF';
              } else if (isFound) {
                bg = 'var(--apple-green-tint)';
                color = 'var(--apple-green)';
              }

              return (
                <div
                  key={key}
                  data-cell="true"
                  data-r={r}
                  data-c={c}
                  onPointerDown={(e) => handlePointerDown(r, c, e)}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '3px',
                    background: bg,
                    color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {letter}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reset Button */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <button
          onClick={() => {
            sound.click();
            initGame();
          }}
          className="ios-button ios-button-secondary"
          style={{ width: '100%', padding: '10px', fontSize: '13px' }}
        >
          <RotateCcw size={14} />
          <span>Nueva partida</span>
        </button>
      </div>

      {/* Words Checklist */}
      <div className="ios-card" style={{ padding: '14px 12px' }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '8px'
        }}>
          Palabras a buscar
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {WORD_SEARCH_WORDS.map((item) => {
            const isFound = foundWords.includes(item.word);
            return (
              <div
                key={item.id}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-pill)',
                  background: isFound ? 'var(--apple-green-tint)' : 'var(--surface-secondary)',
                  border: isFound ? '1px solid var(--apple-green)' : '1px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: isFound ? 'var(--apple-green)' : 'var(--text-secondary)',
                  textDecoration: isFound ? 'line-through' : 'none',
                  opacity: isFound ? 0.7 : 1
                }}
              >
                <span>{item.display}</span>
                {isFound && <Check size={11} strokeWidth={3} />}
              </div>
            );
          })}
        </div>
      </div>

      <SuccessModal
        isOpen={isSuccessModalOpen}
        title="¡Felicitaciones!"
        subtitle="Encontraste todas las palabras en la sopa de letras."
        weekNumber={5}
        scoreText={`Tiempo: ${formatTime(elapsedSeconds)}`}
        onRetry={initGame}
      />
    </div>
  );
};
