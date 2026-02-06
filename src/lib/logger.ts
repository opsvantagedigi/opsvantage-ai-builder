import pino, { type LoggerOptions, type LevelWithSilent } from 'pino';

const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info');

// Only enable the `pino-pretty` transport in development where it's available.
const pinoOptions: LoggerOptions = {
  level: logLevel as LevelWithSilent,
  base: { env: process.env.NODE_ENV },
};

if (process.env.NODE_ENV === 'development') {
  // transport isn't always present in older pino types; assign via a generic record to avoid `any`
  (pinoOptions as unknown as Record<string, unknown>).transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:standard',
    },
  };
}

export const logger = pino(pinoOptions);
