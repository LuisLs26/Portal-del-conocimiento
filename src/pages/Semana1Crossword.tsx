import { GameHeading } from '../components/GameHeading';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CROSSWORD_ITEMS,
  CROSSWORD_ROWS,
  CROSSWORD_COLS,
  type CrosswordItem,
  normalizeLetter
} from '../data/crosswordData';
import { SuccessModal } from '../components/SuccessModal';
import { sound } from '../utils/sound';
import { GameProgress } from '../components/GameProgress';
import { Check, RotateCcw, Eraser, Delete } from 'lucide-react';

interface CellPos {
  r: number;
  c: number;
}

export const Semana1Crossword: React.FC = () => {
  const [userGrid, setUserGrid] = useState<string[][]>(() =>
    Array(CROSSWORD_ROWS).fill(null).map(() => Array(CROSSWORD_COLS).fill(''))
  );

  const [selectedCell, setSelectedCell] = useState<CellPos>({ r: CROSSWORD_ITEMS[0].row, c: CROSSWORD_ITEMS[0].col });
  const [activeDirection, setActiveDirection] = useState<'H' | 'V'>(CROSSWORD_ITEMS[0].direction);
  const [activeClueId, setActiveClueId] = useState<number>(CROSSWORD_ITEMS[0].id); // COEVALUACION

  const [checkedResults, setCheckedResults] = useState<{ [key: string]: boolean } | null>(null);
  const [completedWords, setCompletedWords] = useState<number[]>([]);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const cellMap = useRef<{
    [key: string]: {
      letter: string;
      number?: number;
      words: { id: number; dir: 'H' | 'V'; index: number }[];
    };
  }>({});

  React.useMemo(() => {
    const map: typeof cellMap.current = {};
    CROSSWORD_ITEMS.forEach((item) => {
      for (let i = 0; i < item.word.length; i++) {
        const r = item.direction === 'H' ? item.row : item.row + i;
        const c = item.direction === 'H' ? item.col + i : item.col;
        const key = `${r}-${c}`;
        if (!map[key]) {
          map[key] = {
            letter: item.word[i],
            words: []
          };
        }
        if (i === 0) {
          map[key].number = item.number;
        }
        map[key].words.push({ id: item.id, dir: item.direction, index: i });
      }
    });
    cellMap.current = map;
  }, []);

  useEffect(() => {
    const key = `${selectedCell.r}-${selectedCell.c}`;
    const info = cellMap.current[key];
    if (info) {
      const match = info.words.find((w) => w.dir === activeDirection) || info.words[0];
      if (match) {
        setActiveClueId(match.id);
        setActiveDirection(match.dir);
      }
    }
  }, [selectedCell, activeDirection]);

  const advanceCursor = useCallback((r: number, c: number, dir: 'H' | 'V') => {
    if (dir === 'H') {
      const nextCol = c + 1;
      const key = `${r}-${nextCol}`;
      if (cellMap.current[key]) {
        setSelectedCell({ r, c: nextCol });
      }
    } else {
      const nextRow = r + 1;
      const key = `${nextRow}-${c}`;
      if (cellMap.current[key]) {
        setSelectedCell({ r: nextRow, c });
      }
    }
  }, []);

  const retreatCursor = useCallback((r: number, c: number, dir: 'H' | 'V') => {
    if (dir === 'H') {
      const prevCol = c - 1;
      const key = `${r}-${prevCol}`;
      if (cellMap.current[key]) {
        setSelectedCell({ r, c: prevCol });
      }
    } else {
      const prevRow = r - 1;
      const key = `${prevRow}-${c}`;
      if (cellMap.current[key]) {
        setSelectedCell({ r: prevRow, c });
      }
    }
  }, []);

  const handleInputLetter = useCallback((rawChar: string) => {
    const char = normalizeLetter(rawChar);
    if (!/^[A-Z]$/.test(char)) return;

    sound.click();
    const { r, c } = selectedCell;
    const key = `${r}-${c}`;
    if (!cellMap.current[key]) return;

    setUserGrid((prev) => {
      const next = prev.map((rowArr) => [...rowArr]);
      next[r][c] = char;
      return next;
    });

    setCheckedResults(null);
    setCompletedWords([]);
    advanceCursor(r, c, activeDirection);
  }, [selectedCell, activeDirection, advanceCursor]);

  const handleBackspace = useCallback(() => {
    sound.click();
    const { r, c } = selectedCell;
    const currentVal = userGrid[r][c];

    if (currentVal !== '') {
      setUserGrid((prev) => {
        const next = prev.map((rowArr) => [...rowArr]);
        next[r][c] = '';
        return next;
      });
      setCheckedResults(null);
      setCompletedWords([]);
    } else {
      retreatCursor(r, c, activeDirection);
    }
  }, [selectedCell, userGrid, activeDirection, retreatCursor]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        advanceCursor(selectedCell.r, selectedCell.c, 'H');
        setActiveDirection('H');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        retreatCursor(selectedCell.r, selectedCell.c, 'H');
        setActiveDirection('H');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        advanceCursor(selectedCell.r, selectedCell.c, 'V');
        setActiveDirection('V');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        retreatCursor(selectedCell.r, selectedCell.c, 'V');
        setActiveDirection('V');
      } else if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]$/.test(e.key)) {
        e.preventDefault();
        handleInputLetter(e.key);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleBackspace, handleInputLetter, advanceCursor, retreatCursor, selectedCell]);

  const handleCellClick = (r: number, c: number) => {
    const key = `${r}-${c}`;
    if (!cellMap.current[key]) return;

    sound.pop();
    if (selectedCell.r === r && selectedCell.c === c) {
      const info = cellMap.current[key];
      if (info && info.words.length > 1) {
        setActiveDirection((prev) => (prev === 'H' ? 'V' : 'H'));
      }
    } else {
      setSelectedCell({ r, c });
    }
  };

  const handleSelectClue = (clue: CrosswordItem) => {
    sound.click();
    setActiveClueId(clue.id);
    setActiveDirection(clue.direction);
    setSelectedCell({ r: clue.row, c: clue.col });
  };

  const handleCheck = () => {
    const results: { [key: string]: boolean } = {};
    const completedList: number[] = [];
    let allCorrect = true;

    CROSSWORD_ITEMS.forEach((item) => {
      let wordMatches = true;
      for (let i = 0; i < item.word.length; i++) {
        const r = item.direction === 'H' ? item.row : item.row + i;
        const c = item.direction === 'H' ? item.col + i : item.col;
        const key = `${r}-${c}`;
        const target = item.word[i];
        const entered = normalizeLetter(userGrid[r][c] || '');

        if (entered === target) {
          results[key] = true;
        } else {
          results[key] = false;
          wordMatches = false;
          allCorrect = false;
        }
      }
      if (wordMatches) {
        completedList.push(item.id);
      }
    });

    setCheckedResults(results);
    setCompletedWords(completedList);

    if (allCorrect) {
      sound.success();
      setIsSuccessOpen(true);
    } else {
      sound.error();
    }
  };

  const handleClearCurrentWord = () => {
    sound.click();
    const activeItem = CROSSWORD_ITEMS.find((it) => it.id === activeClueId);
    if (!activeItem) return;

    setUserGrid((prev) => {
      const next = prev.map((rowArr) => [...rowArr]);
      for (let i = 0; i < activeItem.word.length; i++) {
        const r = activeItem.direction === 'H' ? activeItem.row : activeItem.row + i;
        const c = activeItem.direction === 'H' ? activeItem.col + i : activeItem.col;
        next[r][c] = '';
      }
      return next;
    });
    setCheckedResults(null);
    setCompletedWords([]);
  };

  const handleResetAll = () => {
    sound.click();
    setUserGrid(Array(CROSSWORD_ROWS).fill(null).map(() => Array(CROSSWORD_COLS).fill('')));
    setCheckedResults(null);
    setCompletedWords([]);
    setSelectedCell({ r: CROSSWORD_ITEMS[0].row, c: CROSSWORD_ITEMS[0].col });
    setActiveDirection(CROSSWORD_ITEMS[0].direction);
    setActiveClueId(CROSSWORD_ITEMS[0].id);
    setIsSuccessOpen(false);
  };

  const activeWordCells = React.useMemo(() => {
    const set = new Set<string>();
    const activeItem = CROSSWORD_ITEMS.find((it) => it.id === activeClueId);
    if (activeItem) {
      for (let i = 0; i < activeItem.word.length; i++) {
        const r = activeItem.direction === 'H' ? activeItem.row : activeItem.row + i;
        const c = activeItem.direction === 'H' ? activeItem.col + i : activeItem.col;
        set.add(`${r}-${c}`);
      }
    }
    return set;
  }, [activeClueId]);

  const nativeInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const active = document.querySelector(`[data-word-position="${selectedCell.r}-${selectedCell.c}"]`) as HTMLElement | null;
    const strip = active?.parentElement;
    if (active && strip) {
      if (active.offsetLeft < strip.scrollLeft) strip.scrollLeft = active.offsetLeft;
      else if (active.offsetLeft + active.offsetWidth > strip.scrollLeft + strip.clientWidth) strip.scrollLeft = active.offsetLeft + active.offsetWidth - strip.clientWidth;
    }
  }, [selectedCell]);
  const VIRTUAL_KEYS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  const activeClueObj = CROSSWORD_ITEMS.find((it) => it.id === activeClueId);

  return (
    <div className="ios-animate-enter" style={{ padding: '24px 16px 80px' }}>
      <GameHeading title="Crucigrama" />
      <GameProgress value={completedWords.length} total={9} label="Palabras correctas" />
      {checkedResults && <p role="status">{completedWords.length === 9 ? '¡Crucigrama completo!' : 'Revisa las casillas señaladas y vuelve a comprobar.'}</p>}
      {/* Active Clue Bar (Pinned at top of activity) */}
      {activeClueObj && (
        <div
          className="ios-card"
          style={{
            padding: '12px 14px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'var(--apple-blue)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 700,
            flexShrink: 0
          }}>
            {activeClueObj.number}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--apple-blue)', textTransform: 'uppercase' }}>
              {activeDirection === 'H' ? 'Horizontal' : 'Vertical'}
            </span>
            <div style={{ fontSize: '16px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {activeClueObj.clue}
            </div>
          </div>
        </div>
      )}

      {activeClueObj && <div className="active-word-strip" aria-label="Palabra seleccionada">
        {Array.from(activeClueObj.word).map((_, index) => {
          const r = activeClueObj.row + (activeClueObj.direction === 'V' ? index : 0);
          const c = activeClueObj.col + (activeClueObj.direction === 'H' ? index : 0);
          const selected = r === selectedCell.r && c === selectedCell.c;
          return <button key={index} className={selected ? 'selected' : ''} aria-label={`Letra ${index + 1} de la palabra`} data-word-position={`${r}-${c}`} onClick={() => { setSelectedCell({ r, c }); nativeInput.current?.focus({ preventScroll: true }); }}>{userGrid[r][c]}</button>;
        })}
      </div>}
      {/* Crossword Mobile Grid Container */}
      <div
        className="ios-card"
        style={{
          padding: '10px',
          display: 'flex',
          justifyContent: 'center',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          userSelect: 'none',
          marginBottom: '12px'
        }}
      >
        <div style={{
          display: 'grid',
          width: '100%',
          gridTemplateRows: `repeat(${CROSSWORD_ROWS}, auto)`,
          gridTemplateColumns: `repeat(${CROSSWORD_COLS}, minmax(0, 1fr))`,
          gap: '1px',
          background: 'var(--surface-secondary)',
          padding: '4px',
          borderRadius: 'var(--radius-sm)'
        }}>
          {Array.from({ length: CROSSWORD_ROWS }).map((_, r) =>
            Array.from({ length: CROSSWORD_COLS }).map((_, c) => {
              const key = `${r}-${c}`;
              const info = cellMap.current[key];
              const isBlocked = !info;
              const isSelected = selectedCell.r === r && selectedCell.c === c;
              const isInActiveWord = activeWordCells.has(key);
              const userChar = userGrid[r][c];

              const isCorrect = checkedResults ? checkedResults[key] === true : null;
              const isWrong = checkedResults ? checkedResults[key] === false : null;

              if (isBlocked) {
                return (
                  <div
                    key={key}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      background: 'var(--surface-tertiary)',
                      borderRadius: '2px'
                    }}
                  />
                );
              }

              let bg = '#FFFFFF';
              let textColor = 'var(--text-primary)';

              if (isCorrect) {
                bg = 'var(--apple-green-tint)';
                textColor = 'var(--apple-green)';
              } else if (isWrong) {
                bg = 'var(--apple-red-tint)';
                textColor = 'var(--apple-red)';
              } else if (isSelected) {
                bg = 'var(--apple-blue)';
                textColor = '#FFFFFF';
              } else if (isInActiveWord) {
                bg = 'var(--apple-blue-tint)';
                textColor = 'var(--apple-blue)';
              }

              return (
                <div
                  key={key}
                  data-cross-cell={key}
                  onClick={() => { handleCellClick(r, c); nativeInput.current?.focus({ preventScroll: true }); }}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    position: 'relative',
                    background: bg,
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: textColor,
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 0 1.5px var(--apple-blue)' : 'none',
                    transition: 'background 0.1s ease'
                  }}
                >
                  {info.number && (
                    <span style={{
                      position: 'absolute',
                      top: '1px',
                      left: '1px',
                      fontSize: '8px',
                      fontWeight: 700,
                      lineHeight: 1,
                      color: isSelected ? '#FFFFFF' : 'var(--text-secondary)'
                    }}>
                      {info.number}
                    </span>
                  )}
                  <span style={{ marginTop: '1px' }}>{userChar}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <input className="crossword-input" ref={nativeInput} aria-label="Letra del crucigrama" autoComplete="off" autoCapitalize="characters" value="" style={{ width: '100%', fontSize: 16, padding: '10px 12px', border: '1px solid var(--separator)', borderRadius: 12, background: 'white', marginBottom: 10 }} placeholder="Toca una casilla y escribe aquí" onChange={e => { for (const letter of e.target.value.slice(-1)) handleInputLetter(letter); }} onKeyDown={e => { if (e.key === 'Backspace') { e.preventDefault(); handleBackspace(); } }} />
      {/* Action Buttons Row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <button
          onClick={handleCheck}
          className="ios-button ios-button-primary"
          style={{ flex: 2, padding: '10px 14px', fontSize: '15px' }}
        >
          <Check size={16} strokeWidth={2.5} />
          <span>Comprobar</span>
        </button>

        <button
          onClick={handleClearCurrentWord}
          className="ios-button ios-button-secondary"
          style={{ flex: 1, padding: '10px 8px', fontSize: '16px' }}
          title="Borrar palabra activa"
        >
          <Eraser size={14} />
          <span>Borrar</span>
        </button>

        <button
          onClick={handleResetAll}
          className="ios-button ios-button-secondary"
          style={{ width: '40px', padding: 0 }}
          title="Reiniciar todo"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <details className="game-details"><summary>Teclado en pantalla</summary>
      {/* iOS Mobile Virtual Keyboard */}
      <div
        style={{
          background: 'var(--surface-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 4px',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-subtle)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {VIRTUAL_KEYS.map((row, rIdx) => (
            <div key={rIdx} style={{ display: 'flex', justifyContent: 'center', gap: '3px' }}>
              {row.map((k) => (
                <button
                  key={k}
                  onClick={() => handleInputLetter(k)}
                  className="ios-button"
                  style={{
                    flex: 1,
                    maxWidth: '34px',
                    height: '38px',
                    padding: 0,
                    fontSize: '15px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    background: '#FFFFFF',
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--shadow-key)'
                  }}
                >
                  {k}
                </button>
              ))}
              {rIdx === 2 && (
                <button
                  onClick={handleBackspace}
                  className="ios-button"
                  style={{
                    minWidth: '38px',
                    height: '38px',
                    padding: 0,
                    borderRadius: '6px',
                    background: '#D1D1D6',
                    color: 'var(--text-primary)'
                  }}
                  title="Borrar"
                >
                  <Delete size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      </details>
      <details className="game-details" data-clues><summary>Todas las pistas ({completedWords.length}/9 completadas)</summary>
      {/* Clean Clue List in Apple List Style */}
      <div className="ios-card" style={{ padding: '16px 14px' }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '10px'
        }}>
          Todas las Pistas ({completedWords.length}/9 completadas)
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {CROSSWORD_ITEMS.map((item) => {
            const isActive = activeClueId === item.id;
            const isDone = completedWords.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => handleSelectClue(item)}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'var(--apple-blue-tint)' : 'var(--surface-secondary)',
                  border: isActive ? '1px solid var(--apple-blue)' : '1px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'baseline'
                }}
              >
                <span style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: isActive ? 'var(--apple-blue)' : 'var(--text-secondary)'
                }}>
                  {item.number}.
                </span>
                <span style={{
                  fontSize: '15px',
                  color: isDone ? 'var(--apple-green)' : 'var(--text-primary)',
                  textDecoration: isDone ? 'line-through' : 'none',
                  lineHeight: 1.5
                }}>
                  {item.clue}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      </details>
      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        title="¡Excelente! Has completado el crucigrama."
        subtitle="Identificas con éxito los fundamentos y agentes de la evaluación formativa."
        weekNumber={1}
        scoreText="9 de 9 palabras correctas"
        onRetry={handleResetAll}
      />
    </div>
  );
};
