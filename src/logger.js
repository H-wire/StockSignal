import fs from 'fs';
import path from 'path';

const logDir = path.resolve('logs');
fs.mkdirSync(logDir, { recursive: true });
const logFile = path.join(logDir, 'app.log');
const llmLogFile = path.join(logDir, 'llm.log');

function write(type, msg) {
  const line = `[${new Date().toISOString()}] [${type}] ${msg}\n`;
  fs.appendFileSync(logFile, line);
}

export function info(msg) {
  console.log(msg);
  write('INFO', msg);
}

export function error(err) {
  const msg = err && err.stack ? err.stack : String(err);
  console.error(msg);
  write('ERROR', msg);
}

export function logLLMInteraction(prompt, response) {
  const entry = `[${new Date().toISOString()}]\nPROMPT: ${prompt}\nRESPONSE: ${response}\n\n`;
  fs.appendFileSync(llmLogFile, entry);
}

export function init() {
  process.on('unhandledRejection', err => error(err));
  process.on('uncaughtException', err => {
    error(err);
    process.exit(1);
  });
}
