import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAndCache, getHistoricalData, updateAll } from './dataFetcher.js';
import { addIndicators } from './indicators.js';
import { applyStrategy } from './strategyEngine.js';
import { backtest } from './backtest.js';
import { getSummary } from './llm.js';
import { init as initLogger, info, error } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend files
app.use(express.static(path.resolve(__dirname, '..')));

app.get('/api/stock/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    await fetchAndCache(symbol);
    let data = getHistoricalData(symbol);
    data = addIndicators(data);
    res.json(data);
  } catch (err) {
    error(err);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

app.get('/api/backtest/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    await fetchAndCache(symbol);
    let data = getHistoricalData(symbol);
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
    await fetchAndCache(symbol);
    let data = getHistoricalData(symbol);
    data = addIndicators(data);
    const summary = await getSummary(symbol, data);
    res.send(summary);
  } catch (err) {
    error(err);
    res.status(500).send('Failed to get summary');
  }
});

initLogger();
updateAll().catch(err => error(err));

app.listen(PORT, () => info(`Server running on port ${PORT}`));
