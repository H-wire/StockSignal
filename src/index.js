import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAndCache, getHistoricalData, updateAll } from './dataFetcher.js';
import { addIndicators } from './indicators.js';
import { applyStrategy } from './strategyEngine.js';
import { backtest } from './backtest.js';
import { getSummary, clearSummaryCache } from './llm.js';
import { screenSymbols } from './screener.js';
import * as portfolio from './portfolio.js';
import { init as initLogger, info, error } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.resolve(__dirname, '..')));

app.get('/api/stock/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const timeframe = req.query.timeframe || 'all';
    await fetchAndCache(symbol);
    let data = getHistoricalData(symbol, timeframe);
    data = addIndicators(data);
    data = applyStrategy(data);
    
    // Transform data for frontend
    const chartData = {
      dates: data.map(d => d.date),
      close: data.map(d => d.close),
      volume: data.map(d => d.volume),
      sma50: data.map(d => d.sma50),
      sma200: data.map(d => d.sma200),
      rsi: data.map(d => d.rsi14),
      macd: data.map(d => d.macd),
      macdSignal: data.map(d => d.macdSignal),
      macdHist: data.map(d => d.macdHist),
      bbUpper: data.map(d => d.bbUpper),
      bbLower: data.map(d => d.bbLower),
      bbMiddle: data.map(d => d.bbMiddle),
      signals: []
    };
    
    // Add buy signals
    data.forEach((d, i) => {
      if (d.buySignal) {
        chartData.signals.push({ index: i, type: 'buy' });
      }
    });
    
    res.json(chartData);
  } catch (err) {
    error(err);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

app.get('/api/backtest/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const timeframe = req.query.timeframe || 'all';
    await fetchAndCache(symbol);
    let data = getHistoricalData(symbol, timeframe);
    data = addIndicators(data);
    data = applyStrategy(data);
    const bt = backtest(data);
    res.json(bt);
  } catch (err) {
    error(err);
    res.status(500).json({ error: 'Failed to run backtest' });
  }
});

app.get('/api/summary/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const timeframe = req.query.timeframe || 'all';
    const reload = req.query.reload === 'true';
    if (reload) {
      clearSummaryCache(symbol);
    }
    await fetchAndCache(symbol);
    let data = getHistoricalData(symbol, timeframe);
    data = addIndicators(data);
    const summary = await getSummary(symbol, data, { force: reload });
    res.send(summary);
  } catch (err) {
    error(err);
    res.status(500).send('Failed to get summary');
  }
});

app.post('/api/summary/:symbol/reload', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const timeframe = req.query.timeframe || 'all';
    await fetchAndCache(symbol);
    let data = getHistoricalData(symbol, timeframe);
    data = addIndicators(data);
    const summary = await getSummary(symbol, data, true); // Force reload
    res.send(summary);
  } catch (err) {
    error(err);
    res.status(500).send('Failed to reload summary');
  }
});

app.get('/api/screener', async (req, res) => {
  try {
    const symbols = await screenSymbols();
    res.json({ symbols });
  } catch (err) {
    error(err);
    res.status(500).json({ error: 'Failed to run screener' });
  }
});

app.get('/api/portfolio', async (req, res) => {
  try {
    const positions = portfolio.getPositions();
    const prices = {};
    for (const pos of positions) {
      await fetchAndCache(pos.symbol);
      const data = getHistoricalData(pos.symbol);
      if (data.length) prices[pos.symbol] = data[data.length - 1].close;
    }
    const allocations = portfolio.evaluateAllocations(prices);
    res.json({ positions, allocations });
  } catch (err) {
    error(err);
    res.status(500).json({ error: 'Failed to get portfolio' });
  }
});

initLogger();
// Skip updateAll on startup for now
// updateAll().catch(err => error(err));

app.listen(PORT, () => info(`Server running on port ${PORT}`));
