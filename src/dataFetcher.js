import Database from 'better-sqlite3';
import yahooFinance from 'yahoo-finance2';
import fs from 'fs';
import path from 'path';
import CONFIG from './config.js';
import { info } from './logger.js';

const dbPath = path.resolve('data', 'price_cache.sqlite');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);

db.prepare(`CREATE TABLE IF NOT EXISTS stock_prices(
  symbol TEXT,
  date TEXT,
  close REAL,
  volume INTEGER,
  PRIMARY KEY(symbol, date)
)` ).run();

export function getLatestDate(symbol) {
  const row = db.prepare('SELECT date FROM stock_prices WHERE symbol=? ORDER BY date DESC LIMIT 1').get(symbol);
  return row ? row.date : null;
}

export async function fetchAndCache(symbol) {
  const lastDate = getLatestDate(symbol);
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24*60*60*1000);
  if (lastDate) {
    const last = new Date(lastDate);
    if (last >= yesterday) {
      return; // data fresh
    }
  }
  const from = lastDate ? new Date(new Date(lastDate).getTime() + 24*60*60*1000) : new Date('1900-01-01');
  info(`Fetching ${symbol} data from ${from.toISOString().substring(0,10)}`);
  const results = await yahooFinance.historical(symbol, { period1: from, interval: '1d' });
  const insert = db.prepare('INSERT OR REPLACE INTO stock_prices (symbol, date, close, volume) VALUES (?,?,?,?)');
  db.transaction(() => {
    for (const r of results) {
      insert.run(symbol, r.date.toISOString().substring(0,10), r.close, r.volume);
    }
  })();
  info(`Cached ${results.length} records for ${symbol}`);
}

export function getHistoricalData(symbol) {
  return db.prepare('SELECT * FROM stock_prices WHERE symbol=? ORDER BY date').all(symbol);
}

export async function updateAll() {
  for (const sym of CONFIG.symbols) {
    info(`Updating ${sym}`);
    await fetchAndCache(sym);
  }
}

export default { fetchAndCache, getHistoricalData, updateAll };
