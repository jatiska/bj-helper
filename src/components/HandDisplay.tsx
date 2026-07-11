import { type Card } from '../lib/cards';
import { cardColor } from '../lib/cards';
import { type HandAnalysis } from '../lib/handEvaluation';
import { type HandStatus } from '../lib/playerHands';

interface HandDisplayProps {
  title: string;
  cards: Card[];
  hiddenCount?: number;
  analysis: HandAnalysis | null;
  highlight?: boolean;
  active?: boolean;
  status?: HandStatus;
  onClick?: () => void;
}

const STATUS_LABEL: Record<HandStatus, string> = {
  playing: '',
  stood: 'Stood',
  doubled: 'Doubled',
  bust: 'Bust',
  blackjack: 'BJ',
};

export function HandDisplay({
  title,
  cards,
  hiddenCount = 0,
  analysis,
  highlight = false,
  active = false,
  status = 'playing',
  onClick,
}: HandDisplayProps) {
  const isDone = status !== 'playing';

  return (
    <div
      className={[
        'hand-display',
        highlight ? 'hand-display--player' : '',
        active ? 'hand-display--active' : '',
        isDone ? 'hand-display--done' : '',
        onClick ? 'hand-display--clickable' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="hand-display-header">
        <h3>
          {title}
          {status !== 'playing' && (
            <span className={`hand-status hand-status--${status}`}>{STATUS_LABEL[status]}</span>
          )}
        </h3>
        {analysis && <span className="hand-total">{analysis.label}</span>}
      </div>
      <div className="hand-cards">
        {cards.length === 0 && hiddenCount === 0 && (
          <span className="hand-empty">No cards yet</span>
        )}
        {cards.map((card, i) => (
          <div
            key={`${card.rank}-${i}`}
            className={`playing-card playing-card--${cardColor(card.suit)}`}
          >
            <span className="card-rank">{card.rank}</span>
            {card.suit && <span className="card-suit">{card.suit}</span>}
          </div>
        ))}
        {Array.from({ length: hiddenCount }).map((_, i) => (
          <div key={`hidden-${i}`} className="playing-card playing-card--hidden">
            <span>?</span>
          </div>
        ))}
      </div>
    </div>
  );
}
