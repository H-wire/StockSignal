import CONFIG from './config.js';

export function applyStrategy(data) {
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const prev = data[i - 1];

    const crossUp =
      prev.sma50 !== null &&
      prev.sma200 !== null &&
      row.sma50 !== null &&
      row.sma200 !== null &&
      prev.sma50 <= prev.sma200 &&
      row.sma50 > row.sma200;

    row.crossSignal =
      crossUp &&
      row.rsi14 !== null &&
      row.rsi14 >= 30 &&
      row.rsi14 <= 45;

    row.rsiOversold = row.rsi14 !== null && row.rsi14 < 30;

    row.baseSignal = row.crossSignal || row.rsiOversold;

    row.macdSignalBuy = false;
    if (CONFIG.strategies.macd && prev.macd !== null && prev.macdSignal !== null && row.macd !== null && row.macdSignal !== null) {
      row.macdSignalBuy = prev.macd <= prev.macdSignal && row.macd > row.macdSignal;
    }

    row.bollingerBreakout = false;
    if (CONFIG.strategies.bollinger && row.bbUpper !== null) {
      row.bollingerBreakout = row.close > row.bbUpper;
    }

    row.volumeSpike = false;
    if (CONFIG.strategies.volume && row.avgVolume20) {
      row.volumeSpike = row.volume > 2 * row.avgVolume20;
    }

    row.priceRateSignal = false;
    if (CONFIG.strategies.priceRate && row.priceRate30 !== null) {
      row.priceRateSignal = row.priceRate30 > 5; // hardcoded 5% threshold
    }

    row.entryZone =
      row.sma50 !== null &&
      row.sma200 !== null &&
      row.sma50 > row.sma200 &&
      row.rsi14 !== null &&
      row.rsi14 < 45;

    row.buySignal = row.baseSignal || row.macdSignalBuy || row.bollingerBreakout || row.volumeSpike || row.priceRateSignal;
  }
  return data;
}

export default { applyStrategy };
