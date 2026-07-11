import { type Rank, RANKS } from './cards';

export function hiLoValue(rank: Rank): number {
  const num = rank === 'A' ? 11 : parseInt(rank, 10) || 10;
  if (num >= 2 && num <= 6) return 1;
  if (num >= 7 && num <= 9) return 0;
  return -1;
}

export function cardsPerDeck(): number {
  return 52;
}

export function totalCardsInShoe(decks: number): number {
  return decks * cardsPerDeck();
}

export function computeTrueCount(runningCount: number, decksRemaining: number): number {
  if (decksRemaining <= 0) return runningCount;
  return runningCount / decksRemaining;
}

export interface CountState {
  runningCount: number;
  cardsSeen: number;
  decks: number;
}

export function initialCountState(decks: number): CountState {
  return { runningCount: 0, cardsSeen: 0, decks };
}

export function addCardToCount(state: CountState, rank: Rank): CountState {
  return {
    ...state,
    runningCount: state.runningCount + hiLoValue(rank),
    cardsSeen: state.cardsSeen + 1,
  };
}

export function removeLastCardFromCount(state: CountState, rank: Rank): CountState {
  return {
    ...state,
    runningCount: state.runningCount - hiLoValue(rank),
    cardsSeen: Math.max(0, state.cardsSeen - 1),
  };
}

export function resetCount(decks: number): CountState {
  return initialCountState(decks);
}

export function decksRemaining(state: CountState): number {
  const total = totalCardsInShoe(state.decks);
  const remaining = Math.max(0, total - state.cardsSeen);
  return remaining / cardsPerDeck();
}

export function penetrationPercent(state: CountState): number {
  const total = totalCardsInShoe(state.decks);
  if (total === 0) return 0;
  return (state.cardsSeen / total) * 100;
}

export interface BetRecommendation {
  units: number;
  label: string;
  edge: 'negative' | 'neutral' | 'positive' | 'strong';
}

export function betRecommendation(trueCount: number, baseUnit: number): BetRecommendation {
  const tc = Math.floor(trueCount);

  if (tc <= 0) {
    return { units: 1, label: `${baseUnit} (min bet)`, edge: 'negative' };
  }
  if (tc === 1) {
    return { units: 1, label: `${baseUnit} (TC +1)`, edge: 'neutral' };
  }
  if (tc === 2) {
    return { units: 2, label: `${baseUnit * 2} (TC +2)`, edge: 'positive' };
  }
  if (tc === 3) {
    return { units: 4, label: `${baseUnit * 4} (TC +3)`, edge: 'positive' };
  }
  if (tc === 4) {
    return { units: 6, label: `${baseUnit * 6} (TC +4)`, edge: 'strong' };
  }
  return {
    units: 8,
    label: `${baseUnit * 8} (TC +${tc})`,
    edge: 'strong',
  };
}

export function countDescription(_runningCount: number, trueCount: number): string {
  const tc = trueCount;
  if (tc >= 2) return 'Deck favors the player — consider raising your bet.';
  if (tc >= 1) return 'Slight player edge — minimum bet or slight increase.';
  if (tc <= -2) return 'Deck favors the house — bet minimum.';
  return 'Neutral count — stick to basic strategy.';
}

export function remainingRankEstimate(
  state: CountState,
  rank: Rank,
): number {
  const perDeck = rank === 'A' ? 4 : ['10', 'J', 'Q', 'K'].includes(rank) ? 16 : 4;
  const totalForRank = perDeck * state.decks;
  // We don't track per-rank seen cards in simple mode; return nominal
  return totalForRank;
}

export { RANKS };
