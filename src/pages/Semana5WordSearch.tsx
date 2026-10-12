import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  generateWordSearchGrid, 
  type PlacedWord, 
  WORD_SEARCH_WORDS 
} from '../data/wordSearchData';
import { SuccessModal } from '../components/SuccessModal';
import { sound } from '../utils/sound';
import { 
  Sparkles, 
  Clock, 
  RotateCcw, 
  Check, 
  Search 
} from 'lucide-react';

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

  // Set of found words (by normalized word string)
  const [foundWords, setFoundWords] = useState<string[]>([]);

  // Active drag selection
  const [isSelecting, setIsSelecting] = useState(false);
  const [startCell, setStartCell] = useState<CellCoords | null>(null);
  const [currentCell, setCurrentCell] = useState<CellCoords | null>(null);

  // Timer in seconds
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Initialize new game board
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

  // Elapsed timer ticker
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setElapsedSeconds((sec) => sec + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Calculate straight line cells between start and current cell
  const getSelectedPath = useCallback((start: CellCoords, end: CellCoords): CellCoords[] => {
    const dr = end.r - start.r;
    const dc = end.c - start.c;
    const absR = Math.abs(dr);
    const absC = Math.abs(dc);

    // Must be either horizontal, vertical, or 45 deg diagonal
    if (absR === 0 && absC === 0) {
      return [start];
    }

    const isHorizontal = absR === 0;
    const isVertical = absC === 0;
    const isDiagonal = absR === absC;

    if (!isHorizontal && !isVertical && !isDiagonal) {
      return [start]; // invalid line
    }

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

  // Compute active selection path
  const activeSelectionPath = React.useMemo(() => {
    if (!isSelecting || !startCell || !currentCell) return [];
    return getSelectedPath(startCell, currentCell);
  }, [isSelecting, startCell, currentCell, getSelectedPath]);

  // Read cell from pointer event target or position
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

  // Touch / Pointer Down
  const handlePointerDown = (r: number, c: number, e: React.PointerEvent) => {
    e.preventDefault();
    sound.pop();
    setIsSelecting(true);
    setStartCell({ r, c });
    setCurrentCell({ r, c });
  };

  // Touch / Pointer Move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isSelecting) return;
    const cell = getCellFromPoint(e.clientX, e.clientY);
    if (cell) {
      setCurrentCell(cell);
    }
  };

  // Touch / Pointer Up
  const handlePointerUp = () => {
    if (!isSelecting || !startCell || !currentCell || !board) {
      setIsSelecting(false);
      return;
    }

    const path = getSelectedPath(startCell, currentCell);
    const formedLetters = path.map((pt) => board.grid[pt.r][pt.c]).join('');
    const reversedLetters = formedLetters.split('').reverse().join('');

    // Check if formed letters match any placed word
    const matched = board.placedWords.find(
      (pw) => (pw.word === formedLetters || pw.word === reversedLetters) && !foundWords.includes(pw.word)
    );

    if (matched) {
      sound.success();
      const updatedFound = [...foundWords, matched.word];
      setFoundWords(updatedFound);

      // Check if all 12 words found
      if (updatedFound.length === board.placedWords.length) {
        setIsTimerRunning(false);
        setTimeout(() => {
          setIsSuccessModalOpen(true);
        }, 500);
      }
    } else {
      sound.click();
    }

    setIsSelecting(false);
    setStartCell(null);
    setCurrentCell(null);
  };

  // Map of cells that belong to already found words
  const foundCellColorMap = React.useMemo(() => {
    const map: { [key: string]: string } = {};
    if (!board) return map;

    board.placedWords.forEach((pw) => {
      if (foundWords.includes(pw.word)) {
        pw.path.forEach((pt) => {
          map[`${pt.r}-${pt.c}`] = pw.color;
        });
      }
    });
    return map;
  }, [board, foundWords]);

  if (!board) return null;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px 16px 60px' }}>
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
          <span>Semana 5 • Criterios y Evidencias</span>
        </div>

        <h1 className="font-editorial" style={{
          fontSize: 'clamp(26px, 4vw, 36px)',
          fontWeight: 700,
          color: 'var(--verde-oscuro)',
          lineHeight: 1.2,
          marginBottom: '6px'
        }}>
          Sopa de Letras Interactiva
        </h1>

        <p style={{ fontSize: '14px', color: 'var(--gris-neutro)', maxWidth: '640px', margin: '0 auto' }}>
          Arrastra tu dedo o cursor en cualquier dirección (horizontal, vertical o diagonal) para seleccionar las 12 palabras clave.
        </p>

        {/* Status Indicators Pill */}
        <div style={{
          marginTop: '14px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '16px',
          padding: '6px 20px',
          background: 'rgba(255, 255, 255, 0.75)',
          border: '1px solid rgba(197, 161, 90, 0.35)',
          borderRadius: 'var(--radius-pill)',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--verde-oscuro)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={15} color="var(--dorado-elegante)" />
            <span>
              {foundWords.length} de {WORD_SEARCH_WORDS.length} palabras
            </span>
          </div>

          <div style={{ width: '1px', height: '14px', background: 'rgba(18, 61, 50, 0.15)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} color="var(--dorado-elegante)" />
            <span>Tiempo: {formatTime(elapsedSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Main Container: 16x16 Grid on Left, Word List on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left Column: Letter Grid */}
        <div 
          className="liquid-glass"
          style={{
            padding: '20px 14px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            touchAction: 'none'
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div 
            ref={gridContainerRef}
            style={{
              display: 'inline-block',
              padding: '12px',
              background: 'rgba(18, 61, 50, 0.05)',
              border: '1px solid rgba(18, 61, 50, 0.1)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.03)'
            }}
          >
            <div style={{
              display: 'grid',
              gridTemplateRows: `repeat(${gridSize}, 28px)`,
              gridTemplateColumns: `repeat(${gridSize}, 28px)`,
              gap: '2px'
            }}>
              {board.grid.map((row, r) =>
                row.map((letter, c) => {
                  const key = `${r}-${c}`;
                  const isSelected = activeSelectionPath.some((pt) => pt.r === r && pt.c === c);
                  const foundColor = foundCellColorMap[key];

                  let bg = '#FFFFFF';
                  let color = 'var(--gris-oscuro)';
                  let transform = 'scale(1)';

                  if (isSelected) {
                    bg = 'rgba(197, 161, 90, 0.85)';
                    color = '#FFFFFF';
                    transform = 'scale(1.08)';
                  } else if (foundColor) {
                    bg = foundColor;
                    color = 'var(--verde-oscuro)';
                  }

                  return (
                    <div
                      key={key}
                      data-cell="true"
                      data-r={r}
                      data-c={c}
                      onPointerDown={(e) => handlePointerDown(r, c, e)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: bg,
                        color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transform,
                        boxShadow: isSelected ? '0 2px 6px rgba(197, 161, 90, 0.3)' : 'none',
                        transition: 'background 0.12s ease, transform 0.12s ease'
                      }}
                    >
                      {letter}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                sound.click();
                initGame();
              }}
              className="apple-button apple-button-secondary"
              style={{ padding: '10px 18px', fontSize: '13px' }}
            >
              <RotateCcw size={15} />
              <span>Generar nueva partida</span>
            </button>
          </div>
        </div>

        {/* Right Column: Words Checklist */}
        <div className="liquid-glass" style={{ padding: '24px 22px' }}>
          <div style={{
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--verde-oscuro)',
            fontFamily: 'var(--font-editorial)',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>Palabras a buscar</span>
            <span style={{ fontSize: '12px', color: 'var(--dorado-elegante)', fontFamily: 'var(--font-ui)' }}>
              {foundWords.length}/{WORD_SEARCH_WORDS.length}
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '8px'
          }}>
            {WORD_SEARCH_WORDS.map((item) => {
              const isFound = foundWords.includes(item.word);
              return (
                <div
                  key={item.id}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-pill)',
                    background: isFound ? 'rgba(45, 138, 91, 0.15)' : 'rgba(255, 255, 255, 0.65)',
                    border: isFound ? '1px solid var(--verde-exito)' : '1px solid rgba(18, 61, 50, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: isFound ? 'var(--verde-exito)' : 'var(--gris-oscuro)',
                    textDecoration: isFound ? 'line-through' : 'none',
                    opacity: isFound ? 0.75 : 1,
                    transition: 'all 0.18s var(--ease-apple)'
                  }}
                >
                  <span>{item.display}</span>
                  {isFound && <Check size={14} color="var(--verde-exito)" strokeWidth={2.8} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        title="¡Felicitaciones! Encontraste todas las palabras."
        subtitle="Has descubierto con éxito los 12 conceptos de situaciones significativas y evidencias."
        weekNumber={5}
        scoreText={`Tiempo completado: ${formatTime(elapsedSeconds)}`}
        onRetry={initGame}
      />
    </div>
  );
};
