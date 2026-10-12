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
import { Check, RotateCcw, Eraser, Sparkles, HelpCircle, Delete } from 'lucide-react';

interface CellPos {
  r: number;
  c: number;
}

export const Semana1Crossword: React.FC = () => {
  // Matrix of user entries
  const [userGrid, setUserGrid] = useState<string[][]>(() =>
    Array(CROSSWORD_ROWS).fill(null).map(() => Array(CROSSWORD_COLS).fill(''))
  );

  // Selected cell & active direction
  const [selectedCell, setSelectedCell] = useState<CellPos>({ r: 0, c: 3 });
  const [activeDirection, setActiveDirection] = useState<'H' | 'V'>('H');
  const [activeClueId, setActiveClueId] = useState<number>(6); // COEVALUACION

  // Validation feedback states
  const [checkedResults, setCheckedResults] = useState<{ [key: string]: boolean } | null>(null);
  const [completedWords, setCompletedWords] = useState<number[]>([]);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate static grid layout information
  const cellMap = useRef<{
    [key: string]: {
      letter: string;
      number?: number;
      words: { id: number; dir: 'H' | 'V'; index: number }[];
    };
  }>({});

  // Initialize cell mapping
  useEffect(() => {
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

  // Update active clue based on selected cell & direction
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

  // Select a clue directly
  const handleSelectClue = (clue: CrosswordItem) => {
    sound.click();
    setActiveClueId(clue.id);
    setActiveDirection(clue.direction);
    setSelectedCell({ r: clue.row, c: clue.col });
  };

  // Move cursor forward in current direction
  const advanceCursor = useCallback((r: number, c: number, dir: 'H' | 'V') => {
    const activeItem = CROSSWORD_ITEMS.find((it) => it.id === activeClueId);
    if (!activeItem) return;

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
  }, [activeClueId]);

  // Move cursor backward
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

  // Insert letter into selected cell
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

    // Clear checked state when typing
    setCheckedResults(null);

    // Advance
    advanceCursor(r, c, activeDirection);
  }, [selectedCell, activeDirection, advanceCursor]);

  // Backspace / Erase current cell
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
    } else {
      retreatCursor(r, c, activeDirection);
    }
  }, [selectedCell, userGrid, activeDirection, retreatCursor]);

  // Physical keyboard listener
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

  // Handle cell click in grid
  const handleCellClick = (r: number, c: number) => {
    const key = `${r}-${c}`;
    if (!cellMap.current[key]) return;

    sound.pop();
    if (selectedCell.r === r && selectedCell.c === c) {
      // Toggle direction if at intersection
      const info = cellMap.current[key];
      if (info && info.words.length > 1) {
        const nextDir = activeDirection === 'H' ? 'V' : 'H';
        setActiveDirection(nextDir);
      }
    } else {
      setSelectedCell({ r, c });
    }
  };

  // Check answers
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

  // Clear current word
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
  };

  // Reset entire crossword
  const handleResetAll = () => {
    sound.click();
    setUserGrid(Array(CROSSWORD_ROWS).fill(null).map(() => Array(CROSSWORD_COLS).fill('')));
    setCheckedResults(null);
    setCompletedWords([]);
    setSelectedCell({ r: 0, c: 3 });
    setActiveDirection('H');
    setIsSuccessOpen(false);
  };

  // Compute active word highlighted cells
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

  // Virtual iOS Keyboard Rows
  const VIRTUAL_KEYS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  return (
    <div 
      ref={containerRef}
      style={{ maxWidth: '1100px', margin: '0 auto', padding: '16px 16px 60px' }}
    >
      {/* Activity Header */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
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
          <span>Semana 1 • Actividad Formativa</span>
        </div>

        <h1 className="font-editorial" style={{
          fontSize: 'clamp(26px, 4vw, 36px)',
          fontWeight: 700,
          color: 'var(--verde-oscuro)',
          lineHeight: 1.2,
          marginBottom: '6px'
        }}>
          Crucigrama: Fundamentos de la Evaluación
        </h1>

        <p style={{ fontSize: '14px', color: 'var(--gris-neutro)', maxWidth: '640px', margin: '0 auto' }}>
          Completa los 9 conceptos y agentes de la evaluación formativa. Toca una casilla o pista para comenzar a escribir.
        </p>

        {/* Progress pill */}
        <div style={{
          marginTop: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'rgba(255, 255, 255, 0.7)',
          border: '1px solid rgba(197, 161, 90, 0.3)',
          borderRadius: 'var(--radius-pill)',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--verde-oscuro)'
        }}>
          <span>Progreso:</span>
          <span style={{ color: 'var(--dorado-elegante)' }}>
            {completedWords.length} de {CROSSWORD_ITEMS.length} palabras completadas
          </span>
        </div>
      </div>

      {/* Main Layout: Grid on Left, Clues on Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left Column: Crossword Grid */}
        <div 
          className="liquid-glass"
          style={{
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* Active Clue Bar Above Grid */}
          {activeClueId && (
            <div style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: '16px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(18, 61, 50, 0.05)',
              border: '1px solid rgba(197, 161, 90, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--verde-oscuro)',
                color: 'var(--dorado-brillo)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 700,
                flexShrink: 0
              }}>
                {CROSSWORD_ITEMS.find((it) => it.id === activeClueId)?.number}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--verde-oscuro)', lineHeight: 1.4 }}>
                <span style={{ fontWeight: 700 }}>
                  {activeDirection === 'H' ? 'Horizontal' : 'Vertical'}:
                </span>{' '}
                {CROSSWORD_ITEMS.find((it) => it.id === activeClueId)?.clue}
              </div>
            </div>
          )}

          {/* Grid Table */}
          <div style={{
            display: 'inline-block',
            padding: '10px',
            background: 'rgba(18, 61, 50, 0.95)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 24px rgba(18, 61, 50, 0.25)',
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateRows: `repeat(${CROSSWORD_ROWS}, 28px)`,
              gridTemplateColumns: `repeat(${CROSSWORD_COLS}, 28px)`,
              gap: '2px'
            }}>
              {Array.from({ length: CROSSWORD_ROWS }).map((_, r) =>
                Array.from({ length: CROSSWORD_COLS }).map((_, c) => {
                  const key = `${r}-${c}`;
                  const info = cellMap.current[key];
                  const isBlocked = !info;
                  const isSelected = selectedCell.r === r && selectedCell.c === c;
                  const isInActiveWord = activeWordCells.has(key);
                  const userChar = userGrid[r][c];

                  // Result indicator
                  const isCorrect = checkedResults ? checkedResults[key] === true : null;
                  const isWrong = checkedResults ? checkedResults[key] === false : null;

                  if (isBlocked) {
                    return (
                      <div
                        key={key}
                        style={{
                          width: '28px',
                          height: '28px',
                          background: 'rgba(18, 61, 50, 0.95)',
                          borderRadius: '2px'
                        }}
                      />
                    );
                  }

                  let bg = 'rgba(255, 255, 255, 0.95)';
                  let textColor = 'var(--gris-oscuro)';

                  if (isCorrect) {
                    bg = 'rgba(45, 138, 91, 0.25)';
                    textColor = 'var(--verde-exito)';
                  } else if (isWrong) {
                    bg = 'rgba(184, 58, 75, 0.2)';
                    textColor = 'var(--rojo-error)';
                  } else if (isSelected) {
                    bg = 'rgba(197, 161, 90, 0.45)';
                  } else if (isInActiveWord) {
                    bg = 'rgba(197, 161, 90, 0.2)';
                  }

                  return (
                    <div
                      key={key}
                      onClick={() => handleCellClick(r, c)}
                      style={{
                        width: '28px',
                        height: '28px',
                        position: 'relative',
                        background: bg,
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '15px',
                        fontWeight: 700,
                        color: textColor,
                        cursor: 'pointer',
                        outline: isSelected ? '2px solid var(--dorado-elegante)' : 'none',
                        outlineOffset: '-1px',
                        transition: 'background 0.15s var(--ease-out)'
                      }}
                    >
                      {/* Clue Number Badge */}
                      {info.number && (
                        <span style={{
                          position: 'absolute',
                          top: '1px',
                          left: '2px',
                          fontSize: '8px',
                          fontWeight: 700,
                          lineHeight: 1,
                          color: 'var(--verde-oscuro)',
                          opacity: 0.8
                        }}>
                          {info.number}
                        </span>
                      )}
                      <span style={{ marginTop: '2px' }}>{userChar}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Action Controls */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '20px',
            width: '100%',
            justifyContent: 'center'
          }}>
            <button
              onClick={handleCheck}
              className="apple-button apple-button-primary"
              style={{ padding: '10px 20px', fontSize: '14px' }}
            >
              <Check size={16} strokeWidth={2.5} />
              <span>Comprobar respuestas</span>
            </button>

            <button
              onClick={handleClearCurrentWord}
              className="apple-button apple-button-secondary"
              style={{ padding: '10px 16px', fontSize: '13px' }}
              title="Borrar la palabra actualmente seleccionada"
            >
              <Eraser size={15} />
              <span>Borrar palabra</span>
            </button>

            <button
              onClick={handleResetAll}
              className="apple-button apple-button-secondary"
              style={{ padding: '10px 16px', fontSize: '13px' }}
              title="Reiniciar todo el crucigrama"
            >
              <RotateCcw size={15} />
              <span>Reiniciar todo</span>
            </button>
          </div>

          {/* Virtual iOS Keyboard (Designed especially for mobile phones) */}
          <div style={{
            marginTop: '20px',
            width: '100%',
            maxWidth: '480px',
            padding: '12px 8px',
            background: 'rgba(255, 252, 247, 0.75)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(18, 61, 50, 0.08)'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--gris-neutro)',
              textAlign: 'center',
              marginBottom: '8px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              Teclado de pantalla
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {VIRTUAL_KEYS.map((row, rIdx) => (
                <div key={rIdx} style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                  {row.map((k) => (
                    <button
                      key={k}
                      onClick={() => handleInputLetter(k)}
                      className="apple-button"
                      style={{
                        flex: 1,
                        maxWidth: '38px',
                        height: '38px',
                        padding: 0,
                        fontSize: '14px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        background: '#FFFFFF',
                        color: 'var(--gris-oscuro)',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(0, 0, 0, 0.06)'
                      }}
                    >
                      {k}
                    </button>
                  ))}
                  {rIdx === 2 && (
                    <button
                      onClick={handleBackspace}
                      className="apple-button"
                      style={{
                        minWidth: '44px',
                        height: '38px',
                        padding: 0,
                        borderRadius: '6px',
                        background: 'rgba(18, 61, 50, 0.1)',
                        color: 'var(--verde-oscuro)',
                        border: '1px solid rgba(18, 61, 50, 0.12)'
                      }}
                      title="Borrar letra"
                    >
                      <Delete size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Organized Clues (Horizontales & Verticales) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Horizontales */}
          <div className="liquid-glass" style={{ padding: '22px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--verde-oscuro)',
              marginBottom: '14px',
              fontFamily: 'var(--font-editorial)'
            }}>
              <HelpCircle size={18} color="var(--dorado-elegante)" />
              <span>Pistas Horizontales</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {CROSSWORD_ITEMS.filter((it) => it.direction === 'H').map((item) => {
                const isActive = activeClueId === item.id;
                const isDone = completedWords.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectClue(item)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: isActive
                        ? 'rgba(197, 161, 90, 0.18)'
                        : 'rgba(255, 255, 255, 0.5)',
                      border: isActive
                        ? '1px solid var(--dorado-elegante)'
                        : '1px solid rgba(18, 61, 50, 0.05)',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{
                      fontWeight: 700,
                      fontSize: '13px',
                      color: isActive ? 'var(--dorado-elegante)' : 'var(--verde-oscuro)',
                      minWidth: '22px'
                    }}>
                      {item.number}.
                    </span>
                    <span style={{
                      fontSize: '13px',
                      color: isDone ? 'var(--verde-exito)' : 'var(--gris-oscuro)',
                      textDecoration: isDone ? 'line-through' : 'none',
                      lineHeight: 1.4
                    }}>
                      {item.clue}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verticales */}
          <div className="liquid-glass" style={{ padding: '22px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--verde-oscuro)',
              marginBottom: '14px',
              fontFamily: 'var(--font-editorial)'
            }}>
              <HelpCircle size={18} color="var(--dorado-elegante)" />
              <span>Pistas Verticales</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {CROSSWORD_ITEMS.filter((it) => it.direction === 'V').map((item) => {
                const isActive = activeClueId === item.id;
                const isDone = completedWords.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectClue(item)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: isActive
                        ? 'rgba(197, 161, 90, 0.18)'
                        : 'rgba(255, 255, 255, 0.5)',
                      border: isActive
                        ? '1px solid var(--dorado-elegante)'
                        : '1px solid rgba(18, 61, 50, 0.05)',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{
                      fontWeight: 700,
                      fontSize: '13px',
                      color: isActive ? 'var(--dorado-elegante)' : 'var(--verde-oscuro)',
                      minWidth: '22px'
                    }}>
                      {item.number}.
                    </span>
                    <span style={{
                      fontSize: '13px',
                      color: isDone ? 'var(--verde-exito)' : 'var(--gris-oscuro)',
                      textDecoration: isDone ? 'line-through' : 'none',
                      lineHeight: 1.4
                    }}>
                      {item.clue}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        title="¡Excelente! Has completado el crucigrama."
        subtitle="Dominas con éxito los fundamentos y agentes de la evaluación formativa de los aprendizajes."
        weekNumber={1}
        scoreText="9 de 9 palabras correctas"
        onRetry={handleResetAll}
      />
    </div>
  );
};
