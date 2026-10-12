export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  // Never present the answers in their original order.
  if (result.length > 1 && result.every((v, i) => v === items[i])) result.push(result.shift()!);
  return result;
}

export interface Cell { r: number; c: number }
export function straightPath(start: Cell, end: Cell): Cell[] {
  const dr = end.r - start.r, dc = end.c - start.c;
  if (dr && dc && Math.abs(dr) !== Math.abs(dc)) return [start];
  return Array.from({ length: Math.max(Math.abs(dr), Math.abs(dc)) + 1 }, (_, i) =>
    ({ r: start.r + Math.sign(dr) * i, c: start.c + Math.sign(dc) * i }));
}

export function placeTerm(slots: Record<number, string | null>, locked: Record<number, boolean> | null, id: number, word: string | null) {
  if (locked?.[id] || (word && Object.values(slots).includes(word))) return slots;
  return { ...slots, [id]: word };
}

export function quizScore(questions: readonly { correctIndex: number }[], answers: Record<number, number>) {
  const correct = questions.reduce((total, q, i) => total + Number(answers[i] === q.correctIndex), 0);
  return { correct, percentage: Math.round(correct / questions.length * 100) };
}

export function validPair(concept: number | null, definition: number, completed: readonly number[]) {
  return concept !== null && concept === definition && !completed.includes(concept);
}
