# BJ Helper

An interactive blackjack strategy assistant with a web UI. Run it alongside any online blackjack table to get real-time basic strategy recommendations and Hi-Lo card counting.

## Features

- **Basic strategy engine** — Hit, Stand, Double, Split, and Surrender recommendations for standard 6-deck H17 rules with DAS
- **Hi-Lo card counting** — Running count, true count, penetration tracking, and bet sizing suggestions
- **Interactive card input** — Tap ranks as cards appear on your online table
- **Quick scenarios** — One-click presets for common training hands (8,8 vs 6, 16 vs 10, etc.)
- **Configurable** — Deck count (1–8), base bet unit, surrender on/off

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in a browser window next to your online blackjack game.

## How to use

1. Set the deck count to match your online table (default: 6 decks).
2. When a hand is dealt, tap the **dealer upcard**, then your **player cards**.
3. Follow the large **Recommended** action before clicking on the casino site.
4. After the round, optionally enter the **hole card** for accurate counting.
5. Use the **true count** panel to adjust bet size between hands.

## Build for production

```bash
npm run build
npm run preview
```

## Strategy assumptions

- Multi-deck shoe (configurable 1–8 decks)
- Dealer hits soft 17 (H17)
- Double after split allowed (DAS)
- Late surrender (toggleable)

Always verify your table's specific rules match these assumptions.

## Disclaimer

This tool is for educational purposes. Gambling involves risk. Card counting may be prohibited at some venues.
