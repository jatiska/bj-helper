import { type Rank, RANKS } from '../lib/cards';
import { hiLoValue } from '../lib/cardCounting';

interface SeenCardsBarProps {
  onMarkSeen: (rank: Rank) => void;
  onUndoLastSeen: () => void;
  seenRankCounts: Record<Rank, number>;
  canUndo: boolean;
  disabled: boolean;
}

export function SeenCardsBar({
  onMarkSeen,
  onUndoLastSeen,
  seenRankCounts,
  canUndo,
  disabled,
}: SeenCardsBarProps) {
  return (
    <section className="seen-cards-bar" aria-label="Mark cards seen from the shoe">
      <div className="seen-cards-bar-header">
        <div>
          <h2 className="seen-cards-bar-title">Cards pulled from shoe</h2>
          <p className="seen-cards-bar-hint">
            Tap a card when you see it dealt elsewhere — burn cards, other players, etc.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-ghost seen-cards-undo"
          onClick={onUndoLastSeen}
          disabled={!canUndo || disabled}
        >
          Undo last seen
        </button>
      </div>
      <div className={`seen-cards-row ${disabled ? 'seen-cards-row--disabled' : ''}`}>
        {RANKS.map((rank) => {
          const count = seenRankCounts[rank];
          const hiLo = hiLoValue(rank);
          return (
            <button
              key={rank}
              type="button"
              className={`seen-card-btn hi-lo-${hiLo > 0 ? 'low' : hiLo < 0 ? 'high' : 'neutral'}`}
              onClick={() => onMarkSeen(rank)}
              disabled={disabled}
              title={
                hiLo > 0
                  ? `Mark ${rank} as seen (+1 to running count)`
                  : hiLo < 0
                    ? `Mark ${rank} as seen (-1 to running count)`
                    : `Mark ${rank} as seen (neutral)`
              }
            >
              <span className="seen-card-rank">{rank}</span>
              {count > 0 && <span className="seen-card-count">{count}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}
