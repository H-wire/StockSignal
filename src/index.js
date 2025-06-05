import CONFIG from './config.js';
import { updateAll, getHistoricalData } from './dataFetcher.js';
import { addIndicators } from './indicators.js';
import { applyStrategy } from './strategyEngine.js';
import { backtest } from './backtest.js';
import { getSummary } from './llm.js';
import { init as initLogger, info, error } from './logger.js';

async function run() {
  info('Updating price data');
  await updateAll();
  for (const symbol of CONFIG.symbols) {
    info(`Processing ${symbol}`);
    let data = getHistoricalData(symbol);
    data = addIndicators(data);
    data = applyStrategy(data);
    const bt = backtest(data);
    const summary = await getSummary(symbol, data);
    info(`${symbol} summary: ${summary}`);
    info(`${symbol} backtest: ${JSON.stringify(bt)}`);
  }
}

initLogger();
run().catch(err => error(err));
