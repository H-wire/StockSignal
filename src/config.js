import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

export const CONFIG = {
  yahooApiKey: process.env.YF_API_KEY || '',
  llmEndpoint: process.env.LLM_ENDPOINT || 'http://localhost:11434/api/generate',
  llmModel: process.env.LLM_MODEL || 'model',
  rsiBuyThreshold: parseFloat(process.env.RSI_BUY || '30'),
  strategies: {
    macd: process.env.STRAT_MACD !== 'false',
    bollinger: process.env.STRAT_BOLLINGER !== 'false',
    volume: process.env.STRAT_VOLUME !== 'false',
    priceRate: process.env.STRAT_PRICERATE !== 'false'
  },
  symbols: (process.env.SYMBOLS || 'HM-B.ST').split(',').map(s => s.trim())
};

export default CONFIG;
