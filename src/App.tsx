import { useCallback, useEffect, useMemo, useState } from 'react';
import { type Card, type Rank, type Suit, SUITS } from './lib/cards';
import { analyzeHand } from './lib/handEvaluation';
import { getInsuranceAdvice, getStrategy } from './lib/deviations';
import {
  addCardToCount,
  betRecommendation,
  computeTrueCount,
  countDescription,
  decksRemaining,
  initialCountState,
  penetrationPercent,
  removeLastCardFromCount,
  resetCount,
  type CountState,
} from './lib/cardCounting';
import {
  allHandsComplete,
  createPlayerHand,
  findNextPlayingHand,
  getActiveHandInput,
  markHandDoubled,
  markHandStood,
  refreshHandStatus,
  splitHand,
  type PlayerHand,
} from './lib/playerHands';
import { parseKeyboardAction, type PickerMode } from './lib/keyboard';
import { CardPicker } from './components/CardPicker';
import { HandDisplay } from './components/HandDisplay';
import { StrategyPanel } from './components/StrategyPanel';
import { CountPanel } from './components/CountPanel';
import { InsurancePanel } from './components/InsurancePanel';
import { KeyboardHints } from './components/KeyboardHints';
import './App.css';

function randomSuit(): Suit {
  return SUITS[Math.floor(Math.random() * SUITS.length)];
}

function withSuit(rank: Rank): Card {
  return { rank, suit: randomSuit() };
}

export default function App() {
  const [playerHands, setPlayerHands] = useState<PlayerHand[]>([]);
  const [activeHandIndex, setActiveHandIndex] = useState(0);
  const [dealerUpcard, setDealerUpcard] = useState<Card | null>(null);
  const [dealerHole, setDealerHole] = useState<Card | null>(null);
  const [countState, setCountState] = useState<CountState>(initialCountState(6));
  const [baseUnit, setBaseUnit] = useState(10);
  const [surrenderAllowed, setSurrenderAllowed] = useState(true);
  const [deviationsEnabled, setDeviationsEnabled] = useState(true);
  const [trackCount, setTrackCount] = useState(true);
  const [pickerMode, setPickerMode] = useState<PickerMode>('dealer');

  const activeHand = playerHands[activeHandIndex] ?? null;
  const activeCards = activeHand?.cards ?? [];

  const playerAnalysis = useMemo(
    () => analyzeHand(activeCards),
    [activeCards],
  );

  const trueCount = useMemo(
    () => computeTrueCount(countState.runningCount, decksRemaining(countState)),
    [countState],
  );

  const strategy = useMemo(() => {
    if (!dealerUpcard || !activeHand || activeHand.status !== 'playing') return null;
    if (activeCards.length === 0) return null;

    const input = getActiveHandInput(
      activeHand,
      dealerUpcard.rank,
      surrenderAllowed,
    );

    return getStrategy(input, trueCount, deviationsEnabled);
  }, [dealerUpcard, activeHand, activeCards.length, surrenderAllowed, trueCount, deviationsEnabled]);

  const insuranceAdvice = useMemo(() => {
    if (!dealerUpcard || dealerUpcard.rank !== 'A' || dealerHole) return null;
    return getInsuranceAdvice(trueCount);
  }, [dealerUpcard, dealerHole, trueCount]);

  const betRec = useMemo(
    () => betRecommendation(trueCount, baseUnit),
    [trueCount, baseUnit],
  );

  const handsComplete = allHandsComplete(playerHands);
  const canSplitActive =
    activeHand?.status === 'playing' &&
    activeCards.length === 2 &&
    (() => {
      const [a, b] = activeCards;
      return a.rank === b.rank || (['10', 'J', 'Q', 'K'].includes(a.rank) && ['10', 'J', 'Q', 'K'].includes(b.rank));
    })();

  const trackCard = useCallback(
    (rank: Rank) => {
      if (trackCount) {
        setCountState((s) => addCardToCount(s, rank));
      }
    },
    [trackCount],
  );

  const untrackCard = useCallback(
    (rank: Rank) => {
      if (trackCount) {
        setCountState((s) => removeLastCardFromCount(s, rank));
      }
    },
    [trackCount],
  );

  const updateHands = useCallback((updater: (hands: PlayerHand[]) => PlayerHand[]) => {
    setPlayerHands((prev) => updater(prev).map(refreshHandStatus));
  }, []);

  const addPlayerCard = useCallback(
    (rank: Rank) => {
      if (!activeHand || activeHand.status !== 'playing') return;
      trackCard(rank);
      updateHands((hands) =>
        hands.map((h, i) =>
          i === activeHandIndex ? { ...h, cards: [...h.cards, withSuit(rank)] } : h,
        ),
      );
    },
    [activeHand, activeHandIndex, trackCard, updateHands],
  );

  const removePlayerCard = useCallback(() => {
    if (!activeHand) return;
    const cards = activeHand.cards;
    if (cards.length === 0) return;
    const last = cards[cards.length - 1];
    untrackCard(last.rank);
    updateHands((hands) =>
      hands.map((h, i) =>
        i === activeHandIndex ? { ...h, cards: h.cards.slice(0, -1) } : h,
      ),
    );
  }, [activeHand, activeHandIndex, untrackCard, updateHands]);

  const setDealer = useCallback(
    (rank: Rank) => {
      if (dealerUpcard) untrackCard(dealerUpcard.rank);
      trackCard(rank);
      setDealerUpcard(withSuit(rank));
      setDealerHole(null);
    },
    [dealerUpcard, trackCard, untrackCard],
  );

  const revealHole = useCallback(
    (rank: Rank) => {
      if (dealerHole) untrackCard(dealerHole.rank);
      trackCard(rank);
      setDealerHole(withSuit(rank));
    },
    [dealerHole, trackCard, untrackCard],
  );

  const performSplit = useCallback(() => {
    const result = splitHand(playerHands, activeHandIndex);
    if (!result) return;
    setPlayerHands(result.map(refreshHandStatus));
    setActiveHandIndex(activeHandIndex);
  }, [playerHands, activeHandIndex]);

  const performStand = useCallback(() => {
    if (!activeHand) return;

    if (activeHand.status === 'playing') {
      const updated = markHandStood(playerHands, activeHandIndex);
      setPlayerHands(updated);
      const next = findNextPlayingHand(updated, activeHandIndex + 1);
      if (next >= 0) setActiveHandIndex(next);
      return;
    }

    const next = findNextPlayingHand(playerHands, activeHandIndex + 1);
    if (next >= 0) setActiveHandIndex(next);
  }, [activeHand, activeHandIndex, playerHands]);

  const applyDouble = useCallback(() => {
    if (!activeHand || activeHand.status !== 'playing') return;
    const updated = markHandDoubled(playerHands, activeHandIndex);
    setPlayerHands(updated);
    const next = findNextPlayingHand(updated, activeHandIndex + 1);
    if (next >= 0) setActiveHandIndex(next);
  }, [activeHand, activeHandIndex, playerHands]);

  const newHand = useCallback(() => {
    setPlayerHands([]);
    setActiveHandIndex(0);
    setDealerUpcard(null);
    setDealerHole(null);
    setPickerMode('dealer');
  }, []);

  const newShoe = useCallback(() => {
    setCountState(resetCount(countState.decks));
    newHand();
  }, [countState.decks, newHand]);

  const setDecks = useCallback((decks: number) => {
    setCountState((s) => ({ ...s, decks }));
  }, []);

  const ensureHandExists = useCallback(() => {
    if (playerHands.length === 0) {
      setPlayerHands([createPlayerHand()]);
      setActiveHandIndex(0);
    }
  }, [playerHands.length]);

  const addPlayerCardWithInit = useCallback(
    (rank: Rank) => {
      if (playerHands.length === 0) {
        setPlayerHands([createPlayerHand([withSuit(rank)])]);
        setActiveHandIndex(0);
        trackCard(rank);
        return;
      }
      addPlayerCard(rank);
    },
    [playerHands.length, addPlayerCard, trackCard],
  );

  const handleRankInput = useCallback(
    (rank: Rank) => {
      if (!dealerUpcard) {
        setDealer(rank);
        return;
      }
      if (pickerMode === 'dealer') {
        setDealer(rank);
        return;
      }
      if (pickerMode === 'hole') {
        revealHole(rank);
        return;
      }
      addPlayerCardWithInit(rank);
    },
    [dealerUpcard, pickerMode, setDealer, revealHole, addPlayerCardWithInit],
  );

  const cyclePickerMode = useCallback(() => {
    if (!dealerUpcard) return;
    const modes: PickerMode[] = dealerHole ? ['player', 'dealer'] : ['player', 'hole', 'dealer'];
    const idx = modes.indexOf(pickerMode);
    setPickerMode(modes[(idx + 1) % modes.length]);
  }, [dealerUpcard, dealerHole, pickerMode]);

  const quickDeal = useCallback(
    (playerRanks: Rank[], dealerRank: Rank) => {
      newHand();
      trackCard(dealerRank);
      setDealerUpcard(withSuit(dealerRank));
      const hand = createPlayerHand(playerRanks.map(withSuit));
      playerRanks.forEach((r) => trackCard(r));
      setPlayerHands([refreshHandStatus(hand)]);
      setActiveHandIndex(0);
      setPickerMode('player');
    },
    [newHand, trackCard],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const action = parseKeyboardAction(e, {
        hasDealer: dealerUpcard !== null,
        hasHole: dealerHole !== null,
        canSplit: !!canSplitActive,
        multiHand: playerHands.length > 1,
      });

      switch (action.type) {
        case 'rank':
          if (action.rank) {
            e.preventDefault();
            handleRankInput(action.rank);
          }
          break;
        case 'undo':
          e.preventDefault();
          removePlayerCard();
          break;
        case 'newHand':
          e.preventDefault();
          newHand();
          break;
        case 'newShoe':
          e.preventDefault();
          newShoe();
          break;
        case 'cycleMode':
          cyclePickerMode();
          break;
        case 'prevHand':
          e.preventDefault();
          setActiveHandIndex((i) => Math.max(0, i - 1));
          break;
        case 'nextHand':
          e.preventDefault();
          setActiveHandIndex((i) => Math.min(playerHands.length - 1, i + 1));
          break;
        case 'split':
          e.preventDefault();
          performSplit();
          break;
        case 'stand':
          e.preventDefault();
          performStand();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    dealerUpcard,
    dealerHole,
    canSplitActive,
    playerHands.length,
    handleRankInput,
    removePlayerCard,
    newHand,
    newShoe,
    cyclePickerMode,
    performSplit,
    performStand,
  ]);

  // Auto-create hand when dealer is set and user starts entering cards
  useEffect(() => {
    if (dealerUpcard && playerHands.length === 0 && pickerMode === 'player') {
      ensureHandExists();
    }
  }, [dealerUpcard, playerHands.length, pickerMode, ensureHandExists]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <span className="logo">♠</span>
          <div>
            <h1>BJ Helper</h1>
            <p className="tagline">Blackjack strategy assistant — play alongside any online table</p>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="btn btn-ghost" onClick={newHand}>
            New Hand <kbd>N</kbd>
          </button>
          <button type="button" className="btn btn-ghost" onClick={newShoe}>
            New Shoe <kbd>R</kbd>
          </button>
        </div>
      </header>

      <main className="main">
        <section className="panel play-panel">
          <div className="hands">
            <HandDisplay
              title="Dealer"
              cards={dealerUpcard ? [dealerUpcard, ...(dealerHole ? [dealerHole] : [])] : []}
              hiddenCount={dealerUpcard && !dealerHole ? 1 : 0}
              analysis={
                dealerUpcard
                  ? analyzeHand(dealerHole ? [dealerUpcard, dealerHole] : [dealerUpcard])
                  : null
              }
              highlight={false}
            />

            {playerHands.length <= 1 ? (
              <HandDisplay
                title="Your Hand"
                cards={activeCards}
                analysis={activeCards.length > 0 ? playerAnalysis : null}
                highlight
                active={activeHand?.status === 'playing'}
                status={activeHand?.status ?? 'playing'}
              />
            ) : (
              <div className="split-hands">
                {playerHands.map((hand, i) => {
                  const analysis = analyzeHand(hand.cards);
                  return (
                    <HandDisplay
                      key={hand.id}
                      title={`Hand ${i + 1}`}
                      cards={hand.cards}
                      analysis={hand.cards.length > 0 ? analysis : null}
                      highlight
                      active={i === activeHandIndex && hand.status === 'playing'}
                      status={hand.status}
                      onClick={() => setActiveHandIndex(i)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <InsurancePanel
            advice={insuranceAdvice}
            show={dealerUpcard?.rank === 'A' && !dealerHole}
          />

          <StrategyPanel
            strategy={strategy}
            hasInput={activeCards.length > 0 && dealerUpcard !== null}
            isBust={playerAnalysis.isBust}
            isBlackjack={playerAnalysis.isBlackjack && activeHand?.status === 'blackjack'}
            handComplete={handsComplete && playerHands.length > 0}
          />

          {strategy?.action === 'DOUBLE' && activeHand?.status === 'playing' && (
            <button type="button" className="btn btn-accent btn-double-confirm" onClick={applyDouble}>
              Mark as doubled (add one card, then auto-stand)
            </button>
          )}

          <CardPicker
            mode={pickerMode}
            onModeChange={setPickerMode}
            onSelectPlayer={addPlayerCardWithInit}
            onSelectDealer={setDealer}
            onRevealHole={revealHole}
            onUndo={removePlayerCard}
            onSplit={performSplit}
            onStand={performStand}
            hasDealer={dealerUpcard !== null}
            hasHole={dealerHole !== null}
            playerCount={activeCards.length}
            canSplit={!!canSplitActive}
          />

          <div className="quick-scenarios">
            <span className="quick-label">Quick deal:</span>
            <button type="button" className="btn btn-chip" onClick={() => quickDeal(['8', '8'], '6')}>
              8,8 vs 6
            </button>
            <button type="button" className="btn btn-chip" onClick={() => quickDeal(['A', '8'], '6')}>
              A,8 vs 6
            </button>
            <button type="button" className="btn btn-chip" onClick={() => quickDeal(['10', '6'], '10')}>
              16 vs 10
            </button>
            <button type="button" className="btn btn-chip" onClick={() => quickDeal(['5', '6'], '5')}>
              11 vs 5
            </button>
          </div>
        </section>

        <aside className="panel side-panel">
          <CountPanel
            countState={countState}
            trueCount={trueCount}
            penetration={penetrationPercent(countState)}
            betRec={betRec}
            description={countDescription(countState.runningCount, trueCount)}
            baseUnit={baseUnit}
            onBaseUnitChange={setBaseUnit}
            onDecksChange={setDecks}
            trackCount={trackCount}
            onTrackCountChange={setTrackCount}
          />

          <div className="settings-card">
            <h3>Table Rules</h3>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={surrenderAllowed}
                onChange={(e) => setSurrenderAllowed(e.target.checked)}
              />
              <span>Late surrender allowed</span>
            </label>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={deviationsEnabled}
                onChange={(e) => setDeviationsEnabled(e.target.checked)}
              />
              <span>Count deviations (Illustrious 18)</span>
            </label>
            <p className="settings-note">
              Strategy uses standard 6-deck H17 with DAS. Deviations adjust plays based on true count.
            </p>
          </div>

          <KeyboardHints />

          <div className="help-card">
            <h3>How to use</h3>
            <ol>
              <li>Set deck count to match your online table.</li>
              <li>Enter dealer upcard, then your cards (keyboard or clicks).</li>
              <li>Press <kbd>P</kbd> to split, <kbd>Space</kbd> to stand / next hand.</li>
              <li>Follow the recommendation — gold border means a count deviation.</li>
              <li>Enter hole card after the round for accurate counting.</li>
            </ol>
          </div>
        </aside>
      </main>

      <footer className="footer">
        For educational purposes. Always verify table rules match the strategy chart.
      </footer>
    </div>
  );
}
