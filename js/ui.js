import { fetchStock, fetchSummary, fetchBacktest } from './api.js';
import { initCharts, updateStockCharts, updatePortfolioChart } from './chart.js';

let toggles = {
  sma50: true,
  sma200: true,
  bb: true,
  rsi: true,
  macd: true,
  volume: true,
  backtest: true,
};

export function setupUI() {
  initCharts();
  document.getElementById('refreshBtn').addEventListener('click', () => loadData());
  const reloadBtn = document.getElementById('llmReloadBtn');
  if (reloadBtn) reloadBtn.addEventListener('click', () => loadData(true));
  ['sma50','sma200','bb','rsi','macd','volume','backtest'].forEach(id => {
    document.getElementById(id + 'Toggle').addEventListener('change', e => {
      toggles[id] = e.target.checked;
      loadData();
    });
  });
  loadData();
}

async function loadData(reloadSummary = false) {
  const symbol = document.getElementById('symbolInput').value.trim().toUpperCase();
  if (!symbol) return;
  try {
    const data = await fetchStock(symbol);
    updateStockCharts(data, toggles);

    if (toggles.backtest) {
      const bt = await fetchBacktest(symbol);
      showBacktestStats(bt);
      updatePortfolioChart(bt);
    }

    const summary = await fetchSummary(symbol, reloadSummary);
    const summaryEl = document.getElementById('summary');
    summaryEl.innerHTML = `<div class="summary-text">${summary.replace(/\n/g, '<br>')}</div>`;
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

function showBacktestStats(bt) {
  const el = document.getElementById('backtestStats');
  if (!bt) { el.innerHTML = ''; return; }
  
  const returnClass = bt.totalReturn > 0 ? 'text-success' : 'text-danger';
  const winRateClass = bt.winRate > 50 ? 'text-success' : 'text-warning';
  
  el.innerHTML = `
    <div class="col-6 col-lg-3">
      <div class="metric-card">
        <div class="metric-value ${returnClass}">${bt.totalReturn}%</div>
        <div class="metric-label">Total Return</div>
      </div>
    </div>
    <div class="col-6 col-lg-3">
      <div class="metric-card">
        <div class="metric-value ${winRateClass}">${bt.winRate}%</div>
        <div class="metric-label">Win Rate</div>
      </div>
    </div>
    <div class="col-6 col-lg-3">
      <div class="metric-card">
        <div class="metric-value text-danger">${bt.maxDrawdown}%</div>
        <div class="metric-label">Max Drawdown</div>
      </div>
    </div>
    <div class="col-6 col-lg-3">
      <div class="metric-card">
        <div class="metric-value text-info">${bt.trades}</div>
        <div class="metric-label">Total Trades</div>
      </div>
    </div>
  `;
}
