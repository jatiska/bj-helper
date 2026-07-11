import { ACTION_LABELS, type StrategyResult } from '../lib/basicStrategy';

interface StrategyPanelProps {
  strategy: StrategyResult | null;
  hasInput: boolean;
  isBust: boolean;
  isBlackjack: boolean;
  handComplete?: boolean;
}

const ACTION_CLASS: Record<string, string> = {
  HIT: 'action-hit',
  STAND: 'action-stand',
  DOUBLE: 'action-double',
  SPLIT: 'action-split',
  SURRENDER: 'action-surrender',
};

export function StrategyPanel({
  strategy,
  hasInput,
  isBust,
  isBlackjack,
  handComplete = false,
}: StrategyPanelProps) {
  if (!hasInput) {
    return (
      <div className="strategy-panel strategy-panel--empty">
        <p>Enter dealer upcard and your cards to get a recommendation.</p>
      </div>
    );
  }

  if (handComplete) {
    return (
      <div className="strategy-panel strategy-panel--complete">
        <span className="strategy-action action-stand">Hand done</span>
        <p>All hands complete — enter hole card or start a new hand.</p>
      </div>
    );
  }

  if (isBust) {
    return (
      <div className="strategy-panel strategy-panel--bust">
        <span className="strategy-action action-bust">Bust</span>
        <p>Hand is over — press Space to move to the next hand.</p>
      </div>
    );
  }

  if (isBlackjack) {
    return (
      <div className="strategy-panel strategy-panel--blackjack">
        <span className="strategy-action action-blackjack">Blackjack!</span>
        <p>No action needed — check insurance advice if dealer shows Ace.</p>
      </div>
    );
  }

  if (!strategy) return null;

  const actionClass = ACTION_CLASS[strategy.action] ?? '';

  return (
    <div className={`strategy-panel ${actionClass} ${strategy.isDeviation ? 'strategy-panel--deviation' : ''}`}>
      <div className="strategy-main">
        <span className="strategy-label">
          {strategy.isDeviation ? 'Count deviation' : 'Recommended'}
        </span>
        <span className={`strategy-action ${actionClass}`}>
          {ACTION_LABELS[strategy.action]}
        </span>
      </div>
      <p className="strategy-reason">{strategy.reason}</p>
      {strategy.fallback && <p className="strategy-fallback">{strategy.fallback}</p>}
    </div>
  );
}
