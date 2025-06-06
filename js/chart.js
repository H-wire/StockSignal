let priceChart, rsiChart, macdChart, portfolioChart;

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
          pan: {
            enabled: true,
            mode: 'x'
          },
          zoom: {
            wheel: {
              enabled: true
            },
            pinch: {
              enabled: true
            },
            mode: 'x'
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
      interaction: {
        intersect: false,
        mode: 'index'
      },
      scales: { 
        x: {
          grid: { color: 'rgba(0,0,0,0.1)' }
        },
        y: { 
          min: 0, 
          max: 100,
          grid: { color: 'rgba(0,0,0,0.1)' }
        }
      },
      plugins: {
        legend: { 
          display: true,
          position: 'top',
          labels: { usePointStyle: true }
        },
        zoom: {
          pan: {
            enabled: true,
            mode: 'x'
          },
          zoom: {
            wheel: {
              enabled: true
            },
            pinch: {
              enabled: true
            },
            mode: 'x'
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
      interaction: {
        intersect: false,
        mode: 'index'
      },
      scales: {
        x: {
          grid: { color: 'rgba(0,0,0,0.1)' }
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.1)' }
        }
      },
      plugins: {
        legend: { 
          display: true,
          position: 'top',
          labels: { usePointStyle: true }
        },
        zoom: {
          pan: {
            enabled: true,
            mode: 'x'
          },
          zoom: {
            wheel: {
              enabled: true
            },
            pinch: {
              enabled: true
            },
            mode: 'x'
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
      interaction: {
        intersect: false,
        mode: 'index'
      },
      scales: {
        x: {
          grid: { color: 'rgba(0,0,0,0.1)' }
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.1)' }
        }
      },
      plugins: {
        legend: { 
          display: true,
          position: 'top',
          labels: { usePointStyle: true }
        },
        zoom: {
          pan: {
            enabled: true,
            mode: 'x'
          },
          zoom: {
            wheel: {
              enabled: true
            },
            pinch: {
              enabled: true
            },
            mode: 'x'
          }
        }
      }
    }
  });
}

export function updateStockCharts(data, toggles) {
  const labels = data.dates;
  priceChart.data.labels = labels;
  rsiChart.data.labels = labels;
  macdChart.data.labels = labels;

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
