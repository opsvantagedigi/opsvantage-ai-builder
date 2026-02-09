// Simple logger implementation to avoid pino dependency issues in Edge Runtime
export interface Logger {
  debug: (msg: string, ...args: unknown[]) => void;
  info: (msg: string, ...args: unknown[]) => void;
  warn: (msg: string, ...args: unknown[]) => void;
  error: (msg: string, ...args: unknown[]) => void;
}

const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info');

const levels = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = levels[logLevel as keyof typeof levels] || 1;

const createLogger = (): Logger => {
  const timestamp = () => new Date().toISOString();

  const log = (level: string, levelValue: number, msg: string, ...args: unknown[]) => {
    if (levelValue >= currentLevel) {
      console.log(`[${timestamp()}] [${level.toUpperCase()}]`, msg, ...args);
    }
  };

  return {
    debug: (msg: string, ...args: unknown[]) => log('debug', 0, msg, ...args),
    info: (msg: string, ...args: unknown[]) => log('info', 1, msg, ...args),
    warn: (msg: string, ...args: unknown[]) => log('warn', 2, msg, ...args),
    error: (msg: string, ...args: unknown[]) => log('error', 3, msg, ...args),
  };
};

export const logger = createLogger();
