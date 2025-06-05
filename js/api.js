export async function fetchStock(symbol) {
  const res = await fetch(`/api/stock/${symbol}`);
  if (!res.ok) throw new Error('Failed to fetch stock');
  return res.json();
}

export async function fetchSummary(symbol, reload = false) {
  const url = reload ? `/api/summary/${symbol}?reload=true` : `/api/summary/${symbol}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch summary');
  return res.text();
}

export async function fetchBacktest(symbol) {
  const res = await fetch(`/api/backtest/${symbol}`);
  if (!res.ok) throw new Error('Failed to fetch backtest');
  return res.json();
}
