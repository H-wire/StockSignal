let priceChart, rsiChart, macdChart, portfolioChart;

export function initCharts() {
  const priceCtx = document.getElementById('priceChart').getContext('2d');
  const rsiCtx = document.getElementById('rsiChart').getContext('2d');
  const macdCtx = document.getElementById('macdChart').getContext('2d');
  const portfolioCtx = document.getElementById('portfolioChart').getContext('2d');

  priceChart = new Chart(priceCtx, {
    type: 'line',
    data: { labels: [], datasets: [] },
    options: { responsive: true, maintainAspectRatio: false }
  });

  rsiChart = new Chart(rsiCtx, {
    type: 'line',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { min: 0, max: 100 } }
    }
  });

  macdChart = new Chart(macdCtx, {
    type: 'bar',
    data: { labels: [], datasets: [] },
    options: { responsive: true, maintainAspectRatio: false }
  });

  portfolioChart = new Chart(portfolioCtx, {
    type: 'line',
    data: { labels: [], datasets: [] },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

export function updateStockCharts(data, toggles) {
  const labels = data.dates;
  priceChart.data.labels = labels;
  rsiChart.data.labels = labels;
  macdChart.data.labels = labels;

  priceChart.data.datasets = [
    {
      label: 'Close',
      data: data.close,
      borderColor: 'black',
      pointRadius: 0,
      fill: false,
    },
  ];

  if (toggles.sma50) {
    priceChart.data.datasets.push({
      label: 'SMA 50',
      data: data.sma50,
      borderColor: 'blue',
      pointRadius: 0,
      fill: false,
    });
  }
  if (toggles.sma200) {
    priceChart.data.datasets.push({
      label: 'SMA 200',
      data: data.sma200,
      borderColor: 'red',
      pointRadius: 0,
      fill: false,
    });
  }
  if (toggles.bb) {
    priceChart.data.datasets.push({
      label: 'BB Upper',
      data: data.bbUpper,
      borderColor: 'green',
      borderDash: [5,5],
      pointRadius: 0,
      fill: false,
    });
    priceChart.data.datasets.push({
      label: 'BB Lower',
      data: data.bbLower,
      borderColor: 'green',
      borderDash: [5,5],
      pointRadius: 0,
      fill: false,
    });
  }
  if (toggles.volume) {
    priceChart.data.datasets.push({
      label: 'Volume',
      type: 'bar',
      data: data.volume,
      backgroundColor: 'rgba(0,0,0,0.1)',
      yAxisID: 'y1',
    });
  }

  if (data.signals) {
    data.signals.forEach(sig => {
      priceChart.data.datasets.push({
        label: sig.type,
        data: [{ x: labels[sig.index], y: data.close[sig.index] }],
        pointBackgroundColor: sig.type === 'buy' ? 'green' : 'red',
        pointRadius: 6,
        showLine: false,
      });
    });
  }

  rsiChart.data.datasets = [];
  if (toggles.rsi) {
    rsiChart.data.datasets.push({
      label: 'RSI',
      data: data.rsi,
      borderColor: 'purple',
      pointRadius: 0,
    });
  }

  macdChart.data.datasets = [];
  if (toggles.macd) {
    macdChart.data.datasets.push({
      label: 'MACD',
      type: 'line',
      data: data.macd,
      borderColor: 'orange',
      pointRadius: 0,
    });
    macdChart.data.datasets.push({
      label: 'Signal',
      type: 'line',
      data: data.macdSignal,
      borderColor: 'blue',
      pointRadius: 0,
    });
    macdChart.data.datasets.push({
      label: 'Hist',
      type: 'bar',
      data: data.macdHist,
      backgroundColor: 'rgba(0,0,0,0.3)'
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
    borderColor: 'teal',
    pointRadius: 0,
  }];
  portfolioChart.update();
}
