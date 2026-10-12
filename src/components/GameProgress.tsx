export function GameProgress({ value, total, label }: { value: number; total: number; label: string }) {
  return <div className="game-progress">
    <span>{label}: {value} de {total}</span>
    <progress className="sr-only" aria-label={label} value={value} max={total} />
    <div className="progress-track" aria-hidden="true"><div className="progress-fill" style={{ transform: `scaleX(${value / total})` }} /></div>
  </div>;
}
