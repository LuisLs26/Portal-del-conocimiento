export function GameHeading({ title, hint }: { title: string; hint?: string }) {
  return <div className="game-heading">
    <h1>{title}</h1>
    {hint && <p>{hint}</p>}
  </div>;
}
