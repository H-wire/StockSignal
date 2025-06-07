export async function fetchStock(symbol, timeframe = '6m') {
  const res = await fetch(`/api/stock/${symbol}?timeframe=${timeframe}`);
  if (!res.ok) throw new Error('Failed to fetch stock');
  return res.json();
}

export async function fetchSummary(symbol, reload = false) {
  const url = reload ? `/api/summary/${symbol}?reload=true` : `/api/summary/${symbol}`;
  const res = await fetch(url);

  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.text();
}

export async function fetchBacktest(symbol, timeframe = '6m') {
  const res = await fetch(`/api/backtest/${symbol}?timeframe=${timeframe}`);
  if (!res.ok) throw new Error('Failed to fetch backtest');
  return res.json();
}

export async function fetchScreener() {
  const res = await fetch('/api/screener');
  if (!res.ok) throw new Error('Failed to fetch screener');
  return res.json();
}

export async function fetchPortfolio() {
  const res = await fetch('/api/portfolio');
  if (!res.ok) throw new Error('Failed to fetch portfolio');
  return res.json();
}

export async function reloadSummary(symbol, timeframe = '6m') {
  const res = await fetch(`/api/summary/${symbol}/reload?timeframe=${timeframe}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reload summary');
  return res.text();
}
