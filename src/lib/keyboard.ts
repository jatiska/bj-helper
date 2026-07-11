import { type Rank } from './cards';

const RANK_KEY_MAP: Record<string, Rank> = {
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '0': '10',
  t: '10',
  j: 'J',
  q: 'Q',
  k: 'K',
  a: 'A',
};

export type PickerMode = 'player' | 'dealer' | 'hole';

export interface KeyboardAction {
  type: 'rank' | 'undo' | 'newHand' | 'newShoe' | 'cycleMode' | 'prevHand' | 'nextHand' | 'split' | 'stand' | 'none';
  rank?: Rank;
}

export function parseKeyboardAction(
  e: KeyboardEvent,
  opts: {
    hasDealer: boolean;
    hasHole: boolean;
    canSplit: boolean;
    multiHand: boolean;
  },
): KeyboardAction {
  if (e.ctrlKey || e.metaKey || e.altKey) return { type: 'none' };

  const target = e.target;
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  ) {
    return { type: 'none' };
  }

  const key = e.key;

  if (key === 'Backspace' || key === 'Delete') {
    return { type: 'undo' };
  }

  if (key === 'n' || key === 'N') {
    return { type: 'newHand' };
  }

  if (key === 'r' || key === 'R') {
    return { type: 'newShoe' };
  }

  if (key === 'Tab') {
    e.preventDefault();
    return { type: 'cycleMode' };
  }

  if (opts.multiHand && key === '[') {
    return { type: 'prevHand' };
  }

  if (opts.multiHand && key === ']') {
    return { type: 'nextHand' };
  }

  if ((key === 'p' || key === 'P') && opts.canSplit) {
    return { type: 'split' };
  }

  if (key === ' ' || key === 'Enter') {
    return { type: 'stand' };
  }

  const rank = RANK_KEY_MAP[key] ?? RANK_KEY_MAP[key.toLowerCase()];
  if (rank) {
    return { type: 'rank', rank };
  }

  return { type: 'none' };
}

export const KEYBOARD_HINTS = [
  { keys: '2–9, 0/T, A, J/Q/K', desc: 'Enter card rank' },
  { keys: 'Tab', desc: 'Cycle input mode' },
  { keys: 'Bksp', desc: 'Undo last card' },
  { keys: 'P', desc: 'Split hand' },
  { keys: 'Space', desc: 'Stand / next hand' },
  { keys: '[ / ]', desc: 'Switch split hand' },
  { keys: 'N / R', desc: 'New hand / new shoe' },
];
