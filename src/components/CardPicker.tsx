import { useState } from 'react';
import { type Rank, RANKS } from '../lib/cards';

interface CardPickerProps {
  onSelectPlayer: (rank: Rank) => void;
  onSelectDealer: (rank: Rank) => void;
  onRevealHole: (rank: Rank) => void;
  onUndo: () => void;
  hasDealer: boolean;
  hasHole: boolean;
  playerCount: number;
}

export function CardPicker({
  onSelectPlayer,
  onSelectDealer,
  onRevealHole,
  onUndo,
  hasDealer,
  hasHole,
  playerCount,
}: CardPickerProps) {
  const [mode, setMode] = useState<'player' | 'dealer' | 'hole'>('dealer');

  const effectiveMode = !hasDealer ? 'dealer' : mode;

  const handleClick = (rank: Rank) => {
    if (effectiveMode === 'dealer') {
      onSelectDealer(rank);
      setMode('player');
    } else if (effectiveMode === 'hole') {
      onRevealHole(rank);
      setMode('player');
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
                onClick={() => setMode('player')}
              >
                Your cards
              </button>
              {!hasHole && (
                <button
                  type="button"
                  className={`mode-tab ${effectiveMode === 'hole' ? 'active' : ''}`}
                  onClick={() => setMode('hole')}
                >
                  Hole card
                </button>
              )}
              <button
                type="button"
                className={`mode-tab ${effectiveMode === 'dealer' ? 'active' : ''}`}
                onClick={() => setMode('dealer')}
              >
                Change upcard
              </button>
            </>
          )}
        </div>
        <div className="picker-actions">
          {playerCount > 0 && effectiveMode === 'player' && (
            <button type="button" className="btn btn-sm btn-ghost" onClick={onUndo}>
              Undo last
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
