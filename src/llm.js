import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import CONFIG from './config.js';

const cachePath = path.resolve('data', 'llm_cache.json');
fs.mkdirSync(path.dirname(cachePath), { recursive: true });
let cache = {};
if (fs.existsSync(cachePath)) {
  cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
}

export async function getSummary(symbol, indicators) {
  const today = new Date().toISOString().substring(0, 10);
  if (cache[symbol] && cache[symbol].date === today) {
    return cache[symbol].summary;
  }
  
  try {
    const latestData = indicators.slice(-1)[0];
    const prompt = `Analyze this stock data for ${symbol} and provide a brief technical analysis summary (max 3 sentences):
    
Price: $${latestData.close}
RSI: ${latestData.rsi14}
SMA50: ${latestData.sma50}
SMA200: ${latestData.sma200}
MACD: ${latestData.macd}
Volume: ${latestData.volume}
Buy Signal: ${latestData.buySignal || false}

Focus on trend direction, momentum, and key signals.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    const res = await fetch(CONFIG.llmEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        model: CONFIG.llmModel,
        messages: [{ role: 'user', content: prompt }],
        stream: true
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`LLM API error: ${res.status}`);
    }
    
    let summary = '';
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              summary += data.message.content;
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
    
    if (!summary) {
      summary = 'Analysis unavailable';
    }
    
    cache[symbol] = { date: today, summary };
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
    return summary;
  } catch (error) {
    console.error('LLM Error:', error);
    const latestData = indicators.slice(-1)[0];
    const fallbackSummary = generateFallbackAnalysis(symbol, latestData);
    
    cache[symbol] = { date: today, summary: fallbackSummary };
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
    return fallbackSummary;
  }
}

function generateFallbackAnalysis(symbol, data) {
  if (!data) return `Analysis for ${symbol} temporarily unavailable.`;
  
  const price = data.close?.toFixed(2) || 'N/A';
  const rsi = data.rsi14?.toFixed(1) || 'N/A';
  const trend = data.sma50 && data.sma200 ? 
    (data.sma50 > data.sma200 ? 'uptrend' : 'downtrend') : 'neutral';
  
  let rsiSignal = 'neutral';
  if (data.rsi14 < 30) rsiSignal = 'oversold';
  else if (data.rsi14 > 70) rsiSignal = 'overbought';
  
  const buySignal = data.buySignal ? ' Trading signal detected.' : '';
  
  return `${symbol} Analysis: Price $${price}, RSI ${rsi} (${rsiSignal}), Trend: ${trend}.${buySignal} LLM analysis temporarily unavailable.`;
}

export default { getSummary };
