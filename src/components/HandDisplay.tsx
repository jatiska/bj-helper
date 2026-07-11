import { type Card, cardColor } from '../lib/cards';
import { type HandAnalysis } from '../lib/handEvaluation';

interface HandDisplayProps {
  title: string;
  cards: Card[];
  hiddenCount?: number;
  analysis: HandAnalysis | null;
  highlight?: boolean;
}

export function HandDisplay({
  title,
  cards,
  hiddenCount = 0,
  analysis,
  highlight = false,
}: HandDisplayProps) {
  return (
    <div className={`hand-display ${highlight ? 'hand-display--player' : ''}`}>
      <div className="hand-display-header">
        <h3>{title}</h3>
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
