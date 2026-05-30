# FIFA World Cup 2026 — Interactive Bracket

> 🇧🇷 [Versão em Português](README.pt.md)

[![GitHub](https://img.shields.io/badge/GitHub-copa--2026-181717?logo=github)](https://github.com/allanbarcelos/copa-2026)
[![API Repo](https://img.shields.io/badge/GitHub-copa--2026--api-181717?logo=github)](https://github.com/allanbarcelos/copa-2026-api)

React SPA displaying the complete FIFA World Cup 2026 bracket with real-time updates via Socket.IO.

## Features

- **Group stage** — 12 groups with 6 matches each, automatic standings by points, goal difference and head-to-head (FIFA rules)
- **Best third-place teams** — automatic selection of the 8 best third-place finishers
- **Knockout bracket** — R32 → R16 → QF → SF → Final with automatic advancement
- **Real-time** — results synced via Socket.IO every 6 seconds (football-data.org)
- **Win probabilities** — displayed next to each team (api-football, updated every hour)
- **Match status badge** — each match shows whether it is upcoming, live or finished
- **Dates and times** — localized to the user's timezone via `Intl.DateTimeFormat`
- **Multi-language** — Português, English, Français, Español (auto-detected from browser)
- **Locked inputs** — finished matches with API results have their score fields disabled

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 8 |
| Real-time | Socket.IO client |
| Flags | flag-icons (ISO 3166-1 alpha-2) |
| Styling | Plain CSS with custom properties |
| Match API | [football-data.org](https://www.football-data.org/) (via copa-2026-api) |
| Predictions API | [api-football](https://www.api-football.com/) (via copa-2026-api) |

## Project structure

```
src/
├── components/
│   ├── Flag.jsx                  # Renders a flag by ISO country code
│   ├── LiveBadge.jsx             # Socket.IO connection status indicator
│   ├── group/
│   │   ├── GroupMatchCard.jsx    # Group stage match card
│   │   ├── GroupPanel.jsx        # Full group panel
│   │   └── GroupStandings.jsx    # Group standings table
│   └── bracket/
│       ├── BestThirds.jsx        # Best third-place teams bar
│       ├── BracketConnector.jsx  # SVG connector lines between rounds
│       ├── KOMatchCard.jsx       # Knockout match card
│       └── RoundColumn.jsx       # Single knockout round column
├── services/
│   ├── groupStats.js             # Points, goal difference, head-to-head logic
│   ├── bracket.js                # Knockout bracket logic
│   └── dateFormat.js             # Locale-aware date formatting
├── constants/
│   └── bracket.js                # BASE_SLOT, TOTAL_H, CONN_W
├── data.js                       # Teams, groups, dates and R32 pairings
├── i18n.jsx                      # Translations and language selector
├── matchMapper.js                # Maps football-data.org response → app state
├── predictionsMapper.js          # Maps api-football response → win probabilities
├── useMatchData.js               # Socket.IO hook (matches + predictions)
└── App.jsx                       # Global state and composition
```

## Development

### Prerequisites

- Node.js 20+
- [copa-2026-api](../copa-2026-api) running locally

### Install

```bash
npm install
```

### Environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:3001
```

### Start dev server

```bash
npm run dev
# http://localhost:5174
```

### Production build

```bash
npm run build
npm run preview
```

## API connection

The frontend connects via Socket.IO to the address defined in `VITE_API_URL`. Events received:

| Event | Content | Frequency |
|-------|---------|-----------|
| `matches` | Matches + scores + dates + status | Every 6s (during live games) |
| `predictions` | Win probabilities per match | Every 1h |

On connect, the server immediately sends the current in-memory cache — no waiting for the next poller cycle.

## FIFA group stage tiebreakers

Teams within each group are ranked by:

1. Points
2. Goal difference (overall)
3. Goals scored (overall)
4. Points in head-to-head matches
5. Goal difference in head-to-head matches
6. Goals scored in head-to-head matches

---

Open source project — contributions and feedback are welcome.

I accept support for new projects ☕ [Buy me a coffee](https://www.buymeacoffee.com/allanbarcelos)
