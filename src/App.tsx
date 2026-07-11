import { useCallback, useMemo, useState } from 'react';
import { type Card, type Rank, type Suit, SUITS } from './lib/cards';
import { analyzeHand, canDouble, canSplit } from './lib/handEvaluation';
import { getBasicStrategy } from './lib/basicStrategy';
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
import { CardPicker } from './components/CardPicker';
import { HandDisplay } from './components/HandDisplay';
import { StrategyPanel } from './components/StrategyPanel';
import { CountPanel } from './components/CountPanel';
import './App.css';

function randomSuit(): Suit {
  return SUITS[Math.floor(Math.random() * SUITS.length)];
}

function withSuit(rank: Rank): Card {
  return { rank, suit: randomSuit() };
}

export default function App() {
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerUpcard, setDealerUpcard] = useState<Card | null>(null);
  const [dealerHole, setDealerHole] = useState<Card | null>(null);
  const [countState, setCountState] = useState<CountState>(initialCountState(6));
  const [baseUnit, setBaseUnit] = useState(10);
  const [surrenderAllowed, setSurrenderAllowed] = useState(true);
  const [trackCount, setTrackCount] = useState(true);

  const playerAnalysis = useMemo(() => analyzeHand(playerCards), [playerCards]);

  const strategy = useMemo(() => {
    if (!dealerUpcard || playerCards.length === 0) return null;
    return getBasicStrategy({
      playerTotal: playerAnalysis.total,
      isSoft: playerAnalysis.isSoft,
      isPair: playerAnalysis.isPair,
      pairRank: playerAnalysis.pairRank,
      dealerUpcard: dealerUpcard.rank,
      canDouble: canDouble(playerCards),
      canSplit: canSplit(playerCards),
      surrenderAllowed,
    });
  }, [dealerUpcard, playerCards, playerAnalysis, surrenderAllowed]);

  const trueCount = useMemo(
    () => computeTrueCount(countState.runningCount, decksRemaining(countState)),
    [countState],
  );

  const betRec = useMemo(
    () => betRecommendation(trueCount, baseUnit),
    [trueCount, baseUnit],
  );

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

  const addPlayerCard = useCallback(
    (rank: Rank) => {
      trackCard(rank);
      setPlayerCards((prev) => [...prev, withSuit(rank)]);
    },
    [trackCard],
  );

  const removePlayerCard = useCallback(() => {
    setPlayerCards((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      untrackCard(last.rank);
      return prev.slice(0, -1);
    });
  }, [untrackCard]);

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

  const newHand = useCallback(() => {
    setPlayerCards([]);
    setDealerUpcard(null);
    setDealerHole(null);
  }, []);

  const newShoe = useCallback(() => {
    setCountState(resetCount(countState.decks));
    newHand();
  }, [countState.decks, newHand]);

  const setDecks = useCallback((decks: number) => {
    setCountState((s) => ({ ...s, decks }));
  }, []);

  const quickDeal = useCallback(
    (playerRanks: Rank[], dealerRank: Rank) => {
      newHand();
      playerRanks.forEach((r) => addPlayerCard(r));
      setDealer(dealerRank);
    },
    [newHand, addPlayerCard, setDealer],
  );

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
            New Hand
          </button>
          <button type="button" className="btn btn-ghost" onClick={newShoe}>
            New Shoe
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
              analysis={dealerUpcard ? analyzeHand(dealerHole ? [dealerUpcard, dealerHole] : [dealerUpcard]) : null}
              highlight={false}
            />
            <HandDisplay
              title="Your Hand"
              cards={playerCards}
              analysis={playerCards.length > 0 ? playerAnalysis : null}
              highlight
            />
          </div>

          <StrategyPanel
            strategy={strategy}
            hasInput={playerCards.length > 0 && dealerUpcard !== null}
            isBust={playerAnalysis.isBust}
            isBlackjack={playerAnalysis.isBlackjack}
          />

          <CardPicker
            onSelectPlayer={addPlayerCard}
            onSelectDealer={setDealer}
            onRevealHole={revealHole}
            onUndo={removePlayerCard}
            hasDealer={dealerUpcard !== null}
            hasHole={dealerHole !== null}
            playerCount={playerCards.length}
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
            <p className="settings-note">
              Strategy uses standard 6-deck H17 with DAS. Adjust deck count in the counter panel.
            </p>
          </div>

          <div className="help-card">
            <h3>How to use</h3>
            <ol>
              <li>Set the number of decks to match your online table.</li>
              <li>Tap cards as they appear on screen — yours, dealer upcard, then hole card.</li>
              <li>Follow the recommended action before you click on the casino site.</li>
              <li>Use the count panel for bet sizing when the true count is high.</li>
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
