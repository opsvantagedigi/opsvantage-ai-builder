import pino from 'pino';

const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info');

// Only enable the `pino-pretty` transport in development where it's available.
const pinoOptions: any = {
  level: logLevel,
  base: { env: process.env.NODE_ENV },
};

if (process.env.NODE_ENV === 'development') {
  pinoOptions.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:standard',
    },
  };
}

export const logger = pino(pinoOptions);
