const metrics = [
  '6000+ null exceptions eliminated via strict typing',
  '20% adoption uplift for stateful ASG fleets',
  '90% coverage maintained across Auto Scaling experience',
  '40% faster robotics experiment setups',
];

export function MetricsTicker() {
  return (
    <div className="metrics-ticker" aria-label="Key impact metrics">
      <div className="metrics-track">
        {[...metrics, ...metrics].map((item, index) => (
          <span key={`${item}-${index}`} className="metrics-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
