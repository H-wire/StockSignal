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
  document.getElementById('refreshBtn').addEventListener('click', loadData);
  ['sma50','sma200','bb','rsi','macd','volume','backtest'].forEach(id => {
    document.getElementById(id + 'Toggle').addEventListener('change', e => {
      toggles[id] = e.target.checked;
      loadData();
    });
  });
  loadData();
}

async function loadData() {
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

    const summary = await fetchSummary(symbol);
    document.getElementById('summary').innerText = summary;
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

function showBacktestStats(bt) {
  const el = document.getElementById('backtestStats');
  if (!bt) { el.innerHTML = ''; return; }
  el.innerHTML = `
    <div class="col-6 col-md-3">Return: ${bt.totalReturn}%</div>
    <div class="col-6 col-md-3">Win Rate: ${bt.winRate}%</div>
    <div class="col-6 col-md-3">Drawdown: ${bt.maxDrawdown}%</div>
    <div class="col-6 col-md-3">Trades: ${bt.trades}</div>
  `;
}
