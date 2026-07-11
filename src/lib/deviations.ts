import {
  type StrategyAction,
  type StrategyInput,
  type StrategyResult,
  getBasicStrategy,
} from './basicStrategy';
import { type Rank, isTenValue } from './cards';

export interface InsuranceAdvice {
  take: boolean;
  reason: string;
  index: number;
}

const INSURANCE_INDEX = 3;

interface DeviationRule {
  label: string;
  index: number;
  action: StrategyAction;
  direction: 'gte' | 'lte';
  match: (input: StrategyInput) => boolean;
}

// Illustrious 18 + common Fab 4 indices (Hi-Lo, multi-deck)
const DEVIATIONS: DeviationRule[] = [
  {
    label: '16 vs 10',
    index: 0,
    action: 'STAND',
    direction: 'gte',
    match: (i) => !i.isSoft && !i.isPair && i.playerTotal === 16 && dealerIs(i, '10'),
  },
  {
    label: '15 vs 10',
    index: 4,
    action: 'STAND',
    direction: 'gte',
    match: (i) => !i.isSoft && !i.isPair && i.playerTotal === 15 && dealerIs(i, '10'),
  },
  {
    label: '12 vs 2',
    index: 3,
    action: 'STAND',
    direction: 'gte',
    match: (i) => !i.isSoft && !i.isPair && i.playerTotal === 12 && dealerIs(i, '2'),
  },
  {
    label: '12 vs 3',
    index: 2,
    action: 'STAND',
    direction: 'gte',
    match: (i) => !i.isSoft && !i.isPair && i.playerTotal === 12 && dealerIs(i, '3'),
  },
  {
    label: '12 vs 4',
    index: 0,
    action: 'STAND',
    direction: 'gte',
    match: (i) => !i.isSoft && !i.isPair && i.playerTotal === 12 && dealerIs(i, '4'),
  },
  {
    label: '12 vs 5',
    index: -2,
    action: 'STAND',
    direction: 'gte',
    match: (i) => !i.isSoft && !i.isPair && i.playerTotal === 12 && dealerIs(i, '5'),
  },
  {
    label: '12 vs 6',
    index: -1,
    action: 'STAND',
    direction: 'gte',
    match: (i) => !i.isSoft && !i.isPair && i.playerTotal === 12 && dealerIs(i, '6'),
  },
  {
    label: '13 vs 2',
    index: -1,
    action: 'STAND',
    direction: 'gte',
    match: (i) => !i.isSoft && !i.isPair && i.playerTotal === 13 && dealerIs(i, '2'),
  },
  {
    label: '13 vs 3',
    index: -2,
    action: 'STAND',
    direction: 'gte',
    match: (i) => !i.isSoft && !i.isPair && i.playerTotal === 13 && dealerIs(i, '3'),
  },
  {
    label: '16 vs 9',
    index: 4,
    action: 'STAND',
    direction: 'gte',
    match: (i) => !i.isSoft && !i.isPair && i.playerTotal === 16 && dealerIs(i, '9'),
  },
  {
    label: '15 vs 9',
    index: 2,
    action: 'STAND',
    direction: 'gte',
    match: (i) => !i.isSoft && !i.isPair && i.playerTotal === 15 && dealerIs(i, '9'),
  },
  {
    label: '10 vs 10',
    index: 4,
    action: 'DOUBLE',
    direction: 'gte',
    match: (i) => !i.isSoft && !i.isPair && i.playerTotal === 10 && dealerIs(i, '10'),
  },
  {
    label: '10 vs A',
    index: 4,
    action: 'DOUBLE',
    direction: 'gte',
    match: (i) => !i.isSoft && !i.isPair && i.playerTotal === 10 && dealerIs(i, 'A'),
  },
  {
    label: '11 vs A',
    index: 1,
    action: 'DOUBLE',
    direction: 'gte',
    match: (i) => !i.isSoft && !i.isPair && i.playerTotal === 11 && dealerIs(i, 'A'),
  },
  {
    label: '11 vs 10',
    index: 1,
    action: 'DOUBLE',
    direction: 'gte',
    match: (i) => !i.isSoft && !i.isPair && i.playerTotal === 11 && dealerIs(i, '10'),
  },
  {
    label: '9 vs 2',
    index: 1,
    action: 'DOUBLE',
    direction: 'gte',
    match: (i) => !i.isSoft && !i.isPair && i.playerTotal === 9 && dealerIs(i, '2'),
  },
  {
    label: '10 vs 2',
    index: -1,
    action: 'HIT',
    direction: 'lte',
    match: (i) => !i.isSoft && !i.isPair && i.playerTotal === 10 && dealerIs(i, '2'),
  },
  {
    label: 'A,8 vs 5',
    index: 1,
    action: 'DOUBLE',
    direction: 'gte',
    match: (i) => i.isSoft && i.playerTotal === 19 && dealerIs(i, '5'),
  },
  {
    label: 'A,7 vs 2',
    index: 1,
    action: 'STAND',
    direction: 'gte',
    match: (i) => i.isSoft && i.playerTotal === 18 && dealerIs(i, '2'),
  },
  {
    label: '10,10 vs 5',
    index: 5,
    action: 'SPLIT',
    direction: 'gte',
    match: (i) => i.isPair && i.pairRank !== null && isTenValue(i.pairRank) && dealerIs(i, '5'),
  },
  {
    label: '10,10 vs 6',
    index: 4,
    action: 'SPLIT',
    direction: 'gte',
    match: (i) => i.isPair && i.pairRank !== null && isTenValue(i.pairRank) && dealerIs(i, '6'),
  },
];

function dealerIs(input: StrategyInput, up: Rank | '10'): boolean {
  if (up === '10') return isTenValue(input.dealerUpcard);
  return input.dealerUpcard === up;
}

function indexMet(trueCount: number, index: number, direction: 'gte' | 'lte'): boolean {
  const tc = Math.floor(trueCount);
  return direction === 'gte' ? tc >= index : tc <= index;
}

export function getInsuranceAdvice(trueCount: number): InsuranceAdvice {
  const tc = Math.floor(trueCount);
  if (tc >= INSURANCE_INDEX) {
    return {
      take: true,
      reason: `Take insurance — true count is +${tc} (index ≥ +${INSURANCE_INDEX}).`,
      index: INSURANCE_INDEX,
    };
  }
  return {
    take: false,
    reason: `Decline insurance — true count is ${tc >= 0 ? '+' : ''}${tc} (need ≥ +${INSURANCE_INDEX}).`,
    index: INSURANCE_INDEX,
  };
}

export function getStrategy(
  input: StrategyInput,
  trueCount: number,
  deviationsEnabled: boolean,
): StrategyResult {
  const basic = getBasicStrategy(input);

  if (!deviationsEnabled) return basic;

  for (const rule of DEVIATIONS) {
    if (!rule.match(input)) continue;
    if (!indexMet(trueCount, rule.index, rule.direction)) continue;

    // Validate action is legal
    if (rule.action === 'DOUBLE' && !input.canDouble) continue;
    if (rule.action === 'SPLIT' && !input.canSplit) continue;

    const tcLabel = rule.index >= 0 ? `+${rule.index}` : String(rule.index);
    const cmp = rule.direction === 'gte' ? '≥' : '≤';

    return {
      action: rule.action,
      reason: `Count deviation (${rule.label}): ${rule.action.toLowerCase()} at TC ${cmp} ${tcLabel}.`,
      isDeviation: true,
      index: rule.index,
    };
  }

  return basic;
}

export { DEVIATIONS };
