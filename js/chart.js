let priceChart, rsiChart, macdChart, portfolioChart;
let entryHighlightData = null;

const entryHighlightPlugin = {
  id: 'entryHighlight',
  afterDatasetsDraw(chart) {
    if (!entryHighlightData || chart !== priceChart) return;
    const { ctx, scales } = chart;
    const { x, y } = scales;
    const yTop = y.top;
    const height = y.bottom - y.top;
    ctx.save();
    for (let i = 0; i < entryHighlightData.dates.length - 1; i++) {
      const sma50 = entryHighlightData.sma50[i];
      const sma200 = entryHighlightData.sma200[i];
      const rsi = entryHighlightData.rsi[i];
      if (sma50 == null || sma200 == null || rsi == null) continue;
      if (sma50 > sma200 && rsi < 45) {
        const x0 = x.getPixelForValue(entryHighlightData.dates[i]);
        const x1 = x.getPixelForValue(entryHighlightData.dates[i + 1]);
        ctx.fillStyle = rsi < 30 ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.1)';
        ctx.fillRect(x0, yTop, x1 - x0, height);

        if (entryHighlightData.insider && entryHighlightData.insider[i]) {
          ctx.fillStyle = '#0ea5e9';
          ctx.beginPath();
          ctx.arc((x0 + x1) / 2, yTop + 10, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        if (entryHighlightData.earnings && entryHighlightData.earnings[i]) {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.rect((x0 + x1) / 2 - 3, yTop + 18, 6, 6);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }
};

// Register zoom plugin if available
if (typeof Chart !== 'undefined' && typeof ChartZoom !== 'undefined') {
  Chart.register(ChartZoom);
}
if (typeof Chart !== 'undefined') {
  Chart.register(entryHighlightPlugin);
}

export function initCharts() {
  const priceCtx = document.getElementById('priceChart').getContext('2d');
  const rsiCtx = document.getElementById('rsiChart').getContext('2d');
  const macdCtx = document.getElementById('macdChart').getContext('2d');
  const portfolioCtx = document.getElementById('portfolioChart').getContext('2d');

  priceChart = new Chart(priceCtx, {
    type: 'line',
    data: { labels: [], datasets: [] },
    options: { 
      responsive: true, 
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      scales: {
        x: {
          grid: { color: 'rgba(0,0,0,0.1)' }
        },
        y: {
          position: 'left',
          grid: { color: 'rgba(0,0,0,0.1)' }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { usePointStyle: true }
        },
        zoom: {

          pan: { enabled: false },
          zoom: {
            wheel: { enabled: false },
            pinch: { enabled: false },
            drag: { enabled: false },
            mode: 'xy'

          }
        }
      }
    }
  });

  rsiChart = new Chart(rsiCtx, {
    type: 'line',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      
      scales: { y: { min: 0, max: 100 } },
      plugins: {
        zoom: {
          pan: { enabled: false },
          zoom: {
            wheel: { enabled: false },
            pinch: { enabled: false },
            drag: { enabled: false },
            mode: 'xy'

          }
        }
      }
    }
  });

  macdChart = new Chart(macdCtx, {
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: { 
      responsive: true, 
      maintainAspectRatio: false,

      plugins: {
        zoom: {
          pan: { enabled: false },
          zoom: {
            wheel: { enabled: false },
            pinch: { enabled: false },
            drag: { enabled: false },
            mode: 'xy'

          }
        }
      }
    }
  });

  portfolioChart = new Chart(portfolioCtx, {
    type: 'line',
    data: { labels: [], datasets: [] },

    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        zoom: {
          pan: { enabled: false },
          zoom: {
            wheel: { enabled: false },
            pinch: { enabled: false },
            drag: { enabled: false },
            mode: 'xy'

          }
        }
      }
    }
  });
}

export function highlightEntryZones(data) {
  entryHighlightData = data;
  if (priceChart) priceChart.update();
}

export function updateStockCharts(data, toggles) {
  const labels = data.dates;
  priceChart.data.labels = labels;
  rsiChart.data.labels = labels;
  macdChart.data.labels = labels;
  highlightEntryZones(data);

  priceChart.data.datasets = [
    {
      label: 'Close Price',
      data: data.close,
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      pointRadius: 0,
      fill: false,
      borderWidth: 2,
    },
  ];

  if (toggles.sma50) {
    priceChart.data.datasets.push({
      label: 'SMA 50',
      data: data.sma50,
      borderColor: '#10b981',
      pointRadius: 0,
      fill: false,
      borderWidth: 1.5,
    });
  }
  if (toggles.sma200) {
    priceChart.data.datasets.push({
      label: 'SMA 200',
      data: data.sma200,
      borderColor: '#f59e0b',
      pointRadius: 0,
      fill: false,
      borderWidth: 1.5,
    });
  }
  if (toggles.bb) {
    priceChart.data.datasets.push({
      label: 'BB Upper',
      data: data.bbUpper,
      borderColor: '#8b5cf6',
      borderDash: [5,5],
      pointRadius: 0,
      fill: false,
      borderWidth: 1,
    });
    priceChart.data.datasets.push({
      label: 'BB Lower',
      data: data.bbLower,
      borderColor: '#8b5cf6',
      borderDash: [5,5],
      pointRadius: 0,
      fill: false,
      borderWidth: 1,
    });
  }
  if (toggles.volume) {
    priceChart.data.datasets.push({
      label: 'Volume',
      type: 'bar',
      data: data.volume,
      backgroundColor: 'rgba(156, 163, 175, 0.3)',
      yAxisID: 'y1',
    });
  }

  if (data.signals) {
    data.signals.forEach(sig => {
      priceChart.data.datasets.push({
        label: sig.type === 'buy' ? 'Buy Signal' : 'Sell Signal',
        data: [{ x: labels[sig.index], y: data.close[sig.index] }],
        pointBackgroundColor: sig.type === 'buy' ? '#22c55e' : '#ef4444',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 8,
        showLine: false,
      });
    });
  }

  rsiChart.data.datasets = [];
  if (toggles.rsi) {
    rsiChart.data.datasets.push({
      label: 'RSI (14)',
      data: data.rsi,
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      pointRadius: 0,
      fill: true,
      borderWidth: 2,
    });
  }

  macdChart.data.datasets = [];
  if (toggles.macd) {
    macdChart.data.datasets.push({
      label: 'MACD',
      type: 'line',
      data: data.macd,
      borderColor: '#f97316',
      pointRadius: 0,
      borderWidth: 2,
    });
    macdChart.data.datasets.push({
      label: 'Signal',
      type: 'line',
      data: data.macdSignal,
      borderColor: '#3b82f6',
      pointRadius: 0,
      borderWidth: 2,
    });
    macdChart.data.datasets.push({
      label: 'Histogram',
      type: 'bar',
      data: data.macdHist,
      backgroundColor: 'rgba(107, 114, 128, 0.4)',
      borderWidth: 0,
    });
  }

  priceChart.update();
  rsiChart.update();
  macdChart.update();
}

export function updatePortfolioChart(backtest) {
  portfolioChart.data.labels = backtest.dates;
  portfolioChart.data.datasets = [{
    label: 'Portfolio Value',
    data: backtest.values,
    borderColor: '#14b8a6',
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    pointRadius: 0,
    fill: true,
    borderWidth: 2,
  }];
  portfolioChart.update();
}

// Manual zoom controls
const ZOOM_FACTOR = 1.2;

export function zoomX(direction) {
  if (!priceChart) return;
  const factor = direction > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
  priceChart.zoom({x: factor});
}

export function zoomY(direction) {
  if (!priceChart) return;
  const factor = direction > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
  priceChart.zoom({y: factor});
}

export function resetZoom() {
  if (priceChart && typeof priceChart.resetZoom === 'function') {
    priceChart.resetZoom();
  }
}
