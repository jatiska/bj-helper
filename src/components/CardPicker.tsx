import { type Rank, RANKS } from '../lib/cards';
import { type PickerMode } from '../lib/keyboard';

interface CardPickerProps {
  mode: PickerMode;
  onModeChange: (mode: PickerMode) => void;
  onSelectPlayer: (rank: Rank) => void;
  onSelectDealer: (rank: Rank) => void;
  onRevealHole: (rank: Rank) => void;
  onUndo: () => void;
  onSplit?: () => void;
  onStand?: () => void;
  hasDealer: boolean;
  hasHole: boolean;
  playerCount: number;
  canSplit: boolean;
}

export function CardPicker({
  mode,
  onModeChange,
  onSelectPlayer,
  onSelectDealer,
  onRevealHole,
  onUndo,
  onSplit,
  onStand,
  hasDealer,
  hasHole,
  playerCount,
  canSplit,
}: CardPickerProps) {
  const effectiveMode: PickerMode = !hasDealer ? 'dealer' : mode;

  const handleClick = (rank: Rank) => {
    if (effectiveMode === 'dealer') {
      onSelectDealer(rank);
      onModeChange('player');
    } else if (effectiveMode === 'hole') {
      onRevealHole(rank);
      onModeChange('player');
    } else {
      onSelectPlayer(rank);
    }
  };

  const hint =
    effectiveMode === 'dealer'
      ? 'Select dealer upcard'
      : effectiveMode === 'hole'
        ? 'Select dealer hole card'
        : 'Add cards to your hand';

  const cycleMode = () => {
    if (!hasDealer) return;
    const modes: PickerMode[] = hasHole ? ['player', 'dealer'] : ['player', 'hole', 'dealer'];
    const idx = modes.indexOf(effectiveMode);
    onModeChange(modes[(idx + 1) % modes.length]);
  };

  return (
    <div className="card-picker">
      <div className="picker-header">
        <span className="picker-hint">{hint}</span>
        <div className="picker-mode-tabs">
          {hasDealer && (
            <>
              <button
                type="button"
                className={`mode-tab ${effectiveMode === 'player' ? 'active' : ''}`}
                onClick={() => onModeChange('player')}
              >
                Your cards
              </button>
              {!hasHole && (
                <button
                  type="button"
                  className={`mode-tab ${effectiveMode === 'hole' ? 'active' : ''}`}
                  onClick={() => onModeChange('hole')}
                >
                  Hole card
                </button>
              )}
              <button
                type="button"
                className={`mode-tab ${effectiveMode === 'dealer' ? 'active' : ''}`}
                onClick={() => onModeChange('dealer')}
              >
                Change upcard
              </button>
            </>
          )}
        </div>
        <div className="picker-actions">
          {canSplit && onSplit && (
            <button type="button" className="btn btn-sm btn-accent" onClick={onSplit}>
              Split (P)
            </button>
          )}
          {onStand && playerCount > 0 && effectiveMode === 'player' && (
            <button type="button" className="btn btn-sm btn-ghost" onClick={onStand}>
              Stand
            </button>
          )}
          {playerCount > 0 && effectiveMode === 'player' && (
            <button type="button" className="btn btn-sm btn-ghost" onClick={onUndo}>
              Undo
            </button>
          )}
          {hasDealer && (
            <button type="button" className="btn btn-sm btn-ghost" onClick={cycleMode} title="Tab">
              ⇥ Mode
            </button>
          )}
        </div>
      </div>
      <div className="rank-grid">
        {RANKS.map((rank) => (
          <button
            key={rank}
            type="button"
            className={`rank-btn ${rank === 'A' ? 'rank-ace' : isTen(rank) ? 'rank-ten' : ''}`}
            onClick={() => handleClick(rank)}
          >
            {rank}
          </button>
        ))}
      </div>
    </div>
  );
}

function isTen(rank: Rank): boolean {
  return rank === '10' || rank === 'J' || rank === 'Q' || rank === 'K';
}
