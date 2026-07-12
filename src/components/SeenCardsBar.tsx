import { type Rank, RANKS } from '../lib/cards';

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
      <div className={`rank-grid seen-cards-row ${disabled ? 'seen-cards-row--disabled' : ''}`}>
        {RANKS.map((rank) => {
          const count = seenRankCounts[rank];
          return (
            <button
              key={rank}
              type="button"
              className={`rank-btn ${rank === 'A' ? 'rank-ace' : isTen(rank) ? 'rank-ten' : ''}`}
              onClick={() => onMarkSeen(rank)}
              disabled={disabled}
              title={`Mark ${rank} as seen`}
            >
              {rank}
              {count > 0 && <span className="seen-card-count">{count}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function isTen(rank: Rank): boolean {
  return rank === '10' || rank === 'J' || rank === 'Q' || rank === 'K';
}
