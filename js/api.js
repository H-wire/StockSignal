export async function fetchStock(symbol, timeframe = '6m') {
  const res = await fetch(`/api/stock/${symbol}?timeframe=${timeframe}`);
  if (!res.ok) throw new Error('Failed to fetch stock');
  return res.json();
}


export async function fetchSummary(symbol, timeframe = '6m') {
  const res = await fetch(`/api/summary/${symbol}?timeframe=${timeframe}`);

  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.text();
}

export async function fetchBacktest(symbol, timeframe = '6m') {
  const res = await fetch(`/api/backtest/${symbol}?timeframe=${timeframe}`);
  if (!res.ok) throw new Error('Failed to fetch backtest');
  return res.json();
}

export async function reloadSummary(symbol, timeframe = '6m') {
  const res = await fetch(`/api/summary/${symbol}/reload?timeframe=${timeframe}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reload summary');
  return res.text();
}
