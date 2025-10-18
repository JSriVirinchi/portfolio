export function TechBackdrop() {
  const cells = Array.from({ length: 24 }, (_, index) => index);

  return (
    <div className="tech-backdrop" aria-hidden>
      <div className="tech-glow" />
      <div className="tech-grid">
        {cells.map((cell) => (
          <span key={cell} className="tech-cell" />
        ))}
      </div>
      <div className="tech-circuits">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
