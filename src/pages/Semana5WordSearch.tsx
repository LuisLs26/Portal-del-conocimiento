import { GameHeading } from '../components/GameHeading';
import { straightPath } from '../data/gameRules';
import { GameProgress } from '../components/GameProgress';
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
  const previewCells = useRef<HTMLElement[]>([]);
  const [foundPaths, setFoundPaths] = useState<CellCoords[][]>([]);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const gridContainerRef = useRef<HTMLDivElement>(null);

  const initGame = useCallback(() => {
    const generated = generateWordSearchGrid(gridSize);
    setBoard(generated);
    gesture.current = null;
    setFeedback('');
    setFoundWords([]);
    clearPreview();
    setFoundPaths([]);
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

  const getSelectedPath = straightPath;
  const gesture = useRef<{ pointer: number; start: CellCoords; end: CellCoords } | null>(null);
  const [feedback, setFeedback] = useState('');

  function clearPreview() {
    previewCells.current.forEach(cell => cell.classList.remove('word-preview'));
    previewCells.current = [];
  }
  function showPreview(start: CellCoords, end: CellCoords) {
    clearPreview();
    for (const p of straightPath(start, end)) {
      const cell = gridContainerRef.current?.querySelector<HTMLElement>(`[data-r="${p.r}"][data-c="${p.c}"]`);
      if (cell) { cell.classList.add('word-preview'); previewCells.current.push(cell); }
    }
  }

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
    if (gesture.current || !e.isPrimary) return;
    e.preventDefault();
    gridContainerRef.current?.setPointerCapture(e.pointerId);
    gesture.current = { pointer: e.pointerId, start: { r, c }, end: { r, c } };
    setFeedback('');
    sound.pop();
    showPreview({ r, c }, { r, c });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!gesture.current || gesture.current.pointer !== e.pointerId) return;
    const cell = getCellFromPoint(e.clientX, e.clientY);
    if (cell && (cell.r !== gesture.current.end.r || cell.c !== gesture.current.end.c)) {
      gesture.current.end = cell;
      showPreview(gesture.current.start, cell);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const current = gesture.current;
    if (!current || current.pointer !== e.pointerId) return;
    gesture.current = null;
    if (gridContainerRef.current?.hasPointerCapture(e.pointerId)) gridContainerRef.current.releasePointerCapture(e.pointerId);
    if (!board) {
      clearPreview();
      return;
    }

    const path = getSelectedPath(current.start, current.end);
    const formedLetters = path.map((pt) => board.grid[pt.r][pt.c]).join('');
    const reversedLetters = formedLetters.split('').reverse().join('');

    const matched = board.placedWords.find(
      (pw) => (pw.word === formedLetters || pw.word === reversedLetters) && !foundWords.includes(pw.word)
    );

    if (matched) {
      sound.success();
      setFeedback('¡Palabra encontrada!');
      const updatedFound = [...foundWords, matched.word];
      setFoundWords(updatedFound);
      setFoundPaths(prev => [...prev, path]);

      if (updatedFound.length === board.placedWords.length) {
        setIsTimerRunning(false);
        setIsSuccessModalOpen(true);
      }
    } else {
      setFeedback('La selección no forma una palabra nueva. Intenta nuevamente.');
      sound.error();
    }

    clearPreview();
  };

  const foundCellColorMap = React.useMemo(() => {
    const map: { [key: string]: boolean } = {};
    if (!board) return map;

    foundPaths.flat().forEach(pt => { map[`${pt.r}-${pt.c}`] = true; });
    return map;
  }, [board, foundPaths]);

  if (!board) return null;

  return (
    <div className="ios-animate-enter" style={{ padding: '24px 16px 80px' }}>
      <GameHeading title="Sopa de letras" hint="Desliza de la primera a la última letra." />
      <GameProgress value={foundWords.length} total={12} label="Palabras encontradas" />
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
          fontSize: '15px',
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
          fontSize: '14px',
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
        onPointerUp={e => { e.preventDefault(); handlePointerMove(e); handlePointerUp(e); }}
        onPointerCancel={() => { gesture.current = null; clearPreview(); }}
      >
        <div
          ref={gridContainerRef}
          onLostPointerCapture={() => { gesture.current = null; clearPreview(); }}
          style={{
            display: 'grid',
            width: '100%',
            gridTemplateRows: `repeat(${gridSize}, auto)`,
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            gap: '1px',
            background: 'var(--surface-secondary)',
            padding: '4px',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          {board.grid.map((row, r) =>
            row.map((letter, c) => {
              const key = `${r}-${c}`;
              const isFound = foundCellColorMap[key];

              let bg = '#FFFFFF';
              let color = 'var(--text-primary)';

              if (isFound) {
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
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: '3px',
                    background: bg,
                    color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
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

      <p role="status">{feedback}</p>
      {/* Reset Button */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <button
          onClick={() => {
            sound.click();
            initGame();
          }}
          className="ios-button ios-button-secondary"
          style={{ width: '100%', padding: '10px', fontSize: '15px' }}
        >
          <RotateCcw size={14} />
          <span>Nueva partida</span>
        </button>
      </div>

      {/* Words Checklist */}
      <div className="ios-card" style={{ padding: '14px 12px' }}>
        <div style={{
          fontSize: '15px',
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
                  fontSize: '15px',
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
