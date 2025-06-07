
import { fetchStock, fetchSummary, fetchBacktest, fetchScreener, fetchPortfolio } from './api.js';
import { initCharts, updateStockCharts, updatePortfolioChart, zoomX, zoomY, resetZoom } from './chart.js';


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
  const zoomInXBtn = document.getElementById('zoomInX');
  const zoomOutXBtn = document.getElementById('zoomOutX');
  const zoomInYBtn = document.getElementById('zoomInY');
  const zoomOutYBtn = document.getElementById('zoomOutY');
  const resetZoomBtn = document.getElementById('resetZoom');
  if (zoomInXBtn) zoomInXBtn.addEventListener('click', () => zoomX(1));
  if (zoomOutXBtn) zoomOutXBtn.addEventListener('click', () => zoomX(-1));
  if (zoomInYBtn) zoomInYBtn.addEventListener('click', () => zoomY(1));
  if (zoomOutYBtn) zoomOutYBtn.addEventListener('click', () => zoomY(-1));
  if (resetZoomBtn) resetZoomBtn.addEventListener('click', resetZoom);

  ['sma50','sma200','bb','rsi','macd','volume','backtest'].forEach(id => {
    document.getElementById(id + 'Toggle').addEventListener('change', e => {
      toggles[id] = e.target.checked;
      loadData();
    });
  });
  loadData();
  loadScreener();
  loadPortfolio();
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


    const summary = await fetchSummary(symbol, reloadSummary);
    const summaryEl = document.getElementById('summary');

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

async function loadScreener() {
  try {
    const data = await fetchScreener();
    const list = document.getElementById('screenerList');
    if (list) {
      list.innerHTML = data.symbols.map(s => `<option value="${s}">`).join('');
    }
  } catch (err) {
    console.error(err);
  }
}

async function loadPortfolio() {
  try {
    const data = await fetchPortfolio();
    const el = document.getElementById('allocationDisplay');
    if (!el) return;
    const core = data.allocations.core.toFixed(0);
    const spec = data.allocations.speculative.toFixed(0);
    el.innerHTML = `
      <div class="d-flex justify-content-between mb-1">
        <small>Core ${core}%</small>
        <small>Spec ${spec}%</small>
      </div>
      <div class="progress" style="height:8px;">
        <div class="progress-bar bg-success" style="width:${core}%"></div>
        <div class="progress-bar bg-warning" style="width:${spec}%"></div>
      </div>`;
  } catch (err) {
    console.error(err);
  }
}
