import { differenceInCalendarDays } from 'date-fns';

export function backtest(data, initialCapital = 10000) {
  if (data.length === 0) return null;
  let cash = initialCapital;
  let position = 0;
  let entryPrice = 0;
  const trades = [];
  let peak = initialCapital;
  let maxDD = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    if (!position && row.buySignal) {
      position = cash / row.close;
      entryPrice = row.close;
      trades.push({ type: 'buy', date: row.date, price: row.close, reason: 'signal' });
      cash = 0;
    } else if (position && (row.sma50 < row.sma200 || row.rsi14 > 70)) {
      cash = position * row.close;
      trades.push({ type: 'sell', date: row.date, price: row.close, reason: 'exit' });
      position = 0;
    }
    row.portfolio = cash + position * row.close;
    peak = Math.max(peak, row.portfolio);
    maxDD = Math.min(maxDD, (row.portfolio - peak) / peak);
  }

  const last = data[data.length - 1];
  const finalValue = cash + position * last.close;
  const start = new Date(data[0].date);
  const end = new Date(last.date);
  const years = differenceInCalendarDays(end, start) / 365;
  const cagr = Math.pow(finalValue / initialCapital, 1 / years) - 1;

  const wins = trades.filter((t, idx) => t.type === 'sell' && trades[idx - 1] && trades[idx - 1].price && t.price > trades[idx - 1].price).length;
  const sells = trades.filter(t => t.type === 'sell').length;
  const winRate = sells ? wins / sells : 0;

  return {
    cagr,
    maxDrawdown: maxDD,
    winRate,
    trades,
    equityCurve: data.map(d => ({ date: d.date, value: d.portfolio }))
  };
}

export default { backtest };
