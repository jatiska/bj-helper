# BJ Helper

An interactive blackjack strategy assistant with a web UI. Run it alongside any online blackjack table to get real-time basic strategy recommendations and Hi-Lo card counting.

## Features

- **Basic strategy engine** — Hit, Stand, Double, Split, and Surrender recommendations for standard 6-deck H17 rules with DAS
- **Hi-Lo card counting** — Running count, true count, penetration tracking, and bet sizing suggestions
- **Count deviations** — Illustrious 18 index plays that override basic strategy at specific true counts
- **Insurance advice** — Take/decline recommendation when dealer shows Ace (index ≥ +3)
- **Multi-hand / split tracking** — Split hands into separate rows, switch with `[` `]`, stand with Space
- **Keyboard shortcuts** — Enter cards without clicking (2–9, 0/T, A, J/Q/K, Tab, P, etc.)
- **Interactive card input** — Tap ranks as cards appear on your online table
- **Quick scenarios** — One-click presets for common training hands
- **Configurable** — Deck count (1–8), base bet unit, surrender and deviations toggles

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
4. Press **P** to split, **Space** to stand / advance to the next split hand.
5. Gold-bordered recommendations are **count deviations** (toggle in settings).
6. When dealer shows Ace, check the **Insurance** panel (take at TC ≥ +3).
7. After the round, optionally enter the **hole card** for accurate counting.
8. Use the **true count** panel to adjust bet size between hands.

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `2`–`9`, `0`/`T`, `A`, `J`/`Q`/`K` | Enter card rank |
| `Tab` | Cycle input mode (your cards / hole / dealer) |
| `Backspace` | Undo last card |
| `P` | Split hand |
| `Space` | Stand / next hand |
| `[` / `]` | Switch between split hands |
| `N` | New hand |
| `R` | New shoe |

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
