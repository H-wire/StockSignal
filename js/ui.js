import { fetchStock, fetchSummary, fetchBacktest, reloadSummary } from './api.js';
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

  document.getElementById('refreshBtn').addEventListener('click', loadData);
  document.getElementById('timeframeSelect').addEventListener('change', loadData);
  document.getElementById('reloadLlmBtn').addEventListener('click', reloadLlmSummary);
  
  // Chart zoom controls
  document.getElementById('zoomInBtn').addEventListener('click', () => {
    const chart = Chart.getChart('priceChart');
    chart.zoom(1.1);
  });
  
  document.getElementById('zoomOutBtn').addEventListener('click', () => {
    const chart = Chart.getChart('priceChart');
    chart.zoom(0.9);
  });
  
  document.getElementById('resetZoomBtn').addEventListener('click', () => {
    const chart = Chart.getChart('priceChart');
    chart.resetZoom();
  });
  

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
  const timeframe = document.getElementById('timeframeSelect').value;
  if (!symbol) return;
  
  // Show loading state
  const summaryEl = document.getElementById('summary');
  summaryEl.innerHTML = '<div class="text-center"><i class="bi bi-hourglass-split"></i> Loading analysis...</div>';
  
  try {
    const data = await fetchStock(symbol, timeframe);
    updateStockCharts(data, toggles);

    if (toggles.backtest) {
      const bt = await fetchBacktest(symbol, timeframe);
      showBacktestStats(bt);
      updatePortfolioChart(bt);
    }


    const summary = await fetchSummary(symbol, timeframe);
    summaryEl.innerHTML = `<div class="summary-text">${summary.replace(/\n/g, '<br>')}</div>`;
  } catch (err) {
    console.error(err);
    summaryEl.innerHTML = `<div class="text-danger"><i class="bi bi-exclamation-triangle"></i> Error: ${err.message}</div>`;
  }
}

async function reloadLlmSummary() {
  const symbol = document.getElementById('symbolInput').value.trim().toUpperCase();
  const timeframe = document.getElementById('timeframeSelect').value;
  if (!symbol) return;
  
  const summaryEl = document.getElementById('summary');
  const reloadBtn = document.getElementById('reloadLlmBtn');
  
  // Show loading state
  summaryEl.innerHTML = '<div class="text-center"><i class="bi bi-hourglass-split"></i> Reloading AI analysis...</div>';
  reloadBtn.disabled = true;
  reloadBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Loading...';
  
  try {
    const summary = await reloadSummary(symbol, timeframe);

    summaryEl.innerHTML = `<div class="summary-text">${summary.replace(/\n/g, '<br>')}</div>`;
  } catch (err) {
    console.error(err);
    summaryEl.innerHTML = `<div class="text-danger"><i class="bi bi-exclamation-triangle"></i> Error: ${err.message}</div>`;
  } finally {
    reloadBtn.disabled = false;
    reloadBtn.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i>Reload';
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
