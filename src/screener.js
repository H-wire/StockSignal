import yahooFinance from 'yahoo-finance2';
import CONFIG from './config.js';
import { info } from './logger.js';

const SECTOR_REGEX = /(tech|medtech|defense)/i;

export async function screenSymbols(symbols = CONFIG.symbols) {
  const passed = [];
  for (const symbol of symbols) {
    try {
      const quote = await yahooFinance.quote(symbol);
      const qs = await yahooFinance.quoteSummary(symbol, {
        modules: ['assetProfile','financialData','defaultKeyStatistics','incomeStatementHistory']
      });

      // Exchange check - Nasdaq Stockholm but not First North
      const exchangeName = quote.fullExchangeName || quote.exchange || '';
      if (!/Stockholm/i.test(exchangeName) || /First North/i.test(exchangeName)) {
        continue;
      }

      // Sector filter
      const sector = qs.assetProfile?.sector || '';
      if (!SECTOR_REGEX.test(sector)) continue;

      // Fundamental metrics
      let revenueGrowth = qs.financialData?.revenueGrowth;
      const hist = qs.incomeStatementHistory?.incomeStatementHistory;
      if (!revenueGrowth && Array.isArray(hist) && hist.length >= 2) {
        const rev0 = hist[0]?.totalRevenue;
        const rev1 = hist[1]?.totalRevenue;
        if (rev0 && rev1) revenueGrowth = (rev0 - rev1) / rev1;
      }
      const roe = qs.financialData?.returnOnEquity || qs.defaultKeyStatistics?.returnOnEquity;
      const debtEq = qs.financialData?.debtToEquity || qs.defaultKeyStatistics?.debtToEquity;

      if (revenueGrowth > 0.05 && roe > 0.10 && debtEq < 1) {
        passed.push(symbol);
      }
    } catch (err) {
      info(`Screener failed for ${symbol}: ${err.message}`);
    }
  }
  return passed;
}

export default { screenSymbols };
