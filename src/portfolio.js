const positions = [];

export function addPosition(symbol, shares, type = 'core', entryPrice = 0) {
  positions.push({ symbol, shares, type, entryPrice, entryDate: new Date().toISOString() });
}

export function removePosition(symbol) {
  const idx = positions.findIndex(p => p.symbol === symbol);
  if (idx !== -1) positions.splice(idx, 1);
}

export function getPositions() {
  return positions;
}

export function evaluateAllocations(priceMap = {}) {
  let core = 0;
  let speculative = 0;
  for (const p of positions) {
    const price = priceMap[p.symbol] || p.entryPrice || 0;
    const value = p.shares * price;
    if (p.type === 'core') core += value; else speculative += value;
  }
  const total = core + speculative;
  const corePct = total ? (core / total) * 100 : 0;
  const specPct = total ? (speculative / total) * 100 : 0;
  return { core: corePct, speculative: specPct };
}

export function checkAllocation(priceMap = {}) {
  const alloc = evaluateAllocations(priceMap);
  return alloc.core >= 60 && alloc.core <= 80;
}

export function shouldExit(position, metrics) {
  const { close, sma200, revenueGrowth } = metrics;
  if (close < sma200) return true;
  if (typeof revenueGrowth === 'number' && revenueGrowth < 0) return true;
  return false;
}

export default { addPosition, removePosition, getPositions, evaluateAllocations, checkAllocation, shouldExit };
