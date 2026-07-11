import { type Rank, isTenValue } from './cards';

export type StrategyAction =
  | 'HIT'
  | 'STAND'
  | 'DOUBLE'
  | 'SPLIT'
  | 'SURRENDER';

export interface StrategyResult {
  action: StrategyAction;
  reason: string;
  fallback?: string;
  isDeviation?: boolean;
  index?: number;
}

type DealerUp = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'A';

function dealerKey(upcard: Rank): DealerUp {
  if (upcard === 'A') return 'A';
  if (isTenValue(upcard)) return '10';
  return upcard as DealerUp;
}

// Multi-deck basic strategy (H17, DAS, late surrender where noted)
// H=Hit S=Stand D=Double P=Split Rh=Surrender else Hit Rs=Surrender else Stand

const HARD: Record<number, Record<DealerUp, string>> = {
  8: { '2': 'H', '3': 'H', '4': 'H', '5': 'H', '6': 'H', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  9: { '2': 'H', '3': 'D', '4': 'D', '5': 'D', '6': 'D', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  10: { '2': 'D', '3': 'D', '4': 'D', '5': 'D', '6': 'D', '7': 'D', '8': 'D', '9': 'D', '10': 'H', 'A': 'H' },
  11: { '2': 'D', '3': 'D', '4': 'D', '5': 'D', '6': 'D', '7': 'D', '8': 'D', '9': 'D', '10': 'D', 'A': 'H' },
  12: { '2': 'H', '3': 'H', '4': 'S', '5': 'S', '6': 'S', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  13: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  14: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  15: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'H', '8': 'H', '9': 'H', '10': 'Rh', 'A': 'H' },
  16: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'H', '8': 'H', '9': 'Rh', '10': 'Rh', 'A': 'Rh' },
  17: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'A': 'S' },
};

const SOFT: Record<number, Record<DealerUp, string>> = {
  13: { '2': 'H', '3': 'H', '4': 'H', '5': 'D', '6': 'D', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  14: { '2': 'H', '3': 'H', '4': 'H', '5': 'D', '6': 'D', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  15: { '2': 'H', '3': 'H', '4': 'D', '5': 'D', '6': 'D', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  16: { '2': 'H', '3': 'H', '4': 'D', '5': 'D', '6': 'D', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  17: { '2': 'H', '3': 'D', '4': 'D', '5': 'D', '6': 'D', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  18: { '2': 'S', '3': 'D', '4': 'D', '5': 'D', '6': 'D', '7': 'S', '8': 'S', '9': 'H', '10': 'H', 'A': 'H' },
  19: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'D', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'A': 'S' },
  20: { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'A': 'S' },
};

const PAIR: Record<string, Record<DealerUp, string>> = {
  A: { '2': 'P', '3': 'P', '4': 'P', '5': 'P', '6': 'P', '7': 'P', '8': 'P', '9': 'P', '10': 'P', 'A': 'P' },
  '2': { '2': 'P', '3': 'P', '4': 'P', '5': 'P', '6': 'P', '7': 'P', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  '3': { '2': 'P', '3': 'P', '4': 'P', '5': 'P', '6': 'P', '7': 'P', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  '4': { '2': 'H', '3': 'H', '4': 'H', '5': 'P', '6': 'P', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  '5': { '2': 'D', '3': 'D', '4': 'D', '5': 'D', '6': 'D', '7': 'D', '8': 'D', '9': 'D', '10': 'H', 'A': 'H' },
  '6': { '2': 'P', '3': 'P', '4': 'P', '5': 'P', '6': 'P', '7': 'H', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  '7': { '2': 'P', '3': 'P', '4': 'P', '5': 'P', '6': 'P', '7': 'P', '8': 'H', '9': 'H', '10': 'H', 'A': 'H' },
  '8': { '2': 'P', '3': 'P', '4': 'P', '5': 'P', '6': 'P', '7': 'P', '8': 'P', '9': 'P', '10': 'P', 'A': 'P' },
  '9': { '2': 'P', '3': 'P', '4': 'P', '5': 'P', '6': 'P', '7': 'S', '8': 'P', '9': 'P', '10': 'S', 'A': 'S' },
  '10': { '2': 'S', '3': 'S', '4': 'S', '5': 'S', '6': 'S', '7': 'S', '8': 'S', '9': 'S', '10': 'S', 'A': 'S' },
};

function pairKey(rank: Rank): string {
  if (isTenValue(rank)) return '10';
  return rank;
}

function decodeAction(
  code: string,
  canDouble: boolean,
  canSplit: boolean,
  surrenderAllowed: boolean,
): StrategyResult {
  const actionMap: Record<string, StrategyAction> = {
    H: 'HIT',
    S: 'STAND',
    D: 'DOUBLE',
    P: 'SPLIT',
    Rh: 'SURRENDER',
    Rs: 'SURRENDER',
  };

  const reasonMap: Record<string, string> = {
    H: 'Basic strategy says hit.',
    S: 'Basic strategy says stand.',
    D: 'Basic strategy says double down.',
    P: 'Basic strategy says split.',
    Rh: 'Basic strategy says surrender (else hit).',
    Rs: 'Basic strategy says surrender (else stand).',
  };

  let codeToUse = code;

  if (code === 'P' && !canSplit) {
    codeToUse = 'H';
  }

  if ((code === 'Rh' || code === 'Rs') && !surrenderAllowed) {
    codeToUse = code === 'Rh' ? 'H' : 'S';
  }

  if (code === 'D' && !canDouble) {
    codeToUse = 'H';
  }

  const action = actionMap[codeToUse] ?? 'HIT';
  let fallback: string | undefined;

  if (code === 'D' && !canDouble) {
    fallback = 'Cannot double — hit instead.';
  } else if (code === 'P' && !canSplit) {
    fallback = 'Cannot split — hit instead.';
  } else if ((code === 'Rh' || code === 'Rs') && !surrenderAllowed) {
    fallback = `Surrender not available — ${code === 'Rh' ? 'hit' : 'stand'} instead.`;
  }

  return {
    action,
    reason: reasonMap[code] ?? 'Basic strategy recommendation.',
    fallback,
  };
}

export interface StrategyInput {
  playerTotal: number;
  isSoft: boolean;
  isPair: boolean;
  pairRank: Rank | null;
  dealerUpcard: Rank;
  canDouble: boolean;
  canSplit: boolean;
  surrenderAllowed: boolean;
}

export function getBasicStrategy(input: StrategyInput): StrategyResult {
  const dealer = dealerKey(input.dealerUpcard);

  if (input.isPair && input.pairRank) {
    const key = pairKey(input.pairRank);
    const code = PAIR[key]?.[dealer] ?? 'H';
    return decodeAction(code, input.canDouble, input.canSplit, input.surrenderAllowed);
  }

  if (input.isSoft) {
    const code = SOFT[input.playerTotal]?.[dealer] ?? 'H';
    return decodeAction(code, input.canDouble, false, input.surrenderAllowed);
  }

  const total = Math.min(Math.max(input.playerTotal, 8), 17);
  const code = HARD[total]?.[dealer] ?? (input.playerTotal >= 17 ? 'S' : 'H');
  return decodeAction(code, input.canDouble, false, input.surrenderAllowed);
}

export const ACTION_LABELS: Record<StrategyAction, string> = {
  HIT: 'Hit',
  STAND: 'Stand',
  DOUBLE: 'Double',
  SPLIT: 'Split',
  SURRENDER: 'Surrender',
};

export const ACTION_SHORT: Record<StrategyAction, string> = {
  HIT: 'H',
  STAND: 'S',
  DOUBLE: 'D',
  SPLIT: 'P',
  SURRENDER: 'R',
};
