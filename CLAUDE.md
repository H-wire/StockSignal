# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Start server**: `npm start` - Runs the Express server on port 3000, serves the frontend dashboard and provides REST API endpoints
- **No tests, linting, or build commands** - This is a simple Node.js project without these tooling setups

## Architecture

This is a stock trading signal application with Node.js backend and vanilla JavaScript frontend:

### Backend (src/)
- **Express server** (`src/index.js`): Main entry point serving static files and API endpoints
- **Data layer** (`src/dataFetcher.js`): Fetches Yahoo Finance data, caches in SQLite database (`data/price_cache.sqlite`)
- **Technical analysis** (`src/indicators.js`): Calculates SMA, RSI, MACD, Bollinger Bands using `technicalindicators` library  
- **Strategy engine** (`src/strategyEngine.js`): Applies configurable trading signals (base RSI/SMA, MACD crossovers, Bollinger breakouts, volume spikes, price rate changes)
- **Backtesting** (`src/backtest.js`): Simple backtester for strategy evaluation
- **LLM integration** (`src/llm.js`): Generates daily stock summaries, cached in `data/llm_cache.json`

### Frontend (js/, index.html, styles.css)
- **Vanilla JavaScript SPA**: No frameworks, uses Chart.js for price/indicator visualization
- **API consumption**: Calls `/api/stock/:symbol`, `/api/backtest/:symbol`, `/api/summary/:symbol`
- **User interface** (`js/ui.js`): Input handling, chart updates, backtest triggering

### Configuration
- **Environment variables** (`.env`): LLM endpoints, strategy toggles, symbol lists, RSI thresholds
- **Default symbols**: Swedish stocks (HM-B.ST format)
- **Strategy toggles**: MACD, Bollinger, volume, price rate strategies can be enabled/disabled

### Data Flow
1. Startup: Updates all configured symbols from Yahoo Finance
2. API requests: Fetch/cache → add indicators → apply strategy → return results
3. Frontend: User selects symbol → displays charts → can trigger backtests
4. LLM summaries: Generated on-demand, cached daily per symbol