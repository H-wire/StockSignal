import { SMA, RSI, MACD, BollingerBands } from 'technicalindicators';

export function addIndicators(data) {
  const closes = data.map(d => d.close);
  const volumes = data.map(d => d.volume);

  const sma50 = SMA.calculate({ period: 50, values: closes });
  const sma200 = SMA.calculate({ period: 200, values: closes });
  const rsi = RSI.calculate({ period: 14, values: closes });
  const macd = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });
  const bb = BollingerBands.calculate({ period: 20, stdDev: 2, values: closes });

  const avgVolumes = SMA.calculate({ period: 20, values: volumes });

  for (let i = 0; i < data.length; i++) {
    data[i].sma50 = i >= 49 ? sma50[i - 49] : null;
    data[i].sma200 = i >= 199 ? sma200[i - 199] : null;
    data[i].rsi14 = i >= 13 ? rsi[i - 13] : null;
    data[i].macd = i >= 0 && macd[i] ? macd[i].MACD : null;
    data[i].macdSignal = i >= 0 && macd[i] ? macd[i].signal : null;
    data[i].macdHist = i >= 0 && macd[i] ? macd[i].histogram : null;
    data[i].bbLower = i >= 19 ? bb[i - 19].lower : null;
    data[i].bbUpper = i >= 19 ? bb[i - 19].upper : null;
    data[i].bbMiddle = i >= 19 ? bb[i - 19].middle : null;
    data[i].avgVolume20 = i >= 19 ? avgVolumes[i - 19] : null;
    if (i >= 29) {
      const pastClose = closes[i - 29];
      data[i].priceRate30 = ((closes[i] - pastClose) / pastClose) * 100;
    } else {
      data[i].priceRate30 = null;
    }
  }
  return data;
}

export default { addIndicators };
