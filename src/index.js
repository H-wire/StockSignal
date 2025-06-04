import CONFIG from './config.js';
import { updateAll, getHistoricalData } from './dataFetcher.js';
import { addIndicators } from './indicators.js';
import { applyStrategy } from './strategyEngine.js';
import { backtest } from './backtest.js';
import { getSummary } from './llm.js';

async function run() {
  await updateAll();
  for (const symbol of CONFIG.symbols) {
    let data = getHistoricalData(symbol);
    data = addIndicators(data);
    data = applyStrategy(data);
    const bt = backtest(data);
    const summary = await getSummary(symbol, data);
    console.log(symbol, summary, bt);
  }
}

run();
