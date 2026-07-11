import { type Card, type Rank, rankValue } from './cards';

export interface HandAnalysis {
  total: number;
  isSoft: boolean;
  isPair: boolean;
  pairRank: Rank | null;
  isBlackjack: boolean;
  isBust: boolean;
  label: string;
}

export function analyzeHand(cards: Card[]): HandAnalysis {
  if (cards.length === 0) {
    return {
      total: 0,
      isSoft: false,
      isPair: false,
      pairRank: null,
      isBlackjack: false,
      isBust: false,
      label: '—',
    };
  }

  let total = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === 'A') {
      aces += 1;
      total += 11;
    } else {
      total += rankValue(card.rank);
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  const isSoft = aces > 0 && total <= 21;
  const isPair = cards.length === 2 && cards[0].rank === cards[1].rank;
  const isBlackjack = cards.length === 2 && total === 21;
  const isBust = total > 21;

  let label = String(total);
  if (isSoft && total !== 21) {
    label = `${total - 10}/${total}`;
  }
  if (isBlackjack) label = 'Blackjack!';
  if (isBust) label = `${total} Bust`;

  return {
    total,
    isSoft,
    isPair,
    pairRank: isPair ? cards[0].rank : null,
    isBlackjack,
    isBust,
    label,
  };
}

export function canSplit(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  const [a, b] = cards;
  if (a.rank === b.rank) return true;
  return rankValue(a.rank) === 10 && rankValue(b.rank) === 10;
}

export function canDouble(cards: Card[]): boolean {
  return cards.length === 2;
}
