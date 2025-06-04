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
  const prompt = `Provide a short summary for ${symbol} signals:\n${JSON.stringify(indicators.slice(-1)[0])}`;
  const res = await fetch(CONFIG.llmEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: CONFIG.llmModel, prompt })
  });
  const json = await res.json();
  const summary = json.response || json.text || '';
  cache[symbol] = { date: today, summary };
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
  return summary;
}

export default { getSummary };
