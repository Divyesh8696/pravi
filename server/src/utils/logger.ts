/**
 * Structured Logger
 * 
 * Provides consistent formatting with timestamps, log levels, and request context.
 * Adheres to rule: No console.log in business code; use structured logger.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function formatLog(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => {
    console.log(formatLog('info', msg, meta));
  },
  warn: (msg: string, meta?: Record<string, unknown>) => {
    console.warn(formatLog('warn', msg, meta));
  },
  error: (msg: string, meta?: Record<string, unknown>) => {
    console.error(formatLog('error', msg, meta));
  },
  debug: (msg: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(formatLog('debug', msg, meta));
    }
  },
};
