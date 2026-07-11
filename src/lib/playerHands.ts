import { type Card, type Rank } from './cards';
import { analyzeHand, canDouble, canSplit } from './handEvaluation';

export type HandStatus = 'playing' | 'stood' | 'doubled' | 'bust' | 'blackjack';

export interface PlayerHand {
  id: string;
  cards: Card[];
  status: HandStatus;
  fromSplit: boolean;
}

let handIdCounter = 0;

export function createHandId(): string {
  handIdCounter += 1;
  return `hand-${handIdCounter}`;
}

export function createPlayerHand(cards: Card[] = [], fromSplit = false): PlayerHand {
  const analysis = analyzeHand(cards);
  let status: HandStatus = 'playing';
  if (analysis.isBust) status = 'bust';
  else if (analysis.isBlackjack && !fromSplit) status = 'blackjack';

  return {
    id: createHandId(),
    cards,
    status,
    fromSplit,
  };
}

export function refreshHandStatus(hand: PlayerHand): PlayerHand {
  const analysis = analyzeHand(hand.cards);
  if (hand.status === 'stood' || hand.status === 'doubled') return hand;
  if (analysis.isBust) return { ...hand, status: 'bust' };
  if (analysis.isBlackjack && !hand.fromSplit && hand.cards.length === 2) {
    return { ...hand, status: 'blackjack' };
  }
  return { ...hand, status: 'playing' };
}

export function splitHand(hands: PlayerHand[], handIndex: number): PlayerHand[] | null {
  const hand = hands[handIndex];
  if (!hand || hand.cards.length !== 2 || !canSplit(hand.cards)) return null;

  const [a, b] = hand.cards;
  const h1 = createPlayerHand([a], true);
  const h2 = createPlayerHand([b], true);

  const next = [...hands];
  next.splice(handIndex, 1, h1, h2);
  return next;
}

export function markHandStood(hands: PlayerHand[], handIndex: number): PlayerHand[] {
  return hands.map((h, i) =>
    i === handIndex && h.status === 'playing' ? { ...h, status: 'stood' as const } : h,
  );
}

export function markHandDoubled(hands: PlayerHand[], handIndex: number): PlayerHand[] {
  return hands.map((h, i) =>
    i === handIndex && h.status === 'playing' ? { ...h, status: 'doubled' as const } : h,
  );
}

export function findNextPlayingHand(hands: PlayerHand[], fromIndex: number): number {
  for (let i = fromIndex; i < hands.length; i++) {
    if (hands[i].status === 'playing') return i;
  }
  for (let i = 0; i < fromIndex; i++) {
    if (hands[i].status === 'playing') return i;
  }
  return -1;
}

export function allHandsComplete(hands: PlayerHand[]): boolean {
  return hands.length > 0 && hands.every((h) => h.status !== 'playing');
}

export function getActiveHandInput(hand: PlayerHand, dealerUpcard: Rank, surrenderAllowed: boolean) {
  const analysis = analyzeHand(hand.cards);
  return {
    playerTotal: analysis.total,
    isSoft: analysis.isSoft,
    isPair: analysis.isPair,
    pairRank: analysis.pairRank,
    dealerUpcard,
    canDouble: canDouble(hand.cards) && hand.status === 'playing',
    canSplit: canSplit(hand.cards) && hand.status === 'playing',
    surrenderAllowed: surrenderAllowed && hand.cards.length === 2 && !hand.fromSplit,
  };
}
