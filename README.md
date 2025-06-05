# StockSignal

Node.js backend for stock trading signals with Yahoo Finance data and SQLite caching.  
The server exposes a small REST API used by the web dashboard.

## Features
- Fetch historical prices from Yahoo Finance
- Calculate technical indicators (SMA, RSI, MACD, Bollinger Bands)
- Strategy engine with configurable signals
- Simple backtester
- Daily LLM summaries cached in JSON

Run `npm start` after setting up `.env`.  This starts an Express server on
port `3000` that serves the dashboard and provides `/api/stock/:symbol`,
`/api/backtest/:symbol` and `/api/summary/:symbol` endpoints.  Backtests are
now triggered from the frontend instead of running automatically on startup.

