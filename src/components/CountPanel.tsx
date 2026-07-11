import {
  type BetRecommendation,
  type CountState,
  totalCardsInShoe,
} from '../lib/cardCounting';

interface CountPanelProps {
  countState: CountState;
  trueCount: number;
  penetration: number;
  betRec: BetRecommendation;
  description: string;
  baseUnit: number;
  onBaseUnitChange: (v: number) => void;
  onDecksChange: (decks: number) => void;
  trackCount: boolean;
  onTrackCountChange: (v: boolean) => void;
}

export function CountPanel({
  countState,
  trueCount,
  penetration,
  betRec,
  description,
  baseUnit,
  onBaseUnitChange,
  onDecksChange,
  trackCount,
  onTrackCountChange,
}: CountPanelProps) {
  const tcDisplay = trueCount >= 0 ? `+${trueCount.toFixed(1)}` : trueCount.toFixed(1);
  const rcDisplay =
    countState.runningCount >= 0
      ? `+${countState.runningCount}`
      : String(countState.runningCount);

  return (
    <div className="count-panel">
      <div className="count-panel-header">
        <h3>Hi-Lo Counter</h3>
        <label className="toggle-row compact">
          <input
            type="checkbox"
            checked={trackCount}
            onChange={(e) => onTrackCountChange(e.target.checked)}
          />
          <span>Track</span>
        </label>
      </div>

      <div className="count-stats">
        <div className="count-stat">
          <span className="count-stat-label">Running</span>
          <span className={`count-stat-value ${countState.runningCount > 0 ? 'positive' : countState.runningCount < 0 ? 'negative' : ''}`}>
            {rcDisplay}
          </span>
        </div>
        <div className="count-stat count-stat--primary">
          <span className="count-stat-label">True Count</span>
          <span className={`count-stat-value tc ${trueCount >= 2 ? 'strong-positive' : trueCount >= 1 ? 'positive' : trueCount <= -1 ? 'negative' : ''}`}>
            {tcDisplay}
          </span>
        </div>
        <div className="count-stat">
          <span className="count-stat-label">Penetration</span>
          <span className="count-stat-value">{penetration.toFixed(0)}%</span>
        </div>
      </div>

      <p className="count-description">{description}</p>

      <div className={`bet-rec bet-rec--${betRec.edge}`}>
        <span className="bet-rec-label">Suggested bet</span>
        <span className="bet-rec-value">{betRec.label}</span>
      </div>

      <div className="count-controls">
        <label className="count-control">
          <span>Decks</span>
          <select
            value={countState.decks}
            onChange={(e) => onDecksChange(Number(e.target.value))}
          >
            {[1, 2, 4, 6, 8].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="count-control">
          <span>Base unit ($)</span>
          <input
            type="number"
            min={1}
            value={baseUnit}
            onChange={(e) => onBaseUnitChange(Math.max(1, Number(e.target.value) || 1))}
          />
        </label>
      </div>

      <div className="count-progress">
        <div className="count-progress-bar" style={{ width: `${Math.min(penetration, 100)}%` }} />
        <span className="count-progress-text">
          {countState.cardsSeen} / {totalCardsInShoe(countState.decks)} cards seen
        </span>
      </div>
    </div>
  );
}
